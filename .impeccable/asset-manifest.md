# Uai production asset manifest

## Decision

Uai needs no image-native production asset for the approved home surface. The production bucket is empty.

The approved PNG files are build references only:

- `.impeccable/mocks/uai-specimen-wall.png` defines the primary composition.
- `.impeccable/mocks/uai-docs-workbench.png` defines the install command and Task Flow depth.

Do not import these files at runtime. Do not copy them into `public/` or another deployable asset directory.

## Production bucket

| Asset class | Files to produce | Decision |
| --- | --- | --- |
| Raster images | None | The surface contains no photography, illustration, or image-native texture. |
| Generated images | None | This surface does not need an image prompt. |
| Standalone SVG files | None | Keep geometric marks, patterns, and state rails in component code. |
| Logo files | None | Render the `uai` wordmark as text. |
| Texture files | None | Build the diagonal hairline field as an `aria-hidden` inline SVG pattern or CSS pattern. |
| Local font files | None | Use the selected application sans and mono stacks. Do not infer a font asset from the comps. |

## Code-owned visual inventory

| Region | Production medium | Required treatment |
| --- | --- | --- |
| Wordmark, headings, labels, metadata, and prose | Semantic HTML and CSS | Keep all text selectable, responsive, and available to assistive technology. |
| Navigation and documentation shell | React, Fumadocs, and CSS | Preserve links, search, theme control, repository action, mobile drawer, and visible focus. |
| Canvas, panels, dividers, and highlights | CSS | Use solid graphite fills, one-pixel hairlines, inset highlights, and the approved corner system. |
| Diagonal edge field | Inline SVG pattern or CSS pattern | Draw repeated hairlines. Do not export or rasterize the pattern. |
| Cobalt state rail and nodes | Semantic list markup and CSS pseudo-elements | Connect Thinking, Approval, Task, and Prompt as meaningful ordered states. |
| Thinking disclosure | Interactive React | Use an accessible disclosure with live text and status metadata. |
| Approval decision | Interactive React | Use real buttons, status text, keyboard behavior, and focus states. |
| Task rows and Task Flow | Interactive React | Render progress, tools, approval, response, and timing as structured live state. |
| Prompt composer | Form controls and React | Keep attachment, tool, model, and submit controls operable. |
| Install command and source preview | `code` or `pre`, React state, and CSS | Keep the command selectable. Give copy feedback with the Clipboard API. |
| Preview and source tabs | React tabs and highlighted text spans | Do not flatten the preview or code into an image. |
| Status marks and loading motion | Lucide icons, CSS, and React state | Respect `prefers-reduced-motion` and never rely on color alone. |

## Icon inventory

Use Lucide React components instead of exported icon files. The expected set is:

- Navigation: `Search`, `Sun`, `Github`, `ChevronsLeft`, `FileText`, `Box`, `Workflow`, `MessageCircle`, `Table2`, and `ExternalLink`.
- Actions: `ArrowRight`, `Copy`, `Download`, `Pencil`, `ChevronDown`, `ChevronRight`, `ArrowUp`, `Plus`, `Paperclip`, and `X`.
- State and content: `Sparkles`, `Code2`, `Check`, `LoaderCircle`, `Circle`, `Database`, and `ChartNoAxesCombined`.

If the final markup does not use an icon, omit its import. Add no icon sprite, icon font, or raster fallback.

## Verification

Both 1536 by 1024 comps contain interface material only. Their depth comes from layout, borders, state color, type, and live controls.

A raster substitute would break selection, accessibility, interaction, responsive reflow, and theme behavior. CSS, semantic React, and inline vector geometry reproduce every visible region.

Generated metrics, counts, package names, model names, and performance claims are composition placeholders. They are not production content or production assets.
