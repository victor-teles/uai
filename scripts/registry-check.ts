/**
 * Registry contract check.
 *
 * Verifies that every distributed item keeps its source, mirror, catalog entry,
 * preview, variants, dependencies, and reduced-motion handling in sync, and runs
 * the static checks from `quality/premium-rubric.md` (see `premium-lint.ts`).
 *
 *   bun run registry:check            # fail on violations not in the baseline
 *   bun run registry:check --update   # rewrite the baseline with current violations
 *
 * Known violations live in `scripts/registry-check.baseline.json` so CI stays green
 * while they are still reported. Fixing one makes its baseline entry stale; the
 * check prints stale entries so the baseline only shrinks.
 */
import { readdirSync } from "node:fs";
import path from "node:path";
import { registryCatalog } from "../src/components/registry/catalog";
import { lintPreview, lintSource } from "./premium-lint";

type RegistryFile = { path: string; type: string; target?: string };
type RegistryItem = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
};
type Violation = { rule: string; item: string; detail: string };

const ROOT = path.resolve(import.meta.dir, "..");
const BASELINE_PATH = path.join(ROOT, "scripts/registry-check.baseline.json");
const PREVIEW_ROOT = path.join(ROOT, "src/components/registry");
/** Older items keep their live preview inline in this file instead of `<id>-preview.tsx`. */
const LEGACY_PREVIEW = path.join(PREVIEW_ROOT, "registry-preview.tsx");

const registry = (await Bun.file(path.join(ROOT, "registry.json")).json()) as {
  homepage: string;
  items: RegistryItem[];
};
const registryUrl = (name: string) => `${registry.homepage}/r/${name}.json`;

/** Packages that every consumer already has; they never belong in `dependencies`. */
const IMPLICIT_PACKAGES = new Set(["react", "react-dom"]);
/** Items any distributed file may depend on without importing them. */
const AMBIENT_REGISTRY_DEPENDENCIES = new Set([registryUrl("uai-theme")]);

/** A class or CSS token that moves or fades something over time. */
const MOTION_PATTERN =
  /\b(?:transition(?:-[a-z[\]-]+)?|animate-(?!none)[a-z[\]-]+|duration-\d+)\b|@keyframes|requestAnimationFrame|\.animate\(/;
const REDUCED_MOTION_PATTERN =
  /motion-reduce:|motion-safe:|prefers-reduced-motion|useReducedMotion|reducedMotion/;

const violations: Violation[] = [];
const report = (rule: string, item: string, detail: string) =>
  violations.push({ rule, item, detail });

function targetToMirror(target: string): string | undefined {
  const aliases: Record<string, string> = {
    "@ui/": "src/components/ui/",
    "@components/": "src/components/",
    "@lib/": "src/lib/",
  };
  for (const [alias, dir] of Object.entries(aliases)) {
    if (target.startsWith(alias)) return dir + target.slice(alias.length);
  }
  return undefined;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const previewFiles = walk(PREVIEW_ROOT).filter((file) => file.endsWith(".tsx"));
const previewSources = new Map(
  await Promise.all(previewFiles.map(async (file) => [file, await Bun.file(file).text()] as const)),
);
const previewByItem = new Map(
  previewFiles
    .filter((file) => file.endsWith("-preview.tsx"))
    .map((file) => [path.basename(file, "-preview.tsx"), file]),
);
const catalogById = new Map(registryCatalog.map((entry) => [entry.id as string, entry]));

const declaredFiles = new Set<string>();

for (const item of registry.items) {
  const distributable = item.type === "registry:ui" || item.type === "registry:block";
  const declaredRegistryDeps = new Set(item.registryDependencies ?? []);
  const declaredPackages = new Set(item.dependencies ?? []);
  const requiredRegistryDeps = new Set<string>();
  const requiredPackages = new Set<string>();

  for (const file of item.files ?? []) {
    declaredFiles.add(file.path);
    const sourceFile = Bun.file(path.join(ROOT, file.path));
    if (!(await sourceFile.exists())) {
      report("missing-source", item.name, `${file.path} does not exist`);
      continue;
    }
    const source = await sourceFile.text();

    // 1. Source and its in-repo mirror must stay byte-identical.
    const mirror = file.target ? targetToMirror(file.target) : undefined;
    if (!mirror) {
      report("mirror-drift", item.name, `cannot resolve a mirror for target ${file.target}`);
    } else {
      const mirrorFile = Bun.file(path.join(ROOT, mirror));
      if (!(await mirrorFile.exists())) {
        report("mirror-drift", item.name, `${mirror} is missing`);
      } else {
        const mirrorText = await mirrorFile.text();
        const reExport = `export * from "@/${file.path.replace(/^src\//, "").replace(/\.tsx?$/, "")}";\n`;
        if (mirrorText !== reExport && mirrorText !== source) {
          report(
            "mirror-drift",
            item.name,
            `${mirror} must re-export ${file.path} or match it byte for byte`,
          );
        }
      }
    }

    // 2. Imports decide which registry items and packages the file needs.
    for (const [, specifier] of source.matchAll(/(?:from|import)\s+"([^"]+)"/g)) {
      if (!specifier) continue;
      const local =
        specifier.match(/^@\/components\/(?:ui\/)?uai\/([\w-]+)$/) ??
        specifier.match(/^@\/lib\/(uai-utils)$/);
      const primitive = specifier.match(/^@\/components\/ui\/([\w-]+)$/);
      if (local?.[1]) requiredRegistryDeps.add(registryUrl(local[1]));
      else if (primitive?.[1]) requiredRegistryDeps.add(primitive[1]);
      else if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
        const name = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : (specifier.split("/")[0] ?? specifier);
        if (!IMPLICIT_PACKAGES.has(name)) requiredPackages.add(name);
      }
    }

    // 5. Anything that animates must also stand still for reduced motion.
    if (MOTION_PATTERN.test(source) && !REDUCED_MOTION_PATTERN.test(source)) {
      report("reduced-motion", item.name, `${file.path} animates without reduced-motion handling`);
    }

    // 6. Premium rubric lint (quality/premium-rubric.md › §10).
    if (distributable) {
      for (const finding of lintSource(file.path, source)) {
        report(finding.rule, item.name, finding.detail);
      }
    }

    // 4. Every declared variant must reach the live preview.
    if (distributable) {
      const variantConstants = [
        ...source.matchAll(/export const ([A-Z][A-Z0-9_]*_VARIANTS)\s*=\s*\[([^\]]*)\]/g),
      ];
      if (variantConstants.length === 0) {
        report("missing-variants", item.name, "exports no *_VARIANTS constant");
      }
      const itemPreview = previewByItem.get(item.name);
      const previewText = itemPreview
        ? (previewSources.get(itemPreview) ?? "")
        : (previewSources.get(LEGACY_PREVIEW) ?? "");
      for (const [, constant, list] of variantConstants) {
        if (!constant) continue;
        const values = [...(list ?? "").matchAll(/"([^"]+)"/g)].map((match) => match[1]);
        const constantShown = [...previewSources.values()].some((text) =>
          new RegExp(`\\b${constant}\\b`).test(text),
        );
        const missing = values.filter((value) => !previewText.includes(`"${value}"`));
        if (!constantShown && missing.length > 0) {
          report(
            "variants-not-previewed",
            item.name,
            `${constant} values never previewed: ${missing.join(", ")}`,
          );
        }
      }
    }
  }

  for (const dep of requiredRegistryDeps) {
    if (dep !== registryUrl(item.name) && !declaredRegistryDeps.has(dep)) {
      report("registry-dependencies", item.name, `imports ${dep} but does not declare it`);
    }
  }
  // The catalog usage installs alongside the item, so its imports justify a dependency too.
  const usageRegistryDeps = new Set(
    [...(catalogById.get(item.name)?.usage ?? "").matchAll(/from "([^"]+)"/g)].flatMap(
      ([, specifier]) => {
        const local = specifier?.match(/^@\/components\/(?:ui\/)?uai\/([\w-]+)$/);
        const primitive = specifier?.match(/^@\/components\/ui\/([\w-]+)$/);
        if (local?.[1]) return [registryUrl(local[1])];
        if (primitive?.[1]) return [primitive[1]];
        return [];
      },
    ),
  );
  for (const dep of declaredRegistryDeps) {
    if (
      !requiredRegistryDeps.has(dep) &&
      !usageRegistryDeps.has(dep) &&
      !AMBIENT_REGISTRY_DEPENDENCIES.has(dep)
    ) {
      report("registry-dependencies", item.name, `declares ${dep} but never imports it`);
    }
  }
  for (const pkg of requiredPackages) {
    if (!declaredPackages.has(pkg)) {
      report("dependencies", item.name, `imports ${pkg} but does not declare it`);
    }
  }

  // 3. The catalog entry's usage is the preview file, verbatim.
  if (distributable) {
    const entry = catalogById.get(item.name);
    if (!entry) {
      report("catalog", item.name, "has no catalog entry");
      continue;
    }
    const preview = previewByItem.get(item.name);
    if (preview) {
      const relative = path.relative(ROOT, preview);
      for (const finding of lintPreview(relative, previewSources.get(preview) ?? "")) {
        report(finding.rule, item.name, finding.detail);
      }
    }
    if (!preview) {
      report("catalog-preview", item.name, "has no <id>-preview.tsx file to compare usage with");
    } else if (entry.usage !== previewSources.get(preview)) {
      report("catalog-preview", item.name, `usage differs from ${path.relative(ROOT, preview)}`);
    }
  }
}

// Registry source that registry.json never ships is dead weight.
for (const file of walk(path.join(ROOT, "src/registry"))) {
  const relative = path.relative(ROOT, file);
  if (!declaredFiles.has(relative))
    report("orphan-source", relative, "is not listed in registry.json");
}
for (const id of catalogById.keys()) {
  if (!registry.items.some((item) => item.name === id)) {
    report("catalog", id, "is in the catalog but not in registry.json");
  }
}

// Compare with the baseline.
const key = (violation: Violation) => `${violation.rule}:${violation.item}:${violation.detail}`;
const baselineFile = Bun.file(BASELINE_PATH);
const baseline: Violation[] = (await baselineFile.exists()) ? await baselineFile.json() : [];

if (process.argv.includes("--update")) {
  const sorted = [...violations].sort((a, b) => key(a).localeCompare(key(b)));
  await Bun.write(BASELINE_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Baseline updated with ${sorted.length} known violation(s).`);
  process.exit(0);
}

const baselineKeys = new Set(baseline.map(key));
const currentKeys = new Set(violations.map(key));
const fresh = violations.filter((violation) => !baselineKeys.has(key(violation)));
const known = violations.filter((violation) => baselineKeys.has(key(violation)));
const stale = baseline.filter((violation) => !currentKeys.has(key(violation)));

const print = (label: string, list: Violation[]) => {
  if (list.length === 0) return;
  console.log(`\n${label} (${list.length})`);
  for (const violation of list) {
    console.log(`  [${violation.rule}] ${violation.item}: ${violation.detail}`);
  }
};

console.log(`Checked ${registry.items.length} registry items.`);
print("Known violations (baseline)", known);
print("Fixed — remove from the baseline with --update", stale);
print("New violations", fresh);

if (fresh.length > 0) {
  console.error(
    `\n${fresh.length} new violation(s). Fix them, or run \`bun run registry:check --update\` only when the exception is intentional.`,
  );
  process.exit(1);
}
console.log("\nRegistry check passed.");
