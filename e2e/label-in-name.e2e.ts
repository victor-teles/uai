import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { openComponent, PREVIEW, settle, THEMES, useTheme } from "./helpers";

/**
 * Label in name (WCAG 2.5.3): when a control has visible text, its accessible name
 * must contain that text, so speech-input users can say what they see.
 *
 * These items shipped `label-content-name-mismatch` findings that are now fixed.
 * Every variant is checked, not only the default one on page load.
 */
const ITEMS = ["app-header", "file-upload", "prompt-composer"] as const;

/** Labelled controls in the specimen whose visible text is missing from their name. */
async function mismatches(page: Page) {
  return page.locator(PREVIEW).evaluate((preview) =>
    [...preview.querySelectorAll<HTMLElement>("button[aria-label], a[aria-label]")]
      .filter((element) => element.checkVisibility())
      .map((element) => ({
        name: element.getAttribute("aria-label") ?? "",
        text: element.innerText.replace(/\s+/g, " ").trim(),
      }))
      .filter(({ name, text }) => text && !name.toLowerCase().includes(text.toLowerCase())),
  );
}

for (const theme of THEMES) {
  for (const id of ITEMS) {
    test(`${id} keeps visible text in accessible names (${theme})`, async ({ page }) => {
      await useTheme(page, theme);
      await openComponent(page, id);

      const variants = page.locator(".uai-registry-variants button");
      const count = Math.max(await variants.count(), 1);
      for (let index = 0; index < count; index += 1) {
        if (await variants.count()) await variants.nth(index).click();
        await settle(page);

        expect(await mismatches(page)).toEqual([]);
        const { violations } = await new AxeBuilder({ page })
          .include(PREVIEW)
          .withRules(["label-content-name-mismatch"])
          .analyze();
        expect(violations.flatMap((violation) => violation.nodes.map((node) => node.html))).toEqual(
          [],
        );
      }
    });
  }
}
