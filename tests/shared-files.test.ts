import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Guards for the files every component PR would otherwise edit (CONTRIBUTING.md ›
 * Shared files): parallel PRs must be able to merge in any order without conflicts.
 */
const root = path.join(import.meta.dirname, "..");

function tracked(pathspec: string) {
  const result = Bun.spawnSync(["git", "ls-files", "--", pathspec], { cwd: root });
  return result.stdout.toString().trim();
}

describe("shared files", () => {
  test("the README carries no hardcoded item count", () => {
    const readme = readFileSync(path.join(root, "README.md"), "utf8");
    expect(readme).not.toMatch(/\b\d{2,}\s+(?:shadcn\s+)?(?:components|items|blocks)\b/i);
    expect(readme).not.toMatch(/\ball\s+\d+\s+items\b/i);
  });

  test("public/r is a build output and is not committed", () => {
    expect(tracked("public/r")).toBe("");
  });

  test("share-image metadata is one file per item, not a shared manifest", () => {
    expect(tracked("src/assets/og/manifest.json")).toBe("");
  });
});
