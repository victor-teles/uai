# 004 — Mask cursor crossfade ghosting

- **Status**: TODO
- **Commit**: 921eefc
- **Severity**: LOW
- **Category**: Cohesion and tokens
- **Estimated scope**: 1 file, about 35 changed lines

## Problem

The standard arrow and pointing hand use complementary opacity and scale
interpolations. During each four-frame transition both distinct silhouettes are
visible, which can read as a double-exposed cursor instead of a subtle shape
change.

```tsx
// videos/src/thinking-v2/DemoCursor.tsx:60 and :93 — current pattern
opacity: interpolate(
  frame,
  [0, 90, 94, 123, 127, 162, 166, 246, 250, 272, 276, 326, 331, 390],
  [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
  {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
),
```

## Target

Wrap both cursor images in one absolute interactive layer and apply a maximum
`blur(2px)` only at the midpoint of each crossfade. Preserve the existing image
opacity, scale, offsets, sizes, and hotspot.

```tsx
// target wrapper around both existing Img elements
<Interactive.Div
  name="Transição de forma do cursor"
  style={{
    position: "absolute",
    inset: 0,
    filter: interpolate(
      frame,
      [0, 90, 92, 94, 123, 125, 127, 162, 164, 166, 246, 248, 250, 272, 274, 276, 326, 329, 331, 390],
      [
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
        "blur(2px)",
        "blur(0px)",
        "blur(0px)",
      ],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  }}
>
  {/* Keep both existing Img elements unchanged inside this wrapper. */}
</Interactive.Div>
```

## Repo conventions to follow

- Use `Interactive.Div` with a descriptive Portuguese name, matching the other
  editable layers in `videos/src/thinking-v2`.
- Keep animation values inline so the Remotion Studio can expose them.
- The audit catalog permits a subtle `blur(2px)` to mask a jarring crossfade;
  never exceed 2px for this cursor transition.

## Steps

1. In `videos/src/thinking-v2/DemoCursor.tsx`, insert the target
   `Interactive.Div` around the two existing cursor `Img` elements.
2. Add the exact filter keyframes above. Use frame 329 as the integer midpoint
   of the 326–331 return transition.
3. Keep both `Img` style objects byte-for-byte unchanged except for indentation
   required by the wrapper.
4. Confirm the wrapper has no position offset, scale, opacity, or transform
   origin of its own.

## Boundaries

- Do NOT change hover duration, image opacity, image scale, asset paths, sizes,
  or offsets.
- Do NOT add CSS keyframes, global styles, or dependencies.
- Do NOT use blur above 2px or leave blur active while the cursor is settled.
- If the crossfade frame ranges differ from commit `921eefc`, STOP and report
  drift.

## Verification

- **Mechanical**:
  - `cd videos && bun run lint`
  - `cd videos && bun run build`
  - Both commands must exit with code 0.
- **Feel check**:
  - Render frames 84–100, 118–132, 156–172, 240–254, 268–282, and 322–336.
  - Inspect at 10% playback speed and confirm the midpoint reads as one soft
    silhouette rather than two sharp cursors.
  - At frames 89, 95, 122, 128, 161, 167, 245, 251, 271, 277, 325, and 332,
    confirm the cursor is fully sharp.
  - Confirm the hotspot never shifts during any transition.
- **Done when**: every crossfade peaks at exactly `blur(2px)`, settled frames
  remain at `blur(0px)`, and no double-exposed hard edge is visible.
