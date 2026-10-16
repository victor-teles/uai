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

function withReducedMotion() {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

function pointUnder(element: () => Element | null) {
  const original = document.elementsFromPoint;
  document.elementsFromPoint = (() => {
    const hit = element();
    return hit ? [hit] : [];
  }) as typeof document.elementsFromPoint;
  return () => {
    document.elementsFromPoint = original;
  };
}

const pointer = { pointerId: 1, pointerType: "mouse", button: 0 };

test("drags a card with the pointer onto another column through a lifted overlay", () => {
  const restoreMotion = withReducedMotion();
  const change = mock((_value: KanbanBoardValue) => {});
  render(<Stateful onChange={change} />);
  const doing = screen.getByRole("region", { name: "Doing" });
  const restorePoint = pointUnder(() => doing);
  const card = cardNamed("Alpha");
  try {
    fireEvent.pointerDown(card, { ...pointer, clientX: 10, clientY: 10 });
    // Under the 4px threshold it is still a click.
    fireEvent.pointerMove(window, { ...pointer, clientX: 12, clientY: 11 });
    expect(document.querySelector("[data-slot=kanban-board-overlay]")).toBeNull();
    fireEvent.pointerMove(window, { ...pointer, clientX: 200, clientY: 14 });
    const overlay = document.querySelector("[data-slot=kanban-board-overlay]");
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(overlay?.hasAttribute("tabindex")).toBe(false);
    expect(card.hasAttribute("data-dragging")).toBe(true);
    expect(doing.hasAttribute("data-drop-target")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe(
      "Alpha picked up in To do, position 1 of 2.",
    );
    // The empty column becomes the insertion slot.
    expect(
      doing.querySelector("[data-slot=kanban-board-column-empty]")?.hasAttribute("data-drop-slot"),
    ).toBe(true);
    act(() => {
      fireEvent.pointerUp(window, { ...pointer, clientX: 200, clientY: 14 });
    });
    expect(change).toHaveBeenLastCalledWith({ todo: ["b"], doing: ["a"] });
    expect(document.querySelector("[data-slot=kanban-board-overlay]")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Alpha dropped in Doing, position 1 of 1.");
    expect(cardNamed("Alpha").hasAttribute("data-dragging")).toBe(false);
  } finally {
    restorePoint();
    restoreMotion();
  }
});

test("Escape cancels a pointer drag and a press without movement stays a click", () => {
  const restoreMotion = withReducedMotion();
  const change = mock((_value: KanbanBoardValue) => {});
  render(<Stateful onChange={change} />);
  const restorePoint = pointUnder(() => screen.getByRole("region", { name: "Doing" }));
  try {
    const card = cardNamed("Beta");
    fireEvent.pointerDown(card, { ...pointer, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 1, clientY: 1 });
    expect(document.querySelector("[data-slot=kanban-board-overlay]")).toBeNull();

    fireEvent.pointerDown(card, { ...pointer, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 80, clientY: 0 });
    expect(document.querySelector("[data-slot=kanban-board-overlay]")).not.toBeNull();
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(document.querySelector("[data-slot=kanban-board-overlay]")).toBeNull();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe(
      "Move cancelled. Beta returned to To do, position 2 of 2.",
    );
  } finally {
    restorePoint();
    restoreMotion();
  }
});

test("announces and restores a move the consumer rejects", () => {
  const restoreMotion = withReducedMotion();
  const change = mock((_value: KanbanBoardValue) => {});
  render(<Board value={{ todo: ["a"], doing: [] }} onValueChange={change} />);
  const restorePoint = pointUnder(() => screen.getByRole("region", { name: "Doing" }));
  try {
    fireEvent.pointerDown(cardNamed("Alpha"), { ...pointer, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 90, clientY: 0 });
    act(() => {
      fireEvent.pointerUp(window, { ...pointer, clientX: 90, clientY: 0 });
    });
    expect(change).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("region", { name: "To do" }).textContent).toContain("Alpha");
    expect(screen.getByRole("status").textContent).toBe("Couldn't move Alpha. It's back in To do.");
  } finally {
    restorePoint();
    restoreMotion();
  }
});

test("disabled cards cannot be picked up", async () => {
  const user = userEvent.setup();
  render(
    <KanbanBoard defaultValue={{ todo: ["a"] }}>
      <KanbanBoardColumn value="todo" label="To do">
        <KanbanBoardCards>
          <KanbanBoardCard value="a" label="Alpha" aria-disabled="true">
            Alpha
          </KanbanBoardCard>
        </KanbanBoardCards>
      </KanbanBoardColumn>
    </KanbanBoard>,
  );
  const card = cardNamed("Alpha");
  fireEvent.pointerDown(card, { ...pointer, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(window, { ...pointer, clientX: 80, clientY: 0 });
  expect(document.querySelector("[data-slot=kanban-board-overlay]")).toBeNull();
  card.focus();
  await user.keyboard(" ");
  expect(screen.getByRole("status").textContent).toBe("");
});
