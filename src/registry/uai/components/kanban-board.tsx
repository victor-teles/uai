"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const KANBAN_BOARD_VARIANTS = ["board", "plain", "compact"] as const;
export type KanbanBoardVariant = (typeof KANBAN_BOARD_VARIANTS)[number];
/** Column id to ordered card ids. Key order defines column order. */
export type KanbanBoardValue = Record<string, string[]>;
export type KanbanBoardProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: KanbanBoardVariant;
  value?: KanbanBoardValue;
  defaultValue?: KanbanBoardValue;
  onValueChange?: (value: KanbanBoardValue) => void;
};

type BoardContext = {
  id: string;
  variant: KanbanBoardVariant;
  value: KanbanBoardValue;
  grabbed: string | null;
  labels: Map<string, string>;
  register: (id: string, element: HTMLElement | null) => void;
  move: (card: string, column: string, index: number) => void;
  onCardKeyDown: (event: KeyboardEvent<HTMLElement>, card: string) => void;
  onCardFocus: (card: string) => void;
};
const Context = createContext<BoardContext | null>(null);
function useBoard(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within KanbanBoard`);
  return context;
}
type ColumnContext = { value: string; titleId: string };
const ColumnCtx = createContext<ColumnContext | null>(null);
function useColumn(part: string) {
  const context = useContext(ColumnCtx);
  if (!context) throw new Error(`${part} must be used within KanbanBoardColumn`);
  return context;
}

const kanbanBoardVariants = cva(
  "grid min-w-0 grid-flow-col overflow-x-auto pb-1 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        board: "auto-cols-[minmax(240px,1fr)] gap-3",
        plain: "auto-cols-[minmax(240px,1fr)] gap-3",
        compact: "auto-cols-[minmax(200px,1fr)] gap-2",
      },
    },
  },
);

const kanbanBoardColumnVariants = cva("flex min-w-0 flex-col", {
  variants: {
    variant: {
      board: "gap-2 rounded-[14px] border-0 bg-muted/70 p-2",
      plain: "gap-2 rounded-none border-0 border-r bg-transparent py-0 pr-3 pl-0",
      compact: "gap-1.5 rounded-xl border bg-transparent p-1.5",
    },
  },
});

function locate(value: KanbanBoardValue, card: string) {
  for (const [column, cards] of Object.entries(value)) {
    const index = cards.indexOf(card);
    if (index !== -1) return { column, index, count: cards.length };
  }
  return null;
}

export function moveKanbanCard(
  value: KanbanBoardValue,
  card: string,
  column: string,
  index: number,
): KanbanBoardValue {
  if (!(column in value)) return value;
  const next: KanbanBoardValue = {};
  for (const [key, cards] of Object.entries(value))
    next[key] = cards.filter((item) => item !== card);
  const target = next[column] ?? [];
  target.splice(Math.max(0, Math.min(index, target.length)), 0, card);
  return next;
}

export function KanbanBoard({
  variant = "board",
  value,
  defaultValue = {},
  onValueChange,
  className,
  children,
  ...props
}: KanbanBoardProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const snapshot = useRef<KanbanBoardValue | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const labels = useRef(new Map<string, string>()).current;
  const focusTarget = useRef<string | null>(null);
  const current = value ?? internal;

  useLayoutEffect(() => {
    if (!focusTarget.current) return;
    const element = elements.current.get(focusTarget.current);
    focusTarget.current = null;
    if (element && document.activeElement !== element) element.focus();
  });

  const commit = (next: KanbanBoardValue) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const name = (key: string) => labels.get(key) ?? key;
  const position = (board: KanbanBoardValue, card: string) => {
    const spot = locate(board, card);
    if (!spot) return "";
    return `${name(spot.column)}, position ${spot.index + 1} of ${spot.count}`;
  };
  const move = (card: string, column: string, index: number) => {
    const next = moveKanbanCard(current, card, column, index);
    if (next === current) return;
    focusTarget.current = card;
    commit(next);
    setAnnouncement(`${name(card)} moved to ${position(next, card)}.`);
  };
  const drop = () => {
    if (!grabbed) return;
    setAnnouncement(`${name(grabbed)} dropped in ${position(current, grabbed)}.`);
    setGrabbed(null);
    snapshot.current = null;
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>, card: string) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (grabbed === card) return drop();
      snapshot.current = current;
      setGrabbed(card);
      setAnnouncement(
        `${name(card)} picked up in ${position(current, card)}. Use arrow keys to move, Space to drop, Escape to cancel.`,
      );
      return;
    }
    if (grabbed !== card) return;
    if (event.key === "Escape") {
      event.preventDefault();
      const original = snapshot.current ?? current;
      focusTarget.current = card;
      commit(original);
      setGrabbed(null);
      snapshot.current = null;
      setAnnouncement(`Move cancelled. ${name(card)} returned to ${position(original, card)}.`);
      return;
    }
    const spot = locate(current, card);
    if (!spot) return;
    const columns = Object.keys(current);
    const columnIndex = columns.indexOf(spot.column);
    const moves: Record<string, () => void> = {
      ArrowUp: () => spot.index > 0 && move(card, spot.column, spot.index - 1),
      ArrowDown: () => spot.index < spot.count - 1 && move(card, spot.column, spot.index + 1),
      ArrowLeft: () => columnIndex > 0 && move(card, columns[columnIndex - 1] ?? "", spot.index),
      ArrowRight: () => move(card, columns[columnIndex + 1] ?? "", spot.index),
    };
    const action = moves[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const context: BoardContext = {
    id,
    variant,
    value: current,
    grabbed,
    labels,
    register: (card, element) => {
      if (element) elements.current.set(card, element);
      else elements.current.delete(card);
    },
    move,
    onCardKeyDown,
    onCardFocus: (card) => {
      if (grabbed && grabbed !== card) drop();
    },
  };

  return (
    <Context.Provider value={context}>
      <div
        data-slot="kanban-board"
        data-variant={variant}
        className={cn(kanbanBoardVariants({ variant }), className)}
        {...props}
      >
        {children}
        <p id={`${id}-instructions`} className="sr-only">
          Press Space or Enter to pick up a card. Use arrow keys to move it between positions and
          columns. Press Space or Enter again to drop it, or Escape to cancel.
        </p>
        <div role="status" aria-live="assertive" className="sr-only">
          {announcement}
        </div>
      </div>
    </Context.Provider>
  );
}

export type KanbanBoardColumnProps = ComponentProps<"section"> & {
  value: string;
  /** Plain-text name used in keyboard announcements. */
  label: string;
};

export function KanbanBoardColumn({
  value,
  label,
  className,
  children,
  onDragOver,
  onDrop,
  ...props
}: KanbanBoardColumnProps) {
  const board = useBoard("KanbanBoardColumn");
  const titleId = `${board.id}-${value}-title`;
  board.labels.set(value, label);
  return (
    <ColumnCtx.Provider value={{ value, titleId }}>
      <section
        aria-labelledby={titleId}
        data-slot="kanban-board-column"
        className={cn(kanbanBoardColumnVariants({ variant: board.variant }), className)}
        {...props}
        data-column={value}
        onDragOver={(event) => {
          onDragOver?.(event);
          if (event.dataTransfer.types.includes("application/x-uai-kanban")) event.preventDefault();
        }}
        onDrop={(event) => {
          onDrop?.(event);
          const card = event.dataTransfer.getData("application/x-uai-kanban");
          if (!card || event.defaultPrevented) return;
          event.preventDefault();
          board.move(card, value, board.value[value]?.length ?? 0);
        }}
      >
        {children}
      </section>
    </ColumnCtx.Provider>
  );
}

export function KanbanBoardColumnHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="kanban-board-column-header"
      className={cn("flex min-h-7 items-center justify-between gap-2 px-1", className)}
      {...props}
    />
  );
}

export function KanbanBoardColumnTitle({ className, ...props }: ComponentProps<"h3">) {
  const column = useColumn("KanbanBoardColumnTitle");
  return (
    <h3
      data-slot="kanban-board-column-title"
      className={cn("m-0 flex items-center gap-1.5 text-[12.5px]/[18px] font-medium", className)}
      {...props}
      id={column.titleId}
    />
  );
}

export function KanbanBoardColumnCount({ className, ...props }: ComponentProps<"span">) {
  const board = useBoard("KanbanBoardColumnCount");
  const column = useColumn("KanbanBoardColumnCount");
  const count = board.value[column.value]?.length ?? 0;
  return (
    <span
      data-slot="kanban-board-column-count"
      className={cn(
        "min-w-5 rounded-full bg-foreground/7 px-1.5 text-center text-[11px]/[18px] font-medium text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    >
      {count}
      <span className="sr-only"> {count === 1 ? "card" : "cards"}</span>
    </span>
  );
}

export function KanbanBoardCards({ className, ...props }: ComponentProps<"ul">) {
  const board = useBoard("KanbanBoardCards");
  const column = useColumn("KanbanBoardCards");
  if ((board.value[column.value]?.length ?? 0) === 0) return null;
  return (
    <ul
      aria-labelledby={column.titleId}
      data-slot="kanban-board-cards"
      className={cn(
        "m-0 grid list-none p-0",
        board.variant === "compact" ? "gap-1.5" : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

export type KanbanBoardCardProps = ComponentProps<"li"> & {
  value: string;
  /** Plain-text name used in keyboard announcements. */
  label: string;
};

export function KanbanBoardCard({
  value,
  label,
  onKeyDown,
  onFocus,
  onDragStart,
  onDragOver,
  onDrop,
  className,
  ...props
}: KanbanBoardCardProps) {
  const board = useBoard("KanbanBoardCard");
  const column = useColumn("KanbanBoardCard");
  board.labels.set(value, label);
  const grabbed = board.grabbed === value;
  return (
    <li
      data-slot="kanban-board-card"
      className={cn(
        "grid min-w-0 cursor-grab bg-card [transition:box-shadow_120ms_ease-out,transform_160ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing motion-reduce:transition-none",
        board.variant === "compact"
          ? "gap-1 rounded-lg px-2.5 py-2"
          : "gap-1.5 rounded-[10px] px-3 py-2.5",
        grabbed
          ? "[transform:scale(1.02)_rotate(-0.6deg)] shadow-[0_0_0_1.5px_var(--primary),0_12px_24px_-12px_oklch(0_0_0/0.35)]"
          : "shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.06)] hover:shadow-[0_0_0_1px_var(--border-strong),0_1px_2px_oklch(0_0_0/0.08)]",
        className,
      )}
      {...props}
      ref={(element) => board.register(value, element)}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: cards are keyboard-movable items described by the board instructions.
      tabIndex={0}
      draggable
      aria-describedby={`${board.id}-instructions`}
      aria-roledescription="movable card"
      data-grabbed={grabbed || undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) board.onCardKeyDown(event, value);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        board.onCardFocus(value);
      }}
      onDragStart={(event) => {
        onDragStart?.(event);
        event.dataTransfer.setData("application/x-uai-kanban", value);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (event.dataTransfer.types.includes("application/x-uai-kanban")) event.preventDefault();
      }}
      onDrop={(event) => {
        onDrop?.(event);
        const card = event.dataTransfer.getData("application/x-uai-kanban");
        if (!card || event.defaultPrevented) return;
        event.preventDefault();
        event.stopPropagation();
        if (card !== value)
          board.move(card, column.value, board.value[column.value]?.indexOf(value) ?? 0);
      }}
    />
  );
}

export function KanbanBoardCardTitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="kanban-board-card-title"
      className={cn("m-0 text-[13px]/[18px] font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}

export function KanbanBoardCardMeta({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="kanban-board-card-meta"
      className={cn(
        "m-0 flex flex-wrap items-center gap-1.5 text-xs/4 text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function KanbanBoardColumnEmpty({ className, ...props }: ComponentProps<"p">) {
  const board = useBoard("KanbanBoardColumnEmpty");
  const column = useColumn("KanbanBoardColumnEmpty");
  if ((board.value[column.value]?.length ?? 0) > 0) return null;
  return (
    <p
      data-slot="kanban-board-column-empty"
      className={cn(
        "m-0 border border-dashed border-border-strong px-3 py-5 text-center text-[12px] text-subtle-foreground",
        board.variant === "compact" ? "rounded-lg" : "rounded-[10px]",
        className,
      )}
      {...props}
    />
  );
}
