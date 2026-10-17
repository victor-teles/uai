"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { Badge } from "@/components/ui/badge";
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

/** Where a pointer-dragged card would land: an index among the column's other cards. */
type DragSlot = { card: string; column: string | null; index: number; height: number };

type BoardContext = {
  id: string;
  variant: KanbanBoardVariant;
  value: KanbanBoardValue;
  grabbed: string | null;
  /** Card being dragged with the pointer, and the column under the pointer. */
  dragging: string | null;
  dropTarget: string | null;
  /** The insertion slot, or null when the card would land where it started. */
  slot: DragSlot | null;
  labels: Map<string, string>;
  register: (id: string, element: HTMLElement | null) => void;
  move: (card: string, column: string, index: number) => void;
  onCardKeyDown: (event: KeyboardEvent<HTMLElement>, card: string) => void;
  onCardFocus: (card: string) => void;
  onCardPointerDown: (event: ReactPointerEvent<HTMLElement>, card: string) => void;
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

// Fades whichever edge of the board still hides columns.
const scrollEdgeFade =
  "data-overflow-start:[mask-image:linear-gradient(to_right,transparent,black_24px)] data-overflow-end:[mask-image:linear-gradient(to_left,transparent,black_24px)] data-overflow-start:data-overflow-end:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]";
function useScrollEdges(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      element.toggleAttribute("data-overflow-start", element.scrollLeft > 1);
      element.toggleAttribute("data-overflow-end", element.scrollLeft < max - 1);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(element);
    for (const child of element.children) observer?.observe(child);
    return () => {
      element.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [ref]);
}
function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

const kanbanBoardVariants = cva(
  "grid min-w-0 grid-flow-col overflow-x-auto pb-1 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        board: "auto-cols-[minmax(266px,1fr)] gap-3",
        plain: "auto-cols-[minmax(266px,1fr)] gap-3",
        compact: "auto-cols-[minmax(220px,1fr)] gap-2",
      },
    },
  },
);

const kanbanBoardColumnVariants = cva("flex min-w-0 flex-col", {
  variants: {
    variant: {
      board:
        "gap-2 rounded-[14px] border-0 bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] p-2",
      plain: "gap-2 rounded-none border-0 border-r bg-transparent py-0 pr-3 pl-0",
      compact: "gap-1.5 rounded-xl border bg-transparent p-1.5",
    },
  },
});

/* Motion values from Designer's spec (uai-design/redesign/kanban-board/spec.md §3). */
const EASE_POP = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_QUINT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** Critically damped settle: 1.2% overshoot, inside the rubric's 2% cap. */
const EASE_SETTLE = "linear(0, 0.35 12%, 0.72 28%, 0.93 45%, 1.012 62%, 1.004 80%, 1)";
/** The lifted overlay's shadow (spec §3.2), as classes so the theme picks the alphas. */
const LIFT_SHADOW =
  "shadow-[0_0_0_1px_var(--border-strong),0_18px_36px_-12px_oklch(0_0_0/0.22),0_6px_12px_-6px_oklch(0_0_0/0.1)] dark:shadow-[0_0_0_1px_var(--border-strong),0_18px_36px_-12px_oklch(0_0_0/0.55),0_6px_12px_-6px_oklch(0_0_0/0.3)]";
const DRAG_THRESHOLD = 4;
const TOUCH_HOLD = 160;
const EDGE = 48;
const MAX_SCROLL = 12;
const REST_TILT = 0.5;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canAnimate = (element: Element) => typeof element.animate === "function";
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/**
 * The CSS zoom applied to `element` by itself and its ancestors. Rects and pointer coordinates
 * are in screen pixels; lengths set inside a zoomed subtree (translate, height) are multiplied
 * by this, so they are divided by it first.
 */
const zoomOf = (element: Element) => {
  const zoom = (element as Element & { currentCSSZoom?: number }).currentCSSZoom;
  return typeof zoom === "number" && zoom > 0 ? zoom : 1;
};
/** The vertical part of an element's `translate`, including a running FLIP animation. */
const translateY = (element: Element) => {
  const value = getComputedStyle(element).translate;
  if (!value || value === "none") return 0;
  return Number.parseFloat(value.split(" ")[1] ?? "0") || 0;
};
/** Interactive content inside a card keeps its own pointer behaviour. */
const INTERACTIVE = "a, button, input, textarea, select, label, [contenteditable=true]";

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

type Gesture = {
  card: string;
  element: HTMLElement;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  /** The card's rect at pickup, in screen pixels; the overlay is fixed here and translated. */
  rect: DOMRect;
  /** The card's CSS zoom at pickup, so the overlay renders at the card's on-screen size. */
  zoom: number;
  origin: { column: string; index: number };
  holdTimer: number;
  armed: boolean;
  overlay: HTMLElement | null;
  velocity: number;
  lastX: number;
  lastTime: number;
  moved: boolean;
  frame: number;
  reduced: boolean;
  /** Computed resting and lifted shadows, so WAAPI can interpolate between them. */
  rest: string;
  lift: string;
  settling: boolean;
  listeners: {
    move: (event: PointerEvent) => void;
    up: (event: PointerEvent) => void;
    cancel: (event: PointerEvent) => void;
    key: (event: globalThis.KeyboardEvent) => void;
  } | null;
};

export function KanbanBoard({
  variant = "board",
  value,
  defaultValue = {},
  onValueChange,
  className,
  children,
  ref,
  ...props
}: KanbanBoardProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [slot, setSlot] = useState<DragSlot | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  useScrollEdges(root);
  const [announcement, setAnnouncement] = useState("");
  const snapshot = useRef<KanbanBoardValue | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const labels = useRef(new Map<string, string>()).current;
  const focusTarget = useRef<string | null>(null);
  const current = value ?? internal;
  const latest = useRef(current);
  latest.current = current;
  /** FLIP: card rects (relative to the board) captured before a layout change. */
  const flipFrom = useRef<Map<string, DOMRect> | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const slotRef = useRef<DragSlot | null>(null);
  slotRef.current = slot;

  useLayoutEffect(() => {
    if (!focusTarget.current) return;
    const element = elements.current.get(focusTarget.current);
    focusTarget.current = null;
    if (element && document.activeElement !== element) element.focus({ preventScroll: true });
  });

  // FLIP every card whose rect changed since `armFlip`, sliding it from where it was.
  useLayoutEffect(() => {
    const before = flipFrom.current;
    flipFrom.current = null;
    if (!before || prefersReducedMotion()) return;
    for (const [card, element] of elements.current) {
      const from = before.get(card);
      if (!from || !canAnimate(element)) continue;
      const to = element.getBoundingClientRect();
      // Screen-pixel deltas, scaled into the card's own (possibly zoomed) coordinate space.
      const zoom = zoomOf(element);
      const dx = (from.left - to.left) / zoom;
      const dy = (from.top - to.top) / zoom;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      element.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], {
        duration: 200,
        easing: EASE_QUINT,
      });
    }
  });

  const armFlip = (overrides?: Map<string, DOMRect>) => {
    const rects = new Map<string, DOMRect>();
    for (const [card, element] of elements.current)
      rects.set(card, element.getBoundingClientRect());
    for (const [card, rect] of overrides ?? []) rects.set(card, rect);
    flipFrom.current = rects;
  };

  const onChange = useRef(onValueChange);
  onChange.current = onValueChange;
  const controlled = value !== undefined;
  const commit = (next: KanbanBoardValue) => {
    if (!controlled) setInternal(next);
    onChange.current?.(next);
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
    armFlip();
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
    if (event.currentTarget.getAttribute("aria-disabled") === "true") return;
    if (gesture.current?.armed) return;
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
      armFlip();
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

  /* ---------- Pointer drag: a fixed overlay follows the pointer (spec §3) ---------- */

  const setPressed = (element: HTMLElement, pressed: boolean) =>
    element.toggleAttribute("data-pressed", pressed);

  /** The column under the pointer and the gap nearest the overlay's centre. */
  const hitTest = (g: Gesture): { column: string | null; index: number } => {
    const board = root.current;
    const hit =
      typeof document.elementsFromPoint === "function"
        ? document
            .elementsFromPoint(g.x, g.y)
            .find(
              (node): node is HTMLElement =>
                node instanceof HTMLElement &&
                node.dataset.slot === "kanban-board-column" &&
                Boolean(board?.contains(node)),
            )
        : undefined;
    const column = hit?.dataset.column ?? null;
    if (!column) return { column: null, index: 0 };
    const centre = g.y - (g.startY - g.rect.top) + g.rect.height / 2;
    const others = (latest.current[column] ?? []).filter((card) => card !== g.card);
    const open = slotRef.current?.column === column ? slotRef.current : null;
    let index = 0;
    others.forEach((card, position) => {
      const element = elements.current.get(card);
      const list = element?.parentElement;
      if (!element || !list) return;
      // Everything in screen pixels, so a zoomed board measures the same as the pointer.
      // Layout position: take off any FLIP translate still running on the card.
      const zoom = zoomOf(element);
      const rect = element.getBoundingClientRect();
      let top = rect.top - translateY(element) * zoom;
      // Measure as if the open slot were not there, so the slot can't push the gap away.
      if (open && position >= open.index)
        top -= (open.height + (Number.parseFloat(getComputedStyle(list).rowGap) || 0)) * zoom;
      if (centre > top + rect.height / 2) index += 1;
    });
    return { column, index };
  };

  const updateSlot = (g: Gesture) => {
    const { column, index } = hitTest(g);
    const atOrigin = column === g.origin.column && index === g.origin.index;
    const next: DragSlot | null =
      column && !atOrigin
        ? { card: g.card, column, index, height: g.element.offsetHeight || g.rect.height / g.zoom }
        : null;
    const previous = slotRef.current;
    if (previous?.column === next?.column && previous?.index === next?.index) {
      setDropTarget(column);
      return;
    }
    armFlip();
    slotRef.current = next;
    setSlot(next);
    setDropTarget(column);
  };

  const startDrag = (g: Gesture) => {
    g.armed = true;
    setPressed(g.element, false);
    g.reduced = prefersReducedMotion();
    const overlay = g.element.cloneNode(true) as HTMLElement;
    overlay.className = cn(g.element.className, LIFT_SHADOW);
    for (const node of [overlay, ...overlay.querySelectorAll<HTMLElement>("[id]")])
      node.removeAttribute("id");
    overlay.removeAttribute("tabindex");
    overlay.removeAttribute("data-pressed");
    overlay.removeAttribute("aria-describedby");
    overlay.removeAttribute("aria-roledescription");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-slot", "kanban-board-overlay");
    const computed = getComputedStyle(g.element);
    // The overlay lives on <body>, outside any zoom on the board. It takes the card's zoom, so
    // its content renders at the card's on-screen size, and every length set on it is divided
    // by that zoom. Width and height come from layout, which zoom does not touch.
    const z = g.zoom;
    Object.assign(overlay.style, {
      position: "fixed",
      zoom: `${z / zoomOf(document.body)}`,
      left: `${g.rect.left / z}px`,
      top: `${g.rect.top / z}px`,
      width: `${g.element.offsetWidth || g.rect.width / z}px`,
      height: `${g.element.offsetHeight || g.rect.height / z}px`,
      margin: "0",
      zIndex: "50",
      pointerEvents: "none",
      boxSizing: "border-box",
      listStyle: "none",
      color: computed.color,
      font: computed.font,
      transition: g.reduced ? "none" : "rotate 120ms ease-out",
      transformOrigin: `${(g.startX - g.rect.left) / z}px ${(g.startY - g.rect.top) / z}px`,
      scale: g.reduced ? "1" : "1.03",
      rotate: g.reduced ? "0deg" : `${REST_TILT}deg`,
      opacity: g.reduced ? "0.92" : "1",
      translate: `${(g.x - g.startX) / z}px ${(g.y - g.startY) / z}px`,
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.append(overlay);
    g.overlay = overlay;
    g.rest = computed.boxShadow;
    g.lift = getComputedStyle(overlay).boxShadow;
    if (!g.reduced && canAnimate(overlay)) {
      overlay.animate(
        [
          { scale: "1", rotate: "0deg", boxShadow: g.rest },
          { scale: "1.03", rotate: `${REST_TILT}deg`, boxShadow: g.lift },
        ],
        { duration: 180, easing: EASE_POP },
      );
    }
    document.documentElement.style.setProperty("cursor", "grabbing");
    document.documentElement.style.setProperty("user-select", "none");
    window.getSelection?.()?.removeAllRanges();
    armFlip();
    setDragging(g.card);
    setDropTarget(g.origin.column);
    setAnnouncement(`${name(g.card)} picked up in ${position(latest.current, g.card)}.`);
    const tick = () => {
      const active = gesture.current;
      if (!active?.overlay || active.settling) return;
      // Ease the lean back toward rest when the pointer stops.
      if (!active.moved) active.velocity *= 0.75;
      active.moved = false;
      if (!active.reduced)
        active.overlay.style.rotate = `${clamp(REST_TILT + active.velocity * 6, -3, 3)}deg`;
      const board = root.current;
      if (board) {
        const bounds = board.getBoundingClientRect();
        const left = active.x - bounds.left;
        const right = bounds.right - active.x;
        const step =
          left < EDGE
            ? -MAX_SCROLL * (1 - left / EDGE)
            : right < EDGE
              ? MAX_SCROLL * (1 - right / EDGE)
              : 0;
        if (step !== 0 && active.y > bounds.top && active.y < bounds.bottom) {
          board.scrollLeft += step;
          updateSlot(active);
        }
      }
      active.frame = requestAnimationFrame(tick);
    };
    g.frame = requestAnimationFrame(tick);
  };

  const cleanupGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.listeners) {
      window.removeEventListener("pointermove", g.listeners.move);
      window.removeEventListener("pointerup", g.listeners.up);
      window.removeEventListener("pointercancel", g.listeners.cancel);
      window.removeEventListener("keydown", g.listeners.key, true);
      g.listeners = null;
    }
    window.clearTimeout(g.holdTimer);
    cancelAnimationFrame(g.frame);
    setPressed(g.element, false);
    document.documentElement.style.removeProperty("cursor");
    document.documentElement.style.removeProperty("user-select");
  };

  /** Animate the overlay onto `target`, then hand over to the real card in one frame. */
  const settle = (g: Gesture, target: DOMRect, done: () => void) => {
    const overlay = g.overlay;
    g.settling = true;
    const finish = () => {
      done();
      overlay?.remove();
    };
    if (!overlay || g.reduced || !canAnimate(overlay)) return finish();
    const to = `${(target.left - g.rect.left) / g.zoom}px ${(target.top - g.rect.top) / g.zoom}px`;
    const from = getComputedStyle(overlay);
    overlay.style.transition = "none";
    const animation = overlay.animate(
      [
        {
          translate: from.translate,
          scale: from.scale,
          rotate: from.rotate,
          boxShadow: from.boxShadow,
        },
        { translate: to, scale: "1", rotate: "0deg", boxShadow: g.rest },
      ],
      { duration: 300, easing: EASE_SETTLE, fill: "forwards" },
    );
    animation.onfinish = finish;
    animation.oncancel = finish;
  };

  const endDrag = (cancelled: boolean) => {
    const g = gesture.current;
    if (!g) return;
    cleanupGesture();
    if (!g.armed) return;
    // A drag is not a click on whatever sits under the pointer when it ends.
    const swallow = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener("click", swallow, true), 0);

    const target = cancelled ? null : slotRef.current;
    const board = root.current;
    const landing =
      (target && board?.querySelector<HTMLElement>('[data-slot="kanban-board-slot"]')) ||
      (target &&
        [...(board?.querySelectorAll<HTMLElement>('[data-slot="kanban-board-column"]') ?? [])]
          .find((section) => section.dataset.column === target.column)
          ?.querySelector<HTMLElement>('[data-slot="kanban-board-column-empty"]')) ||
      g.element;
    const landingRect = landing.getBoundingClientRect();
    settle(g, landingRect, () => {
      const card = g.card;
      armFlip(new Map([[card, landingRect]]));
      let rejected = false;
      flushSync(() => {
        if (target?.column) {
          const next = moveKanbanCard(latest.current, card, target.column, target.index);
          commit(next);
        }
        setSlot(null);
        slotRef.current = null;
        setDragging(null);
        setDropTarget(null);
      });
      if (target?.column) {
        const spot = locate(latest.current, card);
        rejected = spot?.column !== target.column || spot.index !== target.index;
      }
      if (rejected) {
        const element = elements.current.get(card);
        if (element && canAnimate(element) && !prefersReducedMotion())
          element.animate(
            [
              { translate: "0 0" },
              { translate: "-4px 0" },
              { translate: "4px 0" },
              { translate: "-2px 0" },
              { translate: "0 0" },
            ],
            { duration: 260, easing: "cubic-bezier(0.36, 0.07, 0.19, 0.97)", composite: "add" },
          );
        setAnnouncement(`Couldn't move ${name(card)}. It's back in ${name(g.origin.column)}.`);
      } else if (cancelled) {
        setAnnouncement(
          `Move cancelled. ${name(card)} returned to ${position(latest.current, card)}.`,
        );
      } else {
        setAnnouncement(`${name(card)} dropped in ${position(latest.current, card)}.`);
      }
    });
  };

  function onWindowMove(event: PointerEvent) {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId || g.settling) return;
    const now = event.timeStamp || performance.now();
    g.x = event.clientX;
    g.y = event.clientY;
    if (!g.armed) {
      const distance = Math.hypot(g.x - g.startX, g.y - g.startY);
      if (distance < DRAG_THRESHOLD) return;
      // On touch, moving before the hold completes is a scroll, not a drag.
      if (g.pointerType === "touch") return cleanupGesture();
      startDrag(g);
    }
    const dt = Math.max(1, now - g.lastTime);
    g.velocity = g.velocity * 0.75 + ((g.x - g.lastX) / dt) * 0.25;
    g.lastX = g.x;
    g.lastTime = now;
    g.moved = true;
    if (g.overlay)
      g.overlay.style.translate = `${(g.x - g.startX) / g.zoom}px ${(g.y - g.startY) / g.zoom}px`;
    updateSlot(g);
  }
  function onWindowUp(event: PointerEvent) {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId) return;
    if (!g.armed) return cleanupGesture();
    endDrag(slotRef.current === null && hitTest(g).column === null);
  }
  function onWindowCancel(event: PointerEvent) {
    if (gesture.current && event.pointerId === gesture.current.pointerId) endDrag(true);
  }
  function onWindowKey(event: globalThis.KeyboardEvent) {
    if (event.key !== "Escape" || !gesture.current?.armed) return;
    event.preventDefault();
    event.stopPropagation();
    endDrag(true);
  }

  const onCardPointerDown = (event: ReactPointerEvent<HTMLElement>, card: string) => {
    const element = event.currentTarget;
    if (event.button !== 0 || gesture.current || grabbed) return;
    if (element.getAttribute("aria-disabled") === "true") return;
    const inner = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
    if (inner && inner !== element && element.contains(inner)) return;
    const spot = locate(current, card);
    if (!spot) return;
    // The card owns this pointer: a pannable or sortable ancestor must not start its own drag.
    event.stopPropagation();
    const g: Gesture = {
      card,
      element,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      rect: element.getBoundingClientRect(),
      zoom: zoomOf(element),
      origin: { column: spot.column, index: spot.index },
      holdTimer: 0,
      armed: false,
      overlay: null,
      velocity: 0,
      lastX: event.clientX,
      lastTime: event.timeStamp || performance.now(),
      moved: false,
      frame: 0,
      reduced: false,
      rest: "",
      lift: "",
      settling: false,
      listeners: {
        move: onWindowMove,
        up: onWindowUp,
        cancel: onWindowCancel,
        key: onWindowKey,
      },
    };
    gesture.current = g;
    if (!prefersReducedMotion()) setPressed(element, true);
    if (event.pointerType !== "mouse") {
      g.holdTimer = window.setTimeout(() => {
        if (gesture.current === g && !g.armed) {
          startDrag(g);
          updateSlot(g);
        }
      }, TOUCH_HOLD);
    }
    window.addEventListener("pointermove", onWindowMove);
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowCancel);
    window.addEventListener("keydown", onWindowKey, true);
  };

  // Once a touch drag is armed, the page must not scroll under the finger.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const block = (event: TouchEvent) => {
      if (gesture.current?.armed) event.preventDefault();
    };
    element.addEventListener("touchmove", block, { passive: false });
    return () => element.removeEventListener("touchmove", block);
  }, []);

  // Never leave an overlay or window listener behind if the board unmounts mid-drag.
  // biome-ignore lint/correctness/useExhaustiveDependencies: unmount-only cleanup; listeners live on the gesture.
  useEffect(
    () => () => {
      gesture.current?.overlay?.remove();
      cleanupGesture();
    },
    [],
  );

  const context: BoardContext = {
    id,
    variant,
    value: current,
    grabbed,
    dragging,
    dropTarget,
    slot,
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
    onCardPointerDown,
  };

  return (
    <Context.Provider value={context}>
      <div
        data-slot="kanban-board"
        data-variant={variant}
        className={cn(kanbanBoardVariants({ variant }), scrollEdgeFade, className)}
        {...props}
        ref={(node) => {
          root.current = node;
          assignRef(ref, node);
        }}
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
        className={cn(
          kanbanBoardColumnVariants({ variant: board.variant }),
          "transition-[background-color,box-shadow] duration-150 ease-out data-drop-target:bg-accent/60 data-drop-target:inset-ring-1 data-drop-target:inset-ring-border-strong motion-reduce:transition-none",
          className,
        )}
        {...props}
        data-column={value}
        data-drop-target={(board.dragging !== null && board.dropTarget === value) || undefined}
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
      className={cn("flex h-7 items-center justify-between gap-2 px-1.5", className)}
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
  // Tick only when the count changes after the first paint.
  const first = useRef(count);
  const changed = first.current !== count;
  return (
    <Badge
      variant="secondary"
      data-slot="kanban-board-column-count"
      className={cn(
        "min-w-5 gap-0 overflow-hidden rounded-full border-0 bg-foreground/7 px-1.5 py-0 text-center text-[11px]/[18px] font-medium text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    >
      <span
        key={count}
        className={cn(
          "inline-block",
          changed &&
            "animate-in fade-in-0 slide-in-from-bottom-[3px] duration-200 ease-out-quint motion-reduce:slide-in-from-bottom-0",
        )}
      >
        {count}
      </span>
      <span className="sr-only"> {count === 1 ? "card" : "cards"}</span>
    </Badge>
  );
}

function KanbanBoardSlot({ height }: { height: number }) {
  return (
    <li
      aria-hidden="true"
      data-slot="kanban-board-slot"
      className="pointer-events-none animate-in rounded-[10px] bg-primary/8 outline-[1.5px] -outline-offset-[1.5px] outline-primary/70 outline-dashed fade-in-0 zoom-in-98 duration-160 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
      style={{ height }}
    />
  );
}

export function KanbanBoardCards({ className, children, ...props }: ComponentProps<"ul">) {
  const board = useBoard("KanbanBoardCards");
  const column = useColumn("KanbanBoardCards");
  const cards = board.value[column.value] ?? [];
  if (cards.length === 0) return null;
  const others = cards.filter((card) => card !== board.slot?.card).length;
  const slotAtEnd = board.slot?.column === column.value && board.slot.index >= others;
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
    >
      {children}
      {slotAtEnd && board.slot ? <KanbanBoardSlot height={board.slot.height} /> : null}
    </ul>
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
  onPointerDown,
  className,
  ...props
}: KanbanBoardCardProps) {
  const board = useBoard("KanbanBoardCard");
  const column = useColumn("KanbanBoardCard");
  board.labels.set(value, label);
  const grabbed = board.grabbed === value;
  const slot = board.slot;
  const before =
    slot && slot.column === column.value && slot.card !== value
      ? (board.value[column.value] ?? []).filter((card) => card !== slot.card).indexOf(value) ===
        slot.index
      : false;
  const disabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <>
      {before && slot ? <KanbanBoardSlot height={slot.height} /> : null}
      <li
        data-slot="kanban-board-card"
        className={cn(
          "grid min-w-0 cursor-grab touch-manipulation bg-card select-none",
          "transition-[box-shadow,scale,rotate,opacity,background-color] duration-[120ms,140ms,180ms,120ms,160ms] ease-out-quint motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
          "data-pressed:scale-[0.98] data-pressed:duration-100",
          "data-dragging:cursor-grabbing data-dragging:bg-foreground/4 data-dragging:shadow-[inset_0_0_0_1px_var(--border-strong)] data-dragging:*:invisible",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-55",
          board.variant === "compact"
            ? "gap-1 rounded-lg px-2.5 py-2"
            : "gap-1.5 rounded-[10px] px-3 py-2.5",
          grabbed
            ? "scale-[1.02] -rotate-[0.6deg] shadow-[0_0_0_1.5px_var(--primary),0_12px_24px_-12px_oklch(0_0_0/0.35)] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:scale-100 motion-reduce:rotate-0"
            : "shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.06)] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_0_1px_var(--border-strong),0_1px_2px_oklch(0_0_0/0.06)]",
          className,
        )}
        {...props}
        ref={(element) => board.register(value, element)}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: cards are keyboard-movable items described by the board instructions.
        tabIndex={0}
        draggable={false}
        aria-describedby={`${board.id}-instructions`}
        aria-roledescription="movable card"
        data-grabbed={grabbed || undefined}
        data-dragging={board.dragging === value || undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) board.onCardKeyDown(event, value);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          board.onCardFocus(value);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (!event.defaultPrevented && !disabled) board.onCardPointerDown(event, value);
        }}
      />
    </>
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
        "m-0 flex flex-wrap items-center gap-1.5 text-xs/4 text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function KanbanBoardColumnEmpty({ className, style, ...props }: ComponentProps<"p">) {
  const board = useBoard("KanbanBoardColumnEmpty");
  const column = useColumn("KanbanBoardColumnEmpty");
  if ((board.value[column.value]?.length ?? 0) > 0) return null;
  const isSlot = board.slot?.column === column.value;
  return (
    <p
      // As the drop slot it is as tall as the card, so the card settles onto it exactly and
      // nothing below moves when the card replaces it.
      style={isSlot && board.slot ? { minHeight: board.slot.height, ...style } : style}
      data-slot="kanban-board-column-empty"
      data-drop-slot={isSlot || undefined}
      className={cn(
        "m-0 grid min-h-[62px] place-items-center border border-dashed border-border-strong px-3 text-center text-[12.5px]/[18px] text-muted-foreground",
        "transition-[background-color,border-color,color] duration-120 ease-out motion-reduce:transition-none",
        "data-drop-slot:border-[color-mix(in_oklab,var(--primary)_70%,transparent)] data-drop-slot:bg-primary/8 data-drop-slot:text-transparent",
        board.variant === "compact" ? "rounded-lg" : "rounded-[10px]",
        className,
      )}
      {...props}
    />
  );
}
