import { appendFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import { componentIds, loadBaseline, openComponent, settle, THEMES, useTheme } from "./helpers";

/**
 * Live checks from `quality/premium-rubric.md` › §10 "pw", on the specimen only:
 *
 *   P4  no layout shift when a control is hovered or focused
 *   P5  every focusable control shows a visible focus indicator on keyboard focus
 *   C3  placeholders reach 4.5:1 against their field
 *   C5  the text ladder holds: fg/muted ≥ 1.6, muted/subtle ≥ 1.3 (per theme)
 *   S2  filtering does not replay entrance animations
 *   L2  a loading variant keeps the loaded layout (height within 8px)
 *   X2  the specimen uses at least 2 of {foreground, muted, subtle} and 2 font sizes
 *
 * Known findings live in premium-baseline.json as `<check>:<id>:<theme>`; fix one,
 * then delete its line. Set PREMIUM_FINDINGS=<file> to append every finding as JSON
 * lines (used to rebuild the baseline and the quality report).
 */
const baseline = loadBaseline("premium-baseline.json");
const WORLD = ".uai-registry-specimen__world";
const VARIANTS = ".uai-registry-variants button";

type Finding = { check: string; detail: string };

/** Runs in the page: color parsing, compositing, and contrast via a 1px canvas. */
const pageHelpers = `
  window.__premium = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const rgba = (color) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = "#000";
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const over = (top, bottom) => {
      const a = top[3];
      return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
    };
    const background = (element) => {
      const layers = [];
      for (let node = element; node instanceof Element; node = node.parentElement) {
        const color = rgba(getComputedStyle(node).backgroundColor);
        if (color[3] > 0) layers.push(color);
        if (color[3] >= 1) break;
      }
      let result = rgba(getComputedStyle(document.body).backgroundColor);
      if (result[3] < 1) result = [255, 255, 255, 1];
      for (const layer of layers.reverse()) result = over(layer, result);
      return result;
    };
    const luminance = ([r, g, b]) => {
      const channel = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const token = (name) => rgba(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    return { rgba, over, background, contrast, token };
  })();
`;

async function variantCount(page: Page) {
  return Math.max(await page.locator(VARIANTS).count(), 1);
}

async function selectVariant(page: Page, index: number) {
  if (await page.locator(VARIANTS).count()) await page.locator(VARIANTS).nth(index).click();
  await page.mouse.move(0, 0);
  await settle(page);
}

/** X2 and C3 on the current variant. */
async function staticChecks(page: Page): Promise<Finding[]> {
  return page.locator(WORLD).evaluate((world) => {
    // biome-ignore lint/suspicious/noExplicitAny: helpers are injected as a script string.
    const p = (window as any).__premium;
    const findings: { check: string; detail: string }[] = [];

    // X2: hierarchy count.
    const tokens = ["--foreground", "--muted-foreground", "--subtle-foreground"].map((name) => ({
      name,
      color: p.token(name),
    }));
    const usedTokens = new Set<string>();
    const sizes = new Set<string>();
    const walker = document.createTreeWalker(world, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || !parent.checkVisibility()) continue;
      if (parent.closest("[aria-hidden='true']")) continue;
      const style = getComputedStyle(parent);
      sizes.add(style.fontSize);
      const color = p.over(p.rgba(style.color), p.background(parent));
      for (const candidate of tokens) {
        const blended = p.over(candidate.color, p.background(parent));
        const distance = Math.hypot(...[0, 1, 2].map((i) => color[i] - blended[i]));
        if (distance < 8) usedTokens.add(candidate.name);
      }
    }
    if (usedTokens.size < 2 || sizes.size < 2) {
      findings.push({
        check: "X2",
        detail: `${usedTokens.size} text tier(s) [${[...usedTokens].join(", ")}], ${sizes.size} font size(s)`,
      });
    }

    // C3: placeholder ratio.
    for (const field of world.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input[placeholder], textarea[placeholder]",
    )) {
      if (!field.checkVisibility() || field.value || !field.placeholder.trim()) continue;
      const surface = p.background(field);
      const color = p.over(p.rgba(getComputedStyle(field, "::placeholder").color), surface);
      const ratio = p.contrast(color, surface);
      if (ratio < 4.5) {
        findings.push({ check: "C3", detail: `"${field.placeholder}" at ${ratio.toFixed(2)}:1` });
      }
    }
    return findings;
  });
}

/** Resting indicator styles for every tabbable control in the specimen, keyed by index. */
const TABBABLE =
  "a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/** P5: keyboard-focus every control and require a visible change on it or its frame. */
async function focusChecks(page: Page): Promise<Finding[]> {
  const total = await page.locator(WORLD).evaluate((world, selector) => {
    const indicator = (element: Element) =>
      [element, element.parentElement, element.parentElement?.parentElement]
        .filter((node): node is Element => Boolean(node))
        .map((node) => {
          const style = getComputedStyle(node);
          return [
            style.outlineStyle,
            style.outlineWidth,
            style.outlineColor,
            style.boxShadow,
            style.borderColor,
            style.backgroundColor,
          ].join("|");
        })
        .join("/");
    const controls = [...world.querySelectorAll<HTMLElement>(selector)].filter((element) =>
      element.checkVisibility(),
    );
    controls.forEach((element, index) => {
      element.dataset.premiumIndex = String(index);
      element.dataset.premiumRest = indicator(element);
    });
    // A sentinel just before the first control, so Tab enters the specimen from the keyboard.
    const sentinel = document.createElement("button");
    sentinel.id = "premium-sentinel";
    sentinel.style.cssText = "position:absolute;opacity:0;width:1px;height:1px";
    controls[0]?.before(sentinel);
    sentinel.focus();
    return controls.length;
  }, TABBABLE);

  const findings: Finding[] = [];
  for (let step = 0; step < Math.min(total, 12); step += 1) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(160);
    const result = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active?.dataset.premiumIndex) return { done: true };
      const indicator = [active, active.parentElement, active.parentElement?.parentElement]
        .filter((node): node is HTMLElement => Boolean(node))
        .map((node) => {
          const style = getComputedStyle(node);
          return [
            style.outlineStyle,
            style.outlineWidth,
            style.outlineColor,
            style.boxShadow,
            style.borderColor,
            style.backgroundColor,
          ].join("|");
        })
        .join("/");
      const label =
        active.getAttribute("aria-label") ??
        active.textContent?.replace(/\s+/g, " ").trim().slice(0, 40) ??
        active.tagName;
      return {
        done: false,
        visible: indicator !== active.dataset.premiumRest,
        label: `${active.tagName.toLowerCase()} "${label}"`,
      };
    });
    if (result.done) break;
    if (!result.visible)
      findings.push({ check: "P5", detail: `no focus indicator on ${result.label}` });
  }
  await page.evaluate(() => document.getElementById("premium-sentinel")?.remove());
  return findings;
}

/** P4: hovering a control must not move it or its siblings. */
async function layoutShiftChecks(page: Page): Promise<Finding[]> {
  const findings: Finding[] = [];
  const buttons = page.locator(`${WORLD} button:not([disabled])`);
  const count = Math.min(await buttons.count(), 6);
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (!(await button.isVisible())) continue;
    // Tag the control and its current siblings so popups added on hover don't count.
    await button.evaluate((element) => {
      const nodes = [
        element,
        ...(element.parentElement ? [...element.parentElement.children] : []),
      ];
      nodes.forEach((node, i) => {
        (node as HTMLElement).dataset.premiumSibling = String(i);
      });
    });
    const measure = () =>
      button.evaluate((element) => {
        const scope = element.parentElement ?? element;
        const nodes = [element, ...scope.querySelectorAll(":scope > [data-premium-sibling]")];
        return nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return [rect.width, rect.height, rect.x, rect.y].map(
            (value) => Math.round(value * 2) / 2,
          );
        });
      });
    const before = await measure();
    await button.hover({ timeout: 2_000 }).catch(() => undefined);
    await page.waitForTimeout(200);
    const after = await measure();
    await page.mouse.move(0, 0);
    // Compare sizes, and positions relative to the first rect so panning doesn't count.
    const shift = before.some((rect, i) => {
      const other = after[i];
      if (!other) return true;
      const at = (list: number[] | undefined, i: number) => list?.[i] ?? 0;
      const dx = at(after[0], 2) - at(before[0], 2);
      const dy = at(after[0], 3) - at(before[0], 3);
      return (
        Math.abs(at(rect, 0) - at(other, 0)) > 0.5 ||
        Math.abs(at(rect, 1) - at(other, 1)) > 0.5 ||
        Math.abs(at(other, 2) - at(rect, 2) - dx) > 0.5 ||
        Math.abs(at(other, 3) - at(rect, 3) - dy) > 0.5
      );
    });
    if (shift) {
      const label =
        (await button.getAttribute("aria-label")) ?? (await button.innerText()).trim().slice(0, 40);
      findings.push({ check: "P4", detail: `hover on "${label}" moves the layout` });
    }
  }
  return findings;
}

/** S2: typing into a filter must not replay finite entrance animations. */
async function restaggerChecks(page: Page): Promise<Finding[]> {
  const filter = page
    .locator(
      `${WORLD} input[type=search], ${WORLD} [role=searchbox], ${WORLD} input[placeholder*="ilter" i], ${WORLD} input[placeholder*="earch" i]`,
    )
    .first();
  if (!(await filter.count()) || !(await filter.isVisible())) return [];
  // Listen for animation starts instead of sampling running animations, so a slow
  // machine can't miss a short replay.
  await page.locator(WORLD).evaluate((world) => {
    const started: string[] = [];
    (window as unknown as { __premiumStarted: string[] }).__premiumStarted = started;
    world.addEventListener("animationstart", (event) => {
      const target = event.target as Element;
      if (target.matches("input, textarea")) return;
      if (getComputedStyle(target).animationIterationCount.includes("infinite")) return;
      started.push((event as AnimationEvent).animationName);
    });
  });
  await filter.fill("a");
  await page.waitForTimeout(300);
  const replayed = await page.evaluate(
    () => (window as unknown as { __premiumStarted: string[] }).__premiumStarted,
  );
  await filter.fill("");
  return replayed.length > 0
    ? [{ check: "S2", detail: `filtering replays ${[...new Set(replayed)].join(", ")}` }]
    : [];
}

/** Height of the specimen's root element. */
function specimenHeight(page: Page) {
  return page.locator(WORLD).evaluate((world) => {
    const root = [...world.children].find(
      (child) => !child.classList.contains("uai-registry-specimen__marks"),
    );
    return root ? root.getBoundingClientRect().height : 0;
  });
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "Premium checks run once, on desktop.");
      await useTheme(page, theme);
      await page.addInitScript(pageHelpers);
    });

    test("text ladder holds (C5)", async ({ page }) => {
      await openComponent(page, componentIds[0] ?? "");
      const ratios = await page.evaluate(() => {
        // biome-ignore lint/suspicious/noExplicitAny: helpers are injected as a script string.
        const p = (window as any).__premium;
        const surface = p.token("--background");
        const [fg, muted, subtle] = [
          "--foreground",
          "--muted-foreground",
          "--subtle-foreground",
        ].map((name) => p.over(p.token(name), surface));
        return { fgMuted: p.contrast(fg, muted), mutedSubtle: p.contrast(muted, subtle) };
      });
      expect(ratios.fgMuted, "foreground / muted").toBeGreaterThanOrEqual(1.6);
      expect(ratios.mutedSubtle, "muted / subtle").toBeGreaterThanOrEqual(1.3);
    });

    for (const id of componentIds) {
      test(id, async ({ page }) => {
        test.setTimeout(90_000);
        await openComponent(page, id);
        await settle(page);

        const findings: Finding[] = [];
        findings.push(...(await layoutShiftChecks(page)));
        findings.push(...(await focusChecks(page)));
        findings.push(...(await restaggerChecks(page)));

        const variants = await variantCount(page);
        const labels = await page.locator(VARIANTS).allInnerTexts();
        let loadedHeight: number | undefined;
        const loadingHeights: [string, number][] = [];
        for (let index = 0; index < variants; index += 1) {
          await selectVariant(page, index);
          const label = labels[index] ?? "default";
          for (const finding of await staticChecks(page)) {
            findings.push({ ...finding, detail: `${label}: ${finding.detail}` });
          }
          const height = await specimenHeight(page);
          if (/loading|skeleton/i.test(label)) loadingHeights.push([label, height]);
          else loadedHeight ??= height;
        }
        if (loadedHeight !== undefined) {
          for (const [label, height] of loadingHeights) {
            if (Math.abs(height - loadedHeight) > 8) {
              findings.push({
                check: "L2",
                detail: `${label} is ${Math.round(height)}px tall, loaded is ${Math.round(loadedHeight)}px`,
              });
            }
          }
        }

        if (process.env.PREMIUM_FINDINGS) {
          for (const finding of findings) {
            appendFileSync(
              process.env.PREMIUM_FINDINGS,
              `${JSON.stringify({ id, theme, ...finding })}\n`,
            );
          }
        }
        const fresh = findings.filter(
          (finding) => !baseline.has(`${finding.check}:${id}:${theme}`),
        );
        expect(fresh, `premium rubric findings on /components/${id}`).toEqual([]);
      });
    }
  });
}
