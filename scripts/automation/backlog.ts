/**
 * Reads and validates `backlog/ideas.yml`.
 *
 *   bun scripts/automation/backlog.ts check   # validate the file
 *   bun scripts/automation/backlog.ts next    # print the next `todo` idea (and write it to $GITHUB_OUTPUT)
 */
import { appendFileSync } from "node:fs";
import path from "node:path";

export const IDEA_STATUSES = ["proposed", "todo", "in-progress", "done", "rejected"] as const;

export type Idea = {
  id: string;
  title: string;
  category: string;
  kind: "component" | "block";
  status: (typeof IDEA_STATUSES)[number];
  description: string;
  "builds-on"?: string[];
};

const ROOT = path.resolve(import.meta.dir, "../..");
export const BACKLOG_PATH = path.join(ROOT, "backlog/ideas.yml");

export async function loadIdeas(file = BACKLOG_PATH): Promise<Idea[]> {
  const parsed = Bun.YAML.parse(await Bun.file(file).text()) as { ideas?: Idea[] };
  return parsed.ideas ?? [];
}

/** Problems that would make an idea unusable by the factory. */
export function validateIdeas(
  ideas: readonly Idea[],
  registryNames: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const idea of ideas) {
    const label = idea.id ?? "(missing id)";
    if (!/^[a-z][a-z0-9-]*$/.test(idea.id ?? "")) problems.push(`${label}: id must be kebab-case`);
    if (seen.has(idea.id)) problems.push(`${label}: duplicate id`);
    seen.add(idea.id);
    if (idea.status !== "done" && registryNames.has(idea.id)) {
      problems.push(`${label}: already exists in registry.json`);
    }
    if (!idea.title) problems.push(`${label}: missing title`);
    if (!idea.description || idea.description.length < 40) {
      problems.push(`${label}: description is missing or too short`);
    }
    if (idea.kind !== "component" && idea.kind !== "block") {
      problems.push(`${label}: kind must be component or block`);
    }
    if (!IDEA_STATUSES.includes(idea.status))
      problems.push(`${label}: unknown status ${idea.status}`);
    for (const dependency of idea["builds-on"] ?? []) {
      if (!registryNames.has(dependency))
        problems.push(`${label}: builds-on unknown item ${dependency}`);
    }
  }
  return problems;
}

export async function registryNames(): Promise<Set<string>> {
  const registry = (await Bun.file(path.join(ROOT, "registry.json")).json()) as {
    items: { name: string }[];
  };
  return new Set(registry.items.map((item) => item.name));
}

if (import.meta.main) {
  const command = process.argv[2];
  const ideas = await loadIdeas();
  const problems = validateIdeas(ideas, await registryNames());
  if (problems.length > 0) {
    console.error(`backlog/ideas.yml has ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  if (command === "next") {
    const next = ideas.find((idea) => idea.status === "todo");
    const values = next ? { found: "true", id: next.id, title: next.title } : { found: "false" };
    const lines = Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines}\n`);
    console.log(next ? JSON.stringify(next, null, 2) : "No idea with status todo.");
  } else if (command === "check" || command === undefined) {
    console.log(`backlog/ideas.yml: ${ideas.length} idea(s), valid.`);
  } else {
    console.error("Usage: backlog.ts check | next");
    process.exit(1);
  }
}
