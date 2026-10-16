import { describe, expect, test } from "bun:test";

import { AiConfigError, extractJson, resolveAiConfig } from "../scripts/automation/ai";
import { type Idea, loadIdeas, registryNames, validateIdeas } from "../scripts/automation/backlog";
import { assertBotBranch, isAllowed, MAX_OPEN_BOT_PRS } from "../scripts/automation/bot-pr";
import { clampScore, loadRubric } from "../scripts/design-review";

describe("design review", () => {
  test("fails with a pointer to Designer when the rubric is missing", async () => {
    await expect(loadRubric("/nonexistent/premium-rubric.md")).rejects.toThrow(/Designer/);
  });

  test("clamps scores to 1-10 and rejects non-numbers", () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(7.4)).toBe(7);
    expect(clampScore("12")).toBe(10);
    expect(() => clampScore("great")).toThrow();
  });
});

describe("bot PR guardrails", () => {
  test("allows a new PR only below the open limit", () => {
    expect(MAX_OPEN_BOT_PRS).toBe(2);
    expect(isAllowed(0)).toBe(true);
    expect(isAllowed(1)).toBe(true);
    expect(isAllowed(2)).toBe(false);
  });

  test("only opens from bot/* branches", () => {
    expect(() => assertBotBranch("bot/component-boleto-payment")).not.toThrow();
    expect(() => assertBotBranch("main")).toThrow();
    expect(() => assertBotBranch("feature/x")).toThrow();
  });
});

describe("AI config", () => {
  test("reads keys only from the environment and requires a model", () => {
    expect(() => resolveAiConfig({})).toThrow(AiConfigError);
    expect(() => resolveAiConfig({ OPENAI_API_KEY: "k" })).toThrow(/AI_MODEL/);
    expect(resolveAiConfig({ ANTHROPIC_API_KEY: "a", AI_MODEL: "m" }).provider).toBe("anthropic");
    expect(resolveAiConfig({ OPENAI_API_KEY: "o", AI_MODEL: "m" }).provider).toBe("openai");
    expect(() =>
      resolveAiConfig({ AI_PROVIDER: "openai", ANTHROPIC_API_KEY: "a", AI_MODEL: "m" }),
    ).toThrow(/API key/);
  });

  test("extracts JSON from a fenced reply", () => {
    expect(extractJson<{ score: number }>('Here:\n```json\n{"score": 8}\n```')).toEqual({
      score: 8,
    });
  });
});

describe("backlog", () => {
  test("ideas.yml is valid against the registry", async () => {
    expect(validateIdeas(await loadIdeas(), await registryNames())).toEqual([]);
  });

  test("ships the Brazil ideas", async () => {
    const ids = (await loadIdeas()).map((idea) => idea.id);
    for (const id of [
      "boleto-payment",
      "nota-fiscal-summary",
      "address-form",
      "phone-field-br",
      "holiday-calendar",
    ]) {
      expect(ids).toContain(id);
    }
  });

  test("flags duplicates, existing items, and unknown dependencies", () => {
    const base: Idea = {
      id: "cep-field",
      title: "CEP",
      category: "Brazil",
      kind: "component",
      status: "todo",
      description: "A description that is long enough to pass the length check.",
      "builds-on": ["nope"],
    };
    const problems = validateIdeas([base, base], new Set(["cep-field"]));
    expect(problems.some((p) => p.includes("duplicate"))).toBe(true);
    expect(problems.some((p) => p.includes("already exists"))).toBe(true);
    expect(problems.some((p) => p.includes("unknown item nope"))).toBe(true);
  });
});
