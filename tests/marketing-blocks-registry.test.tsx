import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { marketingBlocksCatalog } from "@/components/registry/marketing-blocks/catalog";
import { MarketingBlocksCompositionFixture } from "./marketing-blocks-composition.fixture";

test("publishes every marketing block without drift and keeps examples executable", async () => {
  expect(marketingBlocksCatalog.map((item) => item.id)).toEqual([
    "hero-section",
    "feature-showcase",
    "pricing-section",
    "testimonials-section",
    "faq-section",
    "call-to-action",
    "waitlist-section",
    "contact-section",
  ]);
  for (const item of marketingBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/marketing-blocks/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Marketing");
    expect(output.type).toBe("registry:block");
    expect(mirror).toBe(`export * from "@/registry/uai/blocks/${item.id}";\n`);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all eight blocks together with unique identifiers", () => {
  const view = render(<MarketingBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(8);
  view.unmount();
});
