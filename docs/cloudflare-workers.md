# Hosting on Cloudflare Workers

uaiblocks.dev is served by Vercel today. This setup lets the same site run on Cloudflare
Workers, side by side, until the domain moves. Nothing here changes the Vercel build:
`bun run build` and the Vercel project behave exactly as before.

## How it works

Every route is prerendered (the build reports no dynamic routes), so the Workers build is
a static export served by a **static-assets-only Worker**: there is no Worker script, no
Next.js server, and no cold start. Requests for assets don't count against the Workers
request limit.

| Command | What it does |
| --- | --- |
| `bun run build:workers` | `registry:build`, then `next build` with `UAI_STATIC_EXPORT=1` (adds `output: "export"`), then `scripts/workers-export.ts`. Writes `out/`. |
| `bun run preview:workers` | Serves `out/` locally with `wrangler dev` on http://localhost:8787. |
| `bun run deploy:workers:preview` | Uploads a version with its own preview URL; production traffic is untouched. |
| `bun run deploy:workers` | Deploys `out/` to the `uai` Worker. |

Build with `NEXT_PUBLIC_REGISTRY_URL=https://uaiblocks.dev/r`, the value the Vercel
production build uses; `workers-export.ts` fails the build if the install commands point at
localhost. Wrangler needs Node 22 or newer. `wrangler.jsonc` holds no account id or token:
set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in the environment.

## What matches Vercel, and how

| Vercel behavior | On Workers |
| --- | --- |
| `/r/<id>.json` and `/r/registry.json`, `application/json; charset=utf-8` | Static files from `public/r`; `_headers` sets the type and `Cache-Control: public, max-age=300, stale-while-revalidate=86400`. |
| `/components/<id>.md` rewrite to `/llms.mdx/components/<id>` | `workers-export.ts` copies each document to `components/<id>.md`. |
| Share images (`opengraph-image`, `twitter-image`) | Prerendered PNGs; `_headers` sets `image/png` on the extensionless files. |
| `llms.txt`, `llms-full.txt` as `text/markdown` | `_headers`. |
| `charset=utf-8` on HTML pages, `/components/<id>.md` and `robots.txt` | `_headers`: Workers keeps only the media type an upload declares, so `workers-export.ts` sets these types per route (`/`, each top-level page, `/components/:id`), then puts `text/markdown` back on `/components/:id.md` and plain `text/plain` on the `/components/:id.txt` RSC payloads, which Next's client router reads. |
| `Access-Control-Allow-Origin: *` and HSTS on every response | `_headers`. |
| `/_next/static` cached for a year | `_headers`. |
| 308 from `/path/` to `/path` | `_redirects`. |
| Unknown paths: the Next 404 page with status 404 | `not_found_handling: "404-page"`. |
| `www.uaiblocks.dev` → `uaiblocks.dev` (Vercel domain redirect) | A zone redirect rule, set at cutover. |
| `uaiblocks.vercel.app` → `uaiblocks.dev` (`redirects()` in `next.config.mjs`) | Only Vercel can answer that host; it keeps working while the Vercel project exists. |

The `/r/*` paths must stay reachable by the shadcn CLI and registry monitors: on the
Cloudflare zone, leave **Bot Fight Mode off** (on the Free plan it can't be skipped per
path) and keep challenges and WAF blocks away from `/r/*`.

## Deploying

`.github/workflows/deploy-workers.yml` runs on `workflow_dispatch` only, with a
`preview` or `production` target, and needs the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets. It does not run on push until the domain has
moved; the cutover plan adds the `push` trigger and the custom domains in
`wrangler.jsonc` as its last steps.
