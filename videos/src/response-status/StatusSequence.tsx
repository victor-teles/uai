import type { ResponseStatusValue, ResponseStatusVariant } from "@uai/components/response-status";
import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { StatusDemo } from "./StatusDemo";

type Step = { at: number; status: ResponseStatusValue };

type StatusSequenceProps = {
  variant: ResponseStatusVariant;
  steps: readonly Step[];
  detail: (status: ResponseStatusValue, frame: number) => ReactNode;
  hovered?: boolean;
  pressed?: boolean;
};

// The incoming layer keeps the root chrome solid while only the parts fade. The
// outgoing layer sits on top without chrome, so the bar never flickers.
const layerCss = `
[data-status-layer] [data-uai-response-status] > :not(style){opacity:var(--status-content)}
[data-status-layer="outgoing"] [data-uai-response-status]{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
`;

// A linear crossfade keeps the combined opacity at 1, so the content never dips.
const crossfadeFrames = 4;

export const StatusSequence = ({ variant, steps, detail, hovered, pressed }: StatusSequenceProps) => {
  const frame = useCurrentFrame();
  const index = Math.max(
    0,
    steps.reduce((last, step, i) => (frame >= step.at ? i : last), -1),
  );
  const current = steps[index];
  const previous = index > 0 ? steps[index - 1] : null;
  const incoming = previous
    ? interpolate(frame - current.at, [0, crossfadeFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const outgoing = previous ? 1 - incoming : 0;
  // The outgoing layer keeps the detail it had when the change happened.
  const layer = (step: Step, role: "incoming" | "outgoing", content: number, at: number) => (
    <div
      key={step.at}
      data-status-layer={role}
      style={{ gridArea: "1 / 1", "--status-content": content } as CSSProperties}
    >
      <StatusDemo
        variant={variant}
        status={step.status}
        detail={detail(step.status, at)}
        hovered={hovered}
        pressed={pressed}
      />
    </div>
  );

  return (
    <div style={{ display: "grid", justifyItems: variant === "bar" ? "stretch" : "start" }}>
      <style>{layerCss}</style>
      {layer(current, "incoming", incoming, frame)}
      {previous && outgoing > 0 ? layer(previous, "outgoing", outgoing, current.at - 1) : null}
    </div>
  );
};
