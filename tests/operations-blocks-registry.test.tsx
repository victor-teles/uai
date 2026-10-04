import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { operationsBlocksCatalog } from "@/components/registry/operations-blocks/catalog";
import { OperationsBlocksCompositionFixture } from "./operations-blocks-composition.fixture";

test("publishes every operations block without drift and keeps examples executable", async () => {
  expect(operationsBlocksCatalog.length).toBe(7);
  const registry = await Bun.file("registry.json").json();
  for (const item of operationsBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/operations-blocks/${item.id}-preview.tsx`,
    ).text();
    const entry = registry.items.find((candidate: { name: string }) => candidate.name === item.id);
    expect(item.category).toBe("Operations");
    expect(entry.type).toBe("registry:block");
    expect(mirror).toBe(`export * from "@/registry/uai/blocks/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    for (const [, component] of source.matchAll(/from "@\/components\/ui\/uai\/([\w-]+)"/g)) {
      expect(entry.registryDependencies).toContain(`https://uaiblocks.vercel.app/r/${component}.json`);
    }
  }
});

test("composes all seven examples together with unique identifiers", () => {
  const view = render(<OperationsBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(7);
  view.unmount();
});
