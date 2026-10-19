import { expect, test } from "@playwright/test";

import { CANVAS, DOCK, FLOATING_CHROME, findSpecimen } from "../scripts/og-clip";
import { componentIds, openComponent, settle } from "./helpers";

/**
 * Share-image captures come from the specimen canvas only. For every item this finds the
 * rect `bun run og:capture` would shoot, on the real page with the "Code example" dock
 * visible (the floating variant switch and zoom controls are hidden, as in a capture),
 * and checks that it stays on the canvas and that nothing painted inside it
 * belongs to the dock. `findSpecimen` itself throws if the rect leaves the canvas or
 * touches the dock.
 */
test.describe("share-image capture rect", () => {
  test.skip(({ isMobile }) => isMobile, "og:capture runs at a 1440px desktop viewport");
  test.use({ viewport: { width: 1440, height: 1000 } });

  for (const id of componentIds) {
    test(`${id} stays on the canvas`, async ({ page }) => {
      await openComponent(page, id);
      await settle(page);
      await page.addStyleTag({ content: `${FLOATING_CHROME} { visibility: hidden !important; }` });
      const { clip } = await findSpecimen(page, id);
      const hits = await page.evaluate(
        ({ clip, canvas, dock }) => {
          const points: [number, number][] = [];
          for (const fx of [0.02, 0.5, 0.98])
            for (const fy of [0.02, 0.5, 0.98])
              points.push([clip.x + clip.width * fx, clip.y + clip.height * fy]);
          return points.map(([x, y]) => {
            const top = document.elementFromPoint(x, y);
            return { onCanvas: Boolean(top?.closest(canvas)), inDock: Boolean(top?.closest(dock)) };
          });
        },
        { clip, canvas: CANVAS, dock: DOCK },
      );
      expect(hits.filter((hit) => hit.inDock)).toEqual([]);
      expect(hits.every((hit) => hit.onCanvas)).toBe(true);
    });
  }
});
