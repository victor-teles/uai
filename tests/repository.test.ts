import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";

import { getRegistryItemKind, registryCatalog } from "@/components/registry/catalog";
import { getLlmsIndex, getLlmsPage, renderLlmsPage } from "@/lib/llms";
import { registrySourcePath, registrySourceUrl, repositoryUrl } from "@/lib/repository";
import packageJson from "../package.json";

const root = path.join(import.meta.dirname, "..");

describe("GitHub repository links", () => {
  test("package.json points at the repository", () => {
    expect(packageJson.repository.url).toBe(`git+${repositoryUrl}.git`);
    expect(packageJson.bugs.url).toBe(`${repositoryUrl}/issues`);
  });

  test("every item's View source link names a file that exists", () => {
    for (const item of registryCatalog) {
      const file = registrySourcePath(item.id, getRegistryItemKind(item.id));
      expect(existsSync(path.join(root, file))).toBe(true);
    }
  });

  test("llms.txt and each item page link the source", () => {
    expect(getLlmsIndex()).toContain(repositoryUrl);
    const page = getLlmsPage("agent-run");
    if (!page) throw new Error("Missing agent-run page");
    expect(renderLlmsPage(page)).toContain(`- Source: ${registrySourceUrl("agent-run", "block")}`);
  });
});
