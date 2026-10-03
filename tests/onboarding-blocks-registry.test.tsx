import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { onboardingBlocksCatalog } from "@/components/registry/onboarding-blocks/catalog";
import { OnboardingBlocksCompositionFixture } from "./onboarding-blocks-composition.fixture";

test("publishes every onboarding block without drift and keeps examples executable", async () => {
  expect(onboardingBlocksCatalog.map((item) => item.id)).toEqual([
    "code-verification",
    "onboarding-wizard",
    "workspace-setup",
  ]);
  for (const item of onboardingBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/onboarding-blocks/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Authentication");
    expect(output.type).toBe("registry:block");
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all three blocks together with unique identifiers", () => {
  const view = render(<OnboardingBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(3);
  view.unmount();
});
