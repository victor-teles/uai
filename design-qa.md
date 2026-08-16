# Components workbench design QA

## Evidence

- Approved source: `.impeccable/mocks/uai-registry-browser.png`
- Collapsed desktop: `.impeccable/screenshots/components-dock-desktop-final.png`
- Highlighted desktop code: `.impeccable/screenshots/components-code-desktop-first.png`
- Expanded mobile dock: `.impeccable/screenshots/components-dock-mobile-final.png`
- Desktop viewport: 1536 x 1024
- Mobile viewport: 390 x 844

## Refinement result

The Components page preserves the approved Registry Browser composition. The header now has one destination. The fixed install dock replaces the document links and persistent detail sections.

The dock reveals Usage and Accessibility without leaving the workbench. The drawer stacks on mobile and remains inert while closed. Shiki highlights TSX in the Code tab and the Usage detail.

Desktop uses the original 312px catalog rail. Mobile collapses the rail into a component selector. Mobile has no horizontal page overflow (`scrollWidth: 390`).

## Interaction QA

- The install dock reports `position: fixed`.
- The detail toggle updates `aria-expanded`.
- The closed drawer removes its controls from the interaction tree.
- The Code and Usage views render highlighted tokens.
- The removed `/docs` route renders 404.
- The browser console contains no runtime errors.

## Severity gate

- P0: none
- P1: none
- P2: none

final result: passed
