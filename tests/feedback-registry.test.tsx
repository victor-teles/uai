import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { feedbackCatalog } from "@/components/registry/feedback/catalog";
import { getFeedbackPreviewControl } from "@/components/registry/feedback/preview";
import { FeedbackCompositionFixture } from "./feedback-composition.fixture";

test("publishes every feedback source without drift and keeps examples executable", async () => {
  expect(feedbackCatalog.length).toBe(6);
  for (const item of feedbackCatalog) {
    const source = await Bun.file(`src/registry/uai/components/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/ui/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/feedback/${item.id}-preview.tsx`,
    ).text();
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.category).toBe("Feedback");
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
    expect(getFeedbackPreviewControl(item.id)?.options.length).toBe(3);
  }
});

test("composes all six examples together with unique identifiers", () => {
  const view = render(<FeedbackCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
