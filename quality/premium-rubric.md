# Premium rubric

The quality bar for every distributed Uai item: `src/registry/uai/components/*` and `blocks/*`. It's written to run as a gate, so every row has an ID, a level, a pass/fail definition, and how it's checked.

- **MUST**: a failure blocks merge. The baseline only shrinks, using the same pattern as `e2e/axe-baseline.json` and `scripts/registry-check.baseline.json`.
- **SHOULD**: scored. An item is **Premium** when every MUST passes and at least 80% of the applicable SHOULDs pass. Below that it's **Polish needed**.
- **Check**: `lint` is a static rule in `scripts/registry-check.ts` over the class strings. `axe` is `e2e/components.e2e.ts`. `pw` is a Playwright assertion on the live specimen (dark and light, desktop and mobile). `vr` is visual regression on the specimen. `human` is the review checklist at the bottom.
- **Gold standard:** `prompt-composer`, `thinking`, `pix-payment`, `approval-card`. When this doc and those files disagree, the files win, and this doc gets fixed.

Sources of truth: `DESIGN.md` (Motion, Shapes, Elevation), `plans/beautiful-polish-brief.md`, and the theme in `src/app/global.css` / `registry.json` › `uai-theme`.

---

## 0. Motion tokens (the only allowed values)

| Use | Duration | Easing | Tailwind |
| --- | --- | --- | --- |
| Hover color / background / border | 120ms (100ms for icons ≤16px) | `ease-out` | `duration-120 ease-out` |
| Press (scale) | 140ms | `cubic-bezier(0.23,1,0.32,1)` (`--ease-out-quint`) | `duration-140 ease-out-quint` |
| Exit (menus, toasts, dismissed bars) | 120–160ms | `ease-out` or quint | `animate-out duration-150` |
| Pop-in (menu, popover, palette, toast) | 180ms | `cubic-bezier(0.16,1,0.3,1)` (`--uai-ease-pop`) | `animate-in duration-180 zoom-in-96 fade-in-0` |
| State swap (icon crossfade, status pop, number tick) | 200ms | quint | `duration-200 ease-out-quint` |
| List fade-up, segmented thumb slide | 240ms | quint | `duration-240` |
| Expand / collapse (`grid-template-rows`) | 300ms | quint | `duration-300` |
| UI feedback ceiling | **400ms** | | |
| Data-viz grow (`animate-grow-x/y`) only | 480ms | quint | |
| Loops: shimmer 2s, skeleton 1.6s, spin, indeterminate 1.4s | | `linear` / `ease-in-out` allowed **only here** | |

Spring: there's no motion library in the registry, so springs don't exist by default. The one allowed use is pointer-driven release, such as a kanban card dropping or a sheet drag snapping back. It must be critically damped (no overshoot past 2%), settle in 400ms or less, and be implemented with CSS `linear()` or the Web Animations API. Never use a spring on hover, press, or open/close.

---

## 1. Press, hover, focus

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| P1 | MUST | Every pill, button, or icon button has press feedback | `active:scale-[0.97]` on pills; `0.92–0.96` on icon buttons (composer send is `0.94`, `prompt-composer.tsx:718`). Fail if a `Button` has no `active:scale-*`. | lint |
| P2 | MUST | Press animates `scale`, not `transform`, and is listed in the transition | The transition list contains `scale` and never `transform` or `all` (Tailwind v4 standalone props, DESIGN.md › Motion). | lint |
| P3 | MUST | Press is disabled when it does nothing | Pairs with `enabled:`/`not-disabled:`, or `motion-reduce:active:scale-100`. Fail if a disabled control still scales. | lint + pw |
| P4 | MUST | No layout shift on hover, press, or state change | No hover changes width, height, padding, border-width, or font-weight. Labels that change length share one grid cell, like "Copiar código" → "Copiado" in pix-payment. pw: measure `getBoundingClientRect` of the control and its siblings before and after hover, focus, and click, with Δ = 0px. | pw |
| P5 | MUST | Visible `focus-visible` ring on every interactive element | `focus-visible:outline-2 outline-offset-2 outline-ring` (or the composer's hairline). Never `outline-none` without a replacement. pw: Tab through and assert a computed outline or box-shadow on each focus. | lint + pw |
| P6 | MUST | Hover changes tone, not just cursor | Ghost goes from muted to foreground with a raised fill. Secondary uses `color-mix(secondary 85%, foreground)`. Primary uses `brightness(1.08)`. | lint |
| P7 | SHOULD | Hover gated to real pointers | Hover-only reveals (row actions) also appear on `focus-within` and on touch (always visible below `md`). | human |
| P8 | SHOULD | Hit area of at least 24×24px | Icon buttons are 28×28 (24 in compact). Small text links extend their hit area with `after:` (`calendar-view.tsx:432` does this). | pw |

## 2. Enter and exit

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| E1 | MUST | No animating from `scale(0)` | Containers, menus, cards, and toasts start at 0.95 or more (`zoom-in-96` is the norm). Icon and status swaps may start at `0.5` *with* opacity 0 and a 2–3px blur (`thinking.tsx:143`, `approval-card.tsx:265`). Exception: indicator dots of 8px or less (radio dot). Fail on `zoom-in-0` and `scale-0` anywhere else. | lint |
| E2 | MUST | Floating content is origin-aware | Popover, menu, and select use the primitive's `origin-(--radix-*-transform-origin)`, or set `origin-*` at the trigger side. Fail if the container scales from its center while anchored to a trigger. | lint |
| E3 | MUST | Exit faster than enter, and present at all | Anything that animates in and later unmounts (menus, toasts, banners, chips, rows) has an `animate-out` / `data-[state=closed]` exit of 120–160ms that's shorter than its enter. Only 5 registry files have `animate-out` today. | lint + pw |
| E4 | MUST | Durations and easings come from §0 | Allowed values only: `duration-{100,120,140,150,160,180,200,240,300}` (100 = tiny inline icon hover, as in `prompt-composer.tsx:316`), plus 400/480 in the listed cases. `ease-linear` only on loops. No `transition-all`. No arbitrary cubic-beziers outside the three named curves (plus shake). | lint |
| E5 | MUST | Only cheap properties move | Animate `opacity`, `scale`, `translate`, `rotate`, `filter: blur`, colors, and `grid-template-rows` only. Never height, width, top, left, or margin. | lint |
| E6 | SHOULD | Expand and collapse use the grid-rows trick | `transition-[grid-template-rows,opacity] duration-300 ease-out-quint` (`thinking.tsx:221`). Chevron rotates in 180ms. | lint |
| E7 | SHOULD | State swaps settle instead of snapping | Icon crossfade uses `scale-50 opacity-0 blur-[2px]` ↔ `scale-100` (`prompt-composer.tsx:732–743`). Numbers tick 3px with a fade. Success ends in a tinted check plus a past-tense label. | human (lint can detect missing pairs) |
| E8 | SHOULD | Page and section enter | Documents use a 4px fade-up in 280ms. Workbench content fades in 200ms with no movement. | human |

## 3. Stagger

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| S1 | MUST | Capped | Per-item delay of 40ms or less. At most 6 items are staggered, so the last one starts by 200ms. Items after the 6th enter with item 6. Fail if `[animation-delay:*]` is over 200ms or the step is over 40ms. | lint |
| S2 | MUST | First paint only | Stagger runs on mount or first reveal, never on re-render, filtering, or sorting. pw: change the filter and assert no `animationName` runs on the remaining rows. | pw |
| S3 | SHOULD | Same direction | All items move the same 4px up. No mixed directions, no scale in lists. | human |

## 4. Empty, loading, error, success

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| L1 | MUST | Every async or data item ships all four states in its preview variants | The catalog preview includes an empty, a loading, and an error variant, or one variant that steps through them, as approval-card goes Submitting → Approved / Rejected / Error. | lint (catalog variant names) + human |
| L2 | MUST | Loading keeps the layout | A skeleton matches the final geometry (same row heights, radius, and widths at 40–80% of the line). Uses `Skeleton` + `animate-skeleton-shimmer`. A **spinner on its own as the whole state fails.** Spinners are only allowed inline next to a label ("Approving…", task-list active marker). pw: the bounding box of the loading versus loaded variant changes height by 8px or less. | pw + human |
| L3 | MUST | Live labels shimmer, and reduced motion keeps the meaning | `shimmer-text` on the verb ("Thinking", "Approving…"). The text stays. Color is not the only signal. | lint |
| L4 | MUST | Errors name the recovery and keep context | `role="alert"` (or polite `status` for non-blocking errors). The copy says what happened and what to do. Inputs, evidence, and actions stay available for retry (`approval-card.tsx:395`). Fail on "Something went wrong" with no action. | lint (role) + human (copy) |
| L5 | MUST | Status changes are announced | `role="status" aria-live="polite"` for progress and success (`thinking.tsx:175`, `pix-payment.tsx:229`). | lint |
| L6 | SHOULD | Empty states are specific | Say what will appear, why it's empty, and the one next action. No illustration over 96px, no lorem ipsum, no "No data". | human |
| L7 | SHOULD | Copy tone | Short, concrete, and specific (real names, numbers, files). Sentence case. Past tense for done (Applied, Verified, Copiado). No exclamation marks except the brand easter egg. | human |
| L8 | SHOULD | Success is a state, not a disabled button | Tinted success pill or button with a check and a past-tense label (pix-payment copy button). | human |

## 5. Reduced motion

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| R1 | MUST | Nothing moves 500ms after load | This is the existing `e2e/reduced-motion.e2e.ts`. Only color and opacity transitions may run. The baseline is empty, so keep it that way. | pw (exists) |
| R2 | MUST | Every `animate-*`, `animate-in`, transform transition, and `active:scale` has a `motion-reduce:` counterpart | `motion-reduce:animate-none`, `motion-reduce:transition-none`, or `motion-reduce:active:scale-100`. Loops (spin, shimmer, pulse) stop and their meaning becomes static text or color (`approval-card.tsx:283`). | lint |
| R3 | SHOULD | Reduced motion still gives feedback | Instant swaps keep the opacity crossfade, so state changes are still noticeable. | human |

## 6. Visual system

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| V1 | MUST | Tokens only | No hex, rgb, or oklch literals in registry source, and no `--uai-*` reads. Use the shadcn token classes or `color-mix(in oklab, var(--token) N%, …)`. Exception: `oklch(0.99 0 0)` ink on destructive. | lint |
| V2 | MUST | Weights | Body 400, emphasis 500. 600 only for one headline per card (14px or larger) or big numerals. **Never 700** (`font-bold`). No `font-[550]`. | lint |
| V3 | MUST | Type scale | Sizes from {10.5, 11, 11.5, 12, 12.5, 13, 14, 15, 16, 20, 22, 28}px. `tabular-nums` on every count, timer, price, and %. | lint (size set) + human (tabular) |
| V4 | MUST | Radius | Cards 14px (12px compact). Rows and inputs 8–10px. Chips 5–6px. Buttons, badges, and segmented controls `rounded-full`. Fail on `rounded-md` cards, square buttons, or `rounded-xl` on a 14px card. | lint |
| V5 | MUST | Depth from tone | Cards are `bg-card` on background with a 1px `border` or none. **No `shadow-md/lg/xl` on in-flow cards.** Floating layers only: a 1px `border-strong` ring plus `0 10px 28px` black at 42%. | lint |
| V6 | MUST | One primary | At most one `bg-primary` action per surface. Secondary is `bg-secondary` with no border. Composer send is ink, never accent. | lint (count per root) + human |
| V7 | SHOULD | Spacing on the 4px grid | Paddings and gaps from {4, 6, 8, 10, 12, 14, 16, 20, 24}. Card inset 16/18/20 (12–14 compact). Controls 28–32px tall (24–34 compact or field). | lint |
| V8 | SHOULD | Icons | lucide 14–16px, stroke 1.75–2, `text-muted-foreground`. | lint |
| V9 | SHOULD | Variants are distinct | Each named variant changes density or structure, not just color. | vr + human |

## 7. Contrast

| ID | Lvl | Criterion | Pass / Fail | Check |
| --- | --- | --- | --- | --- |
| C1 | MUST | Text of at least 4.5:1 (3:1 for 18.66px bold / 24px or larger), dark **and** light, every variant | Run axe `color-contrast` on every variant, not just the default. Disabled controls are exempt. The baseline only shrinks. | axe |
| C2 | MUST | Subtle is for metadata only | `text-subtle-foreground` only on text of 12.5px or less (timestamps, counts, captions, placeholders, kbd). Never on body copy or labels. | lint |
| C3 | MUST | Placeholders pass too | Placeholder ratio of 4.5 or more against the field background. axe skips these, so pw computes it. | pw |
| C4 | MUST | Status text uses its ink | Badge text on a `/14` tint reaches 4.5:1 (needs the `*-ink` tokens; see contrast README › Out of scope). | axe |
| C5 | SHOULD | Hierarchy ladder holds | On the item's surface: fg/muted at least 1.6 and muted/subtle at least 1.3. | pw |

Token values and ratios: `contrast/README.md` (proposed `--uai-subtle` dark `oklch(0.69 0.01 264)` and light `oklch(0.52 0.01 260)`, with muted re-spaced).

---

## 8. Rejection: automatic Polish needed, whatever the score

An item is rejected if **any** of these hold. They're the "generic component" smells.

| ID | Smell | How it's detected |
| --- | --- | --- |
| X1 | **Default shadcn look untouched**: `rounded-md` square-ish buttons, `h-9/h-10`, `font-semibold` titles, `shadow-sm` card, `border` on every block, no Uai radius or pill | lint: a `Button` without `rounded-full`, a card without `rounded-[14px]`/`rounded-xl`, or `font-semibold` on more than 1 element per root |
| X2 | **Gray-on-gray with no hierarchy**: one text color and one surface, every line the same weight and size | pw: fewer than 2 of {foreground, muted, subtle} and fewer than 2 font sizes in the specimen |
| X3 | **No state feedback**: a control with no hover tone, press scale, or focus ring, or an async action with no pending → result | lint P1/P5/P6 + L1 |
| X4 | **Linear or default easing on UI feedback**: `ease-linear`, `ease-in`, or bare `transition` (Tailwind's 150ms default curve) on hover, press, or open | lint |
| X5 | **Motion over 400ms** on feedback, bouncy overshoot, or `transition-all` | lint |
| X6 | **Pop from zero or from center**: `zoom-in-0`/`scale-0` on containers, or menus without trigger origin | lint E1/E2 |
| X7 | **Spinner-only loading** or blank empty state ("No data") | human + pw |
| X8 | **Lorem or placeholder content**: "Item 1", "John Doe", "Lorem", "Title" in the preview | lint (string blocklist on preview files) |
| X9 | **Hard borders everywhere**: more than 3 bordered sub-boxes nested inside a bordered card | lint (count) + human |
| X10 | **Accent abuse**: more than 1 accent fill, accent used as decoration, or a gradient fill | lint V6 + human |

---

## 9. Human review (5 questions, 2 minutes per item, by the Designer)

Compare the specimen side by side with the closest gold standard at 100% and 200% zoom, in both themes.

1. **Would it sit unnoticed next to approval-card?** Same density, tone, radius, and weight. (yes / no)
2. **Is there one clear focal point** and a 3-tier text ladder? (yes / no)
3. **Does every interaction feel acknowledged** within 1 frame (press) and settle within 300ms? Record it at 0.25× speed. (yes / no)
4. **Do loading, empty, and error look designed**, as opposed to a fallback? (yes / no)
5. **Is there one detail you'd screenshot?** That means a microinteraction or a crafted state: the composer send swap, pix-payment's blurred QR reveal, thinking's shimmer plus log. Premium items have one. (yes / no)

Score: 5/5 is Premium, 4/5 is acceptable if Q1–Q3 are yes, and anything else is Polish needed.

---

## 10. Wiring the gate (for the Engineer)

- **lint**: add rules to `scripts/registry-check.ts`, which already supports a shrinking baseline, under the names `motion-duration`, `motion-easing`, `press-scale`, `press-transform`, `reduced-motion-pair`, `scale-from-zero`, `exit-missing`, `stagger-cap`, `no-literal-color`, `font-weight`, `radius`, `shadow`, `subtle-size`, `preview-content`. Parse the `cn(...)` / `cva` string literals and match class tokens. Rows are ID → rule.
- **axe**: `e2e/components.e2e.ts` is already set up. Extend it to iterate over **every variant**, not only the default, and exclude `:disabled`.
- **pw**: add `e2e/premium.e2e.ts` covering P4 (layout shift), P5 (focus ring), C3 (placeholder ratio), C5 (ladder), S2 (no re-stagger), L2 (skeleton geometry), and X2 (hierarchy count).
- **vr**: Playwright `toHaveScreenshot` per item × variant × theme, at a 0.1% threshold, with animations disabled.
- Report per item: MUST fails, SHOULD %, rejection hits, and the Premium / Polish needed verdict, written to `quality/report.json` for the README and home "best of" grid.
