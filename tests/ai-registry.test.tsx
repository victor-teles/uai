import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { aiCatalog } from "@/components/registry/ai/catalog";
import { getPreviewControl } from "@/components/registry/registry-preview";
import { AiCompositionFixture } from "./ai-composition.fixture";

test("publishes every AI source without drift and keeps examples executable", async () => {
  // Derived, not counted: every AI preview file has a catalog entry and the reverse.
  const previews = Array.from(new Bun.Glob("*-preview.tsx").scanSync("src/components/registry/ai"))
    .map((file) => file.replace(/-preview\.tsx$/, ""))
    .sort();
  expect(aiCatalog.map((item): string => item.id).sort()).toEqual(previews);
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
    // Three variants; Diff Review ships unified and compact (split side-by-side is a
    // follow-up), and Agent Question adds its three stacked layout states.
    const variants = item.id === "diff-review" ? 2 : item.id === "agent-question" ? 6 : 3;
    expect(getPreviewControl(item.id)?.options.length).toBe(variants);
  }
});

test("composes every example together with unique identifiers", () => {
  const view = render(<AiCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(
    aiCatalog.length,
  );
  view.unmount();
});
