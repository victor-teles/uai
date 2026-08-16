"use client";

import { Check, FileText, Globe, MessageSquare, Sparkles, Workflow } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardConfirmation,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardError,
  ApprovalCardHeader,
  ApprovalCardReject,
  type ApprovalCardStatus,
  type ApprovalDecision,
} from "@/components/ui/uai/approval-card";
import {
  PROMPT_COMPOSER_VARIANTS,
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerAddItem,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import {
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
} from "@/components/ui/uai/task-list";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking";
import { TaskFlow, TaskFlowStep } from "@/registry/uai/blocks/task-flow";

import type { RegistryItemId } from "./catalog";
import { PreviewStage, SegmentedControl } from "./preview-chrome";

const composerModels = [
  { id: "your-model", label: "Your model" },
  { id: "fast", label: "Fast" },
  { id: "precise", label: "Precise" },
] as const;

function ComposerSourceItems() {
  return (
    <>
      <PromptComposerFileItem />
      <PromptComposerAddItem
        icon={<FileText className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        description="Attach saved context"
      >
        Workspace notes
      </PromptComposerAddItem>
      <PromptComposerAddItem
        icon={<Globe className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        description="Live results"
      >
        Web search
      </PromptComposerAddItem>
      <div className="mt-1 border-t border-[var(--uai-border)] px-2 pt-[7px] pb-[5px] text-[11px] text-[var(--uai-muted)]">
        Attach files or mention a source
      </div>
    </>
  );
}

function RegistryTaskItems() {
  return (
    <>
      <TaskListItem status="complete">
        <TaskListTitle>Review the component interface</TaskListTitle>
        <TaskListDescription>Props and public behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Check keyboard interaction</TaskListTitle>
        <TaskListDescription>Focus and submit paths</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="pending">
        <TaskListTitle>Build the registry item</TaskListTitle>
        <TaskListDescription>Files and dependencies</TaskListDescription>
      </TaskListItem>
    </>
  );
}

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
          <PromptComposer variant={variant} onSubmit={() => setSubmitted(true)}>
            <PromptComposerAdd>
              <ComposerSourceItems />
            </PromptComposerAdd>
            <PromptComposerInput placeholder="Write a message…" />
            <PromptComposerActions>
              <PromptComposerModelSelect models={composerModels} />
              <PromptComposerSubmit />
            </PromptComposerActions>
          </PromptComposer>
        </div>
      </div>
    </PreviewStage>
  );
}

function ThinkingActivities({ status }: { status: "thinking" | "complete" | "error" }) {
  return (
    <>
      <ThinkingActivity type="search" query="Thinking component accessibility" elapsed="0.3s">
        Found the component contract
      </ThinkingActivity>
      <ThinkingActivity type="file" path="src/registry/uai/components/thinking.tsx" elapsed="0.8s">
        Read the public interface
      </ThinkingActivity>
      <ThinkingActivity
        type="tool"
        tool="bun run registry:build"
        elapsed={status === "thinking" ? undefined : status === "complete" ? "3.4s" : "2.6s"}
      >
        {status === "error" ? "Registry build failed" : "Checked the registry output"}
      </ThinkingActivity>
    </>
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
      <Thinking status={status}>
        <ThinkingTrigger summary={copy.summary} duration={copy.duration} />
        <ThinkingContent>
          <ThinkingActivities status={status} />
        </ThinkingContent>
      </Thinking>
    </PreviewStage>
  );
}

const approvalScenarios = ["compact", "detailed", "critical", "error"] as const;
type ApprovalScenario = (typeof approvalScenarios)[number];

type ApprovalPreviewState =
  | { status: Exclude<ApprovalCardStatus, "submitting" | "error"> }
  | { status: "submitting"; pendingDecision: ApprovalDecision }
  | { status: "error" };

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

function ApprovalDecisionActions({
  decide,
  approveLabel,
}: {
  decide: (decision: ApprovalDecision) => void;
  approveLabel?: string;
}) {
  return (
    <ApprovalCardActions>
      <ApprovalCardReject onClick={() => decide("rejected")} />
      <ApprovalCardApprove onClick={() => decide("approved")}>{approveLabel}</ApprovalCardApprove>
    </ApprovalCardActions>
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
    setState(scenario === "error" ? { status: "error" } : { status: "ready" });
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [scenario]);

  const decide = (decision: ApprovalDecision) => {
    setState({ status: "submitting", pendingDecision: decision });
    timerRef.current = window.setTimeout(() => setState({ status: decision }), 900);
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
        <ApprovalCard key={scenario} {...state} risk="low">
          <ApprovalCardHeader
            title="Archive 3 resolved conversations?"
            description="They remain searchable and can be restored later."
          />
          <ApprovalDecisionActions decide={decide} />
        </ApprovalCard>
      ) : scenario === "critical" ? (
        <ApprovalCard
          key={scenario}
          {...state}
          risk="critical"
          variant="detailed"
          confirmation={{ phrase: "support-search-prod" }}
        >
          <ApprovalCardHeader
            title="Delete the production search index?"
            description="This removes the index and every replica. It cannot be undone."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent critical />
          </ApprovalCardDetails>
          <ApprovalCardConfirmation />
          <ApprovalDecisionActions decide={decide} approveLabel="Delete index" />
        </ApprovalCard>
      ) : (
        <ApprovalCard key={scenario} {...state} risk="high" variant="detailed">
          <ApprovalCardHeader
            title="Deploy the generated refund policy?"
            description="This changes how new customer refunds are routed."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent />
          </ApprovalCardDetails>
          <ApprovalCardError>
            The approval service did not respond. Review the impact and try again.
          </ApprovalCardError>
          <ApprovalDecisionActions
            decide={decide}
            approveLabel={scenario === "error" ? "Try again" : "Deploy policy"}
          />
        </ApprovalCard>
      )}
    </PreviewStage>
  );
}

function TaskFlowPreview() {
  return (
    <TaskFlow>
      <TaskFlowStep
        label="Thinking"
        icon={<Sparkles className="size-3.5" aria-hidden="true" />}
        active
      >
        <Thinking status="complete">
          <ThinkingTrigger
            summary="Reviewing the requested component and its interaction contract."
            duration="1.8s"
          />
          <ThinkingContent>
            <ThinkingActivity type="search" query="Thinking component states" elapsed="0.3s">
              Found the component contract
            </ThinkingActivity>
            <ThinkingActivity
              type="file"
              path="src/registry/uai/components/thinking.tsx"
              elapsed="0.8s"
            >
              Reviewed the public interface
            </ThinkingActivity>
            <ThinkingActivity type="progress" elapsed="1.8s">
              Prepared a source-owned change
            </ThinkingActivity>
          </ThinkingContent>
        </Thinking>
      </TaskFlowStep>
      <TaskFlowStep label="Approval" icon={<Check className="size-3.5" aria-hidden="true" />}>
        <ApprovalCard risk="medium">
          <ApprovalCardHeader
            title="Add this component to the registry?"
            description="Review the source change before it becomes available to consumers."
          />
          <ApprovalCardActions>
            <ApprovalCardReject />
            <ApprovalCardApprove />
          </ApprovalCardActions>
        </ApprovalCard>
      </TaskFlowStep>
      <TaskFlowStep label="Tasks" icon={<Workflow className="size-3.5" aria-hidden="true" />}>
        <TaskList>
          <RegistryTaskItems />
        </TaskList>
      </TaskFlowStep>
      <TaskFlowStep label="Prompt" icon={<MessageSquare className="size-3.5" aria-hidden="true" />}>
        <PromptComposer>
          <PromptComposerAdd>
            <ComposerSourceItems />
          </PromptComposerAdd>
          <PromptComposerInput placeholder="Describe an adaptation…" />
          <PromptComposerActions>
            <PromptComposerModelSelect models={[{ id: "default", label: "Your model" }]} />
            <PromptComposerSubmit />
          </PromptComposerActions>
        </PromptComposer>
      </TaskFlowStep>
    </TaskFlow>
  );
}

export function RegistryPreview({ itemId }: { itemId: RegistryItemId }) {
  if (itemId === "prompt-composer") return <PromptComposerPreview />;
  if (itemId === "thinking") return <ThinkingPreview />;
  if (itemId === "approval-card") return <ApprovalCardPreview />;

  if (itemId === "task-list") {
    return (
      <PreviewStage contentClassName="uai-preview-medium" label="Mixed progress">
        <TaskList>
          <RegistryTaskItems />
        </TaskList>
      </PreviewStage>
    );
  }

  return (
    <PreviewStage contentClassName="uai-preview-flow" label="Complete workflow">
      <TaskFlowPreview />
    </PreviewStage>
  );
}
