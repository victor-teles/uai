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
    description: "An accessible disclosure for model progress, elapsed time, and reasoning steps.",
    icon: BrainCircuit,
    usage: `import { Thinking } from "@/components/ui/uai/thinking"

export function ReasoningState() {
  return (
    <Thinking
      summary="Checking the component contract."
      duration="1.8s"
      steps={["Read the props.", "Check keyboard behavior."]}
    />
  )
}`,
    accessibility: [
      "The trigger exposes expanded and collapsed state.",
      "The trigger references the disclosed content.",
      "Reasoning steps keep their ordered-list semantics.",
      "Decorative state icons stay hidden from assistive technology.",
    ],
  },
  {
    id: "approval-card",
    name: "Approval Card",
    category: "Feedback",
    description:
      "A protected decision surface for actions that need explicit approval or rejection.",
    icon: ShieldCheck,
    usage: `import { ApprovalCard } from "@/components/ui/uai/approval-card"

export function PublishDecision() {
  return (
    <ApprovalCard
      title="Publish the generated summary?"
      description="Review the draft before it becomes visible."
      onDecision={(decision) => saveDecision(decision)}
    />
  )
}`,
    accessibility: [
      "Both outcomes use native buttons.",
      "The decision result is announced through a live region.",
      "The reset action remains keyboard accessible.",
      "Labels name the consequence instead of relying on color.",
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
