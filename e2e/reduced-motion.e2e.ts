import { expect, test } from "@playwright/test";
import { componentIds, loadBaseline, openComponent, PREVIEW } from "./helpers";

/**
 * With `prefers-reduced-motion: reduce`, a specimen must not keep moving.
 * Half a second after load, nothing in the live preview may still move, scale, or
 * loop. Colour and opacity transitions are allowed because they do not move.
 * Known offenders are listed by id in reduced-motion-baseline.json.
 */
const baseline = loadBaseline("reduced-motion-baseline.json");

test.use({ reducedMotion: "reduce" });

for (const id of componentIds) {
  test(`${id} stays still with reduced motion`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Motion preferences do not depend on viewport.");
    await openComponent(page, id);
    await page.waitForTimeout(500);

    const moving = await page.evaluate((selector) => {
      const preview = document.querySelector(selector);
      return (
        document
          .getAnimations()
          .filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target;
            return target instanceof Element && preview?.contains(target);
          })
          .filter((animation) => animation.playState === "running")
          // Colour and opacity fades are not motion; only movement, scaling, and loops count.
          .filter((animation) => {
            if (!(animation instanceof CSSTransition)) return true;
            return !/^(?:color|background-color|border-color|outline-color|fill|stroke|opacity|box-shadow|text-decoration-color)$/.test(
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
            const slot = target.closest("[data-slot]")?.getAttribute("data-slot") ?? target.tagName;
            return `${slot} ${name}`;
          })
      );
    }, PREVIEW);

    if (baseline.has(id)) {
      test.info().annotations.push({
        type: "known reduced-motion offender",
        description: moving.join(", ") || "now passes; remove it from the baseline",
      });
      return;
    }
    expect(moving, `animations still running on /components/${id}`).toEqual([]);
  });
}
