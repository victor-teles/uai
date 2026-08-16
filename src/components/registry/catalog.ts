import {
  BrainCircuit,
  ListChecks,
  type LucideIcon,
  MessageSquareText,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export type RegistryItemId =
  | "prompt-composer"
  | "thinking"
  | "approval-card"
  | "task-list"
  | "task-flow";

export type RegistryCategory = "All" | "AI" | "Feedback" | "Forms" | "Data Display" | "Workflow";

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
    usage: `import { PromptComposer } from "@/components/ui/uai/prompt-composer"

export function AskUai() {
  return (
    <PromptComposer
      placeholder="Write a message…"
      modelLabel="Your model"
      variant="rounded"
      onSubmit={(prompt) => sendPrompt(prompt)}
    />
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
    usage: `import { Thinking } from "@/components/ui/uai/thinking"

const activities = [
  {
    id: "read-source",
    type: "file" as const,
    label: "Read the component source",
    path: "src/components/prompt.tsx",
    elapsed: "0.8s",
  },
  {
    id: "run-checks",
    type: "tool" as const,
    label: "Checked the implementation",
    tool: "bun run test",
    elapsed: "1.8s",
  },
]

export function ActivityState() {
  return (
    <Thinking
      status="complete"
      summary="Checking the component contract."
      duration="1.8s"
      activities={activities}
    />
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
  ApprovalCardDetail,
  type ApprovalCardState,
} from "@/components/ui/uai/approval-card"

export function PolicyDecision({ state }: { state: ApprovalCardState }) {
  return (
    <ApprovalCard
      {...state}
      risk="high"
      variant="detailed"
      title="Deploy the generated refund policy?"
      description="This changes how new refunds are routed."
      onApprove={() => deployPolicy()}
      onReject={() => rejectPolicy()}
    >
      <ApprovalCardDetail label="Affected resources">
        refund-policy-v4 · 3 queues
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Downstream impact">
        New requests use this policy immediately.
      </ApprovalCardDetail>
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
    description:
      "An ordered view of complete, active, and pending work with visible status labels.",
    icon: ListChecks,
    usage: `import { TaskList } from "@/components/ui/uai/task-list"

const tasks = [
  { id: "review", label: "Review interface", status: "complete" },
  { id: "test", label: "Check keyboard paths", status: "active" },
]

export function Progress() {
  return <TaskList tasks={tasks} />
}`,
    accessibility: [
      "Tasks retain ordered-list semantics.",
      "Every state includes text in addition to color.",
      "Active animation respects reduced-motion preferences.",
      "Stable task IDs preserve list identity.",
    ],
  },
  {
    id: "task-flow",
    name: "Task Flow",
    category: "Workflow",
    description: "The complete reasoning, approval, work, and prompt sequence behind an AI task.",
    icon: Workflow,
    usage: `import { TaskFlow } from "@/components/uai/task-flow"

export function ReviewFlow() {
  return (
    <TaskFlow
      data={reviewFlow}
      onDecision={(decision) => saveDecision(decision)}
      onPromptSubmit={(prompt) => sendPrompt(prompt)}
    />
  )
}`,
    accessibility: [
      "The workflow keeps an ordered stage sequence.",
      "Each stage preserves its native component semantics.",
      "Decision and prompt feedback use live regions.",
      "The composition shrinks without horizontal overflow.",
    ],
  },
] as const;

export const registryCategories: readonly RegistryCategory[] = [
  "All",
  "AI",
  "Feedback",
  "Forms",
  "Data Display",
  "Workflow",
] as const;

export function getRegistryItem(id: RegistryItemId) {
  const item = registryCatalog.find((entry) => entry.id === id);
  if (item) return item;

  const fallback = registryCatalog.at(0);
  if (!fallback) throw new Error("The Uai registry catalog is empty.");
  return fallback;
}
