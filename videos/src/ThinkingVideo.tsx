import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

import { ThinkingCard } from "./ThinkingCard";

const Feature = ({ children, revealAt }: { children: ReactNode; revealAt: number }) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={`${String(children)} feature`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: interpolate(frame, [revealAt, revealAt + 15], [0, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [revealAt, revealAt + 15], ["0px 14px", "0px 0px"], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: 999,
          background: "#aeb2ba",
        }}
      />
      <span style={{ color: "#b4b7bd", fontSize: 22, fontWeight: 470, lineHeight: "30px" }}>
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
        background: "#111317",
        color: "#f4f4f2",
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
            "radial-gradient(circle, rgba(255,255,255,0.075) 1px, transparent 1.2px)",
          backgroundPosition: "0 0",
          backgroundSize: "32px 32px",
          opacity: 0.52,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -280,
          right: -180,
          width: 980,
          height: 980,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(80,89,108,0.2) 0%, rgba(17,19,23,0) 68%)",
        }}
      />

      <Interactive.Div
        name="Uai wordmark"
        style={{
          position: "absolute",
          top: 72,
          left: 86,
          display: "flex",
          alignItems: "center",
          gap: 13,
          color: "#f4f4f2",
          fontSize: 25,
          fontWeight: 720,
          letterSpacing: "-0.04em",
          lineHeight: "30px",
          opacity: interpolate(frame, [6, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#f4f4f2",
            color: "#15171b",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.07em",
          }}
        >
          u
        </span>
        uai
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          inset: "176px 86px 116px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 670px) minmax(0, 1fr)",
          alignItems: "center",
          gap: 96,
        }}
      >
        <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
          <Interactive.Div
            name="Component eyebrow"
            style={{
              color: "#9da1aa",
              fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
              fontSize: 19,
              fontWeight: 560,
              letterSpacing: "0.12em",
              lineHeight: "28px",
              textTransform: "uppercase",
              opacity: interpolate(frame, [18, 36], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [18, 36], ["0px 14px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Thinking component
          </Interactive.Div>

          <Interactive.Div
            name="Hero title"
            style={{
              maxWidth: 650,
              marginTop: 28,
              color: "#f5f5f2",
              fontSize: 92,
              fontWeight: 590,
              letterSpacing: "-0.058em",
              lineHeight: 0.95,
              opacity: interpolate(frame, [22, 46], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [22, 46], ["0px 26px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            AI work,
            <br />
            made visible.
          </Interactive.Div>

          <Interactive.Div
            name="Hero description"
            style={{
              maxWidth: 600,
              marginTop: 36,
              color: "#aeb1b8",
              fontSize: 29,
              fontWeight: 420,
              letterSpacing: "-0.018em",
              lineHeight: 1.35,
              opacity: interpolate(frame, [34, 58], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [34, 58], ["0px 18px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Live progress becomes clear, inspectable evidence—without exposing private reasoning.
          </Interactive.Div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: "auto",
              paddingBottom: 14,
            }}
          >
            <Feature revealAt={298}>Explicit states</Feature>
            <Feature revealAt={316}>Structured activity</Feature>
            <Feature revealAt={334}>User-controlled disclosure</Feature>
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
          <Interactive.Div
            name="Product stage"
            style={{
              position: "absolute",
              width: 868,
              height: 668,
              border: "1px solid rgba(255,255,255,0.11)",
              borderRadius: 36,
              background: "rgba(246,246,247,0.96)",
              boxShadow: "0 40px 90px rgba(0, 0, 0, 0.34)",
              opacity: interpolate(frame, [8, 32], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [8, 40], [0.94, 1], {
                easing: Easing.spring({ damping: 200 }),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
              translate: interpolate(frame, [8, 40], ["36px 0px", "0px 0px"], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <ThinkingCard />
          </div>
        </div>
      </div>

      <Interactive.Div
        name="Footer note"
        style={{
          position: "absolute",
          right: 86,
          bottom: 52,
          color: "#777c85",
          fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
          fontSize: 16,
          letterSpacing: "0.08em",
          lineHeight: "24px",
          textTransform: "uppercase",
          opacity: interpolate(frame, [348, 372], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        observable by design
      </Interactive.Div>
    </AbsoluteFill>
  );
};
