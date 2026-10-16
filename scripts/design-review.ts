/**
 * Design review: scores registry items 1–10 against the premium rubric.
 *
 * Sends each item's Playwright screenshots (dark and light, from `bun run test:e2e`)
 * and the rubric in `quality/premium-rubric.md` to a vision model, and writes the
 * scores to `e2e-artifacts/design-review.json`.
 *
 *   bun scripts/design-review.ts                       # every item with screenshots
 *   bun scripts/design-review.ts --items thinking,pix-payment
 *   bun scripts/design-review.ts --project mobile --limit 5
 *   bun scripts/design-review.ts --dry-run             # list what would be sent, no API call
 *
 * Needs AI_MODEL and ANTHROPIC_API_KEY or OPENAI_API_KEY (see scripts/automation/ai.ts).
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { AiConfigError, completeWithAi, extractJson } from "./automation/ai";

const ROOT = path.resolve(import.meta.dir, "..");
export const RUBRIC_PATH = path.join(ROOT, "quality/premium-rubric.md");
const SCREENSHOTS = path.join(ROOT, "e2e-artifacts/screenshots");
const REPORT_PATH = path.join(ROOT, "e2e-artifacts/design-review.json");
const THEMES = ["dark", "light"] as const;

export type DesignReview = {
  item: string;
  score: number;
  verdict: "Premium" | "Polish needed";
  mustFails: string[];
  rejections: string[];
  notes: string;
};

export async function loadRubric(rubricPath = RUBRIC_PATH): Promise<string> {
  if (!existsSync(rubricPath)) {
    throw new Error(
      `Rubric not found at ${path.relative(ROOT, rubricPath)}. The premium rubric is written by ` +
        "Designer and lives in quality/premium-rubric.md (see quality/README.md). " +
        "Add it before running the design review.",
    );
  }
  return Bun.file(rubricPath).text();
}

export function clampScore(value: unknown): number {
  const score = Math.round(Number(value));
  if (!Number.isFinite(score)) throw new Error(`Model returned a non-numeric score: ${value}`);
  return Math.min(10, Math.max(1, score));
}

const system = `You are the design reviewer for Uai, an open-code shadcn registry.
Score one registry item against the rubric you are given. Judge only what the
screenshots show plus the rubric's definitions; do not invent interactions you cannot
see. Reply with JSON only:
{"score": <integer 1-10>, "verdict": "Premium" | "Polish needed",
 "mustFails": ["<rubric ID>: <short reason>"], "rejections": ["<X-ID>: <short reason>"],
 "notes": "<two or three sentences, most important fix first>"}`;

async function reviewItem(item: string, project: string, rubric: string): Promise<DesignReview> {
  const images = await Promise.all(
    THEMES.map(async (theme) => ({
      mediaType: "image/png" as const,
      base64: Buffer.from(
        await Bun.file(path.join(SCREENSHOTS, project, theme, `${item}.png`)).arrayBuffer(),
      ).toString("base64"),
      label: `${item}, ${theme} theme, ${project} viewport:`,
    })),
  );
  const reply = await completeWithAi({
    system,
    images,
    prompt: `Rubric:\n\n${rubric}\n\nReview the registry item "${item}" shown above.`,
  });
  const parsed = extractJson<Partial<DesignReview>>(reply);
  const score = clampScore(parsed.score);
  return {
    item,
    score,
    verdict: parsed.verdict === "Premium" ? "Premium" : "Polish needed",
    mustFails: parsed.mustFails ?? [],
    rejections: parsed.rejections ?? [],
    notes: parsed.notes ?? "",
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      items: { type: "string" },
      project: { type: "string", default: "desktop" },
      limit: { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const project = values.project ?? "desktop";
  const rubric = await loadRubric();

  const shotDir = path.join(SCREENSHOTS, project, "dark");
  if (!existsSync(shotDir)) {
    throw new Error(
      `No screenshots in ${path.relative(ROOT, shotDir)}. Run \`bun run test:e2e\` first.`,
    );
  }
  const available = readdirSync(shotDir)
    .filter((file) => file.endsWith(".png"))
    .map((file) => file.replace(/\.png$/, ""))
    .filter((item) =>
      THEMES.every((theme) => existsSync(path.join(SCREENSHOTS, project, theme, `${item}.png`))),
    )
    .sort();
  const requested = values.items
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  let items = requested ? available.filter((item) => requested.includes(item)) : available;
  const missing = (requested ?? []).filter((item) => !available.includes(item));
  if (missing.length > 0)
    throw new Error(`No dark and light screenshots for: ${missing.join(", ")}`);
  if (values.limit) items = items.slice(0, Number(values.limit));

  if (values["dry-run"]) {
    console.log(
      `Rubric: ${rubric.length} characters. Would review ${items.length} item(s) (${project}):`,
    );
    for (const item of items) console.log(`  ${item}`);
    return;
  }

  const reviews: DesignReview[] = [];
  for (const item of items) {
    const review = await reviewItem(item, project, rubric);
    reviews.push(review);
    console.log(`${String(review.score).padStart(2)}/10  ${review.verdict.padEnd(13)}  ${item}`);
  }
  reviews.sort((a, b) => a.score - b.score);
  await Bun.write(
    REPORT_PATH,
    `${JSON.stringify({ project, reviewedAt: new Date().toISOString(), reviews }, null, 2)}\n`,
  );
  console.log(`\nWrote ${path.relative(ROOT, REPORT_PATH)}.`);
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    if (error instanceof AiConfigError) console.error(`Configuration: ${error.message}`);
    else console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
