# Uai registry browser

## Scope and mode

- Primary target: `src/app/(home)/page.tsx`
- Related targets: the root layout, component browser, and registry JSON routes
- Visitor mode: Read with an Operate-style catalog shell

## Audience, job, and action

React developers arrive to find a Uai component, inspect its useful states and
source, then install it through the shadcn CLI. Search and component selection are
the primary task. Copying the install command is the primary action.

## Content and constraints

- Use only verified registry items, categories, descriptions, and install paths.
- Keep preview, highlighted source, usage, and accessibility information attached to the selected item.
- Preserve working search, category filters, component selection, tabs, copy actions, and demos.
- Keep keyboard focus, accessible names, reduced motion, and viewport-safe responsive behavior.
- Do not invent component counts, package aliases, repository URLs, or unavailable capabilities.

## Approved direction

- Primary comp: `.impeccable/mocks/uai-registry-browser.png`
- Comp metadata: `.impeccable/mocks/uai-registry-browser.json`
- Direction name: Registry Browser
- Contract seed: `uai-registry-browser-v1`
- Craft bar: Beautiful UI showcase print for color, hover, type, preview stages, and pills — not for IA

The homepage is a dense component catalog instead of a marketing page. A persistent
left sidebar filters categories and real Uai components. The workbench on the right
shows the selected component's preview or highlighted source. A fixed install dock
reveals usage and accessibility details when requested.

The memorable moment is the browser itself: every visible region helps the reader
select, inspect, or install source-owned code. Graphite surfaces and dotted
hairlines make it feel like a precise developer tool. Catalog selection and
Preview/Code use quiet graphite and inverted pills. Cobalt appears only for
keyboard focus. Each component sits in a 16px preview stage with an optional
floating variant pill.

## Responsive behavior

At desktop widths, the catalog sidebar remains visible while the workbench scrolls.
At widths less than 900px, the sidebar becomes a compact native component selector
above the numbered title and Preview/Code pill. Preview stages keep a single well,
and the install dock keeps its copy action visible. Expanded details use one column.
Commands may scroll inside their own field, but the page must not exceed the viewport.

## Unresolved decisions

- The public production registry URL and repository action remain deployment inputs.
- Future registry categories appear only when verified items require them.
