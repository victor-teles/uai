import { Gauge, History, Info, LayoutTemplate, MessageSquareDot, ShieldAlert } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type FeedbackItemId =
  | "status-banner"
  | "progress-summary"
  | "inline-feedback"
  | "confirmation-dialog"
  | "activity-timeline"
  | "skeleton-group";

export const feedbackCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "status-banner",
    name: "Status Banner",
    category: "Feedback",
    icon: Info,
    description:
      "Information, success, warning, and error states with optional actions and dismissal.",
    usage: `"use client";

import { useState } from "react";
import {
  StatusBanner,
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerDismiss,
  StatusBannerIcon,
  StatusBannerTitle,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";

export function StatusBannerPreview({ variant = "card" }: { variant?: StatusBannerVariant }) {
  const [maintenanceOpen, setMaintenanceOpen] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <StatusBanner variant={variant} tone="error">
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Payment failed</StatusBannerTitle>
          <StatusBannerDescription>
            We couldn’t charge the card ending in 4242. Update it by June 12 to keep your seats.
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction>Update card</StatusBannerAction>
        </StatusBannerActions>
      </StatusBanner>
      <StatusBanner variant={variant} tone="success">
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Export ready</StatusBannerTitle>
          <StatusBannerDescription>Q2 invoices.csv · 1,284 rows</StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction>Download</StatusBannerAction>
        </StatusBannerActions>
      </StatusBanner>
      {maintenanceOpen ? (
        <StatusBanner
          variant={variant}
          tone="info"
          open={maintenanceOpen}
          onOpenChange={setMaintenanceOpen}
        >
          <StatusBannerIcon />
          <StatusBannerContent>
            <StatusBannerTitle>Scheduled maintenance</StatusBannerTitle>
            <StatusBannerDescription>
              Sync pauses Saturday from 02:00 to 02:30 UTC. Edits made offline upload afterward.
            </StatusBannerDescription>
          </StatusBannerContent>
          <StatusBannerDismiss />
        </StatusBanner>
      ) : (
        <button
          type="button"
          onClick={() => setMaintenanceOpen(true)}
          style={{
            justifySelf: "start",
            height: 28,
            padding: "0 12px",
            border: 0,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Show maintenance notice
        </button>
      )}
    </div>
  );
}
`,
    accessibility: [
      'Error and warning banners use role="alert"; information and success banners use a polite role="status".',
      "Tone is conveyed by the title text and icon shape, not color alone; icons are hidden from assistive technology.",
      "Dismiss is a labelled 28×28 button. Dismissal is controlled or uncontrolled through open and onOpenChange; the consumer decides where focus goes next.",
    ],
  },
  {
    id: "progress-summary",
    name: "Progress Summary",
    category: "Feedback",
    icon: Gauge,
    description: "Progress, elapsed time, remaining work, and cancellation in one summary.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  ProgressSummary,
  ProgressSummaryActions,
  ProgressSummaryBar,
  ProgressSummaryCancel,
  ProgressSummaryHeader,
  ProgressSummaryStat,
  ProgressSummaryStatLabel,
  ProgressSummaryStats,
  type ProgressSummaryStatus,
  ProgressSummaryStatusText,
  ProgressSummaryStatValue,
  ProgressSummaryTitle,
  ProgressSummaryValue,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";

const TOTAL = 240;

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return \`\${minutes}m \${String(seconds % 60).padStart(2, "0")}s\`;
}

export function ProgressSummaryPreview({ variant = "card" }: { variant?: ProgressSummaryVariant }) {
  const [done, setDone] = useState(96);
  const [elapsed, setElapsed] = useState(84);
  const [cancelled, setCancelled] = useState(false);
  const status: ProgressSummaryStatus = cancelled
    ? "cancelled"
    : done === TOTAL
      ? "complete"
      : "running";

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setElapsed((seconds) => seconds + 1);
      setDone((count) => Math.min(count + 2, TOTAL));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const remaining = TOTAL - done;
  return (
    <ProgressSummary variant={variant} value={done} max={TOTAL} status={status}>
      <ProgressSummaryHeader>
        <ProgressSummaryTitle>Importing contacts from HubSpot</ProgressSummaryTitle>
        <ProgressSummaryStatusText>
          {status === "running" ? \`\${done} of \${TOTAL} records\` : undefined}
        </ProgressSummaryStatusText>
      </ProgressSummaryHeader>
      <ProgressSummaryValue />
      <ProgressSummaryBar />
      <ProgressSummaryStats>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Elapsed</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>{formatSeconds(elapsed)}</ProgressSummaryStatValue>
        </ProgressSummaryStat>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Remaining</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>{remaining} records</ProgressSummaryStatValue>
        </ProgressSummaryStat>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Skipped</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>3 duplicates</ProgressSummaryStatValue>
        </ProgressSummaryStat>
      </ProgressSummaryStats>
      <ProgressSummaryActions>
        {status === "running" ? (
          <ProgressSummaryCancel onClick={() => setCancelled(true)}>
            Cancel import
          </ProgressSummaryCancel>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDone(0);
              setElapsed(0);
              setCancelled(false);
            }}
            style={{
              height: 28,
              padding: "0 12px",
              border: 0,
              borderRadius: 999,
              background: "var(--uai-surface-raised)",
              color: "var(--uai-text)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Run again
          </button>
        )}
      </ProgressSummaryActions>
    </ProgressSummary>
  );
}
`,
    accessibility: [
      'ProgressSummaryBar is a role="progressbar" labelled by the title, with aria-valuenow and a readable aria-valuetext. Omit value for indeterminate progress.',
      "Elapsed and remaining figures are a description list, so labels and values stay paired for screen readers.",
      "Status text is a polite live region. Cancel is disabled once work is complete, cancelled, or failed; the consumer owns stopping the job.",
    ],
  },
  {
    id: "inline-feedback",
    name: "Inline Feedback",
    category: "Feedback",
    icon: MessageSquareDot,
    description: "Confirm or reject a local action without interrupting the workflow.",
    usage: `"use client";

import {
  InlineFeedback,
  InlineFeedbackAction,
  InlineFeedbackMessage,
  InlineFeedbackStatus,
  type InlineFeedbackVariant,
} from "@/components/ui/uai/inline-feedback";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function InlineFeedbackPreview({ variant = "text" }: { variant?: InlineFeedbackVariant }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <InlineFeedback variant={variant} duration={2400}>
        <InlineFeedbackAction onAction={() => wait(500)}>Copy invite link</InlineFeedbackAction>
        <InlineFeedbackStatus>
          <InlineFeedbackMessage status="pending">Copying…</InlineFeedbackMessage>
          <InlineFeedbackMessage status="success">Link copied</InlineFeedbackMessage>
        </InlineFeedbackStatus>
      </InlineFeedback>
      <InlineFeedback variant={variant} duration={4000}>
        <InlineFeedbackAction
          onAction={async () => {
            await wait(700);
            throw new Error("Network unavailable");
          }}
        >
          Archive thread
        </InlineFeedbackAction>
        <InlineFeedbackStatus>
          <InlineFeedbackMessage status="pending">Archiving…</InlineFeedbackMessage>
          <InlineFeedbackMessage status="success">Archived</InlineFeedbackMessage>
          <InlineFeedbackMessage status="error">Couldn’t archive. Try again.</InlineFeedbackMessage>
        </InlineFeedbackStatus>
      </InlineFeedback>
    </div>
  );
}
`,
    accessibility: [
      "InlineFeedbackStatus stays mounted as a polite live region, so pending, success, and error messages are announced without moving focus.",
      "While the action runs, the button keeps focus and exposes aria-busy and aria-disabled instead of becoming disabled.",
      "Messages pair an icon with text. An optional duration returns success and error to idle; keep error copy until the person can act on it.",
    ],
  },
  {
    id: "confirmation-dialog",
    name: "Confirmation Dialog",
    category: "Feedback",
    icon: ShieldAlert,
    description: "Explain impact before destructive or hard-to-reverse actions.",
    usage: `"use client";

import { useState } from "react";
import {
  ConfirmationDialog,
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogInput,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";

export function ConfirmationDialogPreview({
  variant = "centered",
}: {
  variant?: ConfirmationDialogVariant;
}) {
  const [deleted, setDeleted] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <ConfirmationDialog variant={variant}>
        <ConfirmationDialogTrigger disabled={deleted}>Delete project</ConfirmationDialogTrigger>
        <ConfirmationDialogContent>
          <ConfirmationDialogTitle>Delete “acme-web”?</ConfirmationDialogTitle>
          <ConfirmationDialogDescription>
            <p style={{ margin: 0 }}>This permanently removes the project for everyone.</p>
            <ConfirmationDialogImpact>
              <li>142 deployments and their preview URLs</li>
              <li>18 environment variables</li>
              <li>The acme.dev domain assignment</li>
            </ConfirmationDialogImpact>
          </ConfirmationDialogDescription>
          <ConfirmationDialogInput match="acme-web" />
          <ConfirmationDialogActions>
            <ConfirmationDialogCancel>Keep project</ConfirmationDialogCancel>
            <ConfirmationDialogConfirm onClick={() => setDeleted(true)}>
              Delete project
            </ConfirmationDialogConfirm>
          </ConfirmationDialogActions>
        </ConfirmationDialogContent>
      </ConfirmationDialog>
      <p role="status" style={{ margin: 0, fontSize: 12, color: "var(--uai-subtle)" }}>
        {deleted ? "acme-web was deleted." : "acme-web · 142 deployments"}
      </p>
      {deleted ? (
        <button
          type="button"
          onClick={() => setDeleted(false)}
          style={{
            height: 28,
            padding: "0 12px",
            border: 0,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Restore preview
        </button>
      ) : null}
    </div>
  );
}
`,
    accessibility: [
      'Content renders a native modal <dialog> with role="alertdialog", labelled by the title and described by the impact copy.',
      "Opening focuses Cancel (or an element marked autofocus); Escape and Cancel close it, and focus returns to the trigger.",
      "ConfirmationDialogInput adds an optional typed confirmation with a visible label; Confirm stays disabled until the text matches exactly.",
    ],
  },
  {
    id: "activity-timeline",
    name: "Activity Timeline",
    category: "Feedback",
    icon: History,
    description: "Events, actors, timestamps, metadata, and grouped dates.",
    usage: `import { GitMerge, MessageSquare, Rocket, UserPlus } from "lucide-react";
import {
  ActivityTimeline,
  ActivityTimelineActor,
  ActivityTimelineContent,
  ActivityTimelineDate,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineGroup,
  ActivityTimelineMarker,
  ActivityTimelineMeta,
  ActivityTimelineTime,
  ActivityTimelineTitle,
  type ActivityTimelineVariant,
} from "@/components/ui/uai/activity-timeline";

export function ActivityTimelinePreview({
  variant = "rail",
}: {
  variant?: ActivityTimelineVariant;
}) {
  const iconSize = variant === "compact" ? 10 : 14;
  return (
    <ActivityTimeline variant={variant} aria-label="Project activity">
      <ActivityTimelineGroup>
        <ActivityTimelineDate>Today</ActivityTimelineDate>
        <ActivityTimelineEvents>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <Rocket size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Maya Chen</ActivityTimelineActor> deployed v2.14.0 to
                production
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-04T14:32">2:32 PM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>Build 4m 08s</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <GitMerge size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Jonas Weber</ActivityTimelineActor> merged “Fix invoice
                rounding”
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-04T11:05">11:05 AM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>#1287</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
        </ActivityTimelineEvents>
      </ActivityTimelineGroup>
      <ActivityTimelineGroup>
        <ActivityTimelineDate>Yesterday</ActivityTimelineDate>
        <ActivityTimelineEvents>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <MessageSquare size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Priya Natarajan</ActivityTimelineActor> commented on the
                pricing page brief
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-03T16:48">4:48 PM</ActivityTimelineTime>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <UserPlus size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Sam Ortiz</ActivityTimelineActor> joined as an editor
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-03T09:12">9:12 AM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>Invited by Maya Chen</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
        </ActivityTimelineEvents>
      </ActivityTimelineGroup>
    </ActivityTimeline>
  );
}
`,
    accessibility: [
      "Each date group is a section labelled by its date heading, and events are an ordered list in reading order.",
      "Timestamps use the <time> element with a machine-readable dateTime; markers and rails are decorative and hidden.",
      "Actor, action, and metadata are plain text, so the event reads as a sentence without relying on icons.",
    ],
  },
  {
    id: "skeleton-group",
    name: "Skeleton Group",
    category: "Feedback",
    icon: LayoutTemplate,
    description: "Placeholders that match common page structures without layout shift.",
    usage: `"use client";

import { useState } from "react";
import {
  SkeletonGroup,
  SkeletonGroupBlock,
  SkeletonGroupCard,
  SkeletonGroupCircle,
  SkeletonGroupLine,
  SkeletonGroupRow,
  SkeletonGroupStack,
  type SkeletonGroupVariant,
} from "@/components/ui/uai/skeleton-group";

const members = [
  { name: "Maya Chen", role: "Design lead", initials: "MC" },
  { name: "Jonas Weber", role: "Engineering", initials: "JW" },
  { name: "Priya Natarajan", role: "Product", initials: "PN" },
];

export function SkeletonGroupPreview({ variant = "shimmer" }: { variant?: SkeletonGroupVariant }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {loading ? (
        <SkeletonGroup variant={variant} label="Loading team members">
          <SkeletonGroupCard>
            <SkeletonGroupBlock height={72} />
            {members.map((member) => (
              <SkeletonGroupRow key={member.name}>
                <SkeletonGroupCircle size={32} />
                <SkeletonGroupStack style={{ gap: 7 }}>
                  <SkeletonGroupLine width="45%" height={11} />
                  <SkeletonGroupLine width="28%" height={9} />
                </SkeletonGroupStack>
              </SkeletonGroupRow>
            ))}
          </SkeletonGroupCard>
        </SkeletonGroup>
      ) : (
        <section
          aria-label="Team members"
          style={{
            display: "grid",
            gap: 14,
            padding: 16,
            border: "1px solid var(--uai-border)",
            borderRadius: 14,
            background: "var(--uai-surface)",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "grid",
              alignContent: "center",
              height: 72,
              padding: "0 14px",
              gap: 2,
              borderRadius: 10,
              background: "var(--uai-surface-raised)",
            }}
          >
            <strong style={{ fontWeight: 500 }}>Growth team</strong>
            <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>
              3 members · 12 projects
            </span>
          </div>
          {members.map((member) => (
            <div key={member.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "var(--uai-surface-raised)",
                  boxShadow: "0 0 0 1px color-mix(in oklab, var(--uai-text) 6%, transparent)",
                  color: "var(--uai-muted)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {member.initials}
              </span>
              <span style={{ display: "grid", gap: 2, lineHeight: "18px" }}>
                <span style={{ fontWeight: 500 }}>{member.name}</span>
                <span style={{ color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px" }}>
                  {member.role}
                </span>
              </span>
            </div>
          ))}
        </section>
      )}
      <button
        type="button"
        onClick={() => setLoading((value) => !value)}
        style={{
          justifySelf: "start",
          height: 28,
          padding: "0 12px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {loading ? "Show loaded content" : "Show skeleton"}
      </button>
    </div>
  );
}
`,
    accessibility: [
      'The root is a polite role="status" with aria-busy and a visually hidden label; placeholder shapes are hidden from assistive technology.',
      "Shimmer and pulse motion stop under prefers-reduced-motion; the static variant never animates.",
      "Compose lines, circles, blocks, rows, stacks, and cards at the loaded content's dimensions to prevent layout shift when content swaps in.",
    ],
  },
];
