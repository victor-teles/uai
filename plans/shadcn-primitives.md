# Registry source: native elements → shadcn primitives

Uai is a shadcn registry. Distributed components compose the consumer's shadcn
primitives (`Button`, `Input`, `Select`, `Card`, …) instead of re-implementing
them with native elements. The consumer's primitive owns base behavior and
accessibility; the Uai part layers the Uai visual contract on top through
`className`.

Reference implementations:

- `src/registry/uai/components/form-field.tsx` — `Input`, `Textarea`, `Label`
- `src/registry/uai/components/empty-state.tsx` — `Button`, `Button asChild` for links

## Where primitives come from

- Primitives live in `src/components/ui/<name>.tsx`. They are stock shadcn
  (new-york, Radix) output. **Never edit them** — consumers install their own copy
  from shadcn, so any local edit would not ship.
- Import them as `import { Button } from "@/components/ui/button";`.
- `registry.json` lists every imported primitive by its bare shadcn name in
  `registryDependencies` (e.g. `"button"`, `"dropdown-menu"`). A test in
  `tests/registry.test.ts` enforces this.

Installed: accordion, alert-dialog, avatar, badge, breadcrumb, button, checkbox,
collapsible, dialog, dropdown-menu, input, label, popover, progress, radio-group,
select, separator, sheet, skeleton, table, tabs, textarea, toggle, toggle-group.
Add others (card, command, switch, tooltip, …) with `bunx shadcn@latest add`, then
fix the generated `cn` import to `@/lib/uai-utils`. Ask before adding another.

## Mapping

| Native / hand-rolled | Primitive |
| --- | --- |
| action `<button>` (filled, secondary, ghost, icon) | `Button` (`variant` + `size` closest match) |
| `<a>` styled as a button | `<Button asChild><a … /></Button>` |
| `<input>` text/email/password/number/search | `Input` |
| `<textarea>` | `Textarea` |
| `<label>` for a control | `Label` |
| `<input type="checkbox">` | `Checkbox` |
| `<input type="radio">`, `role="radiogroup"` of radios | `RadioGroup` + `RadioGroupItem` |
| segmented single-choice buttons (`role="radiogroup"` of buttons, `aria-pressed` groups) | `ToggleGroup type="single"` |
| `aria-pressed` toggle button | `Toggle` |
| `role="switch"` | `Switch` |
| `<select>` | `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) |
| `<dialog>` / modal | `Dialog`; destructive confirmation → `AlertDialog`; side drawer → `Sheet` |
| `role="menu"` popup | `DropdownMenu` |
| non-menu floating panel | `Popover` (hover preview → `HoverCard`, label hint → `Tooltip`) |
| `aria-expanded` disclosure | `Collapsible`; stacked Q&A → `Accordion` |
| `role="tablist"` | `Tabs` |
| combobox / command palette | `Command` |
| `<table>` for tabular data | `Table` parts (keep native `<table>` for calendar grids) |
| `role="progressbar"`, `<progress>` | `Progress` |
| `<hr>`, divider `role="separator"` | `Separator` |
| status pill / count chip | `Badge` |
| avatar image + fallback | `Avatar` |
| skeleton block | `Skeleton` |
| breadcrumb nav | `Breadcrumb` parts |
| card surface (every variant has card chrome) | `Card` (and `CardHeader`/`CardTitle`/… only where the structure matches) |

Keep native elements when no primitive fits the semantics (e.g. `<dl>`, `<ol>` of
steps, calendar day grids, a drag handle, a split-pane separator, an `<input
type="file">` hidden behind a drop zone, an OTP cell with bespoke key handling).
If a primitive would change behavior a consumer relies on (keyboard model,
controlled API, exported props), keep the behavior and report it instead of
forcing the swap.

## Overriding a primitive's base classes

The Uai visual contract (DESIGN.md, `plans/beautiful-polish-brief.md`, CLAUDE.md
Prompt Composer rules) still wins. Pass Uai classes through `className`; the
primitive merges them with `cn()` so conflicting utilities are replaced. Audit
**every** base class of the primitive, including prefixed ones, because `twMerge`
only replaces a class with the same variant prefix:

- **Size**: shadcn sizes set `h-9`/`h-8`/`size-9` and `has-[>svg]:px-*`. When Uai
  uses `min-h-*` or padding-driven height, add `h-auto` and override
  `has-[>svg]:px-*` with the Uai padding. For square icon controls use the
  `icon*` size and override with `size-7` etc.
- **Type**: `Input`/`Textarea`/`SelectTrigger` set `text-base md:text-sm`. Override
  both: `text-[13px]/[18px] md:text-[13px]/[18px]`.
- **Dark mode**: primitives set `dark:bg-input/30`, `dark:hover:bg-*`, etc. When Uai
  sets a background, repeat it with `dark:` (`bg-muted dark:bg-muted`).
- **Shadow**: `shadow-xs`/`shadow-sm` → `shadow-none` unless Uai wants one.
- **Focus**: primitives use `focus-visible:ring-[3px] focus-visible:ring-ring/50`.
  If Uai uses an outline, add `focus-visible:ring-0`; if Uai uses a ring, express it
  with the same `focus-visible:` prefix so it replaces the base.
- **Outline focus**: Button, Toggle, Checkbox, and friends set `outline-none`, which in
  Tailwind v4 sets the outline style to `none`. `focus-visible:outline-2` then draws
  nothing; always add `focus-visible:outline-solid` with it.
- **Progress semantics**: stock `Progress` only uses `value` for the bar and never sets
  `aria-valuenow`. Pass `aria-valuenow` (and `aria-valuetext` when meaningful) yourself.
- **Icons**: Button sets `[&_svg:not([class*='size-'])]:size-4`. Use exactly that
  selector to change icon size (`[&_svg:not([class*='size-'])]:size-3.5`); a
  `[&>svg]:size-*` loses on specificity.
  Lucide's `size` prop only sets the `width`/`height` attributes, which that selector
  overrides. Give internal icons a `size-*` class, and on parts that take consumer icon
  children add `[&_svg:not([class*='size-'])]:size-auto` so a consumer's `size` prop
  still applies, as it did on a native button.
- **Hover**: `default` adds `hover:bg-primary/90`; if Uai uses `hover:brightness-*`,
  add `hover:bg-primary`.
- **Layout**: `Label` is `flex gap-2 leading-none select-none`; Card is
  `flex flex-col gap-6 py-6 rounded-xl shadow-sm`. Override what differs.
- **Radius**: Uai radii (`rounded-full` pills, `rounded-[14px]` cards and menus,
  `rounded-[10px]` fields) override the primitive radius.
- **Floating content** (`DropdownMenuContent`, `PopoverContent`, `SelectContent`):
  apply the Uai floating-menu contract — `rounded-[14px] p-1`,
  `shadow-[0_0_0_1px_var(--border-strong),…]` outline plus offset shadow, and the
  `zoom-in-96 duration-180 ease-out-quint` pop-in.

After the swap, verify computed height, padding, font size, radius, colors (light
and dark), and focus ring in the dev server against `main`.

## `asChild`

Radix `Slot` concatenates class names **without** `twMerge`. Put the Uai classes
on the primitive (`<Button asChild className={…}>`), not on the child, so
conflicts resolve through `cn()`.

## Part contract (unchanged)

- Every exported part keeps its own `data-slot="<component>-<part>"`. Pass it as a
  prop; it replaces the primitive's `data-slot`.
- `className` stays the consumer override surface and is merged last.
- Keep exported names, prop types, variants constants, `data-variant`, context
  errors, generated ids, `aria-*` wiring, and `type="button"` defaults.
- If a part's prop type was `ComponentProps<"button">`, it may become
  `ComponentProps<typeof Button>` only when that does not remove props consumers
  use.
- Radix primitives that render into a portal (Dialog, DropdownMenu, Popover,
  Select) still need the root's context. Read context in the Uai part and pass
  values down; never rely on DOM ancestry for styling across a portal.

## Tests

- Run `bun test tests/<item>.test.tsx` for each file you touch, plus any block
  test that composes it.
- Radix opens menus and selects on pointer events; `@testing-library/user-event`
  sends them. `tests/setup.ts` polyfills pointer capture and `scrollIntoView`.
- Portaled content renders under `document.body`; query with `screen`, not
  `view.container`.
- Keep the intent of every assertion. Update a selector or expectation only when
  the primitive changes the DOM legitimately (for example a Radix checkbox is a
  `button role="checkbox"`). Never delete coverage.
