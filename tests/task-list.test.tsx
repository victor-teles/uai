import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import {
  TASK_LIST_VARIANTS,
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
  type TaskListVariant,
} from "@/registry/uai/components/task-list";

function TaskListFixture({ variant = "card" }: { variant?: TaskListVariant }) {
  return (
    <TaskList variant={variant} aria-label="Registry work">
      <TaskListItem status="complete">
        <TaskListTitle>Review the interface</TaskListTitle>
        <TaskListDescription>Props and behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Run interaction tests</TaskListTitle>
      </TaskListItem>
    </TaskList>
  );
}

test("composes ordered tasks with visible status text", () => {
  render(<TaskListFixture />);

  expect(screen.getByRole("list", { name: "Registry work" }).tagName).toBe("OL");
  expect(screen.getByRole("list", { name: "Registry work" }).className).toContain("list-none");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Complete")).toBeTruthy();
  expect(screen.getByText("Complete").className).toContain("bg-success/14");
  expect(screen.getByText("In progress").className).toContain("shimmer-text");
  expect(screen.getByText("In progress").closest('[data-slot="badge"]')?.className).toContain(
    "text-foreground",
  );
  expect(screen.getByText("In progress")).toBeTruthy();
});

test("renders card, timeline, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<TaskListFixture variant="card" />);
  const list = screen.getByRole("list", { name: "Registry work" });

  expect(TASK_LIST_VARIANTS).toEqual(["card", "timeline", "compact"]);
  expect(list.dataset.variant).toBe("card");
  expect(list.dataset.slot).toBe("task-list");
  expect(list.className).toContain("rounded-[14px]");

  rerender(<TaskListFixture variant="timeline" />);
  expect(list.dataset.variant).toBe("timeline");
  expect(list.className).toContain("rounded-none");
  expect(list.className).toContain("bg-transparent");
  expect(list.className).not.toContain("gap-3");
  expect(container.querySelector("li")?.className).toContain("pb-6");

  rerender(<TaskListFixture variant="compact" />);
  expect(list.dataset.variant).toBe("compact");
  expect(list.className).toContain("rounded-xl");
  expect(container.querySelector("li")?.className).toContain("min-h-12");
});

test("identifies the active step and allows localized status copy", () => {
  render(
    <TaskList>
      <TaskListItem status="active" statusLabel="Em andamento">
        <TaskListTitle>Validar a experiência em dispositivos menores</TaskListTitle>
        <TaskListDescription>
          Confirmar que títulos e descrições extensos continuam legíveis.
        </TaskListDescription>
      </TaskListItem>
    </TaskList>,
  );

  expect(screen.getByRole("listitem").getAttribute("aria-current")).toBe("step");
  expect(screen.getByText("Em andamento")).toBeTruthy();
  expect(screen.getByText(/Validar a experiência/).className).toContain("wrap-anywhere");
  expect(screen.getByText(/Confirmar que títulos/).className).not.toContain("truncate");
});

test("compound task list children require their root", () => {
  expect(() =>
    render(
      <TaskListItem status="pending">
        <TaskListTitle>Outside</TaskListTitle>
      </TaskListItem>,
    ),
  ).toThrow("TaskListItem must be used within TaskList");
});
