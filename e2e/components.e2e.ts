import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  componentIds,
  loadBaseline,
  openComponent,
  PREVIEW,
  settle,
  THEMES,
  useTheme,
} from "./helpers";

/**
 * Serious and critical axe findings that existed before this suite. Each entry is
 * `<rule>:<component id>:<theme>`, or `<rule>:*:<theme>` for site chrome on every page.
 * Fix the finding, then delete its entry. New findings fail the run.
 */
const axeBaseline = loadBaseline("axe-baseline.json");
const isKnown = (rule: string, id: string, theme: string) =>
  axeBaseline.has(`${rule}:${id}:${theme}`) || axeBaseline.has(`${rule}:*:${theme}`);

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => useTheme(page, theme));

    for (const id of componentIds) {
      test(id, async ({ page }, testInfo) => {
        await openComponent(page, id);
        await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
        // On mobile the specimen sits below the inspector; bring it into the shot.
        await page.locator(PREVIEW).scrollIntoViewIfNeeded();
        await settle(page);

        const shot = await page.screenshot({
          path: `e2e-artifacts/screenshots/${testInfo.project.name}/${theme}/${id}.png`,
        });
        await testInfo.attach(`${id}-${theme}`, { body: shot, contentType: "image/png" });

        // The page chrome is the same everywhere, so desktop audits the full page and
        // mobile audits only the specimen to keep the run short.
        const axe = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
        if (testInfo.project.name === "mobile") axe.include(PREVIEW);
        const { violations } = await axe.analyze();

        const blocking = violations
          .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
          .filter((violation) => !isKnown(violation.id, id, theme))
          .map((violation) => ({
            rule: violation.id,
            impact: violation.impact,
            help: violation.help,
            targets: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")),
          }));

        expect(blocking, `serious or critical axe violations on /components/${id}`).toEqual([]);
      });
    }
  });
}
