/**
 * Guardrails for pull requests opened by the automation workflows.
 *
 *   bun scripts/automation/bot-pr.ts check
 *     Counts open PRs labelled `bot`. Writes `allowed=true|false` and `open=<n>` to
 *     $GITHUB_OUTPUT (or stdout locally).
 *
 *   bun scripts/automation/bot-pr.ts open --branch bot/<name> --title "<title>" --body-file <file>
 *     Commits the working tree to a new `bot/*` branch and opens it as a DRAFT pull
 *     request against main with the `bot` label. Re-checks the limit first, never
 *     touches main, and never force-pushes. Does nothing when the tree is clean.
 *
 * Needs `gh` authenticated through GH_TOKEN (the workflow's GITHUB_TOKEN).
 */
import { appendFileSync } from "node:fs";
import { parseArgs } from "node:util";

export const MAX_OPEN_BOT_PRS = 2;
export const BOT_LABEL = "bot";

function run(command: string[], { allowFailure = false } = {}) {
  const result = Bun.spawnSync(command, { stdout: "pipe", stderr: "pipe" });
  const stdout = result.stdout.toString().trim();
  if (result.exitCode !== 0 && !allowFailure) {
    throw new Error(`${command.join(" ")} failed: ${result.stderr.toString().trim() || stdout}`);
  }
  return { ok: result.exitCode === 0, stdout };
}

function output(values: Record<string, string>) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
  else console.log(lines.join("\n"));
}

export function openBotPrCount(): number {
  const { stdout } = run([
    "gh",
    "pr",
    "list",
    "--state",
    "open",
    "--label",
    BOT_LABEL,
    "--json",
    "number",
    "--limit",
    "100",
  ]);
  return (JSON.parse(stdout || "[]") as unknown[]).length;
}

export function isAllowed(open: number) {
  return open < MAX_OPEN_BOT_PRS;
}

export function assertBotBranch(branch: string) {
  if (!/^bot\/[a-z0-9][a-z0-9._/-]*$/.test(branch)) {
    throw new Error(`Bot branches must match bot/<name>; got "${branch}".`);
  }
}

function check() {
  const open = openBotPrCount();
  const allowed = isAllowed(open);
  if (!allowed) {
    console.log(
      `::notice::${open} bot PRs are open (limit ${MAX_OPEN_BOT_PRS}). Skipping this run.`,
    );
  }
  output({ allowed: String(allowed), open: String(open) });
}

function open(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      branch: { type: "string" },
      title: { type: "string" },
      "body-file": { type: "string" },
    },
  });
  const { branch, title } = values;
  const bodyFile = values["body-file"];
  if (!branch || !title || !bodyFile)
    throw new Error("open needs --branch, --title and --body-file");
  assertBotBranch(branch);

  if (!run(["git", "status", "--porcelain"]).stdout) {
    console.log("::notice::Nothing changed, so there is nothing to propose.");
    output({ opened: "false" });
    return;
  }
  const count = openBotPrCount();
  if (!isAllowed(count)) {
    console.log(`::notice::${count} bot PRs are already open (limit ${MAX_OPEN_BOT_PRS}).`);
    output({ opened: "false" });
    return;
  }

  run(
    [
      "gh",
      "label",
      "create",
      BOT_LABEL,
      "--color",
      "C5DEF5",
      "--description",
      "Opened by an automation workflow",
    ],
    { allowFailure: true },
  );
  run(["git", "switch", "--create", branch]);
  run(["git", "add", "--all"]);
  run(["git", "commit", "--message", title]);
  run(["git", "push", "--set-upstream", "origin", branch]);
  const { stdout: url } = run([
    "gh",
    "pr",
    "create",
    "--draft",
    "--base",
    "main",
    "--head",
    branch,
    "--label",
    BOT_LABEL,
    "--title",
    title,
    "--body-file",
    bodyFile,
  ]);
  console.log(`Opened draft PR ${url}`);
  output({ opened: "true", url });
}

if (import.meta.main) {
  const [command, ...rest] = process.argv.slice(2);
  try {
    if (command === "check") check();
    else if (command === "open") open(rest);
    else throw new Error("Usage: bot-pr.ts check | open --branch … --title … --body-file …");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
