import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { AddressFormPreview } from "@/components/registry/brazil-blocks/address-form-preview";
import { brazilBlocksCatalog } from "@/components/registry/brazil-blocks/catalog";
import { getPreviewControl } from "@/components/registry/registry-preview";
import { ADDRESS_FORM_VARIANTS } from "@/registry/uai/blocks/address-form";

test("publishes every Brazil block without drift and keeps examples executable", async () => {
  // Derived, not counted: every preview file in the group has a catalog entry and the reverse.
  const previews = Array.from(
    new Bun.Glob("*-preview.tsx").scanSync("src/components/registry/brazil-blocks"),
  )
    .map((file) => file.replace(/-preview\.tsx$/, ""))
    .sort();
  expect(brazilBlocksCatalog.map((item): string => item.id).sort()).toEqual(previews);
  const registry = await Bun.file("registry.json").json();
  for (const item of brazilBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/brazil-blocks/${item.id}-preview.tsx`,
    ).text();
    const entry = registry.items.find((candidate: { name: string }) => candidate.name === item.id);
    expect(item.category).toBe("Brazil");
    expect(entry.type).toBe("registry:block");
    expect(mirror).toBe(`export * from "@/registry/uai/blocks/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    expect(source).not.toMatch(/\bfetch\(|viacep|brasilapi/i);
    for (const [, component] of source.matchAll(/from "@\/components\/ui\/uai\/([\w-]+)"/g)) {
      expect(entry.registryDependencies).toContain(`https://uaiblocks.dev/r/${component}.json`);
    }
  }
});

test("the preview control offers every Address Form variant", () => {
  expect(getPreviewControl("address-form")?.options.map((option) => option.id)).toEqual([
    ...ADDRESS_FORM_VARIANTS,
  ]);
});

test("renders every variant with unique identifiers", () => {
  for (const variant of ADDRESS_FORM_VARIANTS) {
    const view = render(<AddressFormPreview variant={variant} />);
    const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(view.container.querySelector(`[data-variant="${variant}"]`)).not.toBeNull();
    view.unmount();
  }
});
