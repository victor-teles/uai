import { Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";

export const DemoCursor = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Cursor de demonstração"
      style={{
        position: "absolute",
        width: 44,
        height: 44,
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
        opacity: interpolate(frame, [12, 26, 360, 386], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
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
        transformOrigin: "0px 0px",
        zIndex: 20,
      }}
    >
      <Img
        name="Cursor padrão do macOS"
        src={staticFile("cursors/macos-arrow.png")}
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          width: 17.5,
          height: 28,
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
          scale: interpolate(
            frame,
            [0, 90, 94, 123, 127, 162, 166, 246, 250, 272, 276, 326, 331, 390],
            [1, 1, 0.9, 0.9, 1, 1, 0.9, 0.9, 1, 1, 0.9, 0.9, 1, 1],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            },
          ),
          transformOrigin: "0px 0px",
        }}
      />
      <Img
        name="Cursor apontador do macOS"
        src={staticFile("cursors/macos-pointing-hand.png")}
        style={{
          position: "absolute",
          top: -11,
          left: -18,
          width: 44,
          height: 44,
          opacity: interpolate(
            frame,
            [0, 90, 94, 123, 127, 162, 166, 246, 250, 272, 276, 326, 331, 390],
            [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
          scale: interpolate(
            frame,
            [0, 90, 94, 123, 127, 162, 166, 246, 250, 272, 276, 326, 331, 390],
            [0.9, 0.9, 1, 1, 0.9, 0.9, 1, 1, 0.9, 0.9, 1, 1, 0.9, 0.9],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            },
          ),
          transformOrigin: "0px 0px",
        }}
      />
    </Interactive.Div>
  );
};
