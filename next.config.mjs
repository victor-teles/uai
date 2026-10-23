/**
 * The old Vercel host keeps working for links already out there (shadcn directory,
 * awesome lists, logo URLs): it permanently redirects to the canonical domain with
 * the path and query kept. The exact-host match leaves preview hosts and localhost alone.
 */
const legacyHosts = ["uaiblocks\\.vercel\\.app"];

/**
 * `bun run build:workers` sets `UAI_STATIC_EXPORT=1` to write the whole site to `out/`
 * for Cloudflare Workers static assets. Every route is prerendered, so nothing needs a
 * server. A static export can't run `redirects()` or `rewrites()`; `scripts/workers-export.ts`
 * writes their equivalents (`_redirects`, `_headers`, the `.md` copies) into `out/`.
 * The Vercel build (`bun run build`) is unchanged.
 */
const staticExport = process.env.UAI_STATIC_EXPORT === "1";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  ...(staticExport
    ? { output: "export" }
    : {
        async redirects() {
          return legacyHosts.map((host) => ({
            source: "/:path*",
            has: [{ type: "host", value: host }],
            destination: "https://uaiblocks.dev/:path*",
            permanent: true,
          }));
        },
        async rewrites() {
          return [{ source: "/components/:id.md", destination: "/llms.mdx/components/:id" }];
        },
      }),
};

export default config;
