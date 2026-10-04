import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { mapsCatalog } from "@/components/registry/maps/catalog";
import { MapsCompositionFixture } from "./maps-composition.fixture";

test("publishes every map source without drift and keeps examples executable", async () => {
  expect(mapsCatalog.map((item) => item.id)).toEqual([
    "map-frame",
    "map-controls",
    "map-marker",
    "map-legend",
    "place-card",
    "route-summary",
  ]);
  for (const item of mapsCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(`src/components/registry/maps/${item.id}-preview.tsx`).text();
    expect(item.category).toBe("Maps");
    expect(mirror).toBe(`export * from "@/registry/uai/components/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    expect(source).not.toContain("var(--uai-");
  }
});

test("composes all six examples together with unique identifiers", () => {
  const view = render(<MapsCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
