import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import { TaskFlow, TaskFlowStep } from "@/registry/uai/blocks/task-flow";

test("composes arbitrary workflow stages in order", () => {
  render(
    <TaskFlow>
      <TaskFlowStep label="Thinking" icon={<span>1</span>} active>
        <p>Observable work</p>
      </TaskFlowStep>
      <TaskFlowStep label="Prompt" icon={<span>2</span>}>
        <p>Follow-up input</p>
      </TaskFlowStep>
    </TaskFlow>,
  );

  expect(screen.getByRole("region", { name: "Task flow" })).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Observable work")).toBeTruthy();
  expect(screen.getByText("Follow-up input")).toBeTruthy();
  expect(document.querySelector("[data-active='true']")).toBeTruthy();
});
