# Registry source: inline styles → shadcn/Tailwind

Every file under `src/registry/uai` follows shadcn conventions. Visual output
must stay identical; this is a styling-mechanism change, not a redesign.

Reference implementation: `src/registry/uai/components/metric-card.tsx`.

## Rules

1. **Classes, not inline styles.** Replace `style={{...}}` objects and
   `CSSProperties` constants with Tailwind classes. Keep `style` only for values
   computed at runtime (percent widths, transforms from state, CSS custom
   properties fed by props, grid templates built from data).
2. **`className` is the override surface.** Every exported part destructures
   `className`, merges it last with `cn()` from `@/lib/uai-utils`, and spreads
   `{...props}` after its own attributes (keep context-owned attributes such as
   generated `id`s, `aria-*` links, and event handlers that wrap the consumer's
   handler *after* the spread). Do not keep a `style` merge that fights classes.
3. **Variants use `cva`** from `class-variance-authority`. Keep the existing
   `*_VARIANTS` constant and type; keep `data-variant` on the root. Child parts
   that change with the root variant read it from private context and pick
   classes with `cn(...)` or their own `cva`.
4. **`data-slot="<component>-<part>"`** on every exported part (kebab-case,
   e.g. `data-slot="metric-card-label"`).
5. **No injected `<style>` strings.** Hover, focus, active, disabled, aria, data
   state, reduced-motion and child selectors become Tailwind variants:
   `hover:`, `focus-visible:`, `active:`, `disabled:`, `aria-invalid:`,
   `aria-pressed:`, `aria-[current=date]:`, `data-[state=open]:`,
   `motion-reduce:`, `group-*`/`peer-*`, `[&_svg]:`, `*:`, `has-[...]:`,
   `placeholder:`, `nth-[2]:`. Delete the CSS string and the `<style>` element.
   Class-name hooks like `uai-form-field-control` go away.
6. **Tokens.** Never write `var(--uai-*)`. Map 1:1:

   | Old | Class token |
   | --- | --- |
   | `--uai-canvas` | `background` |
   | `--uai-surface` | `card` (floating menus, dialogs, popovers: `popover`) |
   | `--uai-surface-raised` | `muted` for static tonal fills, `accent` for hover/selected interactive fills, `secondary` for secondary buttons |
   | `--uai-border` | `border` (plain `border` class already uses it) |
   | `--uai-border-strong` | `border-strong` |
   | `--uai-text` | `foreground` (`card-foreground` / `popover-foreground` on those surfaces) |
   | `--uai-muted` | `muted-foreground` |
   | `--uai-subtle` | `subtle-foreground` |
   | `--uai-accent` | `primary` (focus outlines: `ring`) |
   | `--uai-accent-foreground` | `primary-foreground` |
   | `--uai-success` | `success` |
   | `--uai-warning` | `warning` |
   | `--uai-danger` | `destructive` |

   `color-mix(in oklab, var(--uai-x) N%, transparent)` → `bg-x/N` (any integer
   opacity works, e.g. `bg-destructive/14`). Mixes against another color that
   cannot be expressed as opacity: `bg-[color-mix(in_oklab,var(--primary)_12%,var(--card))]`.
   Component-local custom properties (e.g. `--uai-day-fill`) are renamed without
   the `uai-` prefix only if still needed; prefer plain classes.
7. **Motion.** `tw-animate-css` is available:
   - fade + rise: `animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint`
     (`slide-in-from-bottom-1` = 4px; slide distances accept integers only, so
     6px is `slide-in-from-bottom-[6px]`; reveal from above uses `slide-in-from-top-1`)
   - pop: `animate-in fade-in-0 zoom-in-96 duration-180 ease-out-quint`
   - stagger: `[animation-delay:40ms]` or `style={{ animationDelay }}` when computed;
     `fill-mode-backwards` when the original used `backwards`.
   - spinner: `animate-spin`; pulse: `animate-pulse`.
   - Theme utilities: `text-shimmer` (running-status text), `animate-skeleton-shimmer`,
     `animate-indeterminate`, `animate-ring-pulse`, `animate-grow-x`, `animate-grow-y`.
   - Always pair with `motion-reduce:animate-none` (and `motion-reduce:transition-none`).
   - Easing `cubic-bezier(0.23, 1, 0.32, 1)` → `ease-out-quint`.
   - A one-off keyframe that none of the above cover: use an arbitrary
     `animate-[...]` built from existing primitives, or ask before adding a theme
     keyframe. Do not inject a `<style>`.
7b. **Responsive / container queries.** Tailwind v4 has container queries built in:
   put `@container` (or `@container/name`) on the container and use
   `@max-[640px]:grid-cols-1`, `@min-[720px]:...`, or named `@max-[640px]/name:` on
   descendants, matching the original breakpoint exactly. Media queries map to
   `max-[640px]:` / `min-[...]:`. Web Animations API (`element.animate`) calls are JS
   behavior and can stay.
8. **Scale.** Use Tailwind scale where exact (`gap-1.5` = 6px, `p-3.5` = 14px,
   `gap-0.75` = 3px, `text-xs` = 12px/16px, `rounded-xl` = 12px, `rounded-full`).
   Otherwise use exact arbitrary values (`text-[12.5px]/4`, `rounded-[14px]`,
   `text-[13px]/[18px]`). Do not round values to the nearest step.
9. **Screen-reader text:** `sr-only`. Font numerics: `tabular-nums`.
   `overflowWrap: anywhere` → `wrap-anywhere`. `minWidth: 0` → `min-w-0`.
10. Keep behavior, accessibility, exports, prop types, and context errors
    unchanged. Do not rename exports.

## Tests

Tests that asserted `element.style.*` assert the class contract instead
(`toContain("rounded-[14px]")`, `data-variant`, `data-slot`). Keep the intent
of each assertion. Do not delete coverage.
