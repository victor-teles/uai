# Contributing to Uai

Thanks for helping. Uai is a shadcn registry: every component ships as source that
people copy into their own app, so each one has to be small, accessible, and finished.
Read `CLAUDE.md` (also linked as `AGENTS.md`) and `DESIGN.md` before you change a
distributed component, and `plans/beautiful-polish-brief.md` for the visual language.

## Set up

```bash
bun install
bun run dev                 # http://localhost:3000
bun run test:e2e:install    # once, for the browser checks
```

## Add a component

1. **Source.** Write the component in `src/registry/uai/components/<name>.tsx`, or a
   page block in `src/registry/uai/blocks/<name>.tsx`. Follow the compound pattern in
   `CLAUDE.md`: the root owns state through private context, children are named
   exports, every exported part has `data-slot`, styling uses shadcn tokens through
   `cn()` and `cva`, and shadcn primitives come from `@/components/ui/*`.
2. **Variants.** Export the supported names as a readonly constant and type, for
   example `export const PIX_PAYMENT_VARIANTS = ["card", "plain", "compact"] as const`,
   and keep `variant` on the root.
3. **Motion.** Every transition or animation needs a reduced-motion path:
   `motion-reduce:transition-none`, `motion-reduce:animate-none`, or
   `motion-safe:` for loops. Animate `transform` and `opacity`, keep durations short,
   and use the easing tokens in the theme.
4. **Mirror.** Add the install-path re-export the site imports:
   `src/components/ui/uai/<name>.tsx` (components) or `src/components/uai/<name>.tsx`
   (blocks), containing only `export * from "@/registry/uai/<components|blocks>/<name>";`.
5. **Registry entry.** Add the item to `registry.json` with its `files`, `target`,
   npm `dependencies`, and `registryDependencies`. List shadcn primitives by bare name
   (`button`) and Uai items by full URL
   (`https://uaiblocks.dev/r/<name>.json`). Always include `uai-utils` when
   you import `cn`, and `uai-theme`.
6. **Catalog and preview.** In `src/components/registry/<group>/`, add
   `<name>-preview.tsx`, a catalog entry in that group's `catalog.ts` whose `usage`
   is the exact text of the preview file, and a preview control built from the
   variants constant so every variant can be selected on the page.
7. **Tests.** Add `tests/<name>.test.tsx` for behaviour and accessibility, and
   extend the group's registry test.

### Works on Base UI and Radix

`shadcn init -d` creates a Base UI project; `shadcn init -b radix` creates a Radix one.
Items install into both, so use only the API the two share:

- No primitive-only props: `forceMount`, `loop`, `onOpenAutoFocus`, `onCloseAutoFocus`,
  `position` on Select, and so on. Keep panels mounted with your own element (with the
  right `role`, `id`, and `aria-*`), and own focus or keyboard wrap in a handler.
- Menu items act in `onClick`; `onSelect` means different things in the two libraries.
- Single-choice segmented controls are `role="radio"` buttons styled with
  `toggleVariants`, not `ToggleGroup` (its value is a string on Radix, an array on Base).
  One-question disclosures use `Collapsible`, not `Accordion`, for the same reason.
- Pass a `SelectValue` the label for the current value; Base shows the raw value otherwise.
- Style state with both forms: `data-[state=open]:` for Radix and `data-open:` for Base
  (also `checked`, `unchecked`, `closed`, `active`, and `data-pressed` for `on`), or use
  `aria-expanded:` / `aria-checked:`, which both set.

`asChild` is fine: the CLI rewrites it to `render` for Base projects.

## Checks that must pass

CI runs all of these on every pull request and on `main`:

| Command | What it checks |
| --- | --- |
| `bun run typecheck` | Next route types and TypeScript. |
| `bun run lint` | Biome formatting and lint rules. |
| `bun run registry:check` | Mirrors, `registry.json` dependencies, catalog usage vs. preview file, variants reaching the preview, reduced-motion handling, and the static rules from [`quality/premium-rubric.md`](quality/premium-rubric.md) (`scripts/premium-lint.ts`). |
| `bun run test` | Rebuilds `public/r` and runs the unit tests. |
| `bun run build` | Rebuilds the registry and the production site. |
| `bun scripts/consumer-check.ts --base base\|radix` | Serves this branch's `public/r`, creates a default Next app, runs `shadcn init` for that base, adds every `registry:ui` and `registry:block` item, then runs `tsc` and `next build`. CI runs both bases. Run `bun run registry:build` first. |
| `bun run test:e2e` | Every `/components/<id>` page in light and dark, desktop and mobile: a screenshot, axe (serious and critical findings fail), a reduced-motion pass, and the premium rubric's live checks (`e2e/premium.e2e.ts`, desktop). Needs `bun run build` first. |

Screenshots and the HTML report land in `e2e-artifacts/` locally. CI splits the
browser checks into shards (four desktop, two mobile), and each shard uploads its
own `browser-<project>-<n>of<total>` artifact with the screenshots and report for
the tests it ran. Review them for the component you changed, in both themes and
on mobile.

### Baselines

Some findings predate these checks. They are listed so CI stays green while still
reporting them; new work must not add entries.

- `scripts/registry-check.baseline.json`: known registry-contract violations.
  When you fix one, run `bun run registry:check --update` to remove it.
- `e2e/axe-baseline.json`: known serious or critical axe findings, as
  `<rule>:<component>:<theme>`. Delete the line once it is fixed.
- `e2e/reduced-motion-baseline.json`: components that still move with reduced motion.
- `e2e/premium-baseline.json`: known premium rubric findings, as
  `<check>:<component>:<theme>` (P4, P5, C3, S2, L2, X2). Delete the line once it is fixed.

Approved exceptions are different from baselines: they are deliberate deviations
from the rubric, signed off by Victor, and never shrink on their own. They live in
`quality/premium-exceptions.json` (one rubric row, one file, named properties,
approver and date), because `quality/premium-rubric.md` is Designer's text and is
kept verbatim.

## Pull requests

- Keep one component or one concern per pull request.
- Update `DESIGN.md` and `PRODUCT.md` in the same change when the visual contract moves.
- Never edit the stock shadcn primitives in `src/components/ui/*.tsx` or the
  generated files in `public/r`.
- By contributing, you agree that your work is released under the MIT License.

## Automation

Three workflows run on `workflow_dispatch` only until their secrets are set; each
file has its `schedule` commented out with a note.

| Workflow | What it does |
| --- | --- |
| `component-factory.yml` | Builds the next `todo` idea from `backlog/ideas.yml` (generation step is a stub for now). |
| `polish-loop.yml` | Screenshots every item and scores it 1–10 against `quality/premium-rubric.md` with `scripts/design-review.ts`. |
| `idea-scout.yml` | Proposes new `status: proposed` ideas for `backlog/ideas.yml`. |

To enable them:

1. Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as a repository secret, and set the
   `AI_MODEL` repository variable (optionally `AI_PROVIDER`). Keys are read from the
   environment only; never put them in code.
2. Allow GitHub Actions to create pull requests (Settings › Actions › General).
3. Uncomment the `schedule` block.

Guardrails live in `scripts/automation/bot-pr.ts`: bot PRs are always drafts from a
`bot/*` branch, carry the `bot` label, and no new one opens while two are open.
Pull requests opened with the workflow's `GITHUB_TOKEN` don't start CI on their own;
push an empty commit or close and reopen the PR to run it.

Run the pieces locally:

```sh
bun scripts/automation/backlog.ts check
bun run build && bunx playwright test e2e/components.e2e.ts --project=desktop
AI_MODEL=<model> ANTHROPIC_API_KEY=<key> bun scripts/design-review.ts --limit 3
```
