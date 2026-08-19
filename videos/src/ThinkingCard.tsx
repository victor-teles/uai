import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

import { Icon, type IconName } from "./icons";

type Activity = {
  icon: IconName;
  label: string;
  description: string;
  evidence?: string;
  elapsed?: string;
  revealAt: number;
};

const activities: readonly Activity[] = [
  {
    icon: "search",
    label: "Search",
    description: "Found the component contract",
    evidence: "Thinking component accessibility",
    elapsed: "0.3s",
    revealAt: 66,
  },
  {
    icon: "file",
    label: "File",
    description: "Read the public interface",
    evidence: "src/registry/uai/components/thinking.tsx",
    elapsed: "0.8s",
    revealAt: 116,
  },
  {
    icon: "tool",
    label: "Tool",
    description: "Checked the registry output",
    evidence: "bun run registry:build",
    elapsed: "2.1s",
    revealAt: 166,
  },
  {
    icon: "update",
    label: "Update",
    description: "Verified the public DOM seams",
    elapsed: "3.4s",
    revealAt: 216,
  },
];

const ActivityRow = ({ activity, isLast }: { activity: Activity; isLast: boolean }) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={`${activity.label} activity`}
      style={{
        display: "grid",
        gridTemplateColumns: "42px minmax(0, 1fr) auto",
        columnGap: 16,
        minHeight: 86,
        padding: "14px 0",
        opacity: interpolate(frame, [activity.revealAt, activity.revealAt + 16], [0, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [activity.revealAt, activity.revealAt + 16],
          ["0px 18px", "0px 0px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <div
        style={{
          position: "relative",
          display: "grid",
          placeItems: "start center",
          paddingTop: 2,
          color: "#73777f",
        }}
      >
        <Icon name={activity.icon} width={22} height={22} />
        {!isLast ? (
          <div
            style={{
              position: "absolute",
              top: 30,
              bottom: -16,
              left: "50%",
              width: 1,
              background: "#dedfe2",
            }}
          />
        ) : null}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            minWidth: 0,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              color: "#747982",
              fontSize: 15,
              fontWeight: 620,
              letterSpacing: "0.08em",
              lineHeight: "24px",
              textTransform: "uppercase",
            }}
          >
            {activity.label}
          </span>
          <span
            style={{
              minWidth: 0,
              color: "#24262a",
              fontSize: 19,
              fontWeight: 520,
              lineHeight: "26px",
            }}
          >
            {activity.description}
          </span>
        </div>
        {activity.evidence ? (
          <div
            style={{
              marginTop: 3,
              overflow: "hidden",
              color: "#777b83",
              fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
              fontSize: 15,
              lineHeight: "22px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activity.evidence}
          </div>
        ) : null}
      </div>

      <span
        style={{
          paddingTop: 1,
          color: "#747982",
          fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
          fontSize: 15,
          fontVariantNumeric: "tabular-nums",
          lineHeight: "24px",
        }}
      >
        {activity.elapsed}
      </span>
    </Interactive.Div>
  );
};

export const ThinkingCard = () => {
  const frame = useCurrentFrame();
  const complete = frame >= 282;

  return (
    <Interactive.Div
      name="Thinking component"
      style={{
        width: 760,
        height: interpolate(frame, [28, 60, 216, 242], [120, 224, 520, 556], {
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        overflow: "hidden",
        border: "1px solid #dfe0e3",
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 1px 2px rgba(20, 23, 28, 0.03)",
        opacity: interpolate(frame, [10, 30], [0, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [10, 38], [0.96, 1], {
          easing: Easing.spring({ damping: 200 }),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        translate: interpolate(frame, [10, 38], ["0px 28px", "0px 0px"], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          height: 120,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: 46,
            height: 46,
            flexShrink: 0,
            overflow: "hidden",
            border: "1px solid #dedfe2",
            borderRadius: 13,
            background: "#f3f3f4",
          }}
        >
          <Icon
            name="loader"
            width={22}
            height={22}
            style={{
              position: "absolute",
              color: "#25272b",
              opacity: interpolate(frame, [274, 288], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              rotate: interpolate(frame, [0, 420], ["0deg", "5040deg"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [274, 288], [1, 0.75], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}
          />
          <Icon
            name="check"
            width={23}
            height={23}
            style={{
              position: "absolute",
              color: "#1a9a52",
              opacity: interpolate(frame, [282, 298], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [282, 304], [0.6, 1], {
                easing: Easing.spring({ damping: 160 }),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}
          />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span style={{ position: "relative", display: "block", minWidth: 180, height: 28 }}>
              <span
                style={{
                  position: "absolute",
                  color: "#202226",
                  fontSize: 21,
                  fontWeight: 640,
                  lineHeight: "28px",
                  opacity: interpolate(frame, [274, 286], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                Thinking
              </span>
              <span
                style={{
                  position: "absolute",
                  color: "#202226",
                  fontSize: 21,
                  fontWeight: 640,
                  lineHeight: "28px",
                  opacity: interpolate(frame, [282, 296], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                Work complete
              </span>
            </span>
            <span
              style={{
                color: complete ? "#168b49" : "#747982",
                fontSize: 14,
                fontWeight: 650,
                letterSpacing: "0.08em",
                lineHeight: "20px",
                textTransform: "uppercase",
              }}
            >
              {complete ? "Complete" : "Working"}
            </span>
          </div>
          <span style={{ position: "relative", display: "block", height: 24 }}>
            <span
              style={{
                position: "absolute",
                overflow: "hidden",
                color: "#71757d",
                fontSize: 18,
                lineHeight: "24px",
                opacity: interpolate(frame, [274, 286], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Checking the component interface and useful states.
            </span>
            <span
              style={{
                position: "absolute",
                overflow: "hidden",
                color: "#71757d",
                fontSize: 18,
                lineHeight: "24px",
                opacity: interpolate(frame, [282, 296], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              The component contract is ready to review.
            </span>
          </span>
        </div>

        <span
          style={{
            color: "#72767e",
            fontFamily: '"Geist Mono Variable", ui-monospace, monospace',
            fontSize: 16,
            fontVariantNumeric: "tabular-nums",
            lineHeight: "24px",
          }}
        >
          {complete ? "3.4s" : `${Math.min(frame / 60, 3.3).toFixed(1)}s`}
        </span>
        <Icon
          name="chevron"
          width={22}
          height={22}
          style={{
            color: "#747982",
            rotate: interpolate(frame, [28, 58], ["0deg", "180deg"], {
              easing: Easing.bezier(0.23, 1, 0.32, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>

      <div style={{ height: 1, background: "#e3e4e6" }} />
      <div style={{ padding: "8px 24px 14px" }}>
        {activities.map((activity, index) => (
          <ActivityRow key={activity.label} activity={activity} isLast={index === 3} />
        ))}
      </div>
    </Interactive.Div>
  );
};
