import {
  BrainCircuit,
  ListChecks,
  type LucideIcon,
  MessageSquareText,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";

export type RegistryItemId =
  | "prompt-composer"
  | "thinking"
  | "approval-card"
  | "task-list"
  | "coupon-field"
  | "price-summary"
  | "order-status";

export type RegistryCategory = "All" | "AI" | "Feedback" | "Forms" | "Data Display" | "Commerce";

export type RegistryCatalogItem = {
  id: RegistryItemId;
  name: string;
  category: Exclude<RegistryCategory, "All">;
  description: string;
  icon: LucideIcon;
  usage: string;
  accessibility: readonly string[];
};

export const registryCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "prompt-composer",
    name: "Prompt Composer",
    category: "Forms",
    description:
      "A prompt bar with ghost plus, ink send, and rounded, pill, ghost, and compact variants.",
    icon: MessageSquareText,
    usage: `import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer"

export function AskUai() {
  return (
    <PromptComposer variant="rounded" onSubmit={(prompt) => sendPrompt(prompt)}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput placeholder="Write a message…" />
      <PromptComposerActions>
        <PromptComposerModelSelect models={[{ id: "default", label: "Your model" }]} />
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>
  )
}`,
    accessibility: [
      "The textarea has a persistent accessible label.",
      "Enter submits while Shift+Enter inserts a line break.",
      "Busy, disabled, and empty states disable submission.",
      "Source and model menus expose expanded state.",
      "Every icon-only action has an accessible name.",
      "Rounded, pill, ghost, and compact keep the same keyboard contract.",
    ],
  },
  {
    id: "thinking",
    name: "Thinking",
    category: "AI",
    description:
      "A live and inspectable activity disclosure with explicit states and structured evidence.",
    icon: BrainCircuit,
    usage: `import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking"

export function ActivityState() {
  return (
    <Thinking status="complete">
      <ThinkingTrigger summary="Checking the component contract." duration="1.8s" />
      <ThinkingContent>
        <ThinkingActivity type="file" path="src/components/prompt.tsx" elapsed="0.8s">
          Read the component source
        </ThinkingActivity>
        <ThinkingActivity type="tool" tool="bun run test" elapsed="1.8s">
          Checked the implementation
        </ThinkingActivity>
      </ThinkingContent>
    </Thinking>
  )
}`,
    accessibility: [
      "The trigger exposes expanded and collapsed state.",
      "The trigger references the disclosed content.",
      "New activity is announced through a polite live log.",
      "Activity entries keep their ordered-list semantics.",
      "Status is communicated with text instead of color alone.",
      "Decorative state icons stay hidden from assistive technology.",
    ],
  },
  {
    id: "approval-card",
    name: "Approval Card",
    category: "Feedback",
    description:
      "A controlled decision surface for reviewing an AI action's risk, evidence, and impact.",
    icon: ShieldCheck,
    usage: `import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card"

export function PolicyDecision() {
  return (
    <ApprovalCard risk="high" variant="detailed">
      <ApprovalCardHeader
        title="Deploy the generated refund policy?"
        description="This changes how new refunds are routed."
      />
      <ApprovalCardDetails>
        <ApprovalCardDetail label="Affected resources">
          refund-policy-v4 · 3 queues
        </ApprovalCardDetail>
        <ApprovalCardDetail label="Downstream impact">
          New requests use this policy immediately.
        </ApprovalCardDetail>
      </ApprovalCardDetails>
      <ApprovalCardActions>
        <ApprovalCardReject onClick={() => rejectPolicy()} />
        <ApprovalCardApprove onClick={() => deployPolicy()}>Deploy policy</ApprovalCardApprove>
      </ApprovalCardActions>
    </ApprovalCard>
  )
}`,
    accessibility: [
      "Risk and status always appear as text in addition to icon and color.",
      "Approve and Reject use native buttons with visible keyboard focus.",
      "Submitting disables duplicate decisions and exposes busy state.",
      "Critical approval stays disabled until the confirmation phrase matches.",
      "Errors use an alert while preserving the evidence and retry actions.",
      "Composable details retain description-list semantics.",
    ],
  },
  {
    id: "task-list",
    name: "Task List",
    category: "Data Display",
    description: "A composable progress list with card, timeline, and compact variants.",
    icon: ListChecks,
    usage: `import {
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
} from "@/components/ui/uai/task-list"

export function Progress() {
  return (
    <TaskList variant="timeline" aria-label="Release progress">
      <TaskListItem status="complete">
        <TaskListTitle>Review interface</TaskListTitle>
        <TaskListDescription>Props and public behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Check keyboard paths</TaskListTitle>
        <TaskListDescription>Focus and reduced-motion behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="pending">
        <TaskListTitle>Publish the registry item</TaskListTitle>
      </TaskListItem>
    </TaskList>
  )
}`,
    accessibility: [
      "Tasks retain ordered-list semantics.",
      "Every state includes text in addition to color.",
      "The active task exposes current-step semantics.",
      "Active animation respects reduced-motion preferences.",
      "Long titles and descriptions wrap instead of being truncated.",
      "Card, timeline, and compact variants preserve the same semantic contract.",
    ],
  },
  {
    id: "coupon-field",
    name: "Coupon Field",
    category: "Commerce",
    description: "A checkout-safe discount field with rounded, pill, and compact variants.",
    icon: TicketPercent,
    usage: `import {
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
} from "@/components/ui/uai/coupon-field"

export function DiscountCode() {
  return (
    <CouponField
      variant="rounded"
      status="applied"
      appliedCode="WELCOME20"
      onApply={(code) => validateCoupon(code)}
    >
      <CouponFieldLabel>Discount code</CouponFieldLabel>
      <CouponFieldControl>
        <CouponFieldInput />
        <CouponFieldApply />
      </CouponFieldControl>
      <CouponFieldFeedback>
        <CouponFieldMessage>20% off this order</CouponFieldMessage>
        <CouponFieldRemove onClick={() => removeCoupon()} />
      </CouponFieldFeedback>
    </CouponField>
  )
}`,
    accessibility: [
      "The visible label is programmatically associated with the input.",
      "Enter applies a valid draft without introducing a nested form.",
      "Applying disables duplicate submissions and exposes busy state.",
      "Success and error feedback use the matching live-region urgency.",
      "Invalid state is communicated through text, icon, border, and aria-invalid.",
      "Apply, Replace, and Remove name the action that will happen.",
    ],
  },
  {
    id: "price-summary",
    name: "Price Summary",
    category: "Commerce",
    description: "A composable order total with card, plain, and compact variants.",
    icon: ReceiptText,
    usage: `import {
  PriceSummary,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTitle,
  PriceSummaryTotal,
} from "@/components/ui/uai/price-summary"

export function CheckoutTotal() {
  return (
    <PriceSummary variant="card">
      <PriceSummaryHeader>
        <PriceSummaryTitle>Order summary</PriceSummaryTitle>
        <PriceSummaryDescription>3 items · USD</PriceSummaryDescription>
      </PriceSummaryHeader>
      <PriceSummaryList>
        <PriceSummaryItem label="Subtotal">$128.00</PriceSummaryItem>
        <PriceSummaryItem label="WELCOME20" tone="success">−$20.00</PriceSummaryItem>
        <PriceSummaryItem label="Shipping" tone="success">Free</PriceSummaryItem>
        <PriceSummaryItem label="Estimated tax">$9.72</PriceSummaryItem>
        <PriceSummaryTotal hint="Includes estimated tax">$117.72</PriceSummaryTotal>
      </PriceSummaryList>
      <PriceSummaryNote>The final amount is confirmed at payment.</PriceSummaryNote>
    </PriceSummary>
  )
}`,
    accessibility: [
      "The root is labelled by the composed summary title.",
      "Line items and totals retain description-list semantics.",
      "Discounts and free shipping use explicit text in addition to color.",
      "Tabular numerals keep changing amounts aligned and scannable.",
      "Long labels and localized currency values wrap without horizontal overflow.",
      "Card, plain, and compact variants preserve the same semantic structure.",
    ],
  },
  {
    id: "order-status",
    name: "Order Status",
    category: "Commerce",
    description: "A composable fulfillment timeline with card, plain, and compact variants.",
    icon: PackageCheck,
    usage: `import {
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
} from "@/components/ui/uai/order-status"

export function ShipmentProgress() {
  return (
    <OrderStatus variant="card">
      <OrderStatusHeader>
        <div>
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
        <OrderStatusStep status="current">
          <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
          <OrderStatusStepDescription>Departed the regional facility</OrderStatusStepDescription>
        </OrderStatusStep>
        <OrderStatusStep>
          <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
          <OrderStatusStepDescription>Expected Aug 21</OrderStatusStepDescription>
        </OrderStatusStep>
      </OrderStatusProgress>
      <OrderStatusDetails>
        <OrderStatusDetail label="Carrier">Northstar Parcel</OrderStatusDetail>
        <OrderStatusDetail label="Tracking">NSP-2048-1182</OrderStatusDetail>
      </OrderStatusDetails>
      <OrderStatusActions>
        <OrderStatusAction href={trackingUrl} emphasis="primary">Track package</OrderStatusAction>
        <OrderStatusAction href={supportUrl}>Get help</OrderStatusAction>
      </OrderStatusActions>
    </OrderStatus>
  )
}`,
    accessibility: [
      "The root is labelled by the composed order status title.",
      "Fulfillment stages retain ordered-list semantics.",
      "The current stage exposes aria-current without relying on color.",
      "Complete, current, upcoming, and issue states include visible text labels.",
      "Tracking facts retain description-list semantics and wrap long values.",
      "Card, plain, and compact variants preserve the same semantic structure.",
    ],
  },
] as const;

export const registryCategories: readonly RegistryCategory[] = [
  "All",
  "AI",
  "Feedback",
  "Forms",
  "Data Display",
  "Commerce",
] as const;

export function getRegistryItem(id: RegistryItemId) {
  const item = registryCatalog.find((entry) => entry.id === id);
  if (item) return item;

  const fallback = registryCatalog.at(0);
  if (!fallback) throw new Error("The Uai registry catalog is empty.");
  return fallback;
}
