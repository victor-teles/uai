import { type CDPSession, expect, type Page, test } from "@playwright/test";
import { openComponent, settle } from "./helpers";

/**
 * One-finger drags on the preview canvas on phones. The canvas keeps `touch-action: pan-y`
 * so the page can scroll, which used to hand every vertical swipe to the page: tall
 * specimens could not be panned, and their lower half was out of reach.
 */

test.skip(({ isMobile }) => !isMobile, "Touch panning is checked on mobile.");

const CANVAS = ".uai-registry-specimen";
const WORLD = ".uai-registry-specimen__world";

/** A real touch drag through the compositor, so native page scrolling can take it. */
async function swipe(page: Page, cdp: CDPSession, x: number, y: number, dx: number, dy: number) {
  const steps = 12;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + (dx * i) / steps, y: y + (dy * i) / steps }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(150);
}

async function snapshot(page: Page) {
  return page.evaluate(
    ({ canvas, world }) => {
      const box = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`${selector} is missing`);
        return element.getBoundingClientRect();
      };
      const c = box(canvas);
      const w = box(world);
      return {
        scrollY: window.scrollY,
        left: w.left - c.left,
        top: w.top - c.top,
        bottomGap: c.bottom - w.bottom,
        center: { x: c.left + c.width / 2, y: c.top + c.height / 2 },
      };
    },
    { canvas: CANVAS, world: WORLD },
  );
}

async function openTallSpecimen(page: Page) {
  await openComponent(page, "dashboard-shell");
  await page.locator(CANVAS).scrollIntoViewIfNeeded();
  await settle(page);
  const start = await snapshot(page);
  // The shell is taller than the 460px mobile canvas, so there is something to pan to.
  expect(start.bottomGap).toBeLessThan(-200);
  return { cdp: await page.context().newCDPSession(page), start };
}

test("a vertical swipe pans a tall specimen instead of scrolling past it", async ({ page }) => {
  const { cdp, start } = await openTallSpecimen(page);
  await swipe(page, cdp, start.center.x, start.center.y + 60, 0, -150);
  const after = await snapshot(page);
  expect(after.top).toBeLessThan(start.top - 120);
  expect(Math.abs(after.scrollY - start.scrollY)).toBeLessThan(2);
});

test("a sideways swipe pans the specimen", async ({ page }) => {
  const { cdp, start } = await openTallSpecimen(page);
  await swipe(page, cdp, start.center.x + 80, start.center.y, -150, 0);
  const after = await snapshot(page);
  expect(after.left).toBeLessThan(start.left - 120);
});

test("swiping past the bottom of the specimen scrolls the page", async ({ page }) => {
  const { cdp, start } = await openTallSpecimen(page);
  for (let i = 0; i < 6; i++) {
    const { center } = await snapshot(page);
    await swipe(page, cdp, center.x, center.y + 100, 0, -200);
  }
  const after = await snapshot(page);
  // The canvas stops with the specimen's bottom edge in view, then the page takes over.
  expect(Math.abs(after.bottomGap)).toBeLessThan(2);
  expect(after.scrollY).toBeGreaterThan(start.scrollY + 100);
});
