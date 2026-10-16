/**
 * Idea scout: asks the model for new component ideas and appends them to
 * `backlog/ideas.yml` with `status: proposed`, for a human to accept or reject in
 * the bot's draft PR.
 *
 *   bun scripts/automation/idea-scout.ts [--count 3] [--dry-run]
 *
 * Needs AI_MODEL and ANTHROPIC_API_KEY or OPENAI_API_KEY (see ai.ts).
 */
import { appendFileSync } from "node:fs";
import { parseArgs } from "node:util";

import { completeWithAi, extractJson } from "./ai";
import { BACKLOG_PATH, type Idea, loadIdeas, registryNames, validateIdeas } from "./backlog";

const system = `You propose new items for Uai, an open-code shadcn registry of React
components and page blocks for websites and web apps, with a Brazil category (Pix,
CPF/CNPJ, CEP, installments). Propose items that are missing, broadly useful, and
small enough to ship as one compound component or block. Do not invent facts:
describe behavior, not statistics, and leave data (prices, dates, lists) to the
consumer. Reply with JSON only:
{"ideas": [{"id": "kebab-case", "title": "...", "category": "...",
"kind": "component" | "block", "description": "two or three sentences"}]}`;

function toYaml(idea: Idea) {
  const description = idea.description.replace(/\s+/g, " ").trim();
  return [
    `  - id: ${idea.id}`,
    `    title: ${JSON.stringify(idea.title)}`,
    `    category: ${JSON.stringify(idea.category)}`,
    `    kind: ${idea.kind}`,
    "    status: proposed",
    "    description: >-",
    `      ${description}`,
  ].join("\n");
}

async function main() {
  const { values } = parseArgs({
    options: { count: { type: "string", default: "3" }, "dry-run": { type: "boolean" } },
  });
  const count = Math.min(10, Math.max(1, Number(values.count) || 3));
  const ideas = await loadIdeas();
  const names = await registryNames();
  const taken = new Set([...names, ...ideas.map((idea) => idea.id)]);

  const reply = await completeWithAi({
    system,
    prompt: [
      `Existing registry items: ${[...names].sort().join(", ")}.`,
      `Already in the backlog: ${ideas.map((idea) => idea.id).join(", ")}.`,
      `Propose ${count} new ideas that are none of the above.`,
    ].join("\n"),
  });
  const proposed = (extractJson<{ ideas: Omit<Idea, "status">[] }>(reply).ideas ?? [])
    .map((idea) => ({ ...idea, status: "proposed" as const }))
    .filter((idea) => !taken.has(idea.id))
    .slice(0, count);

  const problems = validateIdeas(proposed, names);
  const valid = proposed.filter(
    (idea) => !problems.some((problem) => problem.startsWith(`${idea.id}:`)),
  );
  for (const problem of problems) console.warn(`Skipped: ${problem}`);
  if (valid.length === 0) {
    console.log("No new valid ideas this run.");
    return;
  }

  const block = `\n  # Proposed by idea-scout on ${new Date().toISOString().slice(0, 10)}\n${valid.map(toYaml).join("\n\n")}\n`;
  if (values["dry-run"]) {
    console.log(block);
    return;
  }
  appendFileSync(BACKLOG_PATH, block);
  console.log(`Added ${valid.length} proposed idea(s) to backlog/ideas.yml.`);
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
