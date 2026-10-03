import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { ResponseStatusVariant } from "@uai/components/response-status";
import { lightTokens, StatusDemo } from "./StatusDemo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.23, 1, 0.32, 1);

type RowProps = {
  label: ResponseStatusVariant;
  enterAt: number;
  children: ReactNode;
};

const Row = ({ label, enterAt, children }: RowProps) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [enterAt, enterAt + 16], [0, 1], { ...clamp, easing: ease });

  return (
    <div style={{ opacity: enter, translate: `0px ${(1 - enter) * 14}px` }}>
      <div
        style={{
          fontSize: 17,
          lineHeight: "24px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#97968f",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 14, width: 600, scale: "2", transformOrigin: "0 0" }}>
        {children}
      </div>
    </div>
  );
};

export const VariantsScene = () => {
  const frame = useCurrentFrame();
  const pillDone = 60;
  const barFailed = 76;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fbfbfa",
        ...lightTokens,
        opacity: interpolate(frame, [0, 14, 132, 152], [0, 1, 1, 0], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 331,
          display: "grid",
          gridTemplateRows: "94px 102px 126px",
          rowGap: 48,
        }}
      >
        <Row label="inline" enterAt={4}>
          <StatusDemo
            variant="inline"
            status="streaming"
            detail={`${96 + Math.round(frame * 2.6)} tokens`}
          />
        </Row>
        <Row label="pill" enterAt={12}>
          <StatusDemo
            variant="pill"
            status={frame < pillDone ? "streaming" : "complete"}
            detail={`${Math.min(212 + Math.round(frame * 3.3), 412)} tokens`}
          />
        </Row>
        <Row label="bar" enterAt={20}>
          <StatusDemo
            variant="bar"
            status={frame < barFailed ? "streaming" : "failed"}
            detail={frame < barFailed ? `${48 + Math.round(frame * 1.8)} tokens` : "Tempo esgotado"}
          />
        </Row>
      </div>
    </div>
  );
};
