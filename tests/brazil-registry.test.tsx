import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { brazilCatalog } from "@/components/registry/brazil/catalog";
import { BrazilCompositionFixture } from "./brazil-composition.fixture";

test("publishes every Brazil source without drift and keeps examples executable", async () => {
  expect(brazilCatalog.map((item) => item.id)).toEqual([
    "document-field",
    "cep-field",
    "pix-payment",
    "installment-picker",
  ]);
  for (const item of brazilCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(`src/components/registry/brazil/${item.id}-preview.tsx`).text();
    expect(item.category).toBe("Brazil");
    expect(mirror).toBe(`export * from "@/registry/uai/components/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(output.categories).toContain("brazil");
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all four examples together with unique identifiers", () => {
  const view = render(<BrazilCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(4);
  view.unmount();
});
