# Uai contributor guidance

Uai is a Next.js App Router project built with Bun, React, Fumadocs, Tailwind
CSS, and the shadcn registry schema.

- Use Bun for dependency management and repository scripts.
- Treat `src/registry/uai` as the source distributed to consumers.
- Keep component interfaces small and source-owned.
- Update `registry.json`, documentation, previews, and tests together.
- When the visual contract changes, update `DESIGN.md` and `PRODUCT.md` in the
  same change.
- Run `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build`
  before handing off a change.
- Read the matching guide in `node_modules/next/dist/docs` before changing a
  Next.js convention or API.

Generated files under `public/r` are build outputs from `registry.json` and the
registry source files. Do not edit them by hand.

## React composition

Build distributed registry components as named compound components. The root owns
shared state, behavior, styling, and accessibility through private context; consumers
compose replaceable structure and content through exported children.

```tsx
<PromptComposer variant="rounded">
  <PromptComposerAdd>
    ...
  </PromptComposerAdd>

  <PromptComposerInput />

  <PromptComposerActions>
    ...
  </PromptComposerActions>
</PromptComposer>
```

- Prefer children over arrays, data objects, render configuration, or root-level
  content props.
- Keep state and visual switches on the narrowest component that owns the behavior.
- Use named exports such as `PromptComposerAdd`, not properties such as
  `PromptComposer.Add`.
- Do not inspect child types, clone children, or use display names to coordinate
  compound layout. Use private context when regions share state.
- Context-dependent children must throw a clear error when rendered outside their
  matching root. Do not add context to purely structural components.
- Every distributed component must ship meaningful named variants. Export the
  supported names as a source-owned readonly constant and type, keep `variant` on
  the root, and demonstrate every variant in the live preview. States and scenarios
  do not count as visual variants.

## Visual direction

Read `DESIGN.md` before changing either layer, and `plans/beautiful-polish-brief.md`
before changing distributed components.

1. **Site** — a component workbench with its own identity: a top bar with breadcrumb
   and ⌘K search, a file-tree sidebar, solid hairlines, Geist Mono chrome, and one
   `/components/<id>` page per item that pairs a ruled canvas with a sticky inspector.
   The lime signal (`--uai-signal`, `--uai-signal-ink`) is site-only: never route it
   into `--primary`, `--ring`, or the `uai-theme` item. Do not copy the layout of other
   component galleries.
2. **Distributed components** in `src/registry/uai` — product chrome that consumers
   install, in the Beautiful UI language (beautifului.dev). Weight 500 for emphasis (600 for a single headline, never 700), tonal
   surfaces before borders, pill buttons. Accent fills one primary action per surface;
   secondary actions use `--uai-surface-raised` without a border. Use `--uai-subtle`
   for tertiary metadata only.

For Prompt Composer and other installed AI chrome:

- Card radius is 14px. The pill variant uses a full pill, or 24px when expanded.
- Ghost has no card chrome. Compact uses a 12px card and 24px controls.
- Controls are 28×28 by default. The plus control is ghost. Send uses `--uai-text` on
  `--uai-surface` when it can submit, and `--uai-border-strong` when idle.
- Do not use the accent for send.
- Floating menus use 14px corners, 4px padding, a visible outline
  (`0 0 0 1px var(--uai-border-strong)`), an offset shadow, and a pop-in from
  `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Field type is 13px / 18px. The model label is 12px.
- Style registry source the shadcn way: Tailwind classes merged with `cn()` so a
  consumer's `className` always wins, `cva` for variants, `data-slot` on every
  exported part, and the standard shadcn tokens (`bg-card`, `text-muted-foreground`,
  `bg-primary`, `border-border-strong`, `text-subtle-foreground`, `bg-success/14`).
  The `uai-theme` registry item fills those tokens with the Uai palette. Never write
  `var(--uai-*)`, inline style objects, or injected `<style>` strings; keep `style`
  for runtime-computed values only. See `plans/shadcn-migration.md`.
- Compose shadcn primitives (`@/components/ui/button`, `input`, `select`, `card`,
  `dropdown-menu`, …) instead of native or hand-rolled controls, list each one by
  bare name in the item's `registryDependencies`, and apply the Uai contract
  through `className`. Never edit the stock primitives in `src/components/ui/*.tsx`.
  See `plans/shadcn-primitives.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Coding standards

Use 10x-coder skills to always apply code best practices
