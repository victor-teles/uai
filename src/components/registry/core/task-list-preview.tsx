"use client";

import {
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
  type TaskListVariant,
} from "@/components/ui/uai/task-list";

export function TaskListPreview({ variant = "card" }: { variant?: TaskListVariant }) {
  return (
    <div className="w-full max-w-[420px]">
      <TaskList variant={variant} aria-label="Release progress">
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
        <TaskListItem status="pending">
          <TaskListTitle>Publish to the registry</TaskListTitle>
          <TaskListDescription>Tag v0.4.0 and update the changelog</TaskListDescription>
        </TaskListItem>
      </TaskList>
    </div>
  );
}
