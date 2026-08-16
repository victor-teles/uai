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

## Visual direction

Uai has two visual layers. Read `DESIGN.md` before changing either.

1. **Registry workbench** — graphite catalog, dotted hairlines, graphite pill
   selection, cobalt for focus only.
2. **Distributed components** in `src/registry/uai` — Beautiful UI product
   chrome that consumers install.

For Prompt Composer and other installed AI chrome:

- Card radius is 14px. The pill variant uses a full pill, or 24px when expanded.
- Ghost has no card chrome. Compact uses a 12px card and 24px controls.
- Controls are 28×28 by default. The plus control is ghost. Send uses `--uai-text` on
  `--uai-surface` when it can submit, and `--uai-border-strong` when idle.
- Do not use cobalt for send.
- Floating menus use 14px corners, 4px padding, a visible outline
  (`0 0 0 1px var(--uai-border-strong)`), an offset shadow, and a pop-in from
  `scale(0.96)` in 180ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Field type is 13px / 18px. The model label is 12px.
- Prefer inline styles for new visual values in registry source. Tailwind JIT
  often misses utilities used only under `src/registry/uai`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Coding standards

Use 10x-coder skills to always apply code best practices
