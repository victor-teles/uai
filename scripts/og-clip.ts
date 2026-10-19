/**
 * Where a share-image capture may come from: the specimen canvas, and nothing else.
 *
 * The canvas (`.uai-registry-specimen`) clips its contents with `overflow: hidden`, but a
 * tall block's own box keeps going below it. An element screenshot of that box paints
 * whatever sits there on the page, which is the "Code example" dock. So the capture is
 * the intersection of the specimen's box with the canvas, and it must never touch the
 * dock. Shared by `scripts/og-capture.ts` and `e2e/og-capture.e2e.ts`.
 */
import type { Locator, Page } from "@playwright/test";

import { PREVIEW } from "../e2e/helpers";

export type Rect = { x: number; y: number; width: number; height: number };

/** The element that clips the live preview. */
export const CANVAS = ".uai-registry-specimen";
/** Page chrome below the canvas ("Code example", props, accessibility panels). */
export const DOCK = ".uai-bench__dock";

/** Site controls that float over the canvas (variant switch, zoom); hidden in captures. */
export const FLOATING_CHROME = ".uai-registry-variants, .uai-canvas-controls";

/** Half a CSS pixel of slack for subpixel layout. */
const epsilon = 0.5;

export function intersect(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right - x <= epsilon || bottom - y <= epsilon) return null;
  return { x, y, width: right - x, height: bottom - y };
}

export function contains(outer: Rect, inner: Rect) {
  return (
    inner.x >= outer.x - epsilon &&
    inner.y >= outer.y - epsilon &&
    inner.x + inner.width <= outer.x + outer.width + epsilon &&
    inner.y + inner.height <= outer.y + outer.height + epsilon
  );
}

/** Grows a rect to whole CSS pixels, the way an element screenshot frames its box. */
export function roundOut({ x, y, width, height }: Rect): Rect {
  const left = Math.floor(x);
  const top = Math.floor(y);
  return {
    x: left,
    y: top,
    width: Math.ceil(x + width) - left,
    height: Math.ceil(y + height) - top,
  };
}

/** Shrinks a rect to whole CSS pixels, so a clip never takes a sliver past it. */
export function roundIn({ x, y, width, height }: Rect): Rect {
  const left = Math.ceil(x);
  const top = Math.ceil(y);
  return {
    x: left,
    y: top,
    width: Math.floor(x + width) - left,
    height: Math.floor(y + height) - top,
  };
}

export function overlaps(a: Rect, b: Rect) {
  return intersect(a, b) !== null;
}

/**
 * The capture rect for a specimen, in viewport CSS pixels (the page is scrolled to the
 * top first). Returns null when the element has no visible area on the canvas. Throws if
 * the rect would leave the canvas or the viewport, or reach the dock.
 */
export async function specimenClip(
  specimen: Locator,
): Promise<{ clip: Rect; clipped: boolean } | null> {
  const boxes = await specimen.evaluate(
    (element, selectors) => {
      window.scrollTo(0, 0);
      const rect = (node: Element | null) => {
        if (!node) return null;
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        element: rect(element),
        canvas: rect(element.closest(selectors.canvas)),
        dock: rect(document.querySelector(selectors.dock)),
        viewport: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
      };
    },
    { canvas: CANVAS, dock: DOCK },
  );
  if (!boxes.element || !boxes.canvas) return null;
  const clip = intersect(roundOut(boxes.element), roundIn(boxes.canvas));
  if (!clip) return null;
  if (!contains(boxes.canvas, clip)) throw new Error("capture leaves the specimen canvas");
  if (!contains(boxes.viewport, clip)) throw new Error("capture leaves the viewport");
  if (boxes.dock && overlaps(clip, boxes.dock)) throw new Error("capture reaches the dock");
  return { clip, clipped: !contains(boxes.canvas, boxes.element) };
}

/**
 * What gets captured, in order: the item's own root when it renders visibly on the
 * canvas, otherwise the preview's top element (dialogs and sheets render a trigger
 * until they open).
 */
export function specimenCandidates(page: Page, id: string): Locator[] {
  return [
    page.locator(`${PREVIEW} [data-slot="${id}"]:visible`).first(),
    page
      .locator(`${PREVIEW} .uai-registry-specimen__world > :not(.uai-registry-specimen__marks)`)
      .first(),
  ];
}

/** The first candidate with visible area on the canvas, and its capture rect. */
export async function findSpecimen(page: Page, id: string) {
  for (const candidate of specimenCandidates(page, id)) {
    if ((await candidate.count()) === 0) continue;
    const target = await specimenClip(candidate);
    if (target) return target;
  }
  throw new Error(`No visible specimen for ${id}`);
}
