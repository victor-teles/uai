import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { ThinkingCard } from "./ThinkingCard";

type FeatureProps = {
  children: ReactNode;
  revealAt: number;
};

const Feature = ({ children, revealAt }: FeatureProps) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={`${String(children)} — destaque`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: interpolate(frame, [revealAt, revealAt + 15], [0, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [revealAt, revealAt + 15], ["0px 12px", "0px 0px"], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: 999,
          background: "#a6aab2",
        }}
      />
      <span
        style={{
          color: "#aaadb4",
          fontSize: 24,
          fontWeight: 470,
          letterSpacing: "-0.01em",
          lineHeight: "32px",
        }}
      >
        {children}
      </span>
    </Interactive.Div>
  );
};

export const ThinkingVideo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "var(--uai-canvas)",
        color: "var(--uai-text)",
        fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
        opacity: interpolate(frame, [0, 16, 400, 419], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--uai-border) 58%, transparent) 1px, transparent 1.1px)",
          backgroundSize: "32px 32px",
          opacity: 0.44,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -380,
          right: -220,
          width: 1160,
          height: 1160,
          borderRadius: 999,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--uai-surface-raised) 72%, transparent) 0%, transparent 68%)",
        }}
      />

      <Interactive.Div
        name="Identidade da série"
        style={{
          position: "absolute",
          top: 74,
          left: 86,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: interpolate(frame, [6, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [6, 24], ["0px 10px", "0px 0px"], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 54,
            height: 54,
            borderRadius: 14,
            background: "#f7f7f5",
          }}
        >
          <Img
            name="Logo Uai"
            src={staticFile("brand/uai-mark.png")}
            style={{ width: 38, height: 38, objectFit: "contain" }}
          />
        </span>
        <span>
          <span
            style={{
              display: "block",
              color: "var(--uai-text)",
              fontSize: 18,
              fontWeight: 650,
              letterSpacing: "0.11em",
              lineHeight: "24px",
              textTransform: "uppercase",
            }}
          >
            Componente em destaque
          </span>
          <span
            style={{
              display: "block",
              marginTop: 2,
              color: "var(--uai-muted)",
              fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
              fontSize: 14,
              lineHeight: "20px",
            }}
          >
            episódio 01
          </span>
        </span>
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          inset: "198px 86px 108px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 640px) minmax(0, 1fr)",
          alignItems: "center",
          gap: 104,
        }}
      >
        <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
          <Interactive.Div
            name="Nome do componente"
            style={{
              maxWidth: 620,
              color: "var(--uai-text)",
              fontSize: 112,
              fontWeight: 600,
              letterSpacing: "-0.06em",
              lineHeight: 0.94,
              opacity: interpolate(frame, [20, 44], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [20, 44], ["0px 24px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Thinking
          </Interactive.Div>

          <Interactive.Div
            name="Descrição do componente"
            style={{
              maxWidth: 600,
              marginTop: 38,
              color: "var(--uai-muted)",
              fontSize: 34,
              fontWeight: 430,
              letterSpacing: "-0.025em",
              lineHeight: 1.28,
              opacity: interpolate(frame, [32, 56], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [32, 56], ["0px 18px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Acompanhe o trabalho da IA por meio de atividades observáveis, do primeiro passo ao
            resultado.
          </Interactive.Div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: "auto",
              paddingBottom: 18,
            }}
          >
            <Feature revealAt={296}>Progresso ao vivo</Feature>
            <Feature revealAt={314}>Evidências estruturadas</Feature>
            <Feature revealAt={332}>Histórico sempre disponível</Feature>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            minWidth: 0,
            height: 700,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 910,
              height: 650,
              borderRadius: 999,
              background:
                "radial-gradient(ellipse, color-mix(in oklab, var(--uai-surface-raised) 58%, transparent) 0%, transparent 70%)",
              opacity: 0.72,
            }}
          />
          <Interactive.Div
            name="Componente Thinking"
            style={{
              position: "relative",
              opacity: interpolate(frame, [12, 34], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [12, 40], [1.28, 1.38], {
                easing: Easing.spring({ damping: 200 }),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
              translate: interpolate(frame, [12, 40], ["28px 0px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <ThinkingCard />
          </Interactive.Div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
