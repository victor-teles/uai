"use client";

/**
 * "Best of Uai": eight featured tiles on the overview. Each tile renders the real registry
 * component inside a specimen and plays its signature interaction once when it scrolls into
 * view, then rests on its most informative state. Every prop is derived from one demo clock
 * (`t`, in ms), so the rest frame, the reduced-motion still and replays are all "render at t".
 */

import "./showcase.css";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AgentRunPreview } from "@/components/registry/ai-blocks/agent-run-preview";
import {
  getRegistryItem,
  getRegistryPosition,
  type RegistryItemId,
} from "@/components/registry/catalog";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card";
import {
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
} from "@/components/ui/uai/coupon-field";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCardMeta,
  KanbanBoardCards,
  KanbanBoardCardTitle,
  KanbanBoardColumn,
  KanbanBoardColumnCount,
  KanbanBoardColumnEmpty,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  type KanbanBoardValue,
} from "@/components/ui/uai/kanban-board";
import {
  PixPayment,
  PixPaymentAmount,
  PixPaymentBody,
  PixPaymentCode,
  PixPaymentCountdown,
  PixPaymentDetails,
  PixPaymentHeader,
  PixPaymentQrCode,
  PixPaymentStatusBadge,
  PixPaymentTitle,
} from "@/components/ui/uai/pix-payment";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking";
import {
  UnsavedChangesBar,
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  UnsavedChangesBarSave,
} from "@/components/ui/uai/unsaved-changes-bar";
import { NumberTick } from "@/lib/uai-number-tick";

/* ------------------------------------------------------------------ demos */

type DemoProps = {
  t: number;
  epoch: number;
  narrow: boolean;
  /** The tile's clock is running (in a play slot, on screen, tab visible). */
  playing: boolean;
  /** Reduced motion: render the rest frame only. */
  still: boolean;
};
type Demo = {
  id: RegistryItemId;
  /** Length of the signature interaction; the tile rests on `render(duration)`. */
  duration: number;
  /** Natural width of the specimen content before the tile scales it. */
  width: number;
  /** Natural width when the tile is narrow (phones): wide items switch to a denser layout. */
  narrowWidth?: number;
  /** Spans both columns (blocks and boards). */
  wide?: boolean;
  /** Upper bound for the fit zoom, for tall items. */
  maxZoom?: number;
  /**
   * Narrow tiles lay this item out at the specimen's real width instead of zooming it down.
   * For pointer-driven items (the kanban drag) whose text would otherwise shrink below reading
   * size.
   */
  narrowFill?: boolean;
  /** What the demo shows (docs and tests only; the tile shows the catalog description). */
  onView: string;
  render: (props: DemoProps) => ReactNode;
};

const between = (t: number, from: number, to: number) => t >= from && t < to;
const typed = (text: string, t: number, start: number, msPerChar: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - start) / msPerChar))));

/** `APPROVAL_STEP` in agent-run-preview.tsx: the run waits for a decision there. */
const AGENT_RUN_APPROVAL_STEP = 4;
const COMPOSER_TEXT = "Draft a reply to Ana about her refund";
const PIX_CODE =
  "00020126580014br.gov.bcb.pix01367d9f0335-8dcc-4054-9bf9-0dbd61b2a4b95204000053039865406289.905802BR5912CASA AROEIRA6014BELO HORIZONTE62140510PEDIDO4821630449DE";

const KANBAN_CARDS: Record<string, { title: string; tag: string; tone: string; due: string }> = {
  "OPS-121": {
    title: "Migrate invoices to the new ledger",
    tag: "Billing",
    tone: "bg-success/14 text-success-ink",
    due: "Due Oct 9",
  },
  "OPS-124": {
    title: "Fix CSV export for archived rows",
    tag: "Data",
    tone: "bg-warning/14 text-warning-ink",
    due: "Due Oct 1",
  },
  "OPS-112": {
    title: "Rotate staging API keys",
    tag: "Security",
    tone: "bg-destructive/14 text-destructive-ink",
    due: "Due Oct 3",
  },
  "OPS-118": {
    title: "Document the on-call handoff",
    tag: "Support",
    tone: "bg-primary/14 text-primary-ink",
    due: "No due date",
  },
};

export const FEATURED: readonly Demo[] = [
  {
    id: "prompt-composer",
    duration: 3000,
    width: 440,
    narrowWidth: 340,
    onView: "Types, sends, and swaps send for stop",
    render: ({ t }) => (
      <PromptComposer
        variant="rounded"
        value={typed(COMPOSER_TEXT, t, 250, 34)}
        busy={between(t, 1740, 3000)}
        onValueChange={() => {}}
      >
        <PromptComposerInput placeholder="Write a message…" />
        <PromptComposerActions>
          <PromptComposerModelSelect models={[{ id: "your-model", label: "Your model" }]} />
          <PromptComposerSubmit className={between(t, 1600, 1740) ? "scale-[0.94]" : undefined} />
        </PromptComposerActions>
      </PromptComposer>
    ),
  },
  {
    id: "thinking",
    duration: 2300,
    width: 420,
    narrowWidth: 360,
    maxZoom: 0.8,
    onView: "Logs each step, then settles on the result",
    render: ({ t, epoch }) => {
      const done = t >= 2100;
      return (
        <Thinking key={epoch} status={done ? "complete" : "thinking"}>
          <ThinkingTrigger
            summary={
              done
                ? "The component contract is ready to review."
                : "Checking the interface and useful states."
            }
            duration={done ? "2.1s" : undefined}
          />
          <ThinkingContent>
            {t >= 300 ? (
              <ThinkingActivity type="search" query="Thinking accessibility" elapsed="0.3s">
                Found the component contract
              </ThinkingActivity>
            ) : null}
            {t >= 900 ? (
              <ThinkingActivity type="file" path="thinking.tsx" elapsed="0.9s">
                Read the public interface
              </ThinkingActivity>
            ) : null}
            {t >= 1500 ? (
              <ThinkingActivity
                type="tool"
                tool="registry:build"
                elapsed={done ? "2.1s" : undefined}
              >
                Checked the registry output
              </ThinkingActivity>
            ) : null}
          </ThinkingContent>
        </Thinking>
      );
    },
  },
  {
    id: "agent-run",
    duration: 4200,
    width: 860,
    narrowWidth: 420,
    wide: true,
    onView: "Steps stream in and the run waits for approval",
    // The catalog preview scripts the run itself: it holds while the tile's clock is stopped, and
    // reduced motion mounts it already waiting at the approval.
    render: ({ epoch, narrow, playing, still }) => (
      <AgentRunPreview
        key={`${epoch}-${narrow}`}
        variant={narrow ? "compact" : "split"}
        playing={playing}
        initialStep={still ? AGENT_RUN_APPROVAL_STEP : 0}
      />
    ),
  },
  {
    id: "approval-card",
    duration: 2200,
    width: 400,
    narrowWidth: 340,
    onView: "Approve, Approving…, Approved",
    render: ({ t, epoch }) => {
      const state =
        t < 1040
          ? ({ status: "ready" } as const)
          : t < 1940
            ? ({ status: "submitting", pendingDecision: "approved" } as const)
            : ({ status: "approved" } as const);
      return (
        <ApprovalCard key={epoch} risk="low" {...state}>
          <ApprovalCardHeader
            title="Archive 3 resolved conversations?"
            description="They remain searchable and can be restored later."
          />
          <ApprovalCardActions>
            <ApprovalCardReject />
            <ApprovalCardApprove className={between(t, 900, 1040) ? "scale-[0.97]" : undefined} />
          </ApprovalCardActions>
        </ApprovalCard>
      );
    },
  },
  {
    id: "pix-payment",
    duration: 2200,
    width: 560,
    narrowWidth: 340,
    maxZoom: 0.8,
    onView: "Pending with a live countdown, then Pago",
    render: ({ t, epoch, narrow }) => (
      <PixPayment
        key={epoch}
        variant={narrow ? "compact" : "card"}
        status={t >= 1800 ? "paid" : "pending"}
        code={PIX_CODE}
        now="2026-10-03T14:00:00-03:00"
        expiresAt="2026-10-03T14:15:00-03:00"
      >
        <PixPaymentHeader>
          <div>
            <PixPaymentTitle>Pedido #4821 · Casa Aroeira</PixPaymentTitle>
            <PixPaymentAmount value={289.9} />
          </div>
          <PixPaymentStatusBadge />
        </PixPaymentHeader>
        <PixPaymentBody>
          <PixPaymentQrCode>
            {/* biome-ignore lint/performance/noImgElement: the QR comes from the payment provider */}
            <img src="/brazil/pix-qr.svg" alt="QR Code Pix do pedido #4821" />
          </PixPaymentQrCode>
          <PixPaymentDetails>
            <PixPaymentCode />
            <PixPaymentCountdown />
          </PixPaymentDetails>
        </PixPaymentBody>
      </PixPayment>
    ),
  },
  {
    id: "kanban-board",
    duration: 1900,
    width: 860,
    narrowFill: true,
    wide: true,
    onView: "A card lifts, opens a slot, and settles",
    render: ({ t, epoch, narrow, playing }) => (
      <KanbanDemo key={`${epoch}-${narrow}`} t={t} narrow={narrow} playing={playing} />
    ),
  },
  {
    id: "coupon-field",
    duration: 2300,
    width: 360,
    onView: "Checks the code, applies it, ticks the total",
    render: ({ t, epoch }) => <CouponDemo key={epoch} t={t} />,
  },
  {
    id: "unsaved-changes-bar",
    duration: 4300,
    width: 420,
    narrowWidth: 340,
    onView: "Save, Saving…, Saved, then back on the next edit",
    render: ({ t, epoch }) => <UnsavedDemo key={epoch} t={t} />,
  },
];

const COLUMN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  progress: "In progress",
  review: "In review",
};

/** The ghost drag needs the board's hit-testing from pointer-down until the card has settled. */
const KANBAN_HIT_TEST: readonly [number, number] = [250, 1600];

/**
 * The specimen stays `inert` for the whole drag, so nothing in it can ever take focus. Inert nodes
 * are skipped by hit-testing, though, and the board finds the column under the pointer with
 * `document.elementsFromPoint`. While the scripted drag runs, this adds the demo board's own
 * columns under the point to that result. Real pointers never reach the board: the tile's
 * stretched link covers it.
 */
function useDemoColumnHitTest(root: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const board = root.current;
    if (!active || !board) return;
    const hadOwn = Object.hasOwn(document, "elementsFromPoint");
    const native = document.elementsFromPoint;
    const patched = (x: number, y: number) => {
      const columns = [
        ...board.querySelectorAll<HTMLElement>("[data-slot='kanban-board-column']"),
      ].filter((column) => {
        const rect = column.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      });
      return [...columns, ...native.call(document, x, y)];
    };
    document.elementsFromPoint = patched;
    return () => {
      if (document.elementsFromPoint !== patched) return;
      if (hadOwn) document.elementsFromPoint = native;
      else Reflect.deleteProperty(document, "elementsFromPoint");
    };
  }, [root, active]);
}

function KanbanDemo({ t, narrow, playing }: { t: number; narrow: boolean; playing: boolean }) {
  // Mounted at rest (reduced motion, stills): start where the drag would have left the board.
  const [value, setValue] = useState<KanbanBoardValue>(() =>
    t >= 1180
      ? { backlog: ["OPS-112", "OPS-118"], progress: ["OPS-124"], review: ["OPS-121"] }
      : { backlog: ["OPS-112", "OPS-118"], progress: ["OPS-121", "OPS-124"], review: [] },
  );
  // Phones show the two columns the card travels between.
  const columns = narrow
    ? (["progress", "review"] as const)
    : (["backlog", "progress", "review"] as const);
  const root = useRef<HTMLDivElement>(null);
  const phase = useRef<"idle" | "down" | "up">(t >= 1180 ? "up" : "idle");
  const path = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  useDemoColumnHitTest(root, playing && t >= KANBAN_HIT_TEST[0] && t < KANBAN_HIT_TEST[1]);

  // A "ghost drag": real PointerEvents on the real card, so the lift, slot, FLIP and settle are
  // the component's own (kanban-board.tsx:623-690). No cursor is drawn.
  useEffect(() => {
    const board = root.current;
    if (!board) return;
    const card = board.querySelectorAll<HTMLElement>("[data-slot='kanban-board-card']")[
      narrow ? 0 : 2
    ];
    // Dispatched outside React's commit (the board flushSyncs on drop).
    const fire = (target: EventTarget, type: string, x: number, y: number) =>
      queueMicrotask(() =>
        target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            pointerId: 7,
            pointerType: "mouse",
            button: 0,
            buttons: type === "pointerup" ? 0 : 1,
            isPrimary: true,
          }),
        ),
      );
    if (phase.current === "idle" && t >= 300 && card) {
      const from = card.getBoundingClientRect();
      const lane = board.querySelectorAll<HTMLElement>("[data-slot='kanban-board-column']")[
        narrow ? 1 : 2
      ];
      // Aim at where the card will actually land: the review column's empty slot. The pointer
      // keeps its grip on the card, so moving it by the slot's offset puts the lifted card
      // right on the slot and the settle is only the scale and tilt easing out.
      const to =
        lane
          ?.querySelector<HTMLElement>("[data-slot='kanban-board-column-empty']")
          ?.getBoundingClientRect() ?? from;
      const x0 = from.left + from.width * 0.4;
      const y0 = from.top + from.height * 0.5;
      path.current = { x0, y0, x1: x0 + to.left - from.left, y1: y0 + to.top - from.top };
      fire(card, "pointerdown", path.current.x0, path.current.y0);
      phase.current = "down";
    }
    if (phase.current === "down" && path.current) {
      const p = Math.min(1, Math.max(0, (t - 340) / 640));
      const e = 1 - (1 - p) ** 3;
      const { x0, y0, x1, y1 } = path.current;
      fire(window, "pointermove", x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
      if (t >= 1180) {
        fire(window, "pointerup", x1, y1);
        phase.current = "up";
      }
    }
  }, [t, narrow]);

  return (
    <div ref={root}>
      <KanbanBoard
        variant={narrow ? "compact" : "board"}
        // Phones: the two columns share the tile's real width, unzoomed.
        className={narrow ? "auto-cols-[minmax(0,1fr)]" : undefined}
        value={Object.fromEntries(columns.map((column) => [column, value[column] ?? []]))}
        onValueChange={(next) => setValue((current) => ({ ...current, ...next }))}
      >
        {columns
          .map((column) => [column, value[column] ?? []] as const)
          .map(([column, ids]) => (
            <KanbanBoardColumn key={column} value={column} label={COLUMN_LABELS[column] ?? column}>
              <KanbanBoardColumnHeader>
                <KanbanBoardColumnTitle>{COLUMN_LABELS[column] ?? column}</KanbanBoardColumnTitle>
                <KanbanBoardColumnCount />
              </KanbanBoardColumnHeader>
              <KanbanBoardCards>
                {ids.map((id) => {
                  const card = KANBAN_CARDS[id];
                  if (!card) return null;
                  return (
                    <KanbanBoardCard key={id} value={id} label={card.title}>
                      <KanbanBoardCardTitle>{card.title}</KanbanBoardCardTitle>
                      <KanbanBoardCardMeta>
                        <span
                          className={`rounded-[6px] px-1.5 text-[11px]/[18px] font-medium ${card.tone}`}
                        >
                          {card.tag}
                        </span>
                        <span>{id}</span>
                        <span>{card.due}</span>
                      </KanbanBoardCardMeta>
                    </KanbanBoardCard>
                  );
                })}
              </KanbanBoardCards>
              <KanbanBoardColumnEmpty>Nothing waiting for review.</KanbanBoardColumnEmpty>
            </KanbanBoardColumn>
          ))}
      </KanbanBoard>
    </div>
  );
}

function CouponDemo({ t }: { t: number }) {
  const draft = typed("WELCOME20", t, 300, 70);
  const status = t < 1240 ? "idle" : t < 1940 ? "applying" : "applied";
  const applied = status === "applied";
  return (
    <div className="w-full">
      <CouponField
        status={status}
        appliedCode={applied ? "WELCOME20" : undefined}
        value={draft}
        onValueChange={() => {}}
      >
        <CouponFieldLabel>Discount code</CouponFieldLabel>
        <CouponFieldControl>
          <CouponFieldInput />
          <CouponFieldApply className={between(t, 1100, 1240) ? "scale-[0.97]" : undefined} />
        </CouponFieldControl>
        <CouponFieldFeedback>
          <CouponFieldMessage>
            {status === "applying"
              ? "Checking this code…"
              : applied
                ? "WELCOME20 applied · 20% off this order"
                : "Add a code before you check out."}
          </CouponFieldMessage>
          <CouponFieldRemove />
        </CouponFieldFeedback>
      </CouponField>
      <dl className="mt-4 space-y-2 border-t border-[color-mix(in_oklab,var(--border)_60%,transparent)] pt-3 text-[12px] leading-4 tabular-nums">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd>$90.00</dd>
        </div>
        <div className="flex justify-between pt-1 text-sm font-medium">
          <dt>Total</dt>
          <dd>
            <NumberTick value={applied ? "$72.00" : "$90.00"} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function UnsavedDemo({ t }: { t: number }) {
  const draft = t < 3800 ? "Product studio" : "Product studio HQ";
  const saved = t < 2240 ? "Product workspace" : "Product studio";
  const status = between(t, 1340, 2240) ? "saving" : "idle";
  return (
    <div className="grid w-full gap-4">
      <FormField value={draft} onValueChange={() => {}} disabled={status === "saving"}>
        <FormFieldLabel>Workspace name</FormFieldLabel>
        <FormFieldInput name="workspace" />
      </FormField>
      <UnsavedChangesBar
        variant="floating"
        dirty={draft !== saved}
        status={status}
        warnBeforeUnload={false}
      >
        <UnsavedChangesBarMessage />
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave className={between(t, 1200, 1340) ? "scale-[0.97]" : undefined} />
        </UnsavedChangesBarActions>
      </UnsavedChangesBar>
    </div>
  );
}

/* ------------------------------------------------------------------ playback */

/** At most two tiles play at once; the rest queue in reading order. */
const MAX_PLAYING = 2;
type Director = {
  request: (id: string, order: number) => void;
  release: (id: string) => void;
  active: string[];
};
const DirectorContext = createContext<Director | null>(null);

function useDirector() {
  const [queue, setQueue] = useState<{ id: string; order: number }[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const request = useCallback((id: string, order: number) => {
    setQueue((items) =>
      items.some((item) => item.id === id)
        ? items
        : [...items, { id, order }].sort((a, b) => a.order - b.order),
    );
  }, []);
  // Unchanged state keeps its identity, so releasing a tile that holds nothing re-renders nothing.
  const release = useCallback((id: string) => {
    setActive((items) => (items.includes(id) ? items.filter((item) => item !== id) : items));
    setQueue((items) =>
      items.some((item) => item.id === id) ? items.filter((item) => item.id !== id) : items,
    );
  }, []);
  useEffect(() => {
    if (active.length >= MAX_PLAYING) return;
    const next = queue.find((item) => !active.includes(item.id));
    if (next) setActive((items) => [...items, next.id]);
  }, [queue, active]);
  return useMemo(() => ({ request, release, active }), [request, release, active]);
}

/** Specimen width; the tile fits the component with CSS zoom (not transform) so pointer maths stay true. */
function useSpecimenWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useDocumentVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

type TileState = "waiting" | "playing" | "paused" | "rest";

function FeaturedTile({ demo, order, still }: { demo: Demo; order: number; still: boolean }) {
  const item = getRegistryItem(demo.id);
  const director = useContext(DirectorContext);
  const ref = useRef<HTMLLIElement>(null);
  const [t, setT] = useState(still ? demo.duration : 0);
  const [epoch, setEpoch] = useState(0);
  const [played, setPlayed] = useState(still);
  const [inView, setInView] = useState(false);
  const visible = useDocumentVisible();
  const time = useRef(0);
  const slotted = !!director?.active.includes(demo.id);
  // The clock runs only while this tile holds a play slot, is on screen, and the tab is visible.
  const running = slotted && inView && visible;
  const specimen = useRef<HTMLDivElement>(null);
  const specimenWidth = useSpecimenWidth(specimen);
  const narrow = specimenWidth > 0 && specimenWidth < 560;
  const natural = narrow ? (demo.narrowWidth ?? demo.width) : demo.width;
  const width = narrow && demo.narrowFill ? specimenWidth - 48 : natural;
  const zoom = specimenWidth ? Math.min(demo.maxZoom ?? 1, (specimenWidth - 48) / width) : 1;
  const state: TileState =
    played && !slotted ? "rest" : running ? "playing" : slotted || t > 0 ? "paused" : "waiting";

  useEffect(() => {
    const element = ref.current;
    if (!element || still) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView((entry?.intersectionRatio ?? 0) >= 0.6),
      { threshold: [0, 0.6] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [still]);

  // In view: queue the one play. Out of view: give the slot back so a tile on screen can use
  // it; this tile keeps its `t` and resumes from there when it scrolls back in.
  useEffect(() => {
    if (played || still) return;
    if (inView) director?.request(demo.id, order);
    else director?.release(demo.id);
  }, [inView, played, still, director, demo.id, order]);

  // Off screen or on a hidden tab the clock stops, and resumes from the same `t`.
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      time.current = Math.min(demo.duration, time.current + Math.min(64, now - last));
      last = now;
      setT(time.current);
      if (time.current >= demo.duration) {
        setPlayed(true);
        director?.release(demo.id);
        return;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [running, demo.duration, demo.id, director]);

  const replayTimer = useRef<number | null>(null);
  const replay = () => {
    if (still || slotted || !played) return;
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    // Debounced so a pointer sweeping across the grid doesn't restart every tile.
    replayTimer.current = window.setTimeout(() => {
      time.current = 0;
      setT(0);
      setEpoch((value) => value + 1);
      setPlayed(false);
      director?.request(demo.id, -1);
    }, 300);
  };
  const cancelReplay = () => {
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
  };
  useEffect(
    () => () => {
      if (replayTimer.current) window.clearTimeout(replayTimer.current);
    },
    [],
  );

  if (!item) return null;
  const Icon = item.icon;
  return (
    <li
      ref={ref}
      className="uai-feature"
      data-id={demo.id}
      data-state={state}
      data-playing={running || undefined}
      data-wide={demo.wide || undefined}
      onPointerEnter={(event) => event.pointerType === "mouse" && replay()}
      onPointerLeave={cancelReplay}
    >
      {/* The live component sits outside the link and is inert: it plays on its own and nothing
          inside it can ever take focus. The link is the tile's only tab stop. */}
      <div ref={specimen} className="uai-feature__specimen" aria-hidden="true" inert>
        <span className="uai-feature__marks">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="uai-feature__playing">playing</span>
        <div className="uai-feature__world" style={{ width, zoom: Math.min(1, zoom) }}>
          {demo.render({ t, epoch, narrow, playing: running, still })}
        </div>
      </div>
      <div className="uai-feature__meta">
        <Icon aria-hidden="true" />
        <span className="uai-feature__number">{getRegistryPosition(demo.id).number}</span>
        {/* Stretched link: its ::after covers the whole tile. */}
        <Link
          href={`/components/${demo.id}`}
          className="uai-feature__link"
          aria-describedby={`uai-feature-${demo.id}`}
          onFocus={(event) => event.currentTarget.matches(":focus-visible") && replay()}
          onBlur={cancelReplay}
        >
          {item.name}
        </Link>
        <span className="uai-feature__category">{item.category}</span>
        <ArrowUpRight aria-hidden="true" className="uai-feature__arrow" />
      </div>
      <p className="uai-feature__description" id={`uai-feature-${demo.id}`}>
        {item.description}
      </p>
    </li>
  );
}

export function FeaturedTiles({ still: forceStill = false }: { still?: boolean }) {
  const director = useDirector();
  const reduced = usePrefersReducedMotion();
  const still = forceStill || reduced;
  return (
    <section className="uai-doc__section uai-featured" aria-labelledby="uai-featured-title">
      <div className="uai-doc__section-head">
        <h2 id="uai-featured-title">Best of Uai</h2>
        <span className="uai-doc__count">8</span>
      </div>
      <DirectorContext.Provider value={director}>
        <ul className="uai-featured__grid">
          {FEATURED.map((demo, index) => (
            <FeaturedTile key={`${demo.id}-${still}`} demo={demo} order={index} still={still} />
          ))}
        </ul>
      </DirectorContext.Provider>
    </section>
  );
}
