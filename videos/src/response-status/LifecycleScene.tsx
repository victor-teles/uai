import type { ResponseStatusValue } from "@uai/components/response-status";
import { interpolate, useCurrentFrame } from "remotion";
import { StatusCursor } from "./StatusCursor";
import { lightTokens } from "./StatusDemo";
import { StatusSequence } from "./StatusSequence";

const timeline = {
  firstStream: 36,
  stopClick: 96,
  stopped: 97,
  regenerateClick: 132,
  requeued: 133,
  secondStream: 150,
  complete: 228,
};
const totalTokens = 412;
const firstRate = 2.5;
const secondRate = totalTokens / (timeline.complete - timeline.secondStream);
const stoppedTokens = Math.round((timeline.stopClick - timeline.firstStream) * firstRate);

const steps = [
  { at: 0, status: "queued" },
  { at: timeline.firstStream, status: "streaming" },
  { at: timeline.stopped, status: "stopped" },
  { at: timeline.requeued, status: "queued" },
  { at: timeline.secondStream, status: "streaming" },
  { at: timeline.complete, status: "complete" },
] as const;

const detail = (status: ResponseStatusValue, frame: number) => {
  if (status === "queued") return "2º na fila";
  if (status === "stopped") return `${stoppedTokens} tokens`;
  if (status === "complete") return `${totalTokens} tokens · 2,6 s`;
  return frame < timeline.stopped
    ? `${Math.round((frame - timeline.firstStream) * firstRate)} tokens`
    : `${Math.min(totalTokens, Math.round((frame - timeline.secondStream) * secondRate))} tokens`;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// The 520px bar is scaled 3x around the stage center, so its buttons land here.
const stopTarget = { x: 1614, y: 546 };
const regenerateTarget = { x: 1570, y: 546 };

export const LifecycleScene = () => {
  const frame = useCurrentFrame();
  const pressed =
    Math.abs(frame - timeline.stopClick) <= 3 || Math.abs(frame - timeline.regenerateClick) <= 3;
  const hovered = (frame >= 84 && frame < 112) || (frame >= 122 && frame < 140);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fbfbfa",
        ...lightTokens,
        opacity: interpolate(frame, [0, 10, 252, 268], [0, 1, 1, 0], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 700,
          top: 518,
          width: 520,
          scale: String(interpolate(frame, [0, 268], [3, 3.06], clamp)),
        }}
      >
        <StatusSequence
          variant="bar"
          steps={steps}
          detail={detail}
          hovered={hovered}
          pressed={pressed}
        />
      </div>
      <StatusCursor
        size={1.8}
        visible={[58, 176]}
        path={[
          { frame: 58, x: 1500, y: 860 },
          { frame: 84, ...stopTarget },
          { frame: 108, ...stopTarget },
          { frame: 122, ...regenerateTarget },
          { frame: 140, ...regenerateTarget },
          { frame: 176, x: 1700, y: 880 },
        ]}
        clicks={[timeline.stopClick, timeline.regenerateClick]}
        pointer={[
          [80, 110],
          [120, 140],
        ]}
      />
    </div>
  );
};
