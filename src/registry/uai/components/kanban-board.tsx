"use client";

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

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

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
  style,
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
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: variant === "compact" ? "minmax(200px, 1fr)" : "minmax(240px, 1fr)",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          overflowX: "auto",
          paddingBottom: 4,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
        <p id={`${id}-instructions`} style={srOnly}>
          Press Space or Enter to pick up a card. Use arrow keys to move it between positions and
          columns. Press Space or Enter again to drop it, or Escape to cancel.
        </p>
        <div role="status" aria-live="assertive" style={srOnly}>
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
  style,
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
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          gap: board.variant === "compact" ? 6 : 8,
          padding: board.variant === "plain" ? "0 12px 0 0" : board.variant === "compact" ? 6 : 8,
          border: board.variant === "compact" ? "1px solid var(--uai-border)" : 0,
          borderRight: board.variant === "plain" ? "1px solid var(--uai-border)" : undefined,
          borderRadius: board.variant === "plain" ? 0 : board.variant === "compact" ? 12 : 14,
          background:
            board.variant === "board"
              ? "color-mix(in oklab, var(--uai-surface-raised) 70%, transparent)"
              : "transparent",
          ...style,
        }}
      >
        {children}
      </section>
    </ColumnCtx.Provider>
  );
}

export function KanbanBoardColumnHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minHeight: 28,
        paddingInline: 4,
        ...style,
      }}
    />
  );
}

export function KanbanBoardColumnTitle({ style, ...props }: ComponentProps<"h3">) {
  const column = useColumn("KanbanBoardColumnTitle");
  return (
    <h3
      {...props}
      id={column.titleId}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        margin: 0,
        fontSize: 12.5,
        lineHeight: "18px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function KanbanBoardColumnCount({ style, ...props }: ComponentProps<"span">) {
  const board = useBoard("KanbanBoardColumnCount");
  const column = useColumn("KanbanBoardColumnCount");
  const count = board.value[column.value]?.length ?? 0;
  return (
    <span
      {...props}
      style={{
        minWidth: 20,
        padding: "0 6px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-text) 7%, transparent)",
        color: "var(--uai-subtle)",
        fontSize: 11,
        lineHeight: "18px",
        fontWeight: 500,
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {count}
      <span style={srOnly}> {count === 1 ? "card" : "cards"}</span>
    </span>
  );
}

export function KanbanBoardCards({ style, ...props }: ComponentProps<"ul">) {
  const board = useBoard("KanbanBoardCards");
  const column = useColumn("KanbanBoardCards");
  if ((board.value[column.value]?.length ?? 0) === 0) return null;
  return (
    <ul
      aria-labelledby={column.titleId}
      {...props}
      style={{
        display: "grid",
        gap: board.variant === "compact" ? 6 : 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
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
  style,
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
      {...props}
      ref={(element) => board.register(value, element)}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: cards are keyboard-movable items described by the board instructions.
      tabIndex={0}
      draggable
      aria-describedby={`${board.id}-instructions`}
      aria-roledescription="movable card"
      data-grabbed={grabbed || undefined}
      className={[
        grabbed
          ? undefined
          : "shadow-[0_0_0_1px_var(--uai-border),0_1px_2px_oklch(0_0_0_/_0.06)] hover:shadow-[0_0_0_1px_var(--uai-border-strong),0_1px_2px_oklch(0_0_0_/_0.08)]",
        "[transition:box-shadow_120ms_ease-out,transform_160ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] active:cursor-grabbing motion-reduce:transition-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
      style={{
        display: "grid",
        gap: board.variant === "compact" ? 4 : 6,
        minWidth: 0,
        padding: board.variant === "compact" ? "8px 10px" : "10px 12px",
        borderRadius: board.variant === "compact" ? 8 : 10,
        background: "var(--uai-surface)",
        boxShadow: grabbed
          ? "0 0 0 1.5px var(--uai-accent), 0 12px 24px -12px oklch(0 0 0 / 0.35)"
          : undefined,
        transform: grabbed ? "scale(1.02) rotate(-0.6deg)" : undefined,
        cursor: "grab",
        ...style,
      }}
    />
  );
}

export function KanbanBoardCardTitle({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        fontSize: 13,
        lineHeight: "18px",
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function KanbanBoardCardMeta({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function KanbanBoardColumnEmpty({ style, ...props }: ComponentProps<"p">) {
  const board = useBoard("KanbanBoardColumnEmpty");
  const column = useColumn("KanbanBoardColumnEmpty");
  if ((board.value[column.value]?.length ?? 0) > 0) return null;
  return (
    <p
      {...props}
      style={{
        margin: 0,
        padding: "20px 12px",
        border: "1px dashed var(--uai-border-strong)",
        borderRadius: board.variant === "compact" ? 8 : 10,
        color: "var(--uai-subtle)",
        fontSize: 12,
        textAlign: "center",
        ...style,
      }}
    />
  );
}
