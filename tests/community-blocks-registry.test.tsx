import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { communityBlocksCatalog } from "@/components/registry/community-blocks/catalog";
import { CommunityBlocksCompositionFixture } from "./community-blocks-composition.fixture";

test("publishes every content and community block without drift and keeps examples executable", async () => {
  expect(communityBlocksCatalog.map((item) => item.id)).toEqual([
    "article-page",
    "documentation-page",
    "changelog-page",
    "comment-thread",
    "community-feed",
    "public-profile",
  ]);
  for (const item of communityBlocksCatalog) {
    const source = await Bun.file(`src/registry/uai/blocks/${item.id}.tsx`).text();
    const mirror = await Bun.file(`src/components/uai/${item.id}.tsx`).text();
    const output = await Bun.file(`public/r/${item.id}.json`).json();
    const preview = await Bun.file(
      `src/components/registry/community-blocks/${item.id}-preview.tsx`,
    ).text();
    expect(item.category).toBe("Content");
    expect(output.type).toBe("registry:block");
    expect(mirror).toBe(source);
    expect(output.files[0].content).toBe(source);
    expect(item.usage).toBe(preview);
    expect(item.accessibility.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain("@/registry/");
  }
});

test("composes all six blocks together with unique identifiers", () => {
  const view = render(<CommunityBlocksCompositionFixture />);
  const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(view.container.querySelectorAll("[data-variant]").length).toBeGreaterThanOrEqual(6);
  view.unmount();
});
