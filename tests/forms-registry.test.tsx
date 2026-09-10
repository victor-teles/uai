import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { formsCatalog } from "@/components/registry/forms/catalog";
import { FormsCompositionFixture } from "./forms-composition.fixture";

test("publishes every form source without drift and keeps examples executable", async () => {
  for (const item of formsCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(`src/components/registry/forms/${item.id}-preview.tsx`).text();
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all eight examples together with unique field identifiers", () => {
  const view = render(<FormsCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(8);
  view.unmount();
});
