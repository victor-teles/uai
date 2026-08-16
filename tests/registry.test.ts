import { describe, expect, test } from "bun:test";

type RegistryItem = {
  name: string;
  registryDependencies?: string[];
};

type Registry = {
  items: RegistryItem[];
};

const registry = (await Bun.file("registry.json").json()) as Registry;
const itemNames = registry.items.map((item) => item.name);

describe("Uai registry", () => {
  test("publishes the complete starter collection", () => {
    expect(itemNames).toEqual([
      "uai-theme",
      "uai-utils",
      "thinking",
      "approval-card",
      "task-list",
      "prompt-composer",
      "task-flow",
    ]);
  });

  test("builds a public JSON document for every item", async () => {
    for (const item of registry.items) {
      expect(await Bun.file(`public/r/${item.name}.json`).exists()).toBe(true);
    }
  });

  test("keeps the composed block dependency-complete", () => {
    const taskFlow = registry.items.find((item) => item.name === "task-flow");

    expect(taskFlow?.registryDependencies).toEqual([
      "http://localhost:3000/r/thinking.json",
      "http://localhost:3000/r/approval-card.json",
      "http://localhost:3000/r/task-list.json",
      "http://localhost:3000/r/prompt-composer.json",
      "http://localhost:3000/r/uai-theme.json",
      "http://localhost:3000/r/uai-utils.json",
    ]);
  });

  test("ships consumer imports instead of registry-source imports", async () => {
    const outputs = await Promise.all(
      itemNames.map((item) => Bun.file(`public/r/${item}.json`).text()),
    );

    expect(outputs.join("\n")).not.toContain("@/registry/");
    expect(outputs.join("\n")).toContain("@/components/ui/uai/thinking");
    expect(outputs.join("\n")).toContain("@/lib/uai-utils");
  });

  test("prompt composer ships chrome and density variants", async () => {
    const source = await Bun.file("src/registry/uai/components/prompt-composer.tsx").text();

    expect(source).toContain('["rounded", "pill", "ghost", "compact"]');
  });

  test("publishes tokens for light and dark themes", async () => {
    const theme = (await Bun.file("public/r/uai-theme.json").json()) as {
      cssVars?: { light?: Record<string, string>; dark?: Record<string, string> };
    };

    expect(theme.cssVars?.light?.["uai-accent"]).toBeDefined();
    expect(theme.cssVars?.dark?.["uai-accent"]).toBeDefined();
  });
});
