# Animation plans

Plans generated from the focused motion audit of
`videos/src/thinking-v2/DemoCursor.tsx` at commit `921eefc`.

| Plan | Title | Severity | Status | Dependency |
| --- | --- | --- | --- | --- |
| 001 | Make cursor press feedback subtle | HIGH | TODO | None |
| 002 | Move the cursor with translate | LOW | TODO | None |
| 003 | Use natural cursor trajectory easing | MEDIUM | TODO | 002 |
| 004 | Mask cursor crossfade ghosting | LOW | TODO | None |

## Recommended execution order

1. `001-subtle-cursor-press.md`
2. `002-move-cursor-with-translate.md`
3. `003-use-natural-cursor-easing.md`
4. `004-mask-cursor-crossfade.md`

Plan 003 must run after plan 002 because it edits the `translate` interpolation
introduced there. Plans 001 and 004 are independent, but the order above moves
from feel-breaking feedback to trajectory mechanics and then visual polish.

Execute one plan at a time, run its verification, and update its status to
`DONE` only after both mechanical checks and the slow-motion feel check pass.
