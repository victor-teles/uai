"use client";

import { cva } from "class-variance-authority";
import { Check, LoaderCircle, Mic, MicOff, TriangleAlert, X } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const VOICE_INPUT_VARIANTS = ["inline", "pill", "compact"] as const;
export const VOICE_INPUT_STATUSES = [
  "idle",
  "requesting",
  "recording",
  "transcribing",
  "denied",
  "error",
] as const;
export type VoiceInputVariant = (typeof VOICE_INPUT_VARIANTS)[number];
export type VoiceInputState = (typeof VOICE_INPUT_STATUSES)[number];

export type VoiceInputProps = ComponentProps<"div"> & {
  variant?: VoiceInputVariant;
  status?: VoiceInputState;
  /** Latest input level, 0–1. Prefer `getLevel` to avoid a React render per sample. */
  level?: number;
  /** Read on every animation frame while recording; return the current level, 0–1. */
  getLevel?: () => number;
  /** Seconds recorded so far. */
  elapsed?: number;
  /**
   * The range of the composer text your transcript just added, as `[start, end]`. A new
   * array washes that range, moves the caret to its end, and announces the word count.
   */
  insertedRange?: readonly [number, number];
  onStart?: () => void;
  onCancel?: () => void;
  onFinish?: () => void;
  onRetry?: () => void;
  /** Shown in the tooltip and exposed with aria-keyshortcuts. Only Alt+Space is wired. */
  shortcut?: string;
};

type VoiceInputContextValue = {
  id: string;
  variant: VoiceInputVariant;
  status: VoiceInputState;
  active: boolean;
  elapsed: number;
  shortcut: string;
  insertedRange?: readonly [number, number];
  readLevel: () => number;
  onStart?: () => void;
  onCancel: () => void;
  onFinish?: () => void;
  onRetry?: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const VoiceInputContext = createContext<VoiceInputContextValue | null>(null);

function useVoiceInput(part: string) {
  const context = useContext(VoiceInputContext);
  if (!context) throw new Error(`${part} must be used within VoiceInput`);
  return context;
}

const BAR_COUNT = 64;
const EASE_POP = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_OUT_QUINT = "cubic-bezier(0.23, 1, 0.32, 1)";
const isActive = (status: VoiceInputState) =>
  status === "requesting" || status === "recording" || status === "transcribing";
const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export function formatVoiceElapsed(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const px = (value: string) => Number.parseFloat(value) || 0;

function composerOf(element: HTMLElement | null) {
  return element?.closest<HTMLElement>("[data-slot=prompt-composer-card]") ?? null;
}

function textareaOf(element: HTMLElement | null) {
  const scope = element?.closest<HTMLElement>("[data-slot=voice-input]") ?? null;
  return scope?.querySelector<HTMLTextAreaElement>("textarea") ?? null;
}

/**
 * Turns a microphone stream into a level reader: a Web Audio AnalyserNode RMS mapped to
 * 0–1. Pass the returned function to `getLevel`. The AudioContext closes with the stream.
 */
export function useAudioLevel(stream: MediaStream | null | undefined) {
  const analyser = useRef<AnalyserNode | null>(null);
  const buffer = useRef<Float32Array<ArrayBuffer> | null>(null);
  useEffect(() => {
    if (!stream) return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const source = audio.createMediaStreamSource(stream);
    const node = audio.createAnalyser();
    node.fftSize = 1024;
    source.connect(node);
    analyser.current = node;
    buffer.current = new Float32Array(node.fftSize);
    return () => {
      source.disconnect();
      analyser.current = null;
      void audio.close();
    };
  }, [stream]);
  return useCallback(() => {
    const node = analyser.current;
    const samples = buffer.current;
    if (!node || !samples) return 0;
    node.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    return Math.min(1, Math.sqrt(sum / samples.length) * 4);
  }, []);
}

const voiceInputVariants = cva("min-w-0", {
  variants: {
    variant: {
      inline: "grid gap-2",
      compact: "grid gap-1.5",
      pill: "inline-grid place-items-center *:[grid-area:1/1]",
    },
  },
});

export function VoiceInput({
  variant = "inline",
  status = "idle",
  level,
  getLevel,
  elapsed = 0,
  insertedRange,
  onStart,
  onCancel,
  onFinish,
  onRetry,
  shortcut = "Alt+Space",
  className,
  children,
  ...props
}: VoiceInputProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const levelRef = useRef(level ?? 0);
  levelRef.current = level ?? 0;
  const getLevelRef = useRef(getLevel);
  getLevelRef.current = getLevel;
  const readLevel = useCallback(() => getLevelRef.current?.() ?? levelRef.current, []);
  const [message, setMessage] = useState("");
  const active = isActive(status);
  const previous = useRef(status);
  const cancelled = useRef(false);

  // One polite announcement per transition, never per second.
  useEffect(() => {
    const before = previous.current;
    previous.current = status;
    if (before === status) return;
    if (status === "recording") setMessage("Recording");
    else if (status === "transcribing") setMessage("Transcribing");
    else if (status === "idle" && cancelled.current) setMessage("Dictation cancelled");
    if (status === "idle" || status === "denied" || status === "error") {
      cancelled.current = false;
    }
    // Focus goes back to the field when the recorder closes.
    if (isActive(before) && !isActive(status)) {
      (textareaOf(rootRef.current) ?? triggerRef.current)?.focus();
    }
  }, [status]);

  useEffect(() => {
    if (!insertedRange) return;
    const field = textareaOf(rootRef.current);
    const [start, end] = insertedRange;
    const text = field?.value.slice(start, end) ?? "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setMessage(`Added ${words} ${words === 1 ? "word" : "words"}`);
    if (field) {
      field.focus();
      field.setSelectionRange(end, end);
    }
  }, [insertedRange]);

  // Alt+Space starts dictation while focus is inside the composer (or this root).
  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!event.altKey || event.code !== "Space" || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      if (status === "idle" || status === "denied" || status === "error") onStart?.();
    };
    scope.addEventListener("keydown", onKey);
    return () => scope.removeEventListener("keydown", onKey);
  }, [onStart, status]);

  return (
    <VoiceInputContext.Provider
      value={{
        id,
        variant,
        status,
        active,
        elapsed,
        shortcut,
        insertedRange,
        readLevel,
        onStart,
        onCancel: () => {
          cancelled.current = true;
          onCancel?.();
        },
        onFinish,
        onRetry,
        rootRef,
        triggerRef,
      }}
    >
      <div
        ref={rootRef}
        data-slot="voice-input"
        data-variant={variant}
        data-status={status}
        className={cn(voiceInputVariants({ variant }), className)}
        {...props}
      >
        {children}
        <span role="status" aria-live="polite" className="sr-only">
          {message}
        </span>
      </div>
    </VoiceInputContext.Provider>
  );
}

function kbd(shortcut: string) {
  return shortcut.split("+").map((key) => (key === "Alt" ? "⌥" : key));
}

/** The mic. Hidden while the recorder is open; shows mic-off once access is blocked. */
export function VoiceInputTrigger({
  className,
  "aria-label": ariaLabel = "Start dictation",
  ...props
}: ComponentProps<"button">) {
  const context = useVoiceInput("VoiceInputTrigger");
  const pill = context.variant === "pill";
  const compact = context.variant === "compact";
  const denied = context.status === "denied";
  const failed = denied || context.status === "error";
  const Icon = denied ? MicOff : Mic;
  return (
    <>
      <span
        data-slot="voice-input-trigger"
        className={cn(
          "group/mic relative inline-grid flex-none",
          context.active && (pill ? "invisible" : "pointer-events-none"),
        )}
      >
        <Button
          ref={context.triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          aria-keyshortcuts={context.shortcut}
          aria-describedby={failed ? `${context.id}-error` : undefined}
          tabIndex={context.active ? -1 : undefined}
          onClick={() => context.onStart?.()}
          className={cn(
            "text-muted-foreground transition-[background-color,color,scale] duration-140 ease-out-quint hover:text-foreground focus-visible:bg-accent active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-accent",
            pill
              ? "size-11 rounded-full bg-card text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.06),0_12px_28px_-20px_oklch(0_0_0/0.4)] hover:bg-card"
              : compact
                ? "size-6 rounded-[6px]"
                : "size-7 rounded-lg",
            denied && "text-destructive-ink hover:text-destructive-ink",
            className,
          )}
          {...props}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={1.75}
            className={pill ? "size-[18px]" : compact ? "size-3.5" : "size-4"}
          />
        </Button>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg bg-popover px-2 py-1.25 text-[11.5px] text-popover-foreground opacity-0 shadow-[0_0_0_1px_var(--border),0_8px_20px_-12px_oklch(0_0_0/0.45)] transition-opacity duration-120 group-hover/mic:opacity-100 group-has-[:focus-visible]/mic:opacity-100 motion-reduce:transition-none sm:flex"
        >
          Dictate
          {kbd(context.shortcut).map((key) => (
            <kbd
              key={key}
              className="rounded-[4px] bg-muted px-1 font-mono text-[10.5px] text-muted-foreground"
            >
              {key}
            </kbd>
          ))}
        </span>
      </span>
      {failed && !pill ? <FailureFrame /> : null}
      {context.insertedRange && !pill ? (
        <InsertedWash key={context.insertedRange.join(":")} range={context.insertedRange} />
      ) : null}
    </>
  );
}

/** Tints the composer border danger 55% without reaching into the composer. */
function FailureFrame() {
  const ref = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  useLayoutEffect(() => {
    const card = composerOf(ref.current);
    if (!card) return;
    setStyle({ borderRadius: getComputedStyle(card).borderRadius });
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={style ?? undefined}
      className={cn(
        "pointer-events-none hidden",
        style &&
          "absolute -inset-px block z-10 border border-[color-mix(in_oklab,var(--destructive)_55%,var(--border))] transition-opacity duration-120 ease-out starting:opacity-0 motion-reduce:transition-none",
      )}
      data-slot="voice-input-frame"
    />
  );
}

type Geometry = { left: number; top: number; right: number; bottom: number; radius: string };

function useOverlayGeometry(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
): Geometry | null {
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    const card = composerOf(ref.current);
    if (!card) return;
    const measure = () => {
      const style = getComputedStyle(card);
      const add = card.querySelector<HTMLElement>("[data-slot=prompt-composer-add]");
      const padLeft = px(style.paddingLeft);
      const left = add ? add.offsetLeft + add.offsetWidth + 4 : padLeft;
      const radius = card.dataset.voiceRadius ?? (px(style.borderRadius) > 20 ? "999px" : "8px");
      setGeometry({
        left,
        top: px(style.paddingTop),
        right: px(style.paddingRight),
        bottom: px(style.paddingBottom),
        radius,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [enabled, ref]);
  return geometry;
}

/**
 * The live strip. Inline and compact overlay the composer's field and actions (the add
 * button stays); pill replaces the floating mic with a 320×44 pill.
 */
export function VoiceInputRecorder({ className, children, ...props }: ComponentProps<"div">) {
  const context = useVoiceInput("VoiceInputRecorder");
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(context.active);
  const pill = context.variant === "pill";
  const geometry = useOverlayGeometry(ref, shown && !pill);
  const wasActive = useRef(context.active);

  if (context.active && !shown) setShown(true);

  // Open from the mic's x position (pill: from its center); close in reverse.
  useLayoutEffect(() => {
    const element = ref.current;
    const opening = context.active && !wasActive.current;
    const closing = !context.active && wasActive.current;
    wasActive.current = context.active;
    if (!element || (!opening && !closing)) return;
    if (closing && (reduceMotion() || typeof element.animate !== "function")) {
      setShown(false);
      return;
    }
    if (reduceMotion() || typeof element.animate !== "function") return;
    const box = element.getBoundingClientRect();
    const mic = context.triggerRef.current?.getBoundingClientRect();
    const radius = pill ? "22px" : (geometry?.radius ?? "8px");
    let collapsed: string;
    if (pill) {
      const side = Math.max(0, (box.width - 44) / 2);
      collapsed = `inset(0 ${side}px 0 ${side}px round ${radius})`;
    } else {
      const x = mic ? Math.min(box.width - 8, Math.max(0, mic.left - box.left)) : box.width - 28;
      collapsed = `inset(0 0 0 ${x}px round ${radius})`;
    }
    const open = `inset(0 0 0 0 round ${radius})`;
    const animation = element.animate(
      opening
        ? [
            { clipPath: collapsed, opacity: 0 },
            { clipPath: open, opacity: 1 },
          ]
        : [
            { clipPath: open, opacity: 1 },
            { clipPath: collapsed, opacity: 0 },
          ],
      { duration: 240, easing: opening ? EASE_POP : EASE_OUT_QUINT, fill: "both" },
    );
    if (closing) {
      animation.onfinish = () => setShown(false);
      return () => animation.cancel();
    }
    animation.onfinish = () => animation.cancel();
  }, [context.active, context.triggerRef, pill, geometry?.radius]);

  // Focus goes to Finish while recording, and to Cancel while asking or transcribing.
  useEffect(() => {
    if (!context.active) return;
    const slot = context.status === "recording" ? "finish" : "cancel";
    ref.current?.querySelector<HTMLElement>(`[data-slot=voice-input-${slot}]`)?.focus();
  }, [context.active, context.status]);

  if (!shown) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      context.onCancel();
    } else if (event.key === "Enter" && context.status === "recording") {
      event.preventDefault();
      context.onFinish?.();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would bring a legend and form semantics the strip does not have.
    <div
      ref={ref}
      role="group"
      aria-label="Dictation"
      data-slot="voice-input-recorder"
      data-status={context.status}
      onKeyDown={onKeyDown}
      style={
        pill || !geometry
          ? undefined
          : {
              left: geometry.left,
              top: geometry.top,
              right: geometry.right,
              bottom: geometry.bottom,
              borderRadius: geometry.radius,
            }
      }
      className={cn(
        "z-20 flex min-w-0 items-center bg-card",
        pill
          ? "h-11 w-[320px] max-w-[calc(100vw-32px)] gap-2.5 rounded-full py-0 pr-1.5 pl-4 shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.06),0_12px_28px_-20px_oklch(0_0_0/0.4)]"
          : cn("absolute", context.variant === "compact" ? "gap-1" : "gap-1"),
        !pill && !geometry && "invisible",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** The recessed strip holding the dot, timer, status, and waveform. */
export function VoiceInputStrip({ className, ...props }: ComponentProps<"div">) {
  const context = useVoiceInput("VoiceInputStrip");
  const pill = context.variant === "pill";
  return (
    <div
      data-slot="voice-input-strip"
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        pill
          ? "h-full"
          : cn(
              "rounded-lg bg-background pr-1 pl-2",
              context.variant === "compact" ? "h-6 gap-2" : "h-7",
            ),
        className,
      )}
      {...props}
    />
  );
}

/** 8px danger dot whose ring follows the level. Hidden while asking or transcribing. */
export function VoiceInputIndicator({ className, ...props }: ComponentProps<"span">) {
  const context = useVoiceInput("VoiceInputIndicator");
  const ref = useRef<HTMLSpanElement>(null);
  const recording = context.status === "recording";
  useEffect(() => {
    const dot = ref.current;
    if (!recording || !dot || reduceMotion()) return;
    let frame = 0;
    const tick = () => {
      const level = Math.min(1, Math.max(0, context.readLevel()));
      dot.style.boxShadow = `0 0 0 ${(2 + 3 * level).toFixed(2)}px color-mix(in oklab, var(--destructive) ${Math.round(10 + 18 * level)}%, transparent)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [recording, context.readLevel]);
  if (!recording) return null;
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="voice-input-indicator"
      className={cn("size-2 flex-none rounded-full bg-destructive", className)}
      {...props}
    />
  );
}

/** m:ss, hidden from assistive tech (the status announces once instead). */
export function VoiceInputTimer({ className, ...props }: ComponentProps<"span">) {
  const context = useVoiceInput("VoiceInputTimer");
  if (context.status !== "recording") return null;
  const time = formatVoiceElapsed(context.elapsed);
  return (
    <span
      aria-hidden="true"
      data-slot="voice-input-timer"
      className={cn(
        "flex-none font-mono text-xs font-medium tabular-nums text-foreground motion-reduce:hidden",
        className,
      )}
      {...props}
    >
      {time}
    </span>
  );
}

/** Shimmer label while asking for access or transcribing. */
export function VoiceInputStatus({ className, ...props }: ComponentProps<"span">) {
  const context = useVoiceInput("VoiceInputStatus");
  const recording = context.status === "recording";
  const transcribing = context.status === "transcribing";
  if (context.status === "requesting" || transcribing) {
    return (
      <span
        data-slot="voice-input-status"
        className={cn(
          "flex min-w-0 flex-none items-center gap-1.5 truncate text-[12.5px] text-muted-foreground animate-in fade-in-0 duration-200 motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {transcribing ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-3.5 flex-none text-subtle-foreground motion-safe:animate-spin"
          />
        ) : null}
        <span className="motion-safe:shimmer-text">
          {transcribing ? "Transcribing" : "Waiting for microphone access"}
        </span>
      </span>
    );
  }
  // Reduced motion trades the moving bars for words.
  if (recording) {
    return (
      <span
        aria-hidden="true"
        data-slot="voice-input-status"
        className={cn("hidden text-[12.5px] text-muted-foreground motion-reduce:inline", className)}
        {...props}
      >
        Recording {formatVoiceElapsed(context.elapsed)}
      </span>
    );
  }
  return null;
}

/**
 * A fixed row of up to 64 bars, newest on the right, written through refs every frame
 * (never React state). Older bars go subtle; asking and transcribing hold them flat.
 */
export function VoiceInputWaveform({ className, ...props }: ComponentProps<"div">) {
  const context = useVoiceInput("VoiceInputWaveform");
  const bars = useRef<(HTMLElement | null)[]>([]);
  const recording = context.status === "recording";
  const pill = context.variant === "pill";

  useEffect(() => {
    const elements = bars.current;
    const set = (index: number, value: number) => {
      const bar = elements[index];
      if (bar) bar.style.scale = `1 ${Math.max(0.1, Math.min(1, value)).toFixed(3)}`;
    };
    if (!recording) {
      for (let index = 0; index < BAR_COUNT; index++) set(index, 0.1);
      return;
    }
    if (reduceMotion()) {
      for (let index = 0; index < BAR_COUNT; index++) set(index, 0.5);
      return;
    }
    const history = new Array<number>(BAR_COUNT).fill(0.1);
    const started = performance.now();
    let last = 0;
    let frame = 0;
    const tick = (now: number) => {
      // About 30 samples a second keeps the scroll speed steady on any refresh rate.
      if (now - last >= 33) {
        last = now;
        history.shift();
        history.push(Math.max(0.1, Math.min(1, context.readLevel())));
      }
      for (let index = 0; index < BAR_COUNT; index++) {
        // Bars grow in from the left over the first 200ms, 3ms apart.
        const grow = Math.min(1, Math.max(0, (now - started - index * 3) / 200));
        set(index, 0.1 + ((history[index] ?? 0.1) - 0.1) * grow);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [recording, context.readLevel]);

  return (
    <div
      aria-hidden="true"
      data-slot="voice-input-waveform"
      className={cn(
        "flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_24px)]",
        pill ? "h-6" : context.variant === "compact" ? "h-4" : "h-5",
        className,
      )}
      {...props}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <i
          // biome-ignore lint/suspicious/noArrayIndexKey: the bars are a fixed positional row.
          key={index}
          ref={(element) => {
            bars.current[index] = element;
          }}
          className={cn(
            "block h-full w-[3px] flex-none origin-center rounded-[2px] [scale:1_0.1]",
            recording
              ? index < BAR_COUNT / 2
                ? "bg-subtle-foreground"
                : "bg-foreground"
              : "bg-border-strong transition-[scale,background-color] duration-200 ease-out-quint motion-reduce:transition-none",
          )}
        />
      ))}
    </div>
  );
}

const controlClass = (variant: VoiceInputVariant) =>
  variant === "pill"
    ? "size-8 rounded-full"
    : variant === "compact"
      ? "size-6 rounded-[6px]"
      : "size-7 rounded-lg";

/** Ghost ×. Esc does the same while focus is in the recorder. */
export function VoiceInputCancel({
  className,
  "aria-label": ariaLabel = "Cancel dictation",
  ...props
}: ComponentProps<"button">) {
  const context = useVoiceInput("VoiceInputCancel");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-slot="voice-input-cancel"
      aria-label={ariaLabel}
      onClick={context.onCancel}
      className={cn(
        "flex-none text-muted-foreground hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100",
        controlClass(context.variant),
        className,
      )}
      {...props}
    >
      <X aria-hidden="true" strokeWidth={2} className="size-3.5" />
    </Button>
  );
}

/** Ink ✓, never accent (the composer send rule). Disabled at 45% while transcribing. */
export function VoiceInputFinish({
  className,
  "aria-label": ariaLabel = "Finish dictation",
  ...props
}: ComponentProps<"button">) {
  const context = useVoiceInput("VoiceInputFinish");
  if (context.status === "requesting") return null;
  return (
    <Button
      type="button"
      size="icon"
      data-slot="voice-input-finish"
      aria-label={ariaLabel}
      disabled={context.status !== "recording"}
      onClick={() => context.onFinish?.()}
      className={cn(
        "flex-none bg-foreground text-card transition-[opacity,scale] duration-140 ease-out-quint hover:bg-foreground hover:opacity-90 active:scale-[0.94] disabled:opacity-45 motion-reduce:transition-none motion-reduce:active:scale-100",
        controlClass(context.variant),
        className,
      )}
      {...props}
    >
      <Check aria-hidden="true" strokeWidth={2.4} className="size-3.5" />
    </Button>
  );
}

/** Danger-ink line for denied and error, linked to the mic with aria-describedby. */
export function VoiceInputError({ className, ...props }: ComponentProps<"div">) {
  const context = useVoiceInput("VoiceInputError");
  if (context.status !== "denied" && context.status !== "error") return null;
  const denied = context.status === "denied";
  return (
    <div
      data-slot="voice-input-error"
      className={cn(
        "flex items-start gap-2 px-1 text-xs/4 text-destructive-ink animate-in fade-in-0 duration-180 motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <TriangleAlert aria-hidden="true" strokeWidth={1.75} className="mt-px size-3.5 flex-none" />
      <span id={`${context.id}-error`} className="min-w-0 flex-1">
        {denied
          ? "Microphone blocked. Allow it in your browser's site settings, then try again."
          : "Couldn't transcribe that. Try again."}
      </span>
      {!denied && context.onRetry ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={context.onRetry}
          className="-my-1 h-6 flex-none text-foreground active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Mirrors the composer field and paints the inserted range with primary 18%, fading to 0
 * in 300ms. The field's value stays yours; this only draws behind its text.
 */
function InsertedWash({ range }: { range: readonly [number, number] }) {
  const context = useVoiceInput("VoiceInput");
  const [mirror, setMirror] = useState<{
    style: CSSProperties;
    before: string;
    inserted: string;
  } | null>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (reduceMotion()) return;
    const field = textareaOf(context.rootRef.current);
    if (!field || field.offsetParent === null) return;
    const style = getComputedStyle(field);
    setMirror({
      style: {
        left: field.offsetLeft,
        top: field.offsetTop,
        width: field.offsetWidth,
        height: field.offsetHeight,
        font: style.font,
        letterSpacing: style.letterSpacing,
        padding: style.padding,
        borderWidth: style.borderWidth,
      },
      before: field.value.slice(0, range[0]),
      inserted: field.value.slice(range[0], range[1]),
    });
  }, [range, context.rootRef]);
  useEffect(() => {
    const mark = markRef.current;
    if (!mirror || !mark || typeof mark.animate !== "function") return;
    const animation = mark.animate(
      [
        { backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" },
        { backgroundColor: "color-mix(in oklab, var(--primary) 0%, transparent)" },
      ],
      { duration: 300, easing: "ease-out", fill: "forwards" },
    );
    animation.onfinish = () => setMirror(null);
    return () => animation.cancel();
  }, [mirror]);
  if (!mirror) return null;
  return (
    <span
      aria-hidden="true"
      data-slot="voice-input-inserted"
      style={mirror.style}
      className="pointer-events-none absolute -z-10 overflow-hidden border-transparent break-words whitespace-pre-wrap text-transparent"
    >
      {mirror.before}
      <span ref={markRef} className="rounded-[3px]">
        {mirror.inserted}
      </span>
    </span>
  );
}
