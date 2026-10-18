/**
 * The old Vercel host keeps working for links already out there (shadcn directory,
 * awesome lists, logo URLs): it permanently redirects to the canonical domain with
 * the path and query kept. The exact-host match leaves preview hosts and localhost alone.
 */
const legacyHosts = ["uaiblocks\\.vercel\\.app"];

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
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
};

export default config;
