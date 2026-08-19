import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const UaiMark = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Símbolo Uai"
      style={{
        position: "relative",
        width: 286,
        height: 286,
        opacity: interpolate(frame, [0, 14, 174, 204], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [0, 38, 150, 204], [0.9, 1, 1.018, 0.96], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    >
      <Interactive.Div
        name="Parte superior esquerda"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(0 0, 53% 0, 53% 72%, 27% 72%, 0 56%)",
          opacity: interpolate(frame, [0, 13], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 28], ["-22px -34px", "0px 0px"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [0, 28], ["-4deg", "0deg"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transformOrigin: "50% 50%",
        }}
      >
        <CanvasImage
          name="Marca Uai esquerda"
          src={staticFile("brand/uai-mark.png")}
          style={{ width: 286, height: 286 }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Parte superior direita"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(47% 0, 100% 0, 100% 58%, 65% 72%, 47% 72%)",
          opacity: interpolate(frame, [4, 17], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [4, 32], ["22px -34px", "0px 0px"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          rotate: interpolate(frame, [4, 32], ["4deg", "0deg"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transformOrigin: "50% 50%",
        }}
      >
        <CanvasImage
          name="Marca Uai direita"
          src={staticFile("brand/uai-mark.png")}
          style={{ width: 286, height: 286 }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Base do símbolo"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(0 52%, 100% 52%, 100% 100%, 0 100%)",
          opacity: interpolate(frame, [9, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [9, 38], ["0px 38px", "0px 0px"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [9, 38], [0.94, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          transformOrigin: "50% 50%",
        }}
      >
        <CanvasImage
          name="Marca Uai base"
          src={staticFile("brand/uai-mark.png")}
          style={{ width: 286, height: 286 }}
        />
      </Interactive.Div>
    </Interactive.Div>
  );
};

export const LogoScene = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Encerramento Uai"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#fbfbfa",
        opacity: interpolate(frame, [0, 18, 190, 209], [0, 1, 1, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <Interactive.Div
        name="Halo da marca"
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: 999,
          backgroundColor: "rgba(20, 20, 18, 0.035)",
          opacity: interpolate(frame, [0, 14, 46], [0, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 46], [0.62, 1.12], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      />
      <UaiMark />
    </AbsoluteFill>
  );
};
