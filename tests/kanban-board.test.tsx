import { expect, mock, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  KANBAN_BOARD_VARIANTS,
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCards,
  KanbanBoardColumn,
  KanbanBoardColumnCount,
  KanbanBoardColumnEmpty,
  KanbanBoardColumnTitle,
  type KanbanBoardValue,
  type KanbanBoardVariant,
  moveKanbanCard,
} from "@/registry/uai/components/kanban-board";

const names: Record<string, string> = { todo: "To do", doing: "Doing", a: "Alpha", b: "Beta" };

function Board({
  value,
  variant,
  onValueChange,
}: {
  value: KanbanBoardValue;
  variant?: KanbanBoardVariant;
  onValueChange?: (value: KanbanBoardValue) => void;
}) {
  return (
    <KanbanBoard variant={variant} value={value} onValueChange={onValueChange}>
      {Object.entries(value).map(([column, ids]) => (
        <KanbanBoardColumn key={column} value={column} label={names[column] ?? column}>
          <KanbanBoardColumnTitle>{names[column]}</KanbanBoardColumnTitle>
          <KanbanBoardColumnCount />
          <KanbanBoardCards>
            {ids.map((id) => (
              <KanbanBoardCard key={id} value={id} label={names[id] ?? id}>
                {names[id]}
              </KanbanBoardCard>
            ))}
          </KanbanBoardCards>
          <KanbanBoardColumnEmpty>No cards</KanbanBoardColumnEmpty>
        </KanbanBoardColumn>
      ))}
    </KanbanBoard>
  );
}

function Stateful({ onChange }: { onChange?: (value: KanbanBoardValue) => void }) {
  const [value, setValue] = useState<KanbanBoardValue>({ todo: ["a", "b"], doing: [] });
  return (
    <Board
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const cardNamed = (name: string) =>
  screen.getAllByRole("listitem").find((item) => item.textContent === name) as HTMLElement;

test("moves cards between positions and columns with the keyboard and announces it", async () => {
  const user = userEvent.setup();
  const change = mock((_value: KanbanBoardValue) => {});
  render(<Stateful onChange={change} />);
  const status = screen.getByRole("status");
  expect(screen.getByRole("region", { name: "Doing" }).textContent).toContain("No cards");
  cardNamed("Alpha").focus();
  await user.keyboard(" ");
  expect(status.textContent).toContain("Alpha picked up in To do, position 1 of 2");
  await user.keyboard("{ArrowDown}");
  expect(change).toHaveBeenLastCalledWith({ todo: ["b", "a"], doing: [] });
  expect(status.textContent).toBe("Alpha moved to To do, position 2 of 2.");
  await user.keyboard("{ArrowRight}");
  expect(change).toHaveBeenLastCalledWith({ todo: ["b"], doing: ["a"] });
  expect(document.activeElement?.textContent).toBe("Alpha");
  await user.keyboard("{Enter}");
  expect(status.textContent).toBe("Alpha dropped in Doing, position 1 of 1.");
  expect(screen.getByRole("region", { name: "Doing" }).textContent).toContain("1 card");
  expect(screen.getByRole("region", { name: "Doing" }).textContent).not.toContain("No cards");
});

test("Escape cancels a move and restores the original position", async () => {
  const user = userEvent.setup();
  render(<Stateful />);
  cardNamed("Beta").focus();
  await user.keyboard("{Enter}{ArrowRight}");
  expect(screen.getByRole("region", { name: "Doing" }).textContent).toContain("Beta");
  await user.keyboard("{Escape}");
  expect(screen.getByRole("region", { name: "To do" }).textContent).toContain("Beta");
  expect(screen.getByRole("status").textContent).toBe(
    "Move cancelled. Beta returned to To do, position 2 of 2.",
  );
  expect(document.activeElement?.textContent).toBe("Beta");
});

test("arrow keys do nothing until a card is picked up", async () => {
  const user = userEvent.setup();
  const change = mock(() => {});
  render(<Board value={{ todo: ["a"], doing: [] }} onValueChange={change} />);
  cardNamed("Alpha").focus();
  await user.keyboard("{ArrowRight}");
  expect(change).not.toHaveBeenCalled();
});

test("moveKanbanCard clamps indices and ignores unknown columns", () => {
  const value = { todo: ["a", "b"], doing: ["c"] };
  expect(moveKanbanCard(value, "a", "doing", 9)).toEqual({ todo: ["b"], doing: ["c", "a"] });
  expect(moveKanbanCard(value, "a", "missing", 0)).toBe(value);
});

test("renders every variant and guards compound children", () => {
  for (const variant of KANBAN_BOARD_VARIANTS) {
    const view = render(<Board variant={variant} value={{ todo: ["a"] }} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() =>
    render(
      <KanbanBoardColumn value="todo" label="To do">
        x
      </KanbanBoardColumn>,
    ),
  ).toThrow("KanbanBoardColumn must be used within KanbanBoard");
  expect(() =>
    render(
      <KanbanBoard defaultValue={{ todo: [] }}>
        <KanbanBoardColumnTitle>To do</KanbanBoardColumnTitle>
      </KanbanBoard>,
    ),
  ).toThrow("KanbanBoardColumnTitle must be used within KanbanBoardColumn");
});

test("marks the dragged card and the column under the pointer", async () => {
  render(<Stateful />);
  const card = screen.getByText("Alpha").closest("li") as HTMLElement;
  const doing = screen.getByRole("region", { name: "Doing" });
  const dataTransfer = {
    types: ["application/x-uai-kanban"],
    setData: () => {},
    getData: () => "a",
    effectAllowed: "all",
  };
  fireEvent.dragStart(card, { dataTransfer });
  await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  expect(card.hasAttribute("data-dragging")).toBe(true);
  fireEvent.dragEnter(doing, { dataTransfer });
  expect(doing.hasAttribute("data-drop-target")).toBe(true);
  fireEvent.dragLeave(doing, { dataTransfer, relatedTarget: null });
  expect(doing.hasAttribute("data-drop-target")).toBe(false);
  fireEvent.dragEnd(card, { dataTransfer });
  expect(card.hasAttribute("data-dragging")).toBe(false);
});
