"use client";

/**
 * "One request, whole product": a live scene that runs one request through four real
 * registry components: PromptComposer → Thinking → ApprovalCard → PixPayment.
 *
 * Everything on screen is the installed component driven by props. The scene owns one
 * clock (`t`, in ms) and derives every prop from it with `deriveFrame`, so seeking,
 * pausing, looping and the reduced-motion still are all "render at t".
 */

import "./showcase.css";

import { Pause, Play, RotateCcw } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { SegmentedControl } from "@/components/registry/preview-chrome";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card";
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
  deriveFrame,
  SCENE,
  SCENE_CHAPTERS,
  SCENE_CYCLES,
  type SceneFrame,
} from "./scene-timeline";

const PIX_CODE =
  "00020126580014br.gov.bcb.pix01367d9f0335-8dcc-4054-9bf9-0dbd61b2a4b95204000053039865406289.905802BR5912CASA AROEIRA6014BELO HORIZONTE62140510PEDIDO4821630449DE";

/* ------------------------------------------------------------------ clock */

function useSceneClock(playing: boolean) {
  const time = useRef(0);
  const cycle = useRef(0);
  const [frame, setFrame] = useState<SceneFrame>(() => deriveFrame(0));
  const [epoch, setEpoch] = useState(0);
  const [resting, setResting] = useState(false);
  const key = useRef("");

  // Publish a React frame only when the derived state changes: a few dozen renders a cycle.
  const publish = useCallback((t: number) => {
    const next = deriveFrame(t);
    const nextKey = JSON.stringify(next);
    if (nextKey === key.current) return;
    key.current = nextKey;
    setFrame(next);
  }, []);

  const seek = useCallback(
    (t: number) => {
      time.current = t;
      setResting(false);
      setEpoch((value) => value + 1);
      publish(t);
    },
    [publish],
  );

  useEffect(() => {
    if (!playing || resting) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      // Clamp long gaps (tab switch, debugger) so the scene never skips a beat.
      time.current += Math.min(64, now - last);
      last = now;
      if (time.current >= SCENE.duration) {
        cycle.current += 1;
        time.current -= SCENE.duration;
        setEpoch((value) => value + 1);
      }
      if (cycle.current >= SCENE_CYCLES - 1 && time.current >= SCENE.rest) {
        time.current = SCENE.rest;
        publish(SCENE.rest);
        setResting(true);
        return;
      }
      publish(time.current);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, resting, publish]);

  const replay = useCallback(() => {
    cycle.current = 0;
    seek(0);
  }, [seek]);

  return { frame, epoch, resting, seek, replay };
}

/* ------------------------------------------------------------------ hooks */

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

/** Visible enough to watch (≥ 50%) and the tab is in front. */
function useWatchable(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView((entry?.intersectionRatio ?? 0) >= 0.5),
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(element);
    const onVisibility = () => setVisible(document.visibilityState !== "hidden");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

function useCompact(ref: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setCompact(element.clientWidth < 760);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return compact;
}

/** True while keyboard focus is inside `ref`. A mouse click on a chapter keeps it playing. */
function useKeyboardFocusWithin(ref: RefObject<HTMLElement | null>) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onIn = (event: FocusEvent) =>
      setFocused((event.target as Element | null)?.matches(":focus-visible") ?? false);
    const onOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node | null)) setFocused(false);
    };
    element.addEventListener("focusin", onIn);
    element.addEventListener("focusout", onOut);
    return () => {
      element.removeEventListener("focusin", onIn);
      element.removeEventListener("focusout", onOut);
    };
  }, [ref]);
  return focused;
}

/* ------------------------------------------------------------------ pieces */

/** Grows its row with grid-rows (300ms), then pops the card in (180ms pop). Leaves in 160ms. */
function Beat({
  show,
  leaving,
  children,
  className,
}: {
  show: boolean;
  leaving: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className ? `uai-scene__beat ${className}` : "uai-scene__beat"}
      data-show={show || undefined}
      data-leaving={leaving || undefined}
    >
      <div className="uai-scene__beat-inner">
        {show ? <div className="uai-scene__pop">{children}</div> : null}
      </div>
    </div>
  );
}

function PixBeat({ frame, epoch }: { frame: SceneFrame; epoch: number }) {
  return (
    <Beat show={frame.pix} leaving={frame.leaving} className="uai-scene__beat--pix">
      <PixPayment
        key={`pix-${epoch}`}
        variant="compact"
        status={frame.pixStatus}
        code={PIX_CODE}
        now="2026-10-03T14:00:01-03:00"
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
    </Beat>
  );
}

/* ------------------------------------------------------------------ scene */

type SceneState = "waiting" | "playing" | "paused" | "resting" | "still";

export function LiveScene() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const watchable = useWatchable(stage);
  const compact = useCompact(stage);
  const focusHeld = useKeyboardFocusWithin(stage);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  // Start the first time the stage has been ≥ 50% visible for 200ms.
  useEffect(() => {
    if (started || !watchable || reduced) return;
    const timer = window.setTimeout(() => setStarted(true), 200);
    return () => window.clearTimeout(timer);
  }, [started, watchable, reduced]);

  const playing = !reduced && started && !paused && !focusHeld && watchable;
  const { frame: liveFrame, epoch, resting, seek, replay } = useSceneClock(playing);

  const [stillChapter, setStillChapter] = useState(SCENE_CHAPTERS.length - 1);
  const frame = reduced
    ? deriveFrame(SCENE_CHAPTERS[stillChapter]?.still ?? SCENE.rest)
    : liveFrame;
  const state: SceneState = reduced
    ? "still"
    : resting
      ? "resting"
      : playing
        ? "playing"
        : started
          ? "paused"
          : "waiting";

  const onChapter = (id: string) => {
    const index = SCENE_CHAPTERS.findIndex((chapter) => chapter.id === id);
    const chapter = SCENE_CHAPTERS[index];
    if (!chapter) return;
    if (reduced) return setStillChapter(index);
    setStarted(true);
    // Playing: run into the chapter from just before it. Held (paused or keyboard focus): show
    // the chapter's own frame, since nothing will advance to it.
    seek(playing || resting ? chapter.at : chapter.still);
  };

  const conversation = (
    <>
      <Beat show={frame.thinking} leaving={frame.leaving || (compact && frame.pix)}>
        <Thinking key={`thinking-${epoch}`} variant="card" status={frame.thinkingStatus}>
          <ThinkingTrigger
            summary={
              frame.thinkingStatus === "thinking"
                ? "Looking up order #4821 and its payment options."
                : "Order found. Your approval is needed."
            }
            duration={frame.thinkingStatus === "thinking" ? undefined : "1.8s"}
          />
          <ThinkingContent>
            {frame.activities > 0 ? (
              <ThinkingActivity type="search" query="order #4821" elapsed="0.3s">
                Found order #4821 · R$ 289,90
              </ThinkingActivity>
            ) : null}
            {frame.activities > 1 ? (
              <ThinkingActivity
                type="tool"
                tool="pix.createCharge"
                elapsed={frame.thinkingStatus === "complete" ? "1.8s" : undefined}
              >
                Drafted a Pix charge
              </ThinkingActivity>
            ) : null}
          </ThinkingContent>
        </Thinking>
      </Beat>
      <Beat show={frame.approval} leaving={frame.leaving || (compact && frame.pix)}>
        <ApprovalCard
          key={`approval-${epoch}`}
          risk="medium"
          {...(frame.approvalStatus === "submitting"
            ? { status: "submitting" as const, pendingDecision: "approved" as const }
            : { status: frame.approvalStatus })}
        >
          <ApprovalCardHeader
            title="Send a Pix charge of R$ 289,90?"
            description="Casa Aroeira gets a QR code valid for 15 minutes."
          />
          <ApprovalCardActions>
            <ApprovalCardReject />
            <ApprovalCardApprove className={frame.approvePressed ? "scale-[0.97]" : undefined}>
              Send charge
            </ApprovalCardApprove>
          </ApprovalCardActions>
        </ApprovalCard>
      </Beat>
      {compact ? <PixBeat frame={frame} epoch={epoch} /> : null}
      <div className="uai-scene__composer">
        <PromptComposer
          variant="rounded"
          value={frame.prompt}
          busy={frame.busy}
          onValueChange={() => {}}
        >
          <PromptComposerInput placeholder="Ask your store agent…" />
          <PromptComposerActions>
            <PromptComposerModelSelect models={[{ id: "fast", label: "Fast" }]} />
            <PromptComposerSubmit className={frame.submitPressed ? "scale-[0.94]" : undefined} />
          </PromptComposerActions>
        </PromptComposer>
      </div>
    </>
  );

  return (
    <figure
      className="uai-scene"
      data-compact={compact || undefined}
      data-state={state}
      data-chapter={frame.chapter}
      aria-labelledby="uai-scene-caption"
    >
      <div ref={stage} className="uai-scene__stage">
        <div className="uai-registry-specimen__marks" aria-hidden="true" />
        <p className="uai-scene__label" aria-hidden="true">
          store agent
        </p>
        {!compact ? (
          <p
            className="uai-scene__label uai-scene__label--right"
            data-show={frame.pix || undefined}
            aria-hidden="true"
          >
            customer checkout
          </p>
        ) : null}

        {/* The components play on their own, so they stay out of the tab order and the a11y tree. */}
        <div className="uai-scene__world" aria-hidden="true" inert>
          <div className="uai-scene__row" data-shifted={frame.shifted || undefined}>
            <div className="uai-scene__lane">{conversation}</div>
            {!compact ? (
              <div className="uai-scene__lane uai-scene__lane--pix">
                <PixBeat frame={frame} epoch={epoch} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="uai-scene__controls">
          <SegmentedControl
            ariaLabel="Scene chapter"
            value={frame.chapter}
            onChange={onChapter}
            options={SCENE_CHAPTERS.map((chapter) => ({
              id: chapter.id,
              // Phones drop the numerals so the pill and the pause button fit in 358px.
              label: compact ? chapter.label : `${chapter.id} ${chapter.label}`,
            }))}
          />
          {reduced ? null : (
            // WCAG 2.2.2: the scene moves for more than 5s, so it can be paused.
            <button
              type="button"
              className="uai-icon-button uai-scene__toggle"
              onClick={() => (resting ? replay() : setPaused((value) => !value))}
              aria-label={
                resting ? "Replay the scene" : paused ? "Play the scene" : "Pause the scene"
              }
            >
              {resting ? (
                <RotateCcw aria-hidden="true" />
              ) : paused ? (
                <Play aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
      <figcaption id="uai-scene-caption" className="sr-only">
        One request to charge order #4821 moves through four Uai components: Prompt Composer sends
        it, Thinking logs the lookup, Approval Card asks before the charge, and Pix Payment shows
        the QR code until it is paid.
      </figcaption>
    </figure>
  );
}
