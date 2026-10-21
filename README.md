# Uai

**Components that feel finished.**

shadcn components and blocks with real motion and micro-interactions built in.
Copy them with the CLI and own every line.

<p align="center">
  <a href="https://uaiblocks.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/readme/uai-hero-dark.gif">
      <source media="(prefers-color-scheme: light)" srcset=".github/readme/uai-hero-light.gif">
      <img src=".github/readme/uai-hero-dark.gif" width="880" alt="One request moving through four Uai components: Prompt Composer sends “Charge order #4821 to Casa Aroeira with Pix”, Thinking logs the lookup, Approval Card asks before the charge, and Pix Payment shows the QR code until it is paid.">
    </picture>
  </a>
</p>

```bash
bunx shadcn@latest add https://uaiblocks.dev/r/prompt-composer.json
```

## Best of Uai

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/prompt-composer">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/prompt-composer-dark.png">
          <img src=".github/readme/tiles/prompt-composer-light.png" alt="Prompt Composer with a typed message and the ink send button">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/prompt-composer"><b>Prompt Composer</b></a> · Forms
      <br><sub>A prompt bar with ghost plus, ink send, and rounded, pill, ghost, and compact variants.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/thinking">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/thinking-dark.png">
          <img src=".github/readme/tiles/thinking-light.png" alt="Thinking, complete, with three logged steps">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/thinking"><b>Thinking</b></a> · AI
      <br><sub>A live and inspectable activity disclosure with explicit states and structured evidence.</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <a href="https://uaiblocks.dev/components/agent-run">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/agent-run-dark.png">
          <img src=".github/readme/tiles/agent-run-light.png" alt="Agent Run waiting for approval at step 5 of 7, with activity and tasks">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/agent-run"><b>Agent Run</b></a> · AI · Block
      <br><sub>Agent thinking and tool calls, task progress, approvals, and a final run summary.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/approval-card">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/approval-card-dark.png">
          <img src=".github/readme/tiles/approval-card-light.png" alt="Approval Card, low risk, approved">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/approval-card"><b>Approval Card</b></a> · Feedback
      <br><sub>A controlled decision surface for reviewing an AI action's risk, evidence, and impact.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/pix-payment">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/pix-payment-dark.png">
          <img src=".github/readme/tiles/pix-payment-light.png" alt="Pix Payment for order #4821, paid, with the QR code blurred behind a check">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/pix-payment"><b>Pix Payment</b></a> · Brazil
      <br><sub>A Pix charge with QR code, copy-and-paste code, expiry countdown, and payment status.</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <a href="https://uaiblocks.dev/components/kanban-board">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/kanban-board-dark.png">
          <img src=".github/readme/tiles/kanban-board-light.png" alt="Kanban Board with Backlog, In progress, and In review columns">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/kanban-board"><b>Kanban Board</b></a> · Data Display
      <br><sub>Columns, cards, keyboard movement, and empty states.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/coupon-field">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/coupon-field-dark.png">
          <img src=".github/readme/tiles/coupon-field-light.png" alt="Coupon Field with WELCOME20 applied and the total at $72.00">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/coupon-field"><b>Coupon Field</b></a> · Commerce
      <br><sub>A checkout-safe discount field with rounded, pill, and compact variants.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://uaiblocks.dev/components/unsaved-changes-bar">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset=".github/readme/tiles/unsaved-changes-bar-dark.png">
          <img src=".github/readme/tiles/unsaved-changes-bar-light.png" alt="Unsaved Changes Bar floating under an edited workspace name">
        </picture>
      </a>
      <br><a href="https://uaiblocks.dev/components/unsaved-changes-bar"><b>Unsaved Changes Bar</b></a> · Forms
      <br><sub>Persistent save and discard actions with busy, error, and page-exit warnings.</sub>
    </td>
  </tr>
</table>

<p align="center"><a href="https://uaiblocks.dev">Browse the full catalog →</a></p>

## Run the site

The repository includes the component browser at uaiblocks.dev, built with Next.js,
Fumadocs UI, Tailwind CSS, and Bun. Install the dependencies and start the local
development server:

```bash
bun install
bun run dev
```

Open `http://localhost:3000` for the overview. Every registry item has its own page
at `/components/<name>`. Press ⌘K or `/` to search. Generated registry documents are
available under `/r`.

For AI tools, `/llms.txt` indexes every item, `/llms-full.txt` holds the full text,
and `/components/<name>.md` serves one item as Markdown with its install command,
usage example, part tree, and accessibility notes. They are generated from the
catalog in `src/lib/llms.ts` with Fumadocs' `llms()` helper.

## Search and share metadata

`src/app/robots.ts` and `src/app/sitemap.ts` serve `/robots.txt` and `/sitemap.xml`;
the sitemap lists the overview, `/theming`, and every `/components/<name>` page.
Every page builds its title, description, canonical URL, and Open Graph and Twitter
tags with `pageMetadata()` in `src/lib/metadata.ts`, against the origin in
`src/lib/site.ts` (the `homepage` in `registry.json`).

Share images are generated by `src/app/opengraph-image.tsx` (site-wide) and
`src/app/(home)/components/[id]/opengraph-image.tsx` (one per item), with the
templates in `src/components/og/og-template.tsx`: `OgSiteTemplate` puts the home hero
beside the live scene, and `OgTemplate` puts an item's name and description beside
its specimen. Both use captures of the live specimens from `src/assets/og/`. After
changing a preview, rebuild, start the site, and refresh the captures with
`bun run og:capture [id ...]` (set `OG_BASE_URL` if the server is not on port 3100).
Each capture is clipped to the specimen canvas (`scripts/og-clip.ts`), so the page
around it never lands in a share image; `e2e/og-capture.e2e.ts` checks that for every item.

## Install a registry item locally

Keep the Uai development server running. In a shadcn project, run:

```bash
bunx shadcn@latest add http://localhost:3000/r/prompt-composer.json
```

Prompt Composer installs the Uai theme, the shared class-name utility, and the
shadcn primitives it composes (`button`, `textarea`, `dropdown-menu`, …) from the
shadcn registry. Replace `prompt-composer` with another registry item name to install that component.

Components are styled with Tailwind classes and the standard shadcn theme tokens
(`background`, `card`, `muted-foreground`, `primary`, …). The `uai-theme` item fills
those tokens with the Uai palette and adds `subtle-foreground`, `border-strong`,
`success`, and `warning`. Entrance motion uses `tw-animate-css`, which `shadcn init`
imports by default. Restyle any part by passing `className`.

Set `NEXT_PUBLIC_REGISTRY_URL` to the deployed `/r` URL before publishing the
site. Update the `homepage` in `scripts/registry-index.ts` and the dependency URLs in
the per-item `src/registry/uai/**/<name>.json` files at the same time. shadcn requires full URLs for custom registry dependencies.

## Repository layout

- `src/registry/uai`: source files distributed through the registry.
- `src/components/registry`: site shell, command palette, catalog, previews, and
  install workflow.
- `src/app/(home)/components/[id]`: the statically generated page for each item.
- `src/components/ui/uai`: re-exports of registry components at their install path.
- `src/components/ui`: stock shadcn primitives (new-york, Radix) that registry
  components import. Consumers install their own copies, so never edit these.
- `src/components/uai`: re-exports of registry blocks.
- `registry.json`: the registry catalog and dependency graph, generated from one
  `<name>.json` per item by `bun run registry:index`. Not committed.
- `public/r`: registry documents generated by `bun run registry:build`. Not committed.

## Add a component

1. Add the source file under `src/registry/uai/components` or `src/registry/uai/blocks`, and add
   a one-line re-export of it at `src/components/ui/uai` or `src/components/uai`.
2. Define the public item, target path, and dependencies in `<name>.json` next to the
   source file.
3. Add the catalog entry, the live preview (`<name>-preview.tsx`), and its preview
   entry (`<name>-entry.tsx`) in the matching group folder under
   `src/components/registry/<group>`. The catalog entry's `usage` must equal the
   preview file.
4. Run the validation suite.

Don't write item counts anywhere: the site derives them from the catalog. See
[CONTRIBUTING.md](CONTRIBUTING.md#shared-files) for the files every component touches.

See `CONTRIBUTING.md` for the full checklist.

Keep public interfaces small. A compound component should own its shared behavior
and delegate replaceable content to named children.

## Validate a change

```bash
bun run typecheck
bun run lint
bun run registry:check
bun run test
bun run build
bun run test:e2e
```

`bun run test` regenerates the registry before checking its public documents.
`bun run build` does the same before creating the production site. `bun run test:e2e`
screenshots every component page in both themes on desktop and mobile, runs axe, and
checks reduced motion against the production build; run `bun run test:e2e:install` once
first.

## License

[MIT](LICENSE) © 2026 Victor Mesquita
