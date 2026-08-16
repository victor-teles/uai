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
    controlClass: compact ? "size-6" : "size-7",
    controlHeightClass: compact ? "h-6" : "h-7",
    controlRadiusClass: pill ? "rounded-full" : compact ? "rounded-[6px]" : "rounded-lg",
    cardClass: cn(
      "bg-[var(--uai-surface)]",
      pill
        ? hasAttachments || expanded
          ? "rounded-3xl p-1 gap-1"
          : "rounded-full p-1 gap-1"
        : compact
          ? "rounded-xl p-1 gap-1"
          : ghost
            ? "rounded-[14px] bg-transparent p-1 gap-1.5"
            : "rounded-[14px] p-1.5 gap-1.5",
    ),
    chipClass: cn(
      compact ? "h-[22px] text-[11px]" : "h-[26px] text-[11.5px]",
      pill ? "rounded-full" : compact ? "rounded-[5px]" : "rounded-md",
    ),
    fieldClass: compact
      ? "min-h-6 py-1 text-[12.5px] leading-4"
      : "min-h-7 py-[5px] text-[13px] leading-[18px]",
    maxFieldHeightClass: compact ? "max-h-20" : "max-h-[100px]",
    modelClass: compact ? "text-[11px]" : "text-xs",
    iconClass: compact ? "size-3.5" : "size-4",
  };
}

const DEFAULT_SOURCES: readonly PromptComposerSource[] = [
  { id: "files", label: "Add photos & files", description: "Upload from your computer" },
  { id: "notes", label: "Workspace notes", description: "Attach saved context" },
  { id: "search", label: "Web search", description: "Live results" },
];

function SourceGlyph({ id }: { id: string }) {
  if (id === "files") return <Paperclip className="size-4" strokeWidth={1.8} aria-hidden="true" />;
  if (id === "search") return <Globe className="size-4" strokeWidth={1.8} aria-hidden="true" />;
  return <FileText className="size-4" strokeWidth={1.8} aria-hidden="true" />;
}

function FloatingMenu({
  id,
  label,
  kind,
  children,
}: {
  id: string;
  label: string;
  kind: "sources" | "models";
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      role="menu"
      aria-label={label}
      data-uai-menu=""
      className={cn(
        "absolute bottom-full z-10 mb-2 rounded-[14px] bg-[var(--uai-surface)] shadow-[0_0_0_1px_var(--uai-border-strong),0_10px_28px_color-mix(in_oklab,black_42%,transparent)] transition-[opacity,transform] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-[0.96] starting:opacity-0 motion-reduce:transition-none",
        kind === "sources"
          ? "left-0 w-[min(100%,280px)] origin-bottom-left"
          : "right-0 w-44 origin-bottom-right",
      )}
    >
      <div className="relative overflow-hidden rounded-[13px] p-1">{children}</div>
    </div>
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

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    const measure = measureRef.current;
    const modelButton = modelRef.current;
    if (!controls || !measure) return;

    void layoutKey;
    const controlWidth =
      chrome.controlSize * 2 + (modelButton?.offsetWidth ?? (chrome.compact ? 60 : 72));
    const inlineGaps = 4 * 3;
    const inlineInputWidth = controls.clientWidth - controlWidth - inlineGaps;
    const needsFullWidth = prompt.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) setExpanded(needsFullWidth);
  }, [prompt, expanded, layoutKey, chrome.compact, chrome.controlSize]);

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
        chrome.controlClass,
        chrome.controlRadiusClass,
        plusOpen && "bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
      )}
    >
      <span
        className={cn(
          "grid transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
          plusOpen && "rotate-45",
        )}
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
          className={cn(
            "flex shrink-0 items-center gap-1 px-1.5 font-medium text-[var(--uai-muted)] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:bg-[var(--uai-surface-raised)] disabled:cursor-not-allowed",
            chrome.controlHeightClass,
            chrome.controlRadiusClass,
            chrome.modelClass,
          )}
        >
          {model.label}
          <ChevronDown className="size-3" strokeWidth={2.4} aria-hidden="true" />
        </button>
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center px-1.5 font-medium text-[var(--uai-muted)]",
            chrome.controlHeightClass,
            chrome.modelClass,
          )}
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
      className={cn(
        "flex shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.94] disabled:cursor-not-allowed",
        chrome.controlClass,
        chrome.controlRadiusClass,
        canSend || busy
          ? "bg-[var(--uai-text)] text-[var(--uai-surface)]"
          : "bg-[var(--uai-border-strong)] text-[var(--uai-muted)]",
      )}
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

      {plusOpen ? (
        <FloatingMenu id={sourceMenuId} label="Attachments and sources" kind="sources">
          {sources.map((source) => (
            <button
              key={source.id}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pickSource(source)}
              className="relative flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 text-left font-[inherit] text-[inherit] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:bg-[var(--uai-surface-raised)]"
            >
              <span className="grid size-[22px] shrink-0 place-items-center text-[var(--uai-muted)]">
                <SourceGlyph id={source.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] leading-4 font-medium text-[var(--uai-text)]">
                  {source.label}
                </span>
                {source.description ? (
                  <span className="block truncate text-[11.5px] leading-[15px] text-[var(--uai-muted)]">
                    {source.description}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-[var(--uai-border)] px-2 pt-[7px] pb-[5px] text-[11px] text-[var(--uai-muted)]">
            Attach files or mention a source
          </div>
        </FloatingMenu>
      ) : null}

      {modelOpen && modelOptions.length > 1 ? (
        <FloatingMenu id={modelMenuId} label="Choose model" kind="models">
          {modelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === model.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setModel(option);
                setModelOpen(false);
                textareaRef.current?.focus();
              }}
              className="relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 text-left font-[inherit] text-[inherit] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:bg-[var(--uai-surface-raised)]"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--uai-text)]">
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
        className={cn(
          "relative isolate flex flex-col overflow-hidden border border-[var(--uai-border)] transition-colors duration-150 focus-within:border-[var(--uai-border-strong)]",
          chrome.cardClass,
          variant === "ghost" && "border-transparent",
          invalid && "border-[var(--uai-danger)] focus-within:border-[var(--uai-danger)]",
        )}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className={cn("pointer-events-none invisible absolute whitespace-pre", chrome.fieldClass)}
        >
          {prompt}
        </span>

        {attachments.length > 0 ? (
          <div className={cn("flex flex-wrap gap-1.5 pt-0.5", chrome.pill ? "px-1" : "px-0.5")}>
            {attachments.map((item) => (
              <span
                key={item.id}
                className={cn(
                  "flex items-center gap-1.5 bg-[var(--uai-surface-raised)] py-1 pr-1 pl-1.5 text-[var(--uai-muted)]",
                  chrome.chipClass,
                )}
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
                  className={cn(
                    "grid size-4 place-items-center text-[var(--uai-muted)] transition-colors duration-100 hover:text-[var(--uai-text)]",
                    chrome.pill ? "rounded-full" : "rounded",
                  )}
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
              "resize-none overflow-y-auto bg-transparent px-1 text-[var(--uai-text)] caret-[var(--uai-text)] outline-none! [field-sizing:content] selection:bg-[color-mix(in_oklab,var(--uai-text)_18%,transparent)] placeholder:text-[var(--uai-muted)] disabled:cursor-not-allowed",
              chrome.fieldClass,
              chrome.maxFieldHeightClass,
              expanded ? "w-full" : "min-w-0 flex-1",
            )}
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
