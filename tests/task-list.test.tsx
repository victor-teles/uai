import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import {
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
} from "@/registry/uai/components/task-list";

test("composes ordered tasks with visible status text", () => {
  render(
    <TaskList aria-label="Registry work">
      <TaskListItem status="complete">
        <TaskListTitle>Review the interface</TaskListTitle>
        <TaskListDescription>Props and behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Run interaction tests</TaskListTitle>
      </TaskListItem>
    </TaskList>,
  );

  expect(screen.getByRole("list", { name: "Registry work" }).tagName).toBe("OL");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Complete")).toBeTruthy();
  expect(screen.getByText("In progress")).toBeTruthy();
});
