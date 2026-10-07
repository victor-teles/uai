/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/components/:id.md", destination: "/llms.mdx/components/:id" }];
  },
};

export default config;
