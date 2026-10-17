import { expect, test } from "@playwright/test";
import { openComponent, PREVIEW, settle } from "./helpers";

/**
 * kanban-board under CSS zoom: consumers (the home's Best of Uai tile, docs embeds) can zoom
 * the board, so the lifted overlay, the slot and the drop must stay in screen pixels.
 */

test.skip(({ isMobile }) => isMobile, "Mouse drag is checked on desktop.");

const ZOOM = 0.67;

test("a zoomed board lifts a card at its on-screen size and drops it where the slot was", async ({
  page,
}) => {
  await openComponent(page, "kanban-board");
  await settle(page);
  const preview = page.locator(PREVIEW);
  const board = preview.locator('[data-slot="kanban-board"]').first();
  await board.evaluate((element, zoom) => {
    (element as HTMLElement).style.zoom = String(zoom);
  }, ZOOM);
  const card = preview.locator('[data-slot="kanban-board-card"]', { hasText: "Rotate staging" });
  const target = preview.locator('[data-slot="kanban-board-column"][data-column="review"]');
  await card.scrollIntoViewIfNeeded();
  const from = await card.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("specimen is not visible");

  await page.mouse.move(from.x + 20, from.y + 12);
  await page.mouse.down();
  await page.mouse.move(from.x + 40, from.y + 16, { steps: 2 });
  const overlay = page.locator('[data-slot="kanban-board-overlay"]');
  await expect(overlay).toHaveCount(1);
  // Let the 180ms lift finish so the overlay rests at its lifted scale.
  await page.waitForTimeout(260);
  const lifted = await overlay.evaluate((element, source) => {
    const zoomed = element as HTMLElement & { currentCSSZoom?: number };
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    // Undo the lift's scale and tilt to get the overlay's own on-screen size.
    const scale = Number.parseFloat(style.scale) || 1;
    const angle = ((Number.parseFloat(style.rotate) || 0) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.abs(Math.sin(angle));
    const det = cos * cos - sin * sin;
    return {
      zoom: zoomed.currentCSSZoom ?? 1,
      overflowY: element.scrollHeight - element.clientHeight,
      overflowX: element.scrollWidth - element.clientWidth,
      width: (rect.width * cos - rect.height * sin) / det / scale,
      height: (rect.height * cos - rect.width * sin) / det / scale,
      sourceWidth: source.width,
      sourceHeight: source.height,
    };
  }, from);
  expect(lifted.zoom).toBeCloseTo(ZOOM, 2);
  expect(lifted.overflowY).toBeLessThanOrEqual(0);
  expect(lifted.overflowX).toBeLessThanOrEqual(0);
  expect(Math.abs(lifted.width - lifted.sourceWidth)).toBeLessThan(2);
  expect(Math.abs(lifted.height - lifted.sourceHeight)).toBeLessThan(2);

  // The overlay follows the pointer 1:1 in screen pixels, not scaled by the zoom.
  const centreX = () =>
    overlay.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  const before = await centreX();
  await page.mouse.move(from.x + 100, from.y + 16, { steps: 3 });
  await page.waitForTimeout(400);
  expect(Math.abs((await centreX()) - before - 60)).toBeLessThan(2);

  await page.mouse.move(to.x + to.width / 2, to.y + 40 * ZOOM + from.height / 2, { steps: 12 });
  await expect(preview.locator("[data-drop-slot]")).toHaveCount(1);
  const slot = await preview.locator("[data-drop-slot]").boundingBox();
  await page.mouse.up();
  await expect(overlay).toHaveCount(0);
  await expect(target).toContainText("Rotate staging API keys");
  // The card lands on the slot it was shown, at the slot's height.
  const landed = await target
    .locator('[data-slot="kanban-board-card"]', { hasText: "Rotate staging" })
    .boundingBox();
  if (!slot || !landed) throw new Error("slot or card missing");
  expect(Math.abs(landed.y - slot.y)).toBeLessThan(2);
  expect(Math.abs(landed.height - slot.height)).toBeLessThan(2);
});
