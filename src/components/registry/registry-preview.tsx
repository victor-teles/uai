"use client";

import { FileText, Globe } from "lucide-react";
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
  COUPON_FIELD_VARIANTS,
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
  type CouponFieldStatus,
  type CouponFieldVariant,
} from "@/components/ui/uai/coupon-field";
import {
  ORDER_STATUS_VARIANTS,
  OrderStatus,
  OrderStatusAction,
  OrderStatusActions,
  OrderStatusBadge,
  OrderStatusDescription,
  OrderStatusDetail,
  OrderStatusDetails,
  OrderStatusHeader,
  OrderStatusProgress,
  OrderStatusStep,
  OrderStatusStepDescription,
  OrderStatusStepTitle,
  OrderStatusTitle,
  type OrderStatusVariant,
} from "@/components/ui/uai/order-status";
import {
  PRICE_SUMMARY_VARIANTS,
  PriceSummary,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTitle,
  PriceSummaryTotal,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";
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
  TASK_LIST_VARIANTS,
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
  type TaskListVariant,
} from "@/components/ui/uai/task-list";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking";

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

const taskListVariantCopy: Record<TaskListVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Project checklist" },
  timeline: { label: "Timeline", scene: "Workflow progress" },
  compact: { label: "Compact", scene: "Sidebar queue" },
};

function TaskListPreview() {
  const [variant, setVariant] = useState<TaskListVariant>("card");
  const copy = taskListVariantCopy[variant];
  const swapping = useSwapFlag(variant);

  return (
    <PreviewStage
      contentClassName="uai-preview-medium"
      label={copy.scene}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Task list variant"
          value={variant}
          onChange={(id) => setVariant(id as TaskListVariant)}
          options={TASK_LIST_VARIANTS.map((option) => ({
            id: option,
            label: taskListVariantCopy[option].label,
          }))}
        />
      }
    >
      <div className="w-full max-w-[420px]">
        <TaskList variant={variant} aria-label="Release progress">
          <RegistryTaskItems />
        </TaskList>
      </div>
    </PreviewStage>
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

const couponVariantCopy: Record<CouponFieldVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Checkout summary" },
  pill: { label: "Pill", scene: "Promotion panel" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

function CouponFieldPreview() {
  const [variant, setVariant] = useState<CouponFieldVariant>("rounded");
  const [status, setStatus] = useState<CouponFieldStatus>("applied");
  const [appliedCode, setAppliedCode] = useState<string | undefined>("WELCOME20");
  const [draft, setDraft] = useState("WELCOME20");
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = couponVariantCopy[variant];

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const applyCoupon = (code: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setDraft(code);
    setStatus("applying");
    timerRef.current = window.setTimeout(() => {
      const normalizedCode = code.toUpperCase();
      if (normalizedCode === "WELCOME20" || normalizedCode === "SAVE20") {
        setDraft(normalizedCode);
        setAppliedCode(normalizedCode);
        setStatus("applied");
        return;
      }

      setStatus("error");
    }, 700);
  };

  const removeCoupon = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setAppliedCode(undefined);
    setStatus("idle");
  };

  const feedback =
    status === "applying"
      ? "Checking this code…"
      : status === "error"
        ? `${draft.trim().toUpperCase() || "This code"} wasn’t recognized. Check it and try again.${appliedCode ? ` ${appliedCode} still applies.` : ""}`
        : status === "applied"
          ? `${appliedCode} applied · 20% off this order`
          : "Add a code before you check out.";

  return (
    <PreviewStage
      contentClassName="uai-preview-medium"
      label={copy.scene}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Coupon field variant"
          value={variant}
          onChange={(id) => setVariant(id as CouponFieldVariant)}
          options={COUPON_FIELD_VARIANTS.map((option) => ({
            id: option,
            label: couponVariantCopy[option].label,
          }))}
        />
      }
    >
      <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
        <div className="mb-5 flex items-baseline justify-between border-b border-[var(--uai-border)] pb-3">
          <h2 className="text-sm leading-5 font-medium">Order summary</h2>
          <span className="text-[12px] text-[var(--uai-muted)]">2 items</span>
        </div>

        <CouponField
          variant={variant}
          status={status}
          appliedCode={appliedCode}
          value={draft}
          onValueChange={setDraft}
          onApply={applyCoupon}
        >
          <CouponFieldLabel>Discount code</CouponFieldLabel>
          <CouponFieldControl>
            <CouponFieldInput />
            <CouponFieldApply />
          </CouponFieldControl>
          <CouponFieldFeedback>
            <CouponFieldMessage>{feedback}</CouponFieldMessage>
            <CouponFieldRemove onClick={removeCoupon} />
          </CouponFieldFeedback>
        </CouponField>

        <dl className="mt-5 space-y-2 border-t border-[var(--uai-border)] pt-4 text-[12px] leading-4 tabular-nums">
          <div className="flex justify-between text-[var(--uai-muted)]">
            <dt>Subtotal</dt>
            <dd>$90.00</dd>
          </div>
          {appliedCode ? (
            <div className="flex justify-between text-[var(--uai-success)]">
              <dt>Discount</dt>
              <dd>−$18.00</dd>
            </div>
          ) : null}
          <div className="flex justify-between pt-1 text-sm font-medium">
            <dt>Total</dt>
            <dd>{appliedCode ? "$72.00" : "$90.00"}</dd>
          </div>
        </dl>
      </div>
    </PreviewStage>
  );
}

const priceSummaryVariantCopy: Record<PriceSummaryVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Checkout sidebar" },
  plain: { label: "Plain", scene: "Payment step" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

function PriceSummaryPreview() {
  const [variant, setVariant] = useState<PriceSummaryVariant>("card");
  const swapping = useSwapFlag(variant);
  const copy = priceSummaryVariantCopy[variant];

  return (
    <PreviewStage
      contentClassName="uai-preview-narrow"
      label={copy.scene}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Price summary variant"
          value={variant}
          onChange={(id) => setVariant(id as PriceSummaryVariant)}
          options={PRICE_SUMMARY_VARIANTS.map((option) => ({
            id: option,
            label: priceSummaryVariantCopy[option].label,
          }))}
        />
      }
    >
      <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
        <PriceSummary variant={variant}>
          <PriceSummaryHeader>
            <PriceSummaryTitle>Order summary</PriceSummaryTitle>
            <PriceSummaryDescription>3 items · Ready to check out</PriceSummaryDescription>
          </PriceSummaryHeader>
          <PriceSummaryList>
            <PriceSummaryItem label="Subtotal">$128.00</PriceSummaryItem>
            <PriceSummaryItem label="WELCOME20" tone="success">
              −$20.00
            </PriceSummaryItem>
            <PriceSummaryItem label="Shipping" tone="success">
              Free
            </PriceSummaryItem>
            <PriceSummaryItem label="Estimated tax">$9.72</PriceSummaryItem>
            <PriceSummaryTotal hint="Includes estimated tax">$117.72</PriceSummaryTotal>
          </PriceSummaryList>
          <PriceSummaryNote>The final amount is confirmed at payment.</PriceSummaryNote>
        </PriceSummary>
      </div>
    </PreviewStage>
  );
}

const orderStatusVariantCopy: Record<OrderStatusVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Account order" },
  plain: { label: "Plain", scene: "Confirmation page" },
  compact: { label: "Compact", scene: "Order drawer" },
};

function OrderStatusPreview() {
  const [variant, setVariant] = useState<OrderStatusVariant>("card");
  const swapping = useSwapFlag(variant);
  const copy = orderStatusVariantCopy[variant];

  return (
    <PreviewStage
      contentClassName="uai-preview-narrow"
      label={copy.scene}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Order status variant"
          value={variant}
          onChange={(id) => setVariant(id as OrderStatusVariant)}
          options={ORDER_STATUS_VARIANTS.map((option) => ({
            id: option,
            label: orderStatusVariantCopy[option].label,
          }))}
        />
      }
    >
      <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
        <OrderStatus variant={variant}>
          <OrderStatusHeader>
            <div className="min-w-0">
              <OrderStatusTitle>Arriving Friday</OrderStatusTitle>
              <OrderStatusDescription>Order #UAI-2048 · 2 items</OrderStatusDescription>
            </div>
            <OrderStatusBadge tone="progress">In transit</OrderStatusBadge>
          </OrderStatusHeader>
          <OrderStatusProgress>
            <OrderStatusStep status="complete">
              <OrderStatusStepTitle>Order confirmed</OrderStatusStepTitle>
              <OrderStatusStepDescription>Aug 15 · 9:42 AM</OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="complete">
              <OrderStatusStepTitle>Shipped</OrderStatusStepTitle>
              <OrderStatusStepDescription>Aug 17 · Northstar Parcel</OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="current">
              <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
              <OrderStatusStepDescription>
                Departed the regional facility in Austin, TX
              </OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="upcoming">
              <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
              <OrderStatusStepDescription>Expected Aug 21 by 8:00 PM</OrderStatusStepDescription>
            </OrderStatusStep>
          </OrderStatusProgress>
          <OrderStatusDetails>
            <OrderStatusDetail label="Carrier">Northstar Parcel</OrderStatusDetail>
            <OrderStatusDetail label="Tracking">NSP-2048-1182</OrderStatusDetail>
          </OrderStatusDetails>
          <OrderStatusActions>
            <OrderStatusAction href="https://example.com/track" emphasis="primary">
              Track package
            </OrderStatusAction>
            <OrderStatusAction href="https://example.com/help">Get help</OrderStatusAction>
          </OrderStatusActions>
        </OrderStatus>
      </div>
    </PreviewStage>
  );
}

export function RegistryPreview({ itemId }: { itemId: RegistryItemId }) {
  if (itemId === "prompt-composer") return <PromptComposerPreview />;
  if (itemId === "thinking") return <ThinkingPreview />;
  if (itemId === "approval-card") return <ApprovalCardPreview />;
  if (itemId === "task-list") return <TaskListPreview />;
  if (itemId === "coupon-field") return <CouponFieldPreview />;
  if (itemId === "price-summary") return <PriceSummaryPreview />;
  if (itemId === "order-status") return <OrderStatusPreview />;

  return null;
}
