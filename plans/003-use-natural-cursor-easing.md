# 003 — Use natural cursor trajectory easing

- **Status**: TODO
- **Commit**: 921eefc
- **Severity**: MEDIUM
- **Category**: Easing and duration
- **Estimated scope**: 1 file, 1 changed line

## Problem

After plan 002, the cursor path is represented by one `translate`
interpolation, but it still uses strong ease-out. Across the long 42–96 and
126–170 travels, ease-out makes the cursor jump quickly and spend too much of
the segment coasting into the target. On-screen movement should accelerate and
decelerate with strong ease-in-out.

```tsx
// videos/src/thinking-v2/DemoCursor.tsx — expected after plan 002
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

## Target

Use the audit playbook's exact strong ease-in-out curve for movement that stays
on screen.

```tsx
// target: only this easing line changes
easing: Easing.bezier(0.77, 0, 0.175, 1),
```

Do not apply this curve to cursor entry/exit opacity, hover crossfades, click
feedback, or camera movement.

## Repo conventions to follow

- Remotion motion values remain inline in `style`, as in
  `videos/src/thinking-v2/WorkbenchScene.tsx:38`.
- Existing strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` remains correct for
  entry and press feedback; this plan introduces no global token.
- The exact movement curve comes from the animation audit catalog:
  `cubic-bezier(0.77, 0, 0.175, 1)`.

## Steps

1. Execute plan 002 first. Confirm `DemoCursor.tsx` contains the expected
   `translate` interpolation above.
2. Change only that interpolation's easing to
   `Easing.bezier(0.77, 0, 0.175, 1)`.
3. Leave every frame, coordinate, and other easing unchanged.

## Boundaries

- This plan depends on `002-move-cursor-with-translate.md`.
- Do NOT apply ease-in-out to cursor opacity, shape morphing, press scale, or the
  parent camera.
- Do NOT change travel durations or add waypoints.
- If plan 002 has not been applied exactly, STOP and execute it first.

## Verification

- **Mechanical**:
  - `cd videos && bun run lint`
  - `cd videos && bun run build`
  - Both commands must exit with code 0.
- **Feel check**:
  - Render frames 42–180 and inspect at normal speed and 25% speed.
  - Confirm each travel has visible acceleration and deceleration without a
    sluggish initial response or a long final coast.
  - Confirm the cursor still reaches frames 96 and 170 exactly.
- **Done when**: only the cursor's on-screen translation uses
  `cubic-bezier(0.77, 0, 0.175, 1)` and every target frame is unchanged.
