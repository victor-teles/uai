# Components workbench QA report

| Field | Value |
| --- | --- |
| Date | 2026-08-11 |
| App URL | `http://localhost:3000` |
| Session | `uai-single-page-qa` |
| Scope | Components page, install dock, highlighted code, desktop, and mobile |

## Summary

| Severity | Open | Resolved |
| --- | --- | --- |
| Critical | 0 | 0 |
| High | 0 | 0 |
| Medium | 0 | 0 |
| Low | 0 | 0 |
| **Total** | **0** | **0** |

## Route coverage

- The root route exposes the Components workbench.
- The header exposes only the Components destination.
- The removed `/docs` route renders the Next.js 404 page.
- Registry JSON remains available under `/r`.

## Interaction coverage

- The install dock uses fixed positioning at desktop and mobile widths.
- The install toggle reveals Usage and Accessibility details.
- The collapsed detail drawer is inert and removes its controls from keyboard navigation.
- The Code tab renders highlighted TSX.
- The Usage detail renders highlighted TSX.
- The install and usage copy actions remain available.
- The mobile document width matches the 390px viewport.

## Evidence

- Collapsed desktop: `../screenshots/components-dock-desktop-final.png`
- Highlighted desktop code: `../screenshots/components-code-desktop-first.png`
- Expanded mobile dock: `../screenshots/components-dock-mobile-final.png`

final result: passed
