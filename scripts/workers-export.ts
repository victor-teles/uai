/**
 * Finishes the static export in `out/` for Cloudflare Workers static assets
 * (`bun run build:workers` runs it after `next build`).
 *
 * A static export can't run the `rewrites()` in `next.config.mjs`, and Workers picks a
 * file's Content-Type from its extension, so this script reproduces what Vercel serves:
 *
 * - `/components/<id>.md`: a copy of `/llms.mdx/components/<id>`.
 * - `out/_redirects`: Next's 308 from a trailing slash to the bare path (Workers' own
 *   trailing-slash handling answers 307).
 * - `out/_headers`: the Content-Type of the extensionless share images and Markdown
 *   routes, `charset=utf-8` on the registry JSON and llms files, the long cache on
 *   `/_next/static`, and the CORS and HSTS headers Vercel sends on every response.
 *
 * Host redirects (`www.uaiblocks.dev` and `uaiblocks.vercel.app` to `uaiblocks.dev`)
 * live outside the Worker; see `docs/cloudflare-workers.md`.
 */
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? "out");

type HeaderRule = { path: string; headers: Record<string, string> };

/**
 * One `_headers` rule per URL pattern. An `:id` placeholder stands for one item, so the
 * file stays far below the 100-rule limit however many items the registry has.
 */
export function headerRules(shareImageRoutes: readonly string[]): HeaderRule[] {
  const markdown = { "Content-Type": "text/markdown; charset=utf-8" };
  return [
    {
      path: "/*",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Strict-Transport-Security": "max-age=63072000",
      },
    },
    {
      path: "/_next/static/*",
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
    {
      // Registry documents are plain static assets (no Worker script runs) that the shadcn
      // CLI and registry directories poll. A short shared cache absorbs bursts; after a
      // deploy, clients see the new document within five minutes.
      path: "/r/*",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    },
    { path: "/llms.txt", headers: markdown },
    { path: "/llms-full.txt", headers: markdown },
    { path: "/llms.mdx/components/:id", headers: markdown },
    ...shareImageRoutes.map((route) => ({ path: route, headers: { "Content-Type": "image/png" } })),
  ];
}

export function renderHeaders(rules: readonly HeaderRule[]) {
  return `${rules
    .map(({ path: rulePath, headers }) =>
      [rulePath, ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`)].join(
        "\n",
      ),
    )
    .join("\n")}\n`;
}

/** Next answers `/theming/` with a 308 to `/theming`; one rule per path depth the site has. */
export function renderRedirects(maxDepth = 3) {
  const lines: string[] = [];
  for (let depth = 1; depth <= maxDepth; depth++) {
    const segments = Array.from({ length: depth }, (_, index) => `/:s${index + 1}`).join("");
    lines.push(`${segments}/ ${segments} 308`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * The share image routes as `_headers` patterns. Next names them `opengraph-image` and
 * `twitter-image`, with a hash suffix under a dynamic segment, so read them from the export.
 */
function shareImageRoutes(componentsDir: string, ids: readonly string[]) {
  const routes = new Set(["/opengraph-image", "/twitter-image"]);
  for (const id of ids) {
    for (const file of readdirSync(path.join(componentsDir, id))) {
      if (/^(opengraph|twitter)-image(-\w+)?$/.test(file)) routes.add(`/components/:id/${file}`);
    }
  }
  return [...routes];
}

function main() {
  const componentsDir = path.join(outDir, "components");
  const markdownDir = path.join(outDir, "llms.mdx", "components");
  if (!existsSync(componentsDir) || !existsSync(markdownDir)) {
    throw new Error(`${outDir} is not a static export. Run \`bun run build:workers\`.`);
  }

  // The install commands and llms files read NEXT_PUBLIC_REGISTRY_URL at build time; an
  // export built without it would tell visitors to install from localhost.
  if (readFileSync(path.join(outDir, "index.html"), "utf8").includes("localhost:3000/r")) {
    throw new Error(
      "The export points installs at localhost. Build with NEXT_PUBLIC_REGISTRY_URL=https://uaiblocks.dev/r.",
    );
  }

  const ids = readdirSync(componentsDir).filter((entry) =>
    statSync(path.join(componentsDir, entry)).isDirectory(),
  );
  const markdown = readdirSync(markdownDir);
  for (const id of markdown) {
    copyFileSync(path.join(markdownDir, id), path.join(componentsDir, `${id}.md`));
  }

  writeFileSync(
    path.join(outDir, "_headers"),
    renderHeaders(headerRules(shareImageRoutes(componentsDir, ids))),
  );
  writeFileSync(path.join(outDir, "_redirects"), renderRedirects());
  console.log(
    `workers-export: ${markdown.length} Markdown copies, _headers, and _redirects written to ${outDir}`,
  );
}

if (import.meta.main) main();
