import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { commerceBlocksCatalog } from "@/components/registry/commerce-blocks/catalog";
import { CommerceBlocksCompositionFixture } from "./commerce-blocks-composition.fixture";

test("publishes every commerce block without drift and keeps examples executable", async () => {
  expect(commerceBlocksCatalog.map((item) => item.id)).toEqual([
    "product-detail",
    "product-listing",
    "cart-drawer",
    "checkout",
    "order-tracking",
    "subscription-management",
  ]);
  for (const item of commerceBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/commerce-blocks/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Commerce");
    expect(output.type).toBe("registry:block");
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all six blocks together with unique identifiers", () => {
  const view = render(<CommerceBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
