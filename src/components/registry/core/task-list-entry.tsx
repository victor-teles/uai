import { TASK_LIST_VARIANTS, type TaskListVariant } from "@/components/ui/uai/task-list";
import type { PreviewEntry } from "../preview-chrome";
import { coreEntry, options } from "./stage";
import { TaskListPreview } from "./task-list-preview";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Task list variant",
  defaultValue: "card",
  options: options(TASK_LIST_VARIANTS, {
    card: { label: "Card", scene: "Project checklist" },
    timeline: { label: "Timeline", scene: "Workflow progress" },
    compact: { label: "Compact", scene: "Sidebar queue" },
  }),
  contentClassName: "uai-preview-medium",
  render: (selection) => <TaskListPreview variant={selection as TaskListVariant} />,
});
