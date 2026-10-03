import type { ResponseStatusVariant } from "@uai/components/response-status";
import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { lightTokens } from "./StatusDemo";
import { StatusSequence } from "./StatusSequence";

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
    <div
      style={{
        display: "grid",
        justifyItems: "center",
        gap: 18,
        opacity: enter,
        translate: `0px ${(1 - enter) * 16}px`,
      }}
    >
      <div
        style={{
          fontSize: 20,
          lineHeight: "24px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#97968f",
        }}
      >
        {label}
      </div>
      <div style={{ zoom: 2.4 }}>{children}</div>
    </div>
  );
};

export const VariantsScene = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        alignContent: "center",
        justifyItems: "center",
        rowGap: 56,
        overflow: "hidden",
        background: "#fbfbfa",
        ...lightTokens,
        opacity: interpolate(frame, [0, 10, 108, 122], [0, 1, 1, 0], clamp),
      }}
    >
      <Row label="inline" enterAt={2}>
        <StatusSequence
          variant="inline"
          steps={[{ at: 0, status: "streaming" }]}
          detail={(_, at) => `${96 + Math.round(at * 2.6)} tokens`}
        />
      </Row>
      <Row label="pill" enterAt={8}>
        {/* The pill changes width between states, so it holds one state. */}
        <StatusSequence
          variant="pill"
          steps={[{ at: 0, status: "complete" }]}
          detail={() => "412 tokens · 2,6 s"}
        />
      </Row>
      <Row label="bar" enterAt={14}>
        <div style={{ width: 520 }}>
          <StatusSequence
            variant="bar"
            steps={[
              { at: 0, status: "streaming" },
              { at: 62, status: "failed" },
            ]}
            detail={(status, at) =>
              status === "failed" ? "Tempo esgotado" : `${48 + Math.round(at * 1.8)} tokens`
            }
          />
        </div>
      </Row>
    </div>
  );
};
