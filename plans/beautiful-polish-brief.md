# Beautiful UI polish brief

Reference: https://www.beautifului.dev (screenshots: `/tmp/bui-1.png`, `/tmp/bui-2.png`,
`/tmp/bui-3.png`, `/tmp/bui-light.png`). Goal: every distributed Uai component should feel
like it belongs on that page — calm warm graphite, soft medium-weight type, tonal surfaces
instead of hard borders, pill controls, and small purposeful motion.

## Tokens (already live in `src/app/global.css` and the `uai-theme` registry item)

These are the palette roles. Registry source never reads `--uai-*` directly; it uses
the shadcn token classes they map to (see Theme tokens in `DESIGN.md` and
`plans/shadcn-migration.md`).

| Token | Dark | Use |
| --- | --- | --- |
| `--uai-canvas` | `oklch(0.226 0.004 264)` | Page / stage background. Insets (inputs, code wells) may use it inside a surface. |
| `--uai-surface` | `oklch(0.26 0.006 271)` | Cards, panels, popovers. |
| `--uai-surface-raised` | `oklch(0.293 0.006 271)` | Hover fills, chips, secondary buttons, selected rows, tab thumbs. |
| `--uai-border` | `oklch(0.315 0.006 268)` | Hairlines. Use sparingly — prefer tone. |
| `--uai-border-strong` | `oklch(0.39 0.007 268)` | Focused fields, floating-menu outline, idle send. |
| `--uai-text` | `oklch(0.964 0.002 248)` | Primary ink. |
| `--uai-muted` | `oklch(0.731 0.008 261)` | Secondary text, inactive nav, body copy in dense cards. |
| `--uai-subtle` | `oklch(0.62 0.01 264)` | NEW. Tertiary metadata only: timestamps, counts, captions, placeholders. |
| `--uai-accent` | `oklch(0.57 0.185 257)` | Primary affirmative button fill (white text), links, focus rings, selected checkbox/radio. |
| `--uai-success` / `--uai-warning` / `--uai-danger` | green / amber / red | Status. |

Light mode has matching values; never hardcode colors — always use tokens or
`color-mix(in oklab, var(--uai-…) N%, transparent)`.

## Visual rules

**Type** (consumer font; the site uses Inter)
- Body 13px / 18px. Dense metadata 12–12.5px. Captions 11–11.5px. Micro labels 10.5px.
- Weights: 400 body, **500 for almost all emphasis** (titles of rows, buttons, labels, tabs).
  600 only for a card's single headline (≥14px) or big numerals. Never 700. Replace 550 with 500
  and drop most 600s to 500.
- No uppercase tracked micro-labels unless they already carry meaning; prefer sentence-case
  `--uai-subtle` 11.5px labels.
- Use `tabular-nums` for counts, timers, prices, percentages.

**Surfaces & shape**
- Cards: `--uai-surface`, radius 14px (12px compact), 1px `--uai-border` OR no border when
  sitting on canvas with enough tonal contrast. No heavy shadows; at most
  `0 1px 2px oklch(0 0 0 / 0.06)` on light.
- Inner rows / list items / inputs: radius 8–10px. Chips / tags / code pills: radius 6px.
- Buttons are **pills** (`border-radius: 999px`), height 28–32px, padding-inline 12–14px, 12.5–13px / 500.
  - Primary affirmative (Approve, Accept, Continue, Save, Subscribe, Apply, Confirm, Checkout):
    `bg --uai-accent`, `color --uai-accent-foreground`, hover `brightness(1.08)`.
  - Secondary (Skip, Cancel, Reject, Alternatives): `bg --uai-surface-raised`, `color --uai-text`,
    **no border**, hover a slightly lighter mix (`color-mix(in oklab, var(--uai-surface-raised) 85%, var(--uai-text))`).
  - Destructive confirm: `bg --uai-danger`, white text.
  - Ghost/icon buttons: transparent, 28×28, radius 8px, `--uai-muted` → `--uai-text` + raised fill on hover.
  - **Exception:** Prompt Composer send stays ink (`--uai-text` on `--uai-surface`); never accent.
- Status badges: tinted pill — `background: color-mix(in oklab, var(--uai-success) 14%, transparent)`,
  `color: var(--uai-success)`, 11.5px / 500, padding 2px 8px. Optional ring at 28%.
- Segmented controls / tabs: track `--uai-surface` (or transparent) with a raised thumb
  (`--uai-surface-raised`) that slides; text `--uai-subtle` → `--uai-text` when active.
- Dividers: prefer spacing and tone; when needed, 1px `--uai-border`.
- Icons: lucide at 14–16px, `stroke-width` 1.75–2, `--uai-muted`.
- Avatars / brand dots: small (16–24px) full circles with a `0 0 0 1px oklch(1 0 0 / 0.08)` ring.

**Motion** (always add `motion-reduce:` fallbacks)
- Hover color/background: 120ms ease-out.
- Press: `active:scale-[0.97]` on buttons, 140ms `cubic-bezier(0.23,1,0.32,1)`.
- Pop-in for menus, popovers, toasts: from `scale(0.96)` + `opacity:0`, 180ms
  `cubic-bezier(0.16,1,0.3,1)`, `transform-origin` at the trigger.
- Expand/collapse: animate `grid-template-rows: 0fr → 1fr` + opacity, 300ms
  `cubic-bezier(0.23,1,0.32,1)`; rotate chevrons 180ms.
- Entering list items: `fade-up` (opacity 0 → 1, translateY 4px → 0, 240ms) with a ≤40ms
  stagger, capped to the first ~6 items.
- Live / running labels: shimmer text (a moving `background-clip:text` gradient from
  `--uai-subtle` to `--uai-text`, 2s linear infinite) — e.g. "Thinking", "Running", "Uploading".
- Number changes: `tabular-nums`; optionally crossfade.
- No bouncy overshoot, no animation over 400ms for UI feedback, never animate layout props
  other than `grid-template-rows`.

**Content tone**: preview data should feel real and specific (names, numbers, files), short
sentences, no lorem ipsum.

## Engineering rules

- Edit the source of truth in `src/registry/uai/components/*.tsx` or `src/registry/uai/blocks/*.tsx`.
  Then sync the local copy: if `src/components/ui/uai/<name>.tsx` (components) or
  `src/components/uai/<name>.tsx` (blocks) is a one-line `export * from "@/registry/…"`
  re-export, leave it; otherwise copy the registry file over it byte-for-byte
  (`cp src/registry/uai/components/x.tsx src/components/ui/uai/x.tsx`).
- Follow the styling idiom already in the file (most use Tailwind arbitrary values like
  `bg-[var(--uai-surface)]`). Some tests forbid `style={{` in certain files — check
  `tests/registry.test.ts` and `tests/<name>.test.tsx` before changing idioms.
- Keep public APIs, exported names, variant constants, ARIA, roles, and keyboard behavior intact.
  Polish is visual + motion + preview content. Don't rename or remove exports.
- Keep each component's named variants visually distinct.
- Preview files live in `src/components/registry/<group>/` — you may refine preview data/layout
  for your items, but keep each catalog entry's `usage` string equal to its preview file
  content where a test enforces it.
- Do NOT edit shared files: `src/app/global.css`, `registry.json`, `src/components/registry/catalog.ts`,
  `registry-browser.tsx`, `registry-preview.tsx`, `preview-chrome.tsx`, `DESIGN.md`, `PRODUCT.md`,
  `README.md`, `package.json`. If you believe a shared change is needed, describe it in your report.
- Do not run `bun run build`, `bun run dev`, or `git` commands that modify state (no commit/stash/checkout).
