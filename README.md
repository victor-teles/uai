# Uai

Uai is an open-code React component library for websites and web applications.
It works as a shadcn registry: the CLI copies each component and its dependencies
into the consumer's application, where the team can inspect and change every line.

The repository includes a component browser built with Next.js, Fumadocs UI,
Tailwind CSS, and Bun.

## Run the site

Install the dependencies and start the local development server:

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
site. Update the `homepage` and dependency URLs in `registry.json` at the same
time. shadcn requires full URLs for custom registry dependencies.

## Repository layout

- `src/registry/uai`: source files distributed through the registry.
- `src/components/registry`: site shell, command palette, catalog, previews, and
  install workflow.
- `src/app/(home)/components/[id]`: the statically generated page for each item.
- `src/components/ui/uai`: re-exports of registry components at their install path.
- `src/components/ui`: stock shadcn primitives (new-york, Radix) that registry
  components import. Consumers install their own copies, so never edit these.
- `src/components/uai`: re-exports of registry blocks.
- `registry.json`: the registry catalog and dependency graph.
- `public/r`: generated registry documents.

## Add a component

1. Add the source file under `src/registry/uai/components` or `src/registry/uai/blocks`, and copy it
   byte-for-byte to `src/components/ui/uai` or `src/components/uai`.
2. Define the public item, target path, and dependencies in `registry.json`.
3. Add the catalog entry and live preview in the matching group folder under
   `src/components/registry/<group>`. The entry's `usage` must equal the preview file.
4. Run the validation suite.

Keep public interfaces small. A compound component should own its shared behavior
and delegate replaceable content to named children.

## Validate a change

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

`bun run test` regenerates the registry before checking its public documents.
`bun run build` does the same before creating the production site.
