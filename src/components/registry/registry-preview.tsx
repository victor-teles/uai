"use client";

import { useEffect, useRef, useState } from "react";

import {
  ApprovalCard,
  ApprovalCardDetail,
  type ApprovalCardStatus,
  type ApprovalDecision,
} from "@/components/ui/uai/approval-card";
import {
  PROMPT_COMPOSER_VARIANTS,
  PromptComposer,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import { TaskList } from "@/components/ui/uai/task-list";
import { Thinking } from "@/components/ui/uai/thinking";
import { TaskFlow, type TaskFlowData } from "@/registry/uai/blocks/task-flow";

import type { RegistryItemId } from "./catalog";
import { PreviewStage, SegmentedControl } from "./preview-chrome";

const tasks = [
  {
    id: "interface",
    label: "Review the component interface",
    status: "complete" as const,
    detail: "Props and public behavior",
  },
  {
    id: "keyboard",
    label: "Check keyboard interaction",
    status: "active" as const,
    detail: "Focus and submit paths",
  },
  {
    id: "registry",
    label: "Build the registry item",
    status: "pending" as const,
    detail: "Files and dependencies",
  },
];

const taskFlowData: TaskFlowData = {
  thinking: {
    status: "complete",
    summary: "Reviewing the requested component and its interaction contract.",
    duration: "1.8s",
    activities: [
      {
        id: "task-flow-search",
        type: "search",
        label: "Found the component contract",
        query: "Thinking component states",
        elapsed: "0.3s",
      },
      {
        id: "task-flow-file",
        type: "file",
        label: "Reviewed the public interface",
        path: "src/registry/uai/components/thinking.tsx",
        elapsed: "0.8s",
      },
      {
        id: "task-flow-progress",
        type: "progress",
        label: "Prepared a source-owned change",
        elapsed: "1.8s",
      },
    ],
  },
  approval: {
    title: "Add this component to the registry?",
    description: "Review the source change before it becomes available to consumers.",
  },
  tasks,
  composer: {
    placeholder: "Describe an adaptation…",
    modelLabel: "Your model",
  },
};

const variantCopy: Record<PromptComposerVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Floating card" },
  pill: { label: "Pill", scene: "Capsule" },
  ghost: { label: "Ghost", scene: "Dock" },
  compact: { label: "Compact", scene: "Sidebar" },
};

function useSwapFlag(token: string) {
  const [swapping, setSwapping] = useState(false);
  const previousToken = useRef(token);

  useEffect(() => {
    if (previousToken.current === token) return;
    previousToken.current = token;
    setSwapping(true);
    const timer = window.setTimeout(() => setSwapping(false), 160);
    return () => window.clearTimeout(timer);
  }, [token]);

  return swapping;
}

function PromptComposerPreview() {
  const [variant, setVariant] = useState<PromptComposerVariant>("rounded");
  const [submitted, setSubmitted] = useState(false);
  const swapping = useSwapFlag(variant);
  const copy = variantCopy[variant];

  return (
    <PreviewStage
      label={copy.scene}
      status={submitted ? <span role="status">Submitted</span> : null}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Composer variant"
          value={variant}
          onChange={(id) => setVariant(id as PromptComposerVariant)}
          options={PROMPT_COMPOSER_VARIANTS.map((option) => ({
            id: option,
            label: variantCopy[option].label,
          }))}
        />
      }
    >
      <div className="uai-prompt-frame" data-scene={variant}>
        <div className={variant === "ghost" ? "uai-prompt-dock" : undefined}>
          <PromptComposer
            placeholder="Write a message…"
            modelLabel="Your model"
            variant={variant}
            models={[
              { id: "your-model", label: "Your model" },
              { id: "fast", label: "Fast" },
              { id: "precise", label: "Precise" },
            ]}
            onSubmit={() => setSubmitted(true)}
          />
        </div>
      </div>
    </PreviewStage>
  );
}

function ThinkingPreview() {
  const [status, setStatus] = useState<"thinking" | "complete" | "error">("thinking");
  const swapping = useSwapFlag(status);

  const copy = {
    thinking: {
      summary: "Checking the component interface and useful states.",
      duration: "1.8s",
    },
    complete: {
      summary: "The component contract is ready to review.",
      duration: "3.4s",
    },
    error: {
      summary: "The registry build stopped before validation.",
      duration: "2.6s",
    },
  }[status];

  const activities = [
    {
      id: "search-contract",
      type: "search" as const,
      label: "Found the component contract",
      query: "Thinking component accessibility",
      elapsed: "0.3s",
    },
    {
      id: "read-source",
      type: "file" as const,
      label: "Read the public interface",
      path: "src/registry/uai/components/thinking.tsx",
      elapsed: "0.8s",
    },
    {
      id: "run-checks",
      type: "tool" as const,
      label: status === "error" ? "Registry build failed" : "Checked the registry output",
      tool: "bun run registry:build",
      elapsed: status === "thinking" ? undefined : copy.duration,
    },
  ];

  return (
    <PreviewStage
      contentClassName="uai-preview-narrow"
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Thinking status"
          value={status}
          onChange={(id) => setStatus(id as "thinking" | "complete" | "error")}
          options={[
            { id: "thinking", label: "Live" },
            { id: "complete", label: "Complete" },
            { id: "error", label: "Error" },
          ]}
        />
      }
    >
      <Thinking
        status={status}
        summary={copy.summary}
        duration={copy.duration}
        activities={activities}
      />
    </PreviewStage>
  );
}

const approvalScenarios = ["compact", "detailed", "critical", "error"] as const;
type ApprovalScenario = (typeof approvalScenarios)[number];

type ApprovalPreviewState =
  | { status: Exclude<ApprovalCardStatus, "submitting" | "error"> }
  | { status: "submitting"; pendingDecision: ApprovalDecision }
  | { status: "error"; errorMessage: string };

const approvalScenarioCopy: Record<ApprovalScenario, { label: string; scene: string }> = {
  compact: { label: "Compact", scene: "Routine action" },
  detailed: { label: "Detailed", scene: "Impact review" },
  critical: { label: "Critical", scene: "Protected action" },
  error: { label: "Error", scene: "Recovery state" },
};

function DetailedApprovalContent({ critical = false }: { critical?: boolean }) {
  return (
    <>
      <ApprovalCardDetail label="Requested by">Operations agent · Refund triage</ApprovalCardDetail>
      <ApprovalCardDetail label="Affected resources">
        {critical ? "support-search-prod · 8.2M indexed records" : "refund-policy-v4 · 3 queues"}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Proposed changes">
        <ul>
          <li>
            {critical ? "Delete the production search index" : "Route refunds over $500 to review"}
          </li>
          <li>
            {critical ? "Remove its replicas and stored vectors" : "Notify the operations lead"}
          </li>
        </ul>
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Supporting evidence">
        {critical
          ? "No restorable snapshot exists."
          : "A 14-day replay matched 98.6% of prior decisions."}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Downstream impact" className="sm:col-span-2">
        {critical
          ? "Search will be unavailable until the index is rebuilt from source documents."
          : "New refund requests begin using this policy immediately after approval."}
      </ApprovalCardDetail>
    </>
  );
}

function ApprovalCardPreview() {
  const [scenario, setScenario] = useState<ApprovalScenario>("compact");
  const [state, setState] = useState<ApprovalPreviewState>({ status: "ready" });
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(scenario);
  const copy = approvalScenarioCopy[scenario];

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState(
      scenario === "error"
        ? {
            status: "error",
            errorMessage: "The approval service did not respond. Review the impact and try again.",
          }
        : { status: "ready" },
    );

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [scenario]);

  const decide = (decision: ApprovalDecision) => {
    setState({ status: "submitting", pendingDecision: decision });
    timerRef.current = window.setTimeout(() => {
      setState({ status: decision });
    }, 900);
  };

  const commonProps = {
    ...state,
    onApprove: () => decide("approved"),
    onReject: () => decide("rejected"),
  };

  return (
    <PreviewStage
      className={
        scenario === "critical"
          ? "uai-preview-stage--approval-critical"
          : scenario === "compact"
            ? undefined
            : "uai-preview-stage--approval-detailed"
      }
      contentClassName="uai-preview-medium"
      label={copy.scene}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Approval card variant"
          value={scenario}
          onChange={(id) => setScenario(id as ApprovalScenario)}
          options={approvalScenarios.map((option) => ({
            id: option,
            label: approvalScenarioCopy[option].label,
          }))}
        />
      }
    >
      {scenario === "compact" ? (
        <ApprovalCard
          key={scenario}
          {...commonProps}
          risk="low"
          title="Archive 3 resolved conversations?"
          description="They remain searchable and can be restored later."
        />
      ) : scenario === "critical" ? (
        <ApprovalCard
          key={scenario}
          {...commonProps}
          risk="critical"
          variant="detailed"
          title="Delete the production search index?"
          description="This removes the index and every replica. It cannot be undone."
          confirmation={{ phrase: "support-search-prod" }}
          approveLabel="Delete index"
        >
          <DetailedApprovalContent critical />
        </ApprovalCard>
      ) : (
        <ApprovalCard
          key={scenario}
          {...commonProps}
          risk="high"
          variant="detailed"
          title="Deploy the generated refund policy?"
          description="This changes how new customer refunds are routed."
          approveLabel={scenario === "error" ? "Try again" : "Deploy policy"}
        >
          <DetailedApprovalContent />
        </ApprovalCard>
      )}
    </PreviewStage>
  );
}

export function RegistryPreview({ itemId }: { itemId: RegistryItemId }) {
  if (itemId === "prompt-composer") return <PromptComposerPreview />;

  if (itemId === "thinking") return <ThinkingPreview />;

  if (itemId === "approval-card") return <ApprovalCardPreview />;

  if (itemId === "task-list") {
    return (
      <PreviewStage contentClassName="uai-preview-medium" label="Mixed progress">
        <TaskList tasks={tasks} />
      </PreviewStage>
    );
  }

  return (
    <PreviewStage contentClassName="uai-preview-flow" label="Complete workflow">
      <TaskFlow data={taskFlowData} />
    </PreviewStage>
  );
}
