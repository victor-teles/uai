"use client";

import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Globe,
  LoaderCircle,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export type PromptComposerSource = {
  id: string;
  label: string;
  description?: string;
};

export type PromptComposerModel = {
  id: string;
  label: string;
};

export const PROMPT_COMPOSER_VARIANTS = ["rounded", "pill", "ghost", "compact"] as const;

export type PromptComposerVariant = (typeof PROMPT_COMPOSER_VARIANTS)[number];

export type PromptComposerProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  placeholder?: string;
  modelLabel?: string;
  models?: readonly PromptComposerModel[];
  sources?: readonly PromptComposerSource[];
  variant?: PromptComposerVariant;
  busy?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  defaultValue?: string;
  onSubmit?: (prompt: string, files: File[]) => void | Promise<void>;
  onAddContext?: () => void;
};

function composerChrome(
  variant: PromptComposerVariant,
  expanded: boolean,
  hasAttachments: boolean,
) {
  const compact = variant === "compact";
  const pill = variant === "pill";
  const ghost = variant === "ghost";

  return {
    compact,
    pill,
    controlSize: compact ? 24 : 28,
    controlRadius: pill ? 999 : compact ? 6 : 8,
    cardRadius: pill ? (hasAttachments || expanded ? 24 : 999) : compact ? 12 : 14,
    chipRadius: pill ? 999 : compact ? 5 : 6,
    chipHeight: compact ? 22 : 26,
    padding: compact || ghost ? 4 : 6,
    gap: compact ? 4 : 6,
    fieldSize: compact ? 12.5 : 13,
    fieldLineHeight: compact ? 16 : 18,
    fieldPad: compact ? 4 : 5,
    modelSize: compact ? 11 : 12,
    iconClass: compact ? "size-3.5" : "size-4",
    maxFieldHeight: compact ? 80 : 100,
    background: ghost ? "transparent" : "var(--uai-surface)",
    shadow: ghost
      ? "none"
      : "inset 0 1px 0 color-mix(in oklab, var(--uai-text) 6%, transparent), 0 1px 2px color-mix(in oklab, black 6%, transparent), 0 8px 24px color-mix(in oklab, black 8%, transparent)",
  };
}

const DEFAULT_SOURCES: readonly PromptComposerSource[] = [
  { id: "files", label: "Add photos & files", description: "Upload from your computer" },
  { id: "notes", label: "Workspace notes", description: "Attach saved context" },
  { id: "search", label: "Web search", description: "Live results" },
];

const COMPOSER_STYLE = `
@keyframes uai-prompt-pop-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
[data-uai-composer] textarea {
  caret-color: var(--uai-text);
}
[data-uai-composer] textarea::selection {
  background: color-mix(in oklab, var(--uai-text) 18%, transparent);
}
[data-uai-menu] [role="menuitem"],
[data-uai-menu] [role="menuitemradio"] {
  position: relative;
  z-index: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
  font: inherit;
}
[data-uai-composer] [data-uai-card] {
  border: 1px solid var(--uai-border);
  transition: border-color 150ms ease;
}
[data-uai-composer] [data-uai-card]:focus-within {
  border-color: var(--uai-border-strong);
}
[data-uai-composer][data-invalid] [data-uai-card] {
  border-color: var(--uai-danger);
}
[data-uai-composer][data-variant="ghost"] [data-uai-card] {
  border-color: transparent;
}
[data-uai-composer][data-variant="ghost"] [data-uai-card]:focus-within {
  border-color: var(--uai-border-strong);
}
[data-uai-composer][data-variant="ghost"][data-invalid] [data-uai-card],
[data-uai-composer][data-variant="ghost"][data-invalid] [data-uai-card]:focus-within {
  border-color: var(--uai-danger);
}
@media (prefers-reduced-motion: reduce) {
  [data-uai-menu] { animation: none !important; }
}
`;

const menuPanelStyle: CSSProperties = {
  position: "absolute",
  bottom: "100%",
  zIndex: 10,
  marginBottom: 8,
  borderRadius: 14,
  background: "var(--uai-surface)",
  boxShadow:
    "0 0 0 1px var(--uai-border-strong), 0 10px 28px color-mix(in oklab, black 42%, transparent)",
  animation: "uai-prompt-pop-in 180ms cubic-bezier(0.23, 1, 0.32, 1) both",
};

function SourceGlyph({ id }: { id: string }) {
  if (id === "files") return <Paperclip className="size-4" strokeWidth={1.8} aria-hidden="true" />;
  if (id === "search") return <Globe className="size-4" strokeWidth={1.8} aria-hidden="true" />;
  return <FileText className="size-4" strokeWidth={1.8} aria-hidden="true" />;
}

function FloatingMenu({
  id,
  label,
  origin,
  width,
  align,
  children,
}: {
  id: string;
  label: string;
  origin: string;
  width: number | string;
  align: "start" | "end";
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="menu"
      aria-label={label}
      data-uai-menu=""
      style={{
        ...menuPanelStyle,
        left: align === "start" ? 0 : "auto",
        right: align === "end" ? 0 : "auto",
        width,
        transformOrigin: origin,
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 13, padding: 4 }}>
        {children}
      </div>
    </div>
  );
}

function HoverPill({ top, height }: { top: number; height: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top,
        right: 4,
        left: 4,
        height,
        borderRadius: 8,
        background: "var(--uai-surface-raised)",
        pointerEvents: "none",
        transition: "top 140ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    />
  );
}

export function PromptComposer({
  placeholder = "Write a message…",
  modelLabel = "Default",
  models,
  sources = DEFAULT_SOURCES,
  variant = "rounded",
  busy = false,
  disabled = false,
  invalid = false,
  defaultValue = "",
  onSubmit,
  onAddContext,
  className,
  ...props
}: PromptComposerProps) {
  const [prompt, setPrompt] = useState(defaultValue);
  const [attachments, setAttachments] = useState<{ id: string; file: File }[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [sourceHover, setSourceHover] = useState<string | null>(null);
  const [modelHover, setModelHover] = useState<string | null>(null);
  const [model, setModel] = useState<PromptComposerModel>(
    models?.[0] ?? { id: "default", label: modelLabel },
  );
  const [expanded, setExpanded] = useState(false);
  const attachmentId = useRef(0);
  const textareaId = useId();
  const fileInputId = useId();
  const sourceMenuId = useId();
  const modelMenuId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chrome = composerChrome(variant, expanded, attachments.length > 0);
  const locked = busy || disabled;
  const canSend = !locked && (prompt.trim().length > 0 || attachments.length > 0);
  const modelOptions = models ?? [model];
  const layoutKey = `${attachments.length}:${model.label}:${variant}`;
  const sourceHoverIndex = sources.findIndex((source) => source.id === sourceHover);
  const modelHoverIndex = modelOptions.findIndex((option) => option.id === modelHover);

  useEffect(() => {
    if (!plusOpen && !modelOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPlusOpen(false);
        setModelOpen(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setPlusOpen(false);
        setModelOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [plusOpen, modelOpen]);

  useEffect(() => {
    if (!plusOpen) setSourceHover(null);
    if (!modelOpen) setModelHover(null);
  }, [plusOpen, modelOpen]);

  useLayoutEffect(() => {
    const input = textareaRef.current;
    const controls = controlsRef.current;
    const measure = measureRef.current;
    const modelButton = modelRef.current;
    if (!input || !controls || !measure) return;

    void layoutKey;
    const controlWidth =
      chrome.controlSize * 2 + (modelButton?.offsetWidth ?? (chrome.compact ? 60 : 72));
    const inlineGaps = 4 * 3;
    const inlineInputWidth = controls.clientWidth - controlWidth - inlineGaps;
    const needsFullWidth = prompt.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) setExpanded(needsFullWidth);

    input.style.height = "0px";
    const contentHeight = input.scrollHeight;
    input.style.height = `${Math.min(Math.max(contentHeight, chrome.controlSize), chrome.maxFieldHeight)}px`;
    input.style.overflowY = contentHeight > chrome.maxFieldHeight ? "auto" : "hidden";
  }, [prompt, expanded, layoutKey, chrome.compact, chrome.controlSize, chrome.maxFieldHeight]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    await onSubmit?.(
      prompt.trim(),
      attachments.map((item) => item.file),
    );
    setPrompt("");
    setAttachments([]);
    setPlusOpen(false);
    setModelOpen(false);
  };

  const pickSource = (source: PromptComposerSource) => {
    if (source.id === "files") {
      fileInputRef.current?.click();
      setPlusOpen(false);
      return;
    }

    if (source.id === "notes") onAddContext?.();
    setPrompt(
      (current) => `${current}${current && !current.endsWith(" ") ? " " : ""}@${source.label} `,
    );
    setPlusOpen(false);
    textareaRef.current?.focus();
  };

  const onPromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      setPlusOpen(false);
      setModelOpen(false);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const plusButton = (
    <button
      type="button"
      aria-label="Add attachments and sources"
      aria-expanded={plusOpen}
      aria-controls={sourceMenuId}
      disabled={locked}
      onClick={() => {
        setModelOpen(false);
        setPlusOpen((open) => !open);
        textareaRef.current?.focus();
      }}
      className={cn(
        "flex shrink-0 items-center justify-center text-[var(--uai-muted)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:bg-[var(--uai-surface-raised)] active:scale-[0.94] disabled:cursor-not-allowed",
        plusOpen && "bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
      )}
      style={{
        width: chrome.controlSize,
        height: chrome.controlSize,
        borderRadius: chrome.controlRadius,
      }}
    >
      <span
        style={{
          display: "grid",
          transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
          transform: plusOpen ? "rotate(45deg)" : "none",
        }}
      >
        <Plus className={chrome.iconClass} strokeWidth={2} aria-hidden="true" />
      </span>
    </button>
  );
  const modelControl = (
    <div ref={modelRef}>
      {modelOptions.length > 1 ? (
        <button
          type="button"
          aria-label="Choose model"
          aria-expanded={modelOpen}
          aria-controls={modelMenuId}
          disabled={locked}
          onClick={() => {
            setPlusOpen(false);
            setModelOpen((open) => !open);
          }}
          className="flex shrink-0 items-center gap-1 px-1.5 font-medium text-[var(--uai-muted)] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:bg-[var(--uai-surface-raised)] disabled:cursor-not-allowed"
          style={{
            height: chrome.controlSize,
            borderRadius: chrome.controlRadius,
            fontSize: chrome.modelSize,
          }}
        >
          {model.label}
          <ChevronDown className="size-3" strokeWidth={2.4} aria-hidden="true" />
        </button>
      ) : (
        <span
          className="flex shrink-0 items-center px-1.5 font-medium text-[var(--uai-muted)]"
          style={{ height: chrome.controlSize, fontSize: chrome.modelSize }}
        >
          {model.label}
        </span>
      )}
    </div>
  );
  const sendButton = (
    <button
      type="submit"
      aria-label={busy ? "Sending prompt" : "Send"}
      disabled={!canSend}
      className="flex shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.94] disabled:cursor-not-allowed"
      style={{
        width: chrome.controlSize,
        height: chrome.controlSize,
        borderRadius: chrome.controlRadius,
        background: canSend || busy ? "var(--uai-text)" : "var(--uai-border-strong)",
        color: canSend || busy ? "var(--uai-surface)" : "var(--uai-muted)",
      }}
    >
      {busy ? (
        <LoaderCircle
          className={cn(chrome.iconClass, "motion-safe:animate-spin")}
          aria-hidden="true"
        />
      ) : (
        <ArrowUp className={chrome.iconClass} strokeWidth={2.4} aria-hidden="true" />
      )}
    </button>
  );

  return (
    <form
      ref={rootRef}
      data-uai-composer=""
      data-variant={variant}
      data-invalid={invalid || undefined}
      className={cn("relative", disabled && "opacity-55", className)}
      aria-busy={busy || undefined}
      aria-disabled={disabled || undefined}
      onSubmit={submit}
      {...props}
    >
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        multiple
        className="hidden"
        tabIndex={-1}
        disabled={locked}
        onChange={(event) => {
          const next = Array.from(event.target.files ?? []);
          if (next.length) {
            setAttachments((current) => [
              ...current,
              ...next.map((file) => {
                attachmentId.current += 1;
                return { id: String(attachmentId.current), file };
              }),
            ]);
          }
          event.target.value = "";
        }}
      />

      <style>{COMPOSER_STYLE}</style>

      {plusOpen ? (
        <FloatingMenu
          id={sourceMenuId}
          label="Attachments and sources"
          origin="bottom left"
          width="min(100%, 280px)"
          align="start"
        >
          {sourceHoverIndex >= 0 ? <HoverPill top={4 + sourceHoverIndex * 44} height={44} /> : null}
          {sources.map((source) => (
            <button
              key={source.id}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setSourceHover(source.id)}
              onFocus={() => setSourceHover(source.id)}
              onClick={() => pickSource(source)}
              style={{
                display: "flex",
                width: "100%",
                height: 44,
                alignItems: "center",
                gap: 10,
                paddingInline: 8,
                border: 0,
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                className="grid shrink-0 place-items-center text-[var(--uai-muted)]"
                style={{ width: 22, height: 22 }}
              >
                <SourceGlyph id={source.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate font-medium text-[var(--uai-text)]"
                  style={{ fontSize: 12.5, lineHeight: "16px" }}
                >
                  {source.label}
                </span>
                {source.description ? (
                  <span
                    className="block truncate text-[var(--uai-muted)]"
                    style={{ fontSize: 11.5, lineHeight: "15px" }}
                  >
                    {source.description}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          <div
            className="text-[var(--uai-muted)]"
            style={{
              marginTop: 4,
              borderTop: "1px solid var(--uai-border)",
              padding: "7px 8px 5px",
              fontSize: 11,
            }}
          >
            Attach files or mention a source
          </div>
        </FloatingMenu>
      ) : null}

      {modelOpen && modelOptions.length > 1 ? (
        <FloatingMenu
          id={modelMenuId}
          label="Choose model"
          origin="bottom right"
          width={176}
          align="end"
        >
          {modelHoverIndex >= 0 ? <HoverPill top={4 + modelHoverIndex * 32} height={32} /> : null}
          {modelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === model.id}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setModelHover(option.id)}
              onFocus={() => setModelHover(option.id)}
              onClick={() => {
                setModel(option);
                setModelOpen(false);
                textareaRef.current?.focus();
              }}
              style={{
                display: "flex",
                width: "100%",
                height: 32,
                alignItems: "center",
                gap: 8,
                paddingInline: 8,
                border: 0,
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                className="min-w-0 flex-1 truncate font-medium text-[var(--uai-text)]"
                style={{ fontSize: 12.5 }}
              >
                {option.label}
              </span>
              <Check
                className={cn(
                  "size-3",
                  option.id === model.id ? "text-[var(--uai-text)]" : "invisible",
                )}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          ))}
        </FloatingMenu>
      ) : null}

      <div
        data-uai-card=""
        className="relative isolate flex flex-col overflow-hidden"
        style={{
          borderRadius: chrome.cardRadius,
          background: chrome.background,
          boxShadow: chrome.shadow,
          padding: chrome.padding,
          gap: chrome.gap,
        }}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute whitespace-pre"
          style={{ fontSize: chrome.fieldSize, lineHeight: `${chrome.fieldLineHeight}px` }}
        >
          {prompt}
        </span>

        {attachments.length > 0 ? (
          <div className={cn("flex flex-wrap gap-1.5 pt-0.5", chrome.pill ? "px-1" : "px-0.5")}>
            {attachments.map((item) => (
              <span
                key={item.id}
                className="flex items-center gap-1.5 bg-[var(--uai-surface-raised)] py-1 pr-1 pl-1.5 text-[var(--uai-muted)]"
                style={{
                  height: chrome.chipHeight,
                  fontSize: chrome.compact ? 11 : 11.5,
                  borderRadius: chrome.chipRadius,
                }}
              >
                <FileText className="size-3" aria-hidden="true" />
                <span className="max-w-36 truncate text-[var(--uai-text)]">{item.file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item.file.name}`}
                  disabled={locked}
                  onClick={() =>
                    setAttachments((current) => current.filter((entry) => entry.id !== item.id))
                  }
                  className="grid size-4 place-items-center text-[var(--uai-muted)] transition-colors duration-100 hover:text-[var(--uai-text)]"
                  style={{ borderRadius: chrome.pill ? 999 : 4 }}
                >
                  <X className="size-2.5" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div ref={controlsRef} className={cn("flex gap-1", expanded ? "flex-col" : "items-end")}>
          <label htmlFor={textareaId} className="sr-only">
            Prompt
          </label>
          {expanded ? null : plusButton}
          <textarea
            ref={textareaRef}
            id={textareaId}
            rows={1}
            value={prompt}
            disabled={locked}
            aria-invalid={invalid || undefined}
            placeholder={placeholder}
            onChange={(event) => {
              setPrompt(event.target.value);
              setPlusOpen(false);
            }}
            onKeyDown={onPromptKeyDown}
            className={cn(
              "resize-none bg-transparent px-1 text-[var(--uai-text)] outline-none placeholder:text-[var(--uai-muted)] disabled:cursor-not-allowed",
              expanded ? "w-full" : "min-w-0 flex-1",
            )}
            style={{
              minHeight: chrome.controlSize,
              fontSize: chrome.fieldSize,
              lineHeight: `${chrome.fieldLineHeight}px`,
              paddingTop: chrome.fieldPad,
              paddingBottom: chrome.fieldPad,
              outline: "none",
            }}
          />
          {expanded ? (
            <div className="flex items-center gap-1">
              {plusButton}
              <div className="ml-auto">{modelControl}</div>
              {sendButton}
            </div>
          ) : (
            <>
              {modelControl}
              {sendButton}
            </>
          )}
        </div>
      </div>
    </form>
  );
}
