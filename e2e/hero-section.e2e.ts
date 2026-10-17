import { expect, type Page, test } from "@playwright/test";
import { openComponent, PREVIEW, settle } from "./helpers";

/**
 * Hero Section specimen against uai-design/redesign/hero-section/spec.md: the title stays
 * within three lines in two columns, and the composed media keeps its own start alignment in
 * the Centered variant.
 */

test.skip(({ isMobile }) => isMobile, "The two-column layout is checked on desktop.");

async function pick(page: Page, variant: string) {
  await page
    .locator(PREVIEW)
    .getByRole("button", { name: new RegExp(`^${variant}$`, "i") })
    .click();
  await settle(page);
}

function titleLines(page: Page) {
  return page.locator(`${PREVIEW} [data-slot="hero-section-title"]`).evaluate((title) => {
    const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight);
    return Math.round(title.getBoundingClientRect().height / lineHeight);
  });
}

test("keeps the two-column title within three lines", async ({ page }) => {
  await openComponent(page, "hero-section");
  for (const variant of ["Split", "Framed"]) {
    await pick(page, variant);
    expect(await titleLines(page), variant).toBeLessThanOrEqual(3);
  }
});

test("Centered media rows keep start alignment", async ({ page }) => {
  await openComponent(page, "hero-section");
  await pick(page, "Centered");
  const media = page.locator(`${PREVIEW} [data-slot="hero-section-media"]`);
  const row = media.getByText("Leaking water heater");
  expect(await row.evaluate((element) => getComputedStyle(element).textAlign)).toBe("start");
  const title = page.locator(`${PREVIEW} [data-slot="hero-section-title"]`);
  expect(await title.evaluate((element) => getComputedStyle(element).textAlign)).toBe("center");
});
