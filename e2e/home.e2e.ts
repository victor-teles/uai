import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { THEMES, useTheme } from "./helpers";

/**
 * The overview page: the hero copy stays as written, and "Best of Uai" shows eight live
 * tiles (uai-design/showcase/final/SPEC.md §B). The demos are decorative: each specimen is
 * `aria-hidden` and `inert` at all times, so the tile link is the only tab stop.
 */
const FEATURED = ".uai-featured";
const TILES = [
  "prompt-composer",
  "thinking",
  "agent-run",
  "approval-card",
  "pix-payment",
  "kanban-board",
  "coupon-field",
  "unsaved-changes-bar",
] as const;
const WIDE = ["agent-run", "kanban-board"];
const tile = (page: Page, id: string) => page.locator(`.uai-feature[data-id="${id}"]`);

async function openHome(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(FEATURED).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/** Scrolls a tile to the middle of the viewport so it is well past the 60% play threshold. */
async function centre(page: Page, id: string) {
  await tile(page, id).evaluate((element) => element.scrollIntoView({ block: "center" }));
}

/** Animations still running inside `selector`, ignoring colour, opacity and shadow fades. */
function movingIn(page: Page, selector: string) {
  return page.evaluate((root) => {
    const scope = document.querySelector(root);
    return document
      .getAnimations()
      .filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target instanceof Element && scope?.contains(target);
      })
      .filter((animation) => animation.playState === "running")
      .filter((animation) => {
        if (!(animation instanceof CSSTransition)) return true;
        return !/^(?:color|background-color|border-color|border-(?:top|right|bottom|left|block-start|block-end|inline-start|inline-end)-color|outline-color|fill|stroke|opacity|box-shadow|text-decoration-color)$/.test(
          animation.transitionProperty,
        );
      })
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect).target as Element;
        const name =
          animation instanceof CSSAnimation
            ? animation.animationName
            : animation instanceof CSSTransition
              ? `transition:${animation.transitionProperty}`
              : "web-animation";
        const slot = target.closest("[data-slot]")?.getAttribute("data-slot") ?? target.className;
        return `${slot} ${name}`;
      });
  }, selector);
}

test("keeps the hero copy as written", async ({ page }) => {
  await openHome(page);
  const intro = page.locator(".uai-overview__intro");
  await expect(intro.locator(".uai-overview__pronounce")).toHaveText(
    "Uai/waj/sounds like “why”, or “UI” said fast. The Minas Gerais word for surprise",
  );
  await expect(intro.getByRole("heading", { level: 1 })).toHaveText(
    "Open-code components for websites and web apps.",
  );
  await expect(intro.locator("p").nth(1)).toHaveText(
    "Uai is a shadcn registry of compound React components and page blocks. The CLI copies every line into your project, so you own the markup, the styles, and the behavior.",
  );
  await expect(intro.getByRole("textbox", { name: "Install command" })).toHaveValue(
    /^bunx shadcn@latest add .+\/prompt-composer\.json$/,
  );
});

test("shows the eight featured tiles in bento order", async ({ page, isMobile }) => {
  await openHome(page);
  const section = page.getByRole("region", { name: "Best of Uai" });
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Best of Uai");
  await expect(section.locator(".uai-doc__count")).toHaveText("8");
  await expect(section.locator(".uai-feature")).toHaveCount(TILES.length);

  const ids = await section
    .locator(".uai-feature")
    .evaluateAll((items) => items.map((item) => item.getAttribute("data-id")));
  expect(ids).toEqual([...TILES]);

  for (const id of TILES) {
    const link = tile(page, id).locator(".uai-feature__link");
    await expect(link).toHaveAttribute("href", `/components/${id}`);
    // Named by the item, described by its catalog description.
    const describedBy = await link.getAttribute("aria-describedby");
    await expect(page.locator(`[id="${describedBy}"]`)).not.toBeEmpty();
  }

  if (isMobile) return;
  // Two columns; Agent Run and Kanban Board span the row.
  const box = async (id: string) => {
    const rect = await tile(page, id).boundingBox();
    if (!rect) throw new Error(`${id} is not rendered`);
    return rect;
  };
  const grid = await section.locator(".uai-featured__grid").boundingBox();
  const [composer, thinking] = [await box("prompt-composer"), await box("thinking")];
  expect(Math.abs(composer.y - thinking.y)).toBeLessThan(1);
  expect(thinking.x).toBeGreaterThan(composer.x + composer.width);
  for (const id of WIDE) expect((await box(id)).width).toBeCloseTo(grid?.width ?? 0, 0);
});

test("each tile has one tab stop and Tab never enters a demo", async ({ page }) => {
  await openHome(page);
  // Specimens are hidden from assistive tech and inert, so nothing inside can be focused.
  const specimens = page.locator(".uai-feature__specimen");
  await expect(specimens).toHaveCount(TILES.length);
  for (const specimen of await specimens.all()) {
    await expect(specimen).toHaveAttribute("aria-hidden", "true");
    expect(await specimen.evaluate((element) => (element as HTMLElement).inert)).toBe(true);
  }

  const links = page.locator(".uai-feature__link");
  await links.first().focus();
  const focused = async () =>
    page.evaluate(() => {
      const active = document.activeElement;
      return {
        tile: active?.closest(".uai-feature")?.getAttribute("data-id") ?? null,
        link: active?.classList.contains("uai-feature__link") ?? false,
        inDemo: Boolean(active?.closest(".uai-feature__specimen")),
      };
    });
  for (const [index, id] of TILES.entries()) {
    if (index > 0) await page.keyboard.press("Tab");
    expect(await focused()).toEqual({ tile: id, link: true, inDemo: false });
  }
  await page.keyboard.press("Tab");
  expect((await focused()).tile).toBeNull();
});

test("kanban ghost drag moves OPS-121 through the board's pointer path without leaving inert", async ({
  page,
}) => {
  await openHome(page);
  const kanban = tile(page, "kanban-board");
  // Watch every frame: the specimen must stay inert, nothing in it may hold focus, and the
  // board's own drag overlay must appear (proof the move went through the pointer path).
  await page.evaluate(() => {
    const record = { overlay: false, notInert: 0, focusInDemo: 0, frames: 0 };
    (window as unknown as { __kanbanWatch: typeof record }).__kanbanWatch = record;
    const specimen = document.querySelector<HTMLElement>(
      '.uai-feature[data-id="kanban-board"] .uai-feature__specimen',
    );
    const tick = () => {
      record.frames += 1;
      if (document.querySelector('[data-slot="kanban-board-overlay"]')) record.overlay = true;
      if (specimen && !specimen.inert) record.notInert += 1;
      if (specimen?.contains(document.activeElement)) record.focusInDemo += 1;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await centre(page, "kanban-board");
  await expect(kanban).toHaveAttribute("data-state", "rest", { timeout: 20_000 });

  const review = kanban.locator('[data-slot="kanban-board-column"][data-column="review"]');
  await expect(review.locator('[data-slot="kanban-board-card"]')).toHaveText([
    /Migrate invoices to the new ledger/,
  ]);
  const watch = await page.evaluate(
    () => (window as unknown as { __kanbanWatch: Record<string, number | boolean> }).__kanbanWatch,
  );
  expect(watch.overlay).toBe(true);
  expect(watch.notInert).toBe(0);
  expect(watch.focusInDemo).toBe(0);
  // The hit-test shim is gone once the drag has settled.
  expect(
    await page.evaluate(() => Object.hasOwn(document, "elementsFromPoint")),
    "document.elementsFromPoint is restored",
  ).toBe(false);
  // A card in the demo cannot be focused, even from script.
  expect(
    await kanban
      .locator('[data-slot="kanban-board-card"]')
      .first()
      .evaluate((card) => {
        (card as HTMLElement).focus();
        return document.activeElement === card;
      }),
  ).toBe(false);
});

test("plays at most two tiles at once and pauses off screen or on a hidden tab", async ({
  page,
}) => {
  await openHome(page);
  await page.evaluate(() => {
    const record = { max: 0 };
    (window as unknown as { __playing: typeof record }).__playing = record;
    const tick = () => {
      const count = document.querySelectorAll(".uai-feature[data-playing]").length;
      record.max = Math.max(record.max, count);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Sweep the grid so every tile asks to play.
  for (const id of TILES) {
    await centre(page, id);
    await page.waitForTimeout(250);
  }

  // Agent Run: start it, scroll it away, and it holds.
  await centre(page, "agent-run");
  const agent = tile(page, "agent-run");
  await expect(agent).toHaveAttribute("data-state", /playing|rest/, { timeout: 20_000 });
  if ((await agent.getAttribute("data-state")) === "playing") {
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(agent).toHaveAttribute("data-state", "paused");
    await centre(page, "agent-run");
    await expect(agent).toHaveAttribute("data-state", /playing|rest/);
  }

  // Wait for the last tile, then check the cap held the whole time.
  await centre(page, "unsaved-changes-bar");
  const last = tile(page, "unsaved-changes-bar");
  await expect(last).toHaveAttribute("data-state", /playing|rest/, { timeout: 30_000 });
  if ((await last.getAttribute("data-state")) === "playing") {
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(last).toHaveAttribute("data-state", "paused");
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "visibilityState");
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }
  await expect(last).toHaveAttribute("data-state", "rest", { timeout: 10_000 });
  const { max } = await page.evaluate(
    () => (window as unknown as { __playing: { max: number } }).__playing,
  );
  expect(max).toBeGreaterThan(0);
  expect(max).toBeLessThanOrEqual(2);
});

test("hover replays a tile only after its first play", async ({ page, isMobile }) => {
  test.skip(isMobile, "Hover replay is for fine pointers.");
  await openHome(page);
  const composer = tile(page, "prompt-composer");
  // Not played yet (still above the fold's 60% line or queued): hovering must not start it early.
  await expect(composer).toHaveAttribute("data-state", "waiting");
  await centre(page, "prompt-composer");
  await expect(composer).toHaveAttribute("data-state", "rest", { timeout: 20_000 });
  await composer.hover();
  await expect(composer).toHaveAttribute("data-state", "playing", { timeout: 2_000 });
  await expect(composer).toHaveAttribute("data-state", "rest", { timeout: 10_000 });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("tiles rest on their final frame and nothing moves", async ({ page }) => {
    await openHome(page);
    await page.waitForTimeout(500);
    expect(await movingIn(page, FEATURED)).toEqual([]);
    for (const id of TILES) await expect(tile(page, id)).toHaveAttribute("data-state", "rest");
    await expect(tile(page, "agent-run")).toContainText("Waiting for your approval");
    await expect(
      tile(page, "kanban-board").locator('[data-slot="kanban-board-column"][data-column="review"]'),
    ).toContainText("Migrate invoices to the new ledger");
    // Scrolling through the grid starts nothing.
    await centre(page, "kanban-board");
    await page.waitForTimeout(500);
    expect(await movingIn(page, FEATURED)).toEqual([]);
    await expect(page.locator(".uai-feature[data-playing]")).toHaveCount(0);
  });
});

test("fits a 390px screen in one column", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const lefts = await page
    .locator(".uai-feature")
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().left)));
  expect(new Set(lefts).size).toBe(1);
});

for (const theme of THEMES) {
  test(`axe finds nothing on / in the ${theme} theme`, async ({ page }, testInfo) => {
    await useTheme(page, theme);
    await openHome(page);
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
    // Let the first tiles play and settle, as a visitor would see them.
    await centre(page, "agent-run");
    await expect(tile(page, "agent-run")).toHaveAttribute("data-state", "rest", {
      timeout: 20_000,
    });
    // Like components.e2e.ts, mobile audits the page content and leaves the shared chrome to desktop.
    const axe = new AxeBuilder({ page }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
    ]);
    if (testInfo.project.name === "mobile") axe.include(".uai-overview");
    const { violations } = await axe.analyze();
    expect(
      violations.map((violation) => ({
        rule: violation.id,
        impact: violation.impact,
        targets: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

test.describe("kanban tile on a 390px phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("lifts the card at the source card's size with nothing overflowing", async ({ page }) => {
    await openHome(page);
    const kanban = tile(page, "kanban-board");
    // Sample every frame of the scripted drag: the overlay must match the card it lifted and
    // never overflow its own box.
    await page.evaluate(() => {
      const record = { frames: 0, overflow: 0, mismatch: 0, zoomed: 0, worst: "" };
      (window as unknown as { __kanbanLift: typeof record }).__kanbanLift = record;
      const scope = document.querySelector('.uai-feature[data-id="kanban-board"]');
      const tick = () => {
        const overlay = document.querySelector<HTMLElement>('[data-slot="kanban-board-overlay"]');
        const source = scope?.querySelector<HTMLElement>(
          '[data-slot="kanban-board-card"][data-dragging]',
        );
        if (overlay && source) {
          record.frames += 1;
          if (
            overlay.scrollHeight > overlay.clientHeight ||
            overlay.scrollWidth > overlay.clientWidth
          )
            record.overflow += 1;
          // Undo the lift's scale and tilt to get the overlay's own on-screen size.
          const a = overlay.getBoundingClientRect();
          const b = source.getBoundingClientRect();
          const style = getComputedStyle(overlay);
          const scale = Number.parseFloat(style.scale) || 1;
          const angle = ((Number.parseFloat(style.rotate) || 0) * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.abs(Math.sin(angle));
          const det = cos * cos - sin * sin;
          const width = (a.width * cos - a.height * sin) / det / scale;
          const height = (a.height * cos - a.width * sin) / det / scale;
          if (Math.abs(width - b.width) > 2 || Math.abs(height - b.height) > 2) {
            record.mismatch += 1;
            record.worst = `${width}x${height} vs ${b.width}x${b.height}`;
          }
          if ((overlay as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom !== 1)
            record.zoomed += 1;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await centre(page, "kanban-board");
    await expect(kanban).toHaveAttribute("data-state", "rest", { timeout: 20_000 });
    const record = await page.evaluate(
      () => (window as unknown as { __kanbanLift: Record<string, number | string> }).__kanbanLift,
    );
    expect(record.frames, "the overlay was seen").toBeGreaterThan(5);
    expect(record.overflow, "overlay content overflowed").toBe(0);
    expect(record.mismatch, `overlay size differs from the card: ${record.worst}`).toBe(0);
    // The phone tile lays the board out at its real width instead of zooming it down.
    expect(record.zoomed).toBe(0);
    const review = kanban.locator('[data-slot="kanban-board-column"][data-column="review"]');
    await expect(review.locator('[data-slot="kanban-board-card"]')).toHaveText([
      /Migrate invoices to the new ledger/,
    ]);
  });
});
