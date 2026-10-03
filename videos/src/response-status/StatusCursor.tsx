import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type StatusCursorProps = {
  // Keyframes for the cursor tip in stage coordinates.
  path: readonly { frame: number; x: number; y: number }[];
  // Frames where the cursor presses a target.
  clicks: readonly number[];
  // Frame ranges where the cursor shows the pointing hand.
  pointer: readonly (readonly [number, number])[];
  visible: readonly [number, number];
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const StatusCursor = ({ path, clicks, pointer, visible }: StatusCursorProps) => {
  const frame = useCurrentFrame();
  const move = { ...clamp, easing: Easing.bezier(0.77, 0, 0.175, 1) };
  const x = interpolate(
    frame,
    path.map((point) => point.frame),
    path.map((point) => point.x),
    move,
  );
  const y = interpolate(
    frame,
    path.map((point) => point.frame),
    path.map((point) => point.y),
    move,
  );
  const press = Math.min(
    1,
    ...clicks.map((click) =>
      interpolate(frame, [click - 4, click, click + 3], [1, 0.97, 1], { ...clamp, easing: ease }),
    ),
  );
  const hand = Math.max(
    0,
    ...pointer.map(([start, end]) =>
      interpolate(frame, [start, start + 4, end, end + 4], [0, 1, 1, 0], {
        ...clamp,
        easing: ease,
      }),
    ),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 44,
        height: 44,
        translate: `${x}px ${y}px`,
        scale: String(press),
        transformOrigin: "0px 0px",
        opacity: interpolate(
          frame,
          [visible[0], visible[0] + 14, visible[1] - 14, visible[1]],
          [0, 1, 1, 0],
          clamp,
        ),
        zIndex: 20,
      }}
    >
      <Img
        src={staticFile("cursors/macos-arrow.png")}
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          width: 17.5,
          height: 28,
          opacity: 1 - hand,
          scale: String(1 - hand * 0.1),
          transformOrigin: "0px 0px",
        }}
      />
      <Img
        src={staticFile("cursors/macos-pointing-hand.png")}
        style={{
          position: "absolute",
          top: -11,
          left: -18,
          width: 44,
          height: 44,
          opacity: hand,
          scale: String(0.9 + hand * 0.1),
          transformOrigin: "0px 0px",
        }}
      />
    </div>
  );
};
