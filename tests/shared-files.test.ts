import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { registryCatalog } from "@/components/registry/catalog";

/**
 * Guards for the files every component PR would otherwise edit (CONTRIBUTING.md ›
 * Shared files): parallel PRs must be able to merge in any order without conflicts.
 */
const root = path.join(import.meta.dirname, "..");

function tracked(pathspec: string) {
  const result = Bun.spawnSync(["git", "ls-files", "--", pathspec], { cwd: root });
  return result.stdout.toString().trim();
}

function trackedList(pathspec: string) {
  return tracked(pathspec).split("\n").filter(Boolean);
}

const catalogIds = registryCatalog.map((item): string => item.id).sort();

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

  test("registry.json is generated from one <id>.json per item, not committed", () => {
    expect(tracked("registry.json")).toBe("");
    const entries = trackedList("src/registry/uai/**/*.json").map((file) =>
      path.basename(file, ".json"),
    );
    expect(entries.filter((id) => !id.startsWith("uai-")).sort()).toEqual(catalogIds);
  });

  test("previews are one <id>-entry.tsx per item, not a group map", () => {
    expect(tracked("src/components/registry/*/preview.tsx")).toBe("");
    expect(tracked("src/components/registry/preview-entries.generated.ts")).toBe("");
    const entries = trackedList("src/components/registry/*/*-entry.tsx").map((file) =>
      path.basename(file, "-entry.tsx"),
    );
    expect(entries.sort()).toEqual(catalogIds);
    const preview = readFileSync(
      path.join(root, "src/components/registry/registry-preview.tsx"),
      "utf8",
    );
    expect(preview).not.toMatch(/from "\.\/[\w-]+\//);
  });

  test("PRODUCT.md describes groups without enumerating their items", () => {
    const product = readFileSync(path.join(root, "PRODUCT.md"), "utf8");
    expect(product).not.toMatch(/\bcatalog (?:includes|contains)\b/i);
  });
});
