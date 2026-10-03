import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { ResponseStatusValue } from "@uai/components/response-status";
import { lightTokens, StatusDemo } from "./StatusDemo";
import { StatusCursor } from "./StatusCursor";

const answer =
  "A v2 do Uai traz mais de 70 componentes, todos compostos por partes nomeadas. O Response Status acompanha cada resposta do modelo: fila, geração, interrupção, conclusão e falha. Parar e Regenerar só aparecem quando fazem sentido, e o foco do teclado fica no lugar certo.";

const totalTokens = 412;
const timeline = {
  firstStream: 48,
  stopClick: 128,
  stopped: 130,
  regenerateClick: 178,
  requeued: 180,
  secondStream: 198,
  complete: 328,
};
const firstRate = 2.4;
const secondRate = totalTokens / (timeline.complete - timeline.secondStream);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const camera = {
  ...clamp,
  easing: Easing.bezier(0.23, 1, 0.32, 1),
};

const stateAt = (frame: number): { status: ResponseStatusValue; count: number } => {
  if (frame < timeline.firstStream) return { status: "queued", count: 0 };
  if (frame < timeline.stopped) {
    return {
      status: "streaming",
      count: Math.round((frame - timeline.firstStream) * firstRate),
    };
  }
  const stoppedCount = Math.round((timeline.stopped - timeline.firstStream) * firstRate);
  if (frame < timeline.requeued) {
    return { status: "stopped", count: stoppedCount };
  }
  if (frame < timeline.secondStream) {
    return { status: "queued", count: 0 };
  }
  if (frame < timeline.complete) {
    return {
      status: "streaming",
      count: Math.round((frame - timeline.secondStream) * secondRate),
    };
  }
  return { status: "complete", count: totalTokens };
};

export const LifecycleScene = () => {
  const frame = useCurrentFrame();
  const { status, count } = stateAt(frame);
  const visibleText = answer.slice(0, Math.round((answer.length * count) / totalTokens));
  const pressed =
    Math.abs(frame - timeline.stopClick) <= 3 || Math.abs(frame - timeline.regenerateClick) <= 3;
  const hovered = (frame >= 110 && frame < 146) || (frame >= 162 && frame < 186);
  const detail =
    status === "queued"
      ? "2º na fila"
      : status === "complete"
        ? `${count} tokens · 4,3 s`
        : `${count} tokens`;
  const userEnter = interpolate(frame, [4, 22], [0, 1], { ...clamp, easing: camera.easing });
  const caretOn = status === "streaming" && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fbfbfa",
        ...lightTokens,
        opacity: interpolate(frame, [0, 14, 384, 408], [0, 1, 1, 0], clamp),
        scale: interpolate(frame, [376, 408], [1, 1.035], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(frame, [0, 92, 120, 190, 228], [1, 1, 1.14, 1.14, 1], camera),
          translate: interpolate(
            frame,
            [0, 92, 120, 190, 228],
            ["0px 0px", "0px 0px", "-150px -80px", "-150px -80px", "0px 0px"],
            camera,
          ),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 360,
            top: 364,
            width: 600,
            scale: "2",
            transformOrigin: "0 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            color: "var(--uai-text)",
          }}
        >
          <div
            style={{
              alignSelf: "flex-end",
              padding: "8px 12px",
              borderRadius: 14,
              background: "var(--uai-surface-raised)",
              fontSize: 13,
              lineHeight: "20px",
              opacity: userEnter,
              translate: `0px ${(1 - userEnter) * 6}px`,
            }}
          >
            Resuma o que mudou na v2 do Uai.
          </div>
          <p style={{ margin: 0, minHeight: 64, fontSize: 13, lineHeight: "20px" }}>
            {visibleText}
            {caretOn ? (
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 13,
                  marginLeft: 2,
                  verticalAlign: "-2px",
                  borderRadius: 1,
                  background: "var(--uai-text)",
                }}
              />
            ) : null}
          </p>
          <StatusDemo
            variant="bar"
            status={status}
            detail={detail}
            hovered={hovered}
            pressed={pressed}
          />
        </div>
        <StatusCursor
          visible={[70, 236]}
          path={[
            { frame: 70, x: 1240, y: 920 },
            { frame: 112, x: 1477, y: 672 },
            { frame: 148, x: 1477, y: 672 },
            { frame: 164, x: 1448, y: 672 },
            { frame: 184, x: 1448, y: 672 },
            { frame: 224, x: 1640, y: 900 },
          ]}
          clicks={[timeline.stopClick, timeline.regenerateClick]}
          pointer={[
            [108, 132],
            [160, 182],
          ]}
        />
      </div>
    </div>
  );
};
