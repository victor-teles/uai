import { expect, type Page, test } from "@playwright/test";
import { openComponent, PREVIEW, settle } from "./helpers";

/**
 * Pointer drag on the kanban-board specimen (uai-design/redesign/kanban-board/spec.md §8):
 * a lifted overlay follows the pointer, one insertion slot shows where the card lands, the
 * lift runs 180ms and the settle 300ms, and reduced motion drops scale and rotate.
 */

test.skip(({ isMobile }) => isMobile, "Mouse drag is checked on desktop.");

async function startDrag(page: Page) {
  const preview = page.locator(PREVIEW);
  const card = preview.locator('[data-slot="kanban-board-card"]', { hasText: "Rotate staging" });
  const target = preview.locator('[data-slot="kanban-board-column"][data-column="review"]');
  const from = await card.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("specimen is not visible");
  await page.mouse.move(from.x + 40, from.y + 20);
  await page.mouse.down();
  await page.mouse.move(from.x + 60, from.y + 24, { steps: 2 });
  return { to, card };
}

async function overlayAnimations(page: Page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('[data-slot="kanban-board-overlay"]');
    return (overlay?.getAnimations() ?? []).map((animation) => ({
      duration: Number(animation.effect?.getTiming().duration),
      properties: (animation.effect as KeyframeEffect | null)
        ?.getKeyframes()
        .flatMap((frame) => Object.keys(frame)),
    }));
  });
}

test("drags a card into another column with a lift, a slot, and a settle", async ({ page }) => {
  await openComponent(page, "kanban-board");
  await settle(page);
  const { to } = await startDrag(page);
  const lift = await overlayAnimations(page);
  expect(lift.some((animation) => animation.duration === 180)).toBe(true);

  await page.mouse.move(to.x + to.width / 2, to.y + 60, { steps: 12 });
  await expect(page.locator(`${PREVIEW} [data-drop-slot]`)).toHaveCount(1);
  await expect(page.locator(`${PREVIEW} [data-dragging]`)).toHaveCount(1);

  await page.mouse.up();
  const drop = await overlayAnimations(page);
  expect(drop.some((animation) => animation.duration === 300)).toBe(true);

  await expect(page.locator('[data-slot="kanban-board-overlay"]')).toHaveCount(0);
  const review = page.locator(`${PREVIEW} [data-column="review"]`);
  await expect(review).toContainText("Rotate staging API keys");
  await expect(page.locator(`${PREVIEW} [role="status"]`)).toContainText(
    "Rotate staging API keys dropped in In review, position 1 of 1.",
  );
});

test("shows one insertion slot when reordering inside a column", async ({ page }) => {
  await openComponent(page, "kanban-board");
  await settle(page);
  const preview = page.locator(PREVIEW);
  const below = await preview
    .locator('[data-slot="kanban-board-card"]', { hasText: "Document the on-call" })
    .boundingBox();
  if (!below) throw new Error("specimen is not visible");
  await startDrag(page);
  await page.mouse.move(below.x + 40, below.y + below.height - 4, { steps: 12 });
  await expect(preview.locator('[data-slot="kanban-board-slot"]')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator('[data-slot="kanban-board-overlay"]')).toHaveCount(0);
});

test("reduced motion drops the lift scale, tilt, and spring", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openComponent(page, "kanban-board");
  const { to } = await startDrag(page);
  expect(await overlayAnimations(page)).toEqual([]);
  const style = await page.locator('[data-slot="kanban-board-overlay"]').evaluate((overlay) => ({
    scale: getComputedStyle(overlay).scale,
    rotate: getComputedStyle(overlay).rotate,
  }));
  expect(style.scale === "1" || style.scale === "none").toBe(true);
  expect(style.rotate === "0deg" || style.rotate === "none").toBe(true);
  await page.mouse.move(to.x + to.width / 2, to.y + 60, { steps: 4 });
  await page.mouse.up();
  await expect(page.locator('[data-slot="kanban-board-overlay"]')).toHaveCount(0);
});
