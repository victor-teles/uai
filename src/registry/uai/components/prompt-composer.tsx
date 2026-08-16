"use client";

import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export type PromptComposerModel = {
  id: string;
  label: string;
};

export const PROMPT_COMPOSER_VARIANTS = ["rounded", "pill", "ghost", "compact"] as const;

export type PromptComposerVariant = (typeof PROMPT_COMPOSER_VARIANTS)[number];

export type PromptComposerProps = Omit<ComponentProps<"form">, "onSubmit" | "onChange"> & {
  variant?: PromptComposerVariant;
  busy?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (prompt: string, files: File[]) => void | Promise<void>;
};

type Attachment = { id: string; file: File };
type OpenMenu = "add" | "model" | null;

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

type PromptComposerContextValue = {
  prompt: string;
  setPrompt: (value: string) => void;
  attachments: Attachment[];
  addFiles: (files: File[]) => void;
  removeAttachment: (id: string) => void;
  busy: boolean;
  invalid: boolean;
  locked: boolean;
  canSend: boolean;
  expanded: boolean;
  openMenu: OpenMenu;
  setOpenMenu: (menu: OpenMenu) => void;
  inputId: string;
  addMenuId: string;
  modelMenuId: string;
  rootRef: React.RefObject<HTMLFormElement | null>;
  controlsRef: React.RefObject<HTMLDivElement | null>;
  addRef: React.RefObject<HTMLDivElement | null>;
  actionsRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  chrome: ReturnType<typeof composerChrome>;
};

const PromptComposerContext = createContext<PromptComposerContextValue | null>(null);

function usePromptComposer(name: string) {
  const context = useContext(PromptComposerContext);
  if (!context) throw new Error(`${name} must be used within PromptComposer`);
  return context;
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
          ? "left-0 w-[min(280px,calc(100vw-32px))] origin-bottom-left"
          : "right-0 w-44 origin-bottom-right",
      )}
    >
      <div className="relative overflow-hidden rounded-[13px] p-1">{children}</div>
    </div>
  );
}

export function PromptComposer({
  variant = "rounded",
  busy = false,
  disabled = false,
  invalid = false,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  className,
  children,
  ...props
}: PromptComposerProps) {
  const [internalPrompt, setInternalPrompt] = useState(defaultValue);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [expanded, setExpanded] = useState(false);
  const attachmentId = useRef(0);
  const inputId = useId();
  const addMenuId = useId();
  const modelMenuId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const prompt = value ?? internalPrompt;
  const locked = busy || disabled;
  const canSend = !locked && (prompt.trim().length > 0 || attachments.length > 0);
  const chrome = composerChrome(variant, expanded, attachments.length > 0);

  const setPrompt = (nextValue: string) => {
    if (value === undefined) setInternalPrompt(nextValue);
    onValueChange?.(nextValue);
  };

  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    const measure = measureRef.current;
    if (!controls || !measure) return;

    const reservedWidth =
      (addRef.current?.offsetWidth ?? chrome.controlSize) +
      (actionsRef.current?.offsetWidth ?? chrome.controlSize) +
      8;
    const inlineInputWidth = controls.clientWidth - reservedWidth;
    const needsFullWidth = prompt.includes("\n") || measure.offsetWidth + 8 > inlineInputWidth;
    if (needsFullWidth !== expanded) setExpanded(needsFullWidth);
  }, [prompt, expanded, chrome.controlSize]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    await onSubmit?.(
      prompt.trim(),
      attachments.map((item) => item.file),
    );
    setPrompt("");
    setAttachments([]);
    setOpenMenu(null);
  };

  const context: PromptComposerContextValue = {
    prompt,
    setPrompt,
    attachments,
    addFiles: (files) => {
      setAttachments((current) => [
        ...current,
        ...files.map((file) => {
          attachmentId.current += 1;
          return { id: String(attachmentId.current), file };
        }),
      ]);
    },
    removeAttachment: (id) => {
      setAttachments((current) => current.filter((item) => item.id !== id));
    },
    busy,
    invalid,
    locked,
    canSend,
    expanded,
    openMenu,
    setOpenMenu,
    inputId,
    addMenuId,
    modelMenuId,
    rootRef,
    controlsRef,
    addRef,
    actionsRef,
    inputRef,
    chrome,
  };

  return (
    <PromptComposerContext.Provider value={context}>
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
        <div
          data-uai-card=""
          className={cn(
            "relative isolate flex flex-col border border-[var(--uai-border)] transition-colors duration-150 focus-within:border-[var(--uai-border-strong)]",
            chrome.cardClass,
            variant === "ghost" && "border-transparent",
            invalid && "border-[var(--uai-danger)] focus-within:border-[var(--uai-danger)]",
          )}
        >
          <span
            ref={measureRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none invisible absolute whitespace-pre",
              chrome.fieldClass,
            )}
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
                    onClick={() => context.removeAttachment(item.id)}
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

          <div
            ref={controlsRef}
            className={cn(
              "grid items-end gap-1",
              expanded ? "grid-cols-[auto_minmax(0,1fr)]" : "grid-cols-[auto_minmax(0,1fr)_auto]",
            )}
          >
            {children}
          </div>
        </div>
      </form>
    </PromptComposerContext.Provider>
  );
}

export type PromptComposerAddProps = Omit<ComponentProps<"div">, "children"> & {
  children: ReactNode;
  label?: string;
};

export function PromptComposerAdd({
  children,
  label = "Add attachments and sources",
  className,
  ...props
}: PromptComposerAddProps) {
  const context = usePromptComposer("PromptComposerAdd");
  const open = context.openMenu === "add";

  return (
    <div
      ref={context.addRef}
      className={cn(
        "relative",
        context.expanded ? "col-start-1 row-start-2" : "col-start-1 row-start-1",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={context.addMenuId}
        disabled={context.locked}
        onClick={() => {
          context.setOpenMenu(open ? null : "add");
          context.inputRef.current?.focus();
        }}
        className={cn(
          "flex shrink-0 items-center justify-center text-[var(--uai-muted)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:bg-[var(--uai-surface-raised)] active:scale-[0.94] disabled:cursor-not-allowed",
          context.chrome.controlClass,
          context.chrome.controlRadiusClass,
          open && "bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
        )}
      >
        <span
          className={cn(
            "grid transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
            open && "rotate-45",
          )}
        >
          <Plus className={context.chrome.iconClass} strokeWidth={2} aria-hidden="true" />
        </span>
      </button>
      {open ? (
        <FloatingMenu id={context.addMenuId} label={label} kind="sources">
          {children}
        </FloatingMenu>
      ) : null}
    </div>
  );
}

export type PromptComposerAddItemProps = Omit<ComponentProps<"button">, "onSelect"> & {
  icon?: ReactNode;
  description?: ReactNode;
  onSelect?: () => void;
};

export function PromptComposerAddItem({
  icon,
  description,
  onSelect,
  children,
  className,
  onClick,
  disabled,
  ...props
}: PromptComposerAddItemProps) {
  const context = usePromptComposer("PromptComposerAddItem");

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      disabled={context.locked || disabled}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.();
        context.setOpenMenu(null);
        context.inputRef.current?.focus();
      }}
      className={cn(
        "relative flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 py-1 text-left font-[inherit] text-[inherit] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:bg-[var(--uai-surface-raised)]",
        className,
      )}
    >
      {icon ? (
        <span className="grid size-[22px] shrink-0 place-items-center text-[var(--uai-muted)]">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] leading-4 font-medium text-[var(--uai-text)]">
          {children}
        </span>
        {description ? (
          <span className="block truncate text-[11.5px] leading-[15px] text-[var(--uai-muted)]">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export type PromptComposerFileItemProps = Omit<
  ComponentProps<"input">,
  "type" | "children" | "onChange"
> & {
  label?: string;
  description?: string;
};

export function PromptComposerFileItem({
  label = "Add photos & files",
  description = "Upload from your computer",
  multiple = true,
  accept,
  disabled,
  ...props
}: PromptComposerFileItemProps) {
  const context = usePromptComposer("PromptComposerFileItem");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <PromptComposerAddItem
        icon={<Paperclip className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        description={description}
        disabled={disabled}
        onSelect={() => inputRef.current?.click()}
      >
        {label}
      </PromptComposerAddItem>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        tabIndex={-1}
        aria-label={label}
        disabled={context.locked || disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) context.addFiles(files);
          event.target.value = "";
        }}
        {...props}
      />
    </>
  );
}

export type PromptComposerInputProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
>;

export function PromptComposerInput({
  placeholder = "Write a message…",
  "aria-label": ariaLabel = "Prompt",
  className,
  onKeyDown,
  disabled,
  ...props
}: PromptComposerInputProps) {
  const context = usePromptComposer("PromptComposerInput");

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      context.setOpenMenu(null);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <textarea
      {...props}
      ref={context.inputRef}
      id={context.inputId}
      rows={1}
      value={context.prompt}
      disabled={context.locked || disabled}
      aria-label={ariaLabel}
      aria-invalid={context.invalid || undefined}
      placeholder={placeholder}
      onChange={(event) => {
        context.setPrompt(event.target.value);
        context.setOpenMenu(null);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        "resize-none overflow-y-auto bg-transparent px-1 text-[var(--uai-text)] caret-[var(--uai-text)] outline-none! [field-sizing:content] selection:bg-[color-mix(in_oklab,var(--uai-text)_18%,transparent)] placeholder:text-[var(--uai-muted)] disabled:cursor-not-allowed",
        context.chrome.fieldClass,
        context.chrome.maxFieldHeightClass,
        context.expanded
          ? "col-span-2 col-start-1 row-start-1 w-full"
          : "col-start-2 row-start-1 min-w-0 w-full",
        className,
      )}
    />
  );
}

export type PromptComposerActionsProps = ComponentProps<"div">;

export function PromptComposerActions({
  className,
  children,
  ...props
}: PromptComposerActionsProps) {
  const context = usePromptComposer("PromptComposerActions");

  return (
    <div
      ref={context.actionsRef}
      className={cn(
        "flex items-center gap-1",
        context.expanded ? "col-start-2 row-start-2 justify-self-end" : "col-start-3 row-start-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type PromptComposerModelSelectProps = Omit<ComponentProps<"div">, "onChange"> & {
  models: readonly PromptComposerModel[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (modelId: string) => void;
  label?: string;
};

export function PromptComposerModelSelect({
  models,
  value,
  defaultValue,
  onValueChange,
  label = "Choose model",
  className,
  ...props
}: PromptComposerModelSelectProps) {
  const context = usePromptComposer("PromptComposerModelSelect");
  const [internalValue, setInternalValue] = useState(defaultValue ?? models[0]?.id ?? "");
  const selectedId = value ?? internalValue;
  const selected = models.find((model) => model.id === selectedId) ?? models[0];
  const open = context.openMenu === "model";

  if (!selected) return null;

  return (
    <div className={cn("relative", className)} {...props}>
      {models.length > 1 ? (
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-controls={context.modelMenuId}
          disabled={context.locked}
          onClick={() => context.setOpenMenu(open ? null : "model")}
          className={cn(
            "flex shrink-0 items-center gap-1 px-1.5 font-medium text-[var(--uai-muted)] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:bg-[var(--uai-surface-raised)] disabled:cursor-not-allowed",
            context.chrome.controlHeightClass,
            context.chrome.controlRadiusClass,
            context.chrome.modelClass,
          )}
        >
          {selected.label}
          <ChevronDown className="size-3" strokeWidth={2.4} aria-hidden="true" />
        </button>
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center px-1.5 font-medium text-[var(--uai-muted)]",
            context.chrome.controlHeightClass,
            context.chrome.modelClass,
          )}
        >
          {selected.label}
        </span>
      )}
      {open && models.length > 1 ? (
        <FloatingMenu id={context.modelMenuId} label={label} kind="models">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              role="menuitemradio"
              aria-checked={model.id === selected.id}
              onClick={() => {
                if (value === undefined) setInternalValue(model.id);
                onValueChange?.(model.id);
                context.setOpenMenu(null);
                context.inputRef.current?.focus();
              }}
              className="relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 text-left font-[inherit] text-[inherit] transition-colors duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:bg-[var(--uai-surface-raised)]"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--uai-text)]">
                {model.label}
              </span>
              <Check
                className={cn(
                  "size-3",
                  model.id === selected.id ? "text-[var(--uai-text)]" : "invisible",
                )}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          ))}
        </FloatingMenu>
      ) : null}
    </div>
  );
}

export type PromptComposerSubmitProps = ComponentProps<"button">;

export function PromptComposerSubmit({
  "aria-label": ariaLabel,
  className,
  children,
  disabled,
  ...props
}: PromptComposerSubmitProps) {
  const context = usePromptComposer("PromptComposerSubmit");

  return (
    <button
      {...props}
      type="submit"
      aria-label={ariaLabel ?? (context.busy ? "Sending prompt" : "Send")}
      disabled={!context.canSend || disabled}
      className={cn(
        "flex shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.94] disabled:cursor-not-allowed",
        context.chrome.controlClass,
        context.chrome.controlRadiusClass,
        context.canSend || context.busy
          ? "bg-[var(--uai-text)] text-[var(--uai-surface)]"
          : "bg-[var(--uai-border-strong)] text-[var(--uai-muted)]",
        className,
      )}
    >
      {children ??
        (context.busy ? (
          <LoaderCircle
            className={cn(context.chrome.iconClass, "motion-safe:animate-spin")}
            aria-hidden="true"
          />
        ) : (
          <ArrowUp className={context.chrome.iconClass} strokeWidth={2.4} aria-hidden="true" />
        ))}
    </button>
  );
}
