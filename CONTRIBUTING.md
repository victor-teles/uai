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
   (`https://uaiblocks.vercel.app/r/<name>.json`). Always include `uai-utils` when
   you import `cn`, and `uai-theme`.
6. **Catalog and preview.** In `src/components/registry/<group>/`, add
   `<name>-preview.tsx`, a catalog entry in that group's `catalog.ts` whose `usage`
   is the exact text of the preview file, and a preview control built from the
   variants constant so every variant can be selected on the page.
7. **Tests.** Add `tests/<name>.test.tsx` for behaviour and accessibility, and
   extend the group's registry test.

## Checks that must pass

CI runs all of these on every pull request and on `main`:

| Command | What it checks |
| --- | --- |
| `bun run typecheck` | Next route types and TypeScript. |
| `bun run lint` | Biome formatting and lint rules. |
| `bun run registry:check` | Mirrors, `registry.json` dependencies, catalog usage vs. preview file, variants reaching the preview, reduced-motion handling. |
| `bun run test` | Rebuilds `public/r` and runs the unit tests. |
| `bun run build` | Rebuilds the registry and the production site. |
| `bun run test:e2e` | Every `/components/<id>` page in light and dark, desktop and mobile: a screenshot, axe (serious and critical findings fail), and a reduced-motion pass. Needs `bun run build` first. |

Screenshots and the HTML report land in `e2e-artifacts/` locally and as the
`browser-desktop` and `browser-mobile` artifacts in CI. Review them for the
component you changed, in both themes and on mobile.

### Baselines

Some findings predate these checks. They are listed so CI stays green while still
reporting them; new work must not add entries.

- `scripts/registry-check.baseline.json`: known registry-contract violations.
  When you fix one, run `bun run registry:check --update` to remove it.
- `e2e/axe-baseline.json`: known serious or critical axe findings, as
  `<rule>:<component>:<theme>`. Delete the line once it is fixed.
- `e2e/reduced-motion-baseline.json`: components that still move with reduced motion.

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
