import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { aiCatalog } from "@/components/registry/ai/catalog";
import { getAiPreviewControl } from "@/components/registry/ai/preview";
import { AiCompositionFixture } from "./ai-composition.fixture";

test("publishes every AI source without drift and keeps examples executable", async () => {
  expect(aiCatalog.length).toBe(6);
  for (const item of aiCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(`src/components/registry/ai/${item.id}-preview.tsx`).text();
    expect(mirror).toBe(`export * from "@/registry/uai/components/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.category).toBe("AI");
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    expect(getAiPreviewControl(item.id)?.options.length).toBe(3);
  }
});

test("composes all six examples together with unique identifiers", () => {
  const view = render(<AiCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
