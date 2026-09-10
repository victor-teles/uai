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
            easing: Easing.bezier(0.77, 0, 0.175, 1),
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
          [96, 100, 103, 170, 174, 177, 218, 222, 225, 278, 282, 285],
          [1, 0.97, 1, 1, 0.97, 1, 1, 0.97, 1, 1, 0.97, 1],
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
      <Interactive.Div
        name="Transição de forma do cursor"
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${interpolate(
            frame,
            [
              0, 90, 92, 94, 123, 125, 127, 162, 164, 166, 246, 248, 250, 272, 274, 276, 326, 329,
              331, 390,
            ],
            [0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}px)`,
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
    </Interactive.Div>
  );
};
