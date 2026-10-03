"use client";

import { cva } from "class-variance-authority";
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

const promptComposerCardVariants = cva(
  "relative isolate flex flex-col border bg-card transition-colors duration-150 focus-within:border-border-strong",
  {
    variants: {
      variant: {
        rounded: "gap-1.5 rounded-[14px] p-1.5",
        pill: "gap-1 p-1",
        ghost: "gap-1.5 rounded-[14px] border-transparent bg-transparent p-1",
        compact: "gap-1 rounded-xl p-1",
      },
      open: { true: "", false: "" },
      invalid: { true: "border-destructive focus-within:border-destructive", false: "" },
    },
    compoundVariants: [
      { variant: "pill", open: false, className: "rounded-full" },
      { variant: "pill", open: true, className: "rounded-3xl" },
    ],
  },
);

function composerChrome(variant: PromptComposerVariant) {
  const compact = variant === "compact";
  const pill = variant === "pill";

  return {
    compact,
    pill,
    controlSize: compact ? 24 : 28,
    controlClass: compact ? "size-6" : "size-7",
    controlHeightClass: compact ? "h-6" : "h-7",
    controlRadiusClass: pill ? "rounded-full" : compact ? "rounded-[6px]" : "rounded-lg",
    chipClass: cn(
      compact ? "h-5.5 text-[11px]" : "h-6.5 text-[11.5px]",
      pill ? "rounded-full" : compact ? "rounded-[5px]" : "rounded-md",
    ),
    fieldClass: compact ? "min-h-6 py-1 text-[12.5px]/4" : "min-h-7 py-1.25 text-[13px]/[18px]",
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
      data-slot="prompt-composer-menu"
      className={cn(
        "absolute bottom-full z-10 mb-2 rounded-[14px] bg-popover text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_10px_28px_color-mix(in_oklab,black_42%,transparent)] transition-[opacity,transform] duration-180 ease-out-quint starting:scale-[0.96] starting:opacity-0 motion-reduce:transition-none",
        kind === "sources"
          ? "left-0 w-[min(340px,calc(100vw-32px))] origin-bottom-left"
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
  const chrome = composerChrome(variant);

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
        data-slot="prompt-composer"
        data-variant={variant}
        data-invalid={invalid || undefined}
        className={cn("relative", disabled && "opacity-55", className)}
        aria-busy={busy || undefined}
        aria-disabled={disabled || undefined}
        {...props}
        onSubmit={submit}
      >
        <div
          data-slot="prompt-composer-card"
          className={cn(
            promptComposerCardVariants({
              variant,
              open: expanded || attachments.length > 0,
              invalid,
            }),
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
                    "flex items-center gap-1.5 bg-muted py-1 pr-1 pl-1.5 text-muted-foreground",
                    chrome.chipClass,
                  )}
                >
                  <FileText className="size-3" aria-hidden="true" />
                  <span className="max-w-36 truncate text-card-foreground">{item.file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    disabled={locked}
                    onClick={() => context.removeAttachment(item.id)}
                    className={cn(
                      "grid size-4 place-items-center text-muted-foreground transition-colors duration-100 hover:text-card-foreground",
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
      data-slot="prompt-composer-add"
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
          "flex shrink-0 items-center justify-center text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent active:scale-[0.94] disabled:cursor-not-allowed",
          context.chrome.controlClass,
          context.chrome.controlRadiusClass,
          open && "bg-accent text-accent-foreground",
        )}
      >
        <span
          className={cn(
            "grid transition-transform duration-160 ease-out-quint",
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
      data-slot="prompt-composer-add-item"
      type="button"
      role="menuitem"
      {...props}
      disabled={context.locked || disabled}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.();
        context.setOpenMenu(null);
        context.inputRef.current?.focus();
      }}
      className={cn(
        "group/item relative flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left font-[inherit] text-[inherit] outline-none transition-colors duration-120 ease-out hover:bg-accent focus-visible:bg-accent disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
    >
      {icon ? (
        <span className="grid size-5 shrink-0 place-items-center text-muted-foreground transition-colors duration-120 group-hover/item:text-popover-foreground [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="shrink-0 truncate text-[13px]/[18px] font-medium text-popover-foreground">
          {children}
        </span>
        {description ? (
          <span className="min-w-0 truncate text-[12.5px]/[18px] text-subtle-foreground">
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
  className,
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
        data-slot="prompt-composer-file-item"
        type="file"
        multiple={multiple}
        accept={accept}
        className={cn("hidden", className)}
        tabIndex={-1}
        aria-label={label}
        {...props}
        disabled={context.locked || disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) context.addFiles(files);
          event.target.value = "";
        }}
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
      data-slot="prompt-composer-input"
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
        "resize-none overflow-y-auto bg-transparent px-1 text-card-foreground caret-card-foreground outline-none! field-sizing-content selection:bg-foreground/18 placeholder:text-subtle-foreground disabled:cursor-not-allowed",
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
      data-slot="prompt-composer-actions"
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
    <div data-slot="prompt-composer-model-select" className={cn("relative", className)} {...props}>
      {models.length > 1 ? (
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-controls={context.modelMenuId}
          disabled={context.locked}
          onClick={() => context.setOpenMenu(open ? null : "model")}
          className={cn(
            "flex shrink-0 items-center gap-1 px-2 font-medium text-muted-foreground transition-colors duration-120 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent disabled:cursor-not-allowed motion-reduce:transition-none",
            context.chrome.controlHeightClass,
            context.chrome.controlRadiusClass,
            context.chrome.modelClass,
            open && "bg-accent text-accent-foreground",
          )}
        >
          {selected.label}
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-180 ease-out-quint motion-reduce:transition-none",
              open && "rotate-180",
            )}
            strokeWidth={2.4}
            aria-hidden="true"
          />
        </button>
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center px-1.5 font-medium text-muted-foreground",
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
              className="relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent px-2 text-left font-[inherit] text-[inherit] transition-colors duration-150 hover:bg-accent focus-visible:bg-accent"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-popover-foreground">
                {model.label}
              </span>
              <Check
                className={cn(
                  "size-3",
                  model.id === selected.id ? "text-popover-foreground" : "invisible",
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
      data-slot="prompt-composer-submit"
      {...props}
      type="submit"
      aria-label={ariaLabel ?? (context.busy ? "Sending prompt" : "Send")}
      disabled={!context.canSend || disabled}
      className={cn(
        "flex shrink-0 items-center justify-center transition-[background-color,color,opacity,transform] duration-140 ease-out-quint enabled:hover:opacity-90 enabled:active:scale-[0.94] disabled:cursor-not-allowed motion-reduce:transition-none",
        context.chrome.controlClass,
        context.chrome.controlRadiusClass,
        context.canSend || context.busy
          ? "bg-foreground text-card"
          : "bg-border-strong text-muted-foreground",
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
