import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { aiBlocksCatalog } from "@/components/registry/ai-blocks/catalog";
import { AiBlocksCompositionFixture } from "./ai-blocks-composition.fixture";

test("publishes every AI block without drift and keeps examples executable", async () => {
  expect(aiBlocksCatalog.length).toBe(4);
  const registry = await Bun.file("registry.json").json();
  for (const item of aiBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/ai-blocks/${item.id}-preview.tsx`,
    ).text();
    const entry = registry.items.find((candidate: { name: string }) => candidate.name === item.id);
    expect(item.category).toBe("AI");
    expect(entry.type).toBe("registry:block");
    expect(mirror).toBe(`export * from "@/registry/uai/blocks/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    for (const [, component] of source.matchAll(/from "@\/components\/ui\/uai\/([\w-]+)"/g)) {
      expect(entry.registryDependencies).toContain(`https://useuai.vercel.app/r/${component}.json`);
    }
  }
});

test("composes all four examples together with unique identifiers", () => {
  const view = render(<AiBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(4);
  view.unmount();
});
