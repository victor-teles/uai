# Share image fonts

Static WOFF files for the `next/og` share images. Satori cannot read the variable
WOFF2 files the site loads through `@fontsource-variable`, so the OG renderer
(`src/lib/og.tsx`) reads these instead.

| File | Family | Source | License |
| --- | --- | --- | --- |
| `inter-latin-{400,600}-normal.woff` | Inter | Fontsource (`cdn.jsdelivr.net/fontsource/fonts/inter`) | SIL Open Font License 1.1 |
| `geist-mono-latin-{400,500,600}-normal.woff` | Geist Mono | Fontsource (`cdn.jsdelivr.net/fontsource/fonts/geist-mono`) | SIL Open Font License 1.1 |

Only the Latin subset is included, which covers the catalog copy (including
Portuguese accents and typographic punctuation).
