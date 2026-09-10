# 001 — Make cursor press feedback subtle

- **Status**: TODO
- **Commit**: 921eefc
- **Severity**: HIGH
- **Category**: Physicality and duration
- **Estimated scope**: 1 file, about 10 changed lines

## Problem

The demo cursor contracts to `0.82` during every click. At 30 fps, the first click
takes 200 ms to press and another 200 ms to release; later clicks take even longer.
This reads as a decorative pulse instead of a macOS click. The final click also
starts at frame 272 while the pointing-hand transition is still running through
frame 276.

```tsx
// videos/src/thinking-v2/DemoCursor.tsx:37 — current
scale: interpolate(
  frame,
  [96, 102, 108, 170, 178, 184, 218, 225, 231, 272, 279, 285],
  [1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1],
  {
    easing: Easing.bezier(0.23, 1, 0.32, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
```

## Target

Use the Uai press scale of `0.97`. Each press lasts 4 frames (133 ms), each
release lasts 3 frames (100 ms), and the final press begins 2 frames after the
pointing-hand transition completes.

```tsx
// target
scale: interpolate(
  frame,
  [96, 100, 103, 170, 174, 177, 218, 222, 225, 278, 282, 285],
  [1, 0.97, 1, 1, 0.97, 1, 1, 0.97, 1, 1, 0.97, 1],
  {
    easing: Easing.bezier(0.23, 1, 0.32, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
```

## Repo conventions to follow

- `DESIGN.md:427` defines `0.97` as the press scale for links and theme controls.
- `DESIGN.md:433` repeats `0.97` for segmented-pill press feedback.
- Keep the existing inline `interpolate()` shape so the Remotion Studio can edit
  the keyframes.

## Steps

1. In `videos/src/thinking-v2/DemoCursor.tsx`, replace only the parent cursor's
   press `scale` input and output ranges with the target ranges above.
2. Preserve `transformOrigin: "0px 0px"`, all cursor coordinates, image sizes,
   hover transitions, and camera timing.
3. Confirm that the status changes in `WorkbenchScene.tsx` still occur after the
   corresponding click troughs; do not edit those status thresholds.

## Boundaries

- Do NOT modify `WorkbenchScene.tsx`.
- Do NOT change cursor assets, cursor sizes, hover timing, or the camera timeline.
- Do NOT add dependencies.
- If the cited scale block differs from commit `921eefc`, STOP and report drift.

## Verification

- **Mechanical**:
  - `cd videos && bun run lint`
  - `cd videos && bun run build`
  - Both commands must exit with code 0.
- **Feel check**:
  - Render `ThinkingV2` frames 88–292 and inspect at 10% playback speed.
  - Confirm each click is visible but the cursor never appears to collapse.
  - Confirm the final pointing hand is fully formed before the press begins.
  - Confirm the hotspot stays fixed at the control throughout every scale change.
- **Done when**: all four clicks bottom at exactly `0.97`, complete in the target
  frame budgets, and the final click starts at frame 278.
