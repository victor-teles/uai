import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { appBlocksCatalog } from "@/components/registry/app-blocks/catalog";
import { AppBlocksCompositionFixture } from "./app-blocks-composition.fixture";

test("publishes every application block without drift and keeps examples executable", async () => {
  expect(appBlocksCatalog.map((item) => item.id)).toEqual([
    "dashboard-shell",
    "settings-page",
    "profile-page",
    "team-management",
    "notification-center",
    "billing-portal",
    "search-results",
  ]);
  for (const item of appBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/app-blocks/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Application");
    expect(mirror).toBe(`export * from "@/registry/uai/blocks/${item.id}";\n`);
    expect(output.type).toBe("registry:block");
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    for (const [, component] of source.matchAll(/@\/components\/ui\/uai\/([\w-]+)/g)) {
      expect(output.registryDependencies).toContain(
        `https://uaiblocks.vercel.app/r/${component}.json`,
      );
    }
  }
});

test("composes all seven blocks together with unique identifiers", () => {
  const view = render(<AppBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(7);
  view.unmount();
});
