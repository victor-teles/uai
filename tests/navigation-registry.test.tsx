import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { navigationCatalog } from "@/components/registry/navigation/catalog";
import { NavigationCompositionFixture } from "./navigation-composition.fixture";

test("publishes every navigation source without drift and keeps examples executable", async () => {
  expect(navigationCatalog.map((item) => item.id)).toEqual([
    "app-sidebar",
    "breadcrumb-trail",
    "page-tabs",
    "command-menu",
    "split-pane",
  ]);
  for (const item of navigationCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/navigation/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Navigation");
    expect(mirror).toBe(`export * from "@/registry/uai/components/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all five examples together with unique identifiers", () => {
  const view = render(<NavigationCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(5);
  view.unmount();
});
