import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

type RegistryItem = { name: string; type: string };

const registry = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "..", "registry.json"), "utf8"),
) as { items: RegistryItem[] };

/** Every item with its own `/components/<id>` page. */
export const componentIds = registry.items
  .filter((item) => item.type === "registry:ui" || item.type === "registry:block")
  .map((item) => item.name);

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const PREVIEW = 'section[aria-label="Live preview"]';

/** next-themes reads the `theme` key before hydration, so set it before any script runs. */
export async function useTheme(page: Page, theme: Theme) {
  await page.addInitScript((value) => window.localStorage.setItem("theme", value), theme);
  await page.emulateMedia({ colorScheme: theme });
}

export async function openComponent(page: Page, id: string) {
  await page.goto(`/components/${id}`, { waitUntil: "networkidle" });
  await page.locator(PREVIEW).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/** Waits for entrance motion to settle so screenshots and axe see the resting state. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
    await Promise.race([
      Promise.allSettled(finite.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
  });
}

export function loadBaseline(file: string): Set<string> {
  const entries = JSON.parse(readFileSync(path.join(import.meta.dirname, file), "utf8")) as {
    known: string[];
  };
  return new Set(entries.known);
}
