/**
 * Consumer install check.
 *
 * Installs registry items into a fresh shadcn project, the way a consumer would,
 * and proves the result type-checks and builds. The registry is served from this
 * checkout's `public/r` (run `bun run registry:build` first), never production:
 * item URLs that point at the homepage are rewritten to the local server on the fly.
 *
 *   bun scripts/consumer-check.ts --base base           # `shadcn init -d` (Base UI)
 *   bun scripts/consumer-check.ts --base radix          # `shadcn init -b radix`
 *   bun scripts/consumer-check.ts --base base --items prompt-composer,thinking
 *   bun scripts/consumer-check.ts --base base --app /tmp/app   # reuse a fresh app
 *
 * Steps: create-next-app (defaults) → shadcn init → shadcn add <items> → a page that
 * imports every installed item → `tsc --noEmit` → `next build`.
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const ROOT = path.resolve(import.meta.dir, "..");
const REGISTRY_OUT = path.join(ROOT, "public/r");

/** CI pins both (see .github/workflows/ci.yml) so a release can't change the test project under us. */
const SHADCN = process.env.SHADCN_VERSION ?? "latest";
const CREATE_NEXT_APP = process.env.CREATE_NEXT_APP_VERSION ?? "latest";

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "base" },
    items: { type: "string", default: "all" },
    app: { type: "string" },
    "skip-build": { type: "boolean", default: false },
  },
});

const base = values.base;
if (base !== "base" && base !== "radix") {
  throw new Error(`--base must be "base" or "radix", got "${base}"`);
}

const registry = (await Bun.file(path.join(ROOT, "registry.json")).json()) as {
  homepage: string;
  items: { name: string; type: string }[];
};

if (!existsSync(path.join(REGISTRY_OUT, "registry.json"))) {
  throw new Error("public/r is empty. Run `bun run registry:build` first.");
}

const allInstallable = registry.items
  .filter((item) => item.type === "registry:ui" || item.type === "registry:block")
  .map((item) => item.name);
const items = values.items === "all" ? allInstallable : values.items.split(",");
for (const name of items) {
  if (!allInstallable.includes(name)) throw new Error(`Unknown registry item "${name}"`);
}

// Serve public/r with production item URLs rewritten to this server.
const homepageRegistry = `${registry.homepage}/r/`;
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request): Promise<Response> {
    const { origin, pathname } = new URL(request.url);
    const name = pathname.replace(/^\/r\//, "");
    if (!/^[a-z0-9-]+\.json$/.test(name)) return new Response("Not found", { status: 404 });
    const file = Bun.file(path.join(REGISTRY_OUT, name));
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    const body = (await file.text()).replaceAll(homepageRegistry, `${origin}/r/`);
    return new Response(body, { headers: { "content-type": "application/json" } });
  },
});
const itemUrl = (name: string) => `${server.url.origin}/r/${name}.json`;

async function run(cmd: string[], cwd: string) {
  console.log(`\n$ ${cmd.join(" ")}  (in ${cwd})`);
  const proc = Bun.spawn(cmd, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CI: "1" },
  });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`Command failed (${code}): ${cmd.join(" ")}`);
}

const toIdentifier = (name: string) =>
  `Uai${name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())}`;

try {
  let app = values.app;
  if (!app) {
    const workDir = mkdtempSync(path.join(tmpdir(), `uai-consumer-${base}-`));
    app = path.join(workDir, "app");
    await run(
      [
        "npx",
        "-y",
        `create-next-app@${CREATE_NEXT_APP}`,
        app,
        "--yes",
        "--use-bun",
        "--disable-git",
      ],
      workDir,
    );
  }
  if (!existsSync(path.join(app, "components.json"))) {
    const init = base === "base" ? ["init", "-d"] : ["init", "-b", "radix", "-p", "nova", "-y"];
    await run(["npx", "-y", `shadcn@${SHADCN}`, ...init], app);
  }

  // One `add` per chunk keeps the CLI's dependency resolution fast without a
  // single huge request burst.
  const chunkSize = 20;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await run(
      ["npx", "-y", `shadcn@${SHADCN}`, "add", ...chunk.map(itemUrl), "-y", "--overwrite"],
      app,
    );
  }

  // Import every installed module from a page so `next build` compiles all of them,
  // not just whatever the starter page happens to use.
  const modules: string[] = [];
  for (const dir of ["components/ui/uai", "components/uai"]) {
    const abs = path.join(app, dir);
    if (!existsSync(abs)) continue;
    for (const file of readdirSync(abs)) {
      if (file.endsWith(".tsx")) modules.push(`@/${dir}/${file.replace(/\.tsx$/, "")}`);
    }
  }
  const page = [
    '"use client";',
    "",
    "// Generated by uai scripts/consumer-check.ts",
    ...modules.map((mod) => `import * as ${toIdentifier(path.basename(mod))} from "${mod}";`),
    "",
    `const modules = [${modules.map((mod) => toIdentifier(path.basename(mod))).join(", ")}];`,
    "",
    "export default function UaiConsumerCheck() {",
    "  return <p>{modules.reduce((count, mod) => count + Object.keys(mod).length, 0)} exports</p>;",
    "}",
    "",
  ].join("\n");
  mkdirSync(path.join(app, "app/uai-consumer-check"), { recursive: true });
  writeFileSync(path.join(app, "app/uai-consumer-check/page.tsx"), page);

  await run(["npx", "tsc", "--noEmit"], app);
  if (!values["skip-build"]) await run(["npx", "next", "build"], app);
  console.log(
    `\n✔ ${items.length} items install and type-check${values["skip-build"] ? "" : " and build"} on shadcn ${base}.`,
  );
} finally {
  server.stop(true);
}
