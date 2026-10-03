import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { marketingCatalog } from "@/components/registry/marketing/catalog";
import { MarketingCompositionFixture } from "./marketing-composition.fixture";

test("publishes every marketing source without drift and keeps examples executable", async () => {
  expect(marketingCatalog.map((item) => item.id)).toEqual([
    "announcement-bar",
    "pricing-toggle",
    "testimonial-card",
    "product-gallery",
    "trust-panel",
    "newsletter-form",
  ]);
  for (const item of marketingCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/marketing/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Marketing");
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all six examples together with unique identifiers", () => {
  const view = render(<MarketingCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
