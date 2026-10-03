# 002 — Move the cursor with translate

- **Status**: TODO
- **Commit**: 921eefc
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 1 file, about 35 changed lines

## Problem

The cursor animates absolute `left` and `top` values. These properties trigger
layout on every preview frame in Remotion Studio. The two interpolations share
the same frame range, so they can be represented as one compositor-friendly
`translate` interpolation without changing the path.

```tsx
// videos/src/thinking-v2/DemoCursor.tsx:13 — current
left: interpolate(
  frame,
  [0, 42, 96, 126, 170, 198, 224, 248, 274, 330, 390],
  [1120, 1120, 760, 760, 1324, 1324, 1324, 1324, 884, 884, 1060],
  {
    easing: Easing.bezier(0.23, 1, 0.32, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
top: interpolate(
  frame,
  [0, 42, 96, 126, 170, 198, 224, 248, 274, 330, 390],
  [880, 880, 242, 242, 399, 399, 399, 399, 242, 242, 720],
  {
    easing: Easing.bezier(0.23, 1, 0.32, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
```

## Target

Anchor the cursor at the top-left of its containing block and express every
existing coordinate as a `translate` pair. Preserve the current ease-out in this
plan; plan 003 changes the trajectory easing afterward.

```tsx
// target
left: 0,
top: 0,
translate: interpolate(
  frame,
  [0, 42, 96, 126, 170, 198, 224, 248, 274, 330, 390],
  [
    "1120px 880px",
    "1120px 880px",
    "760px 242px",
    "760px 242px",
    "1324px 399px",
    "1324px 399px",
    "1324px 399px",
    "1324px 399px",
    "884px 242px",
    "884px 242px",
    "1060px 720px",
  ],
  {
    easing: Easing.bezier(0.23, 1, 0.32, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
```

## Repo conventions to follow

- `videos/src/thinking-v2/WorkbenchScene.tsx:49` already animates camera position
  through the CSS `translate` property.
- Keep the interpolation inline in the `style` prop for Remotion Studio editing.
- Keep `transformOrigin: "0px 0px"` because it anchors click feedback to the
  cursor hotspot.

## Steps

1. In `videos/src/thinking-v2/DemoCursor.tsx`, remove the animated `left` and
   `top` interpolation blocks.
2. Add static `left: 0` and `top: 0` declarations.
3. Add the target `translate` interpolation with the exact coordinate pairs
   above.
4. Leave the current `cubic-bezier(0.23, 1, 0.32, 1)` unchanged; plan 003 owns
   the easing change.

## Boundaries

- Do NOT alter any coordinate, frame, cursor size, opacity, scale, or asset.
- Do NOT change `WorkbenchScene.tsx` or camera motion.
- Do NOT add dependencies or extract a shared motion utility.
- If the cited coordinate arrays differ from commit `921eefc`, STOP and report
  drift instead of recalculating positions.

## Verification

- **Mechanical**:
  - `cd videos && bun run lint`
  - `cd videos && bun run build`
  - Both commands must exit with code 0.
- **Feel check**:
  - Compare frames 42, 96, 170, 224, 274, and 390 before and after the edit.
  - Confirm the hotspot lands on the exact same pixels at every target.
  - Scrub the Studio timeline and confirm no jump occurs at frame 0 or 390.
- **Done when**: `left` and `top` are static, only `translate` moves the cursor,
  and all target coordinates remain visually identical.
