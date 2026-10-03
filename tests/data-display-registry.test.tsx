import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { dataDisplayCatalog } from "@/components/registry/data-display/catalog";
import { DataDisplayCompositionFixture } from "./data-display-composition.fixture";

test("publishes every data display source without drift and keeps examples executable", async () => {
  expect(dataDisplayCatalog.length).toBe(7);
  for (const item of dataDisplayCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/data-display/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Data Display");
    expect(mirror).toBe(`export * from "@/registry/uai/components/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all seven examples together with unique identifiers", () => {
  const view = render(<DataDisplayCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(7);
  view.unmount();
});
