"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const CONFIRMATION_DIALOG_VARIANTS = ["centered", "sheet", "compact"] as const;
export type ConfirmationDialogVariant = (typeof CONFIRMATION_DIALOG_VARIANTS)[number];
export type ConfirmationDialogProps = {
  variant?: ConfirmationDialogVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};
type DialogContext = {
  id: string;
  variant: ConfirmationDialogVariant;
  open: boolean;
  setOpen: (open: boolean) => void;
  phrase: string | null;
  setPhrase: (phrase: string | null) => void;
  typed: string;
  setTyped: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  cancelRef: React.RefObject<HTMLButtonElement | null>;
};
const Context = createContext<DialogContext | null>(null);
function useConfirmation(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ConfirmationDialog`);
  return context;
}
const motionCss = `
.uai-confirmation-dialog[open]{animation:uai-confirmation-in 180ms cubic-bezier(0.16,1,0.3,1)}
.uai-confirmation-dialog[open][data-variant="sheet"]{animation:uai-confirmation-sheet-in 300ms cubic-bezier(0.23,1,0.32,1)}
.uai-confirmation-dialog::backdrop{background:color-mix(in oklab,var(--uai-canvas) 62%,transparent);backdrop-filter:blur(2px);animation:uai-confirmation-fade 180ms ease-out}
@keyframes uai-confirmation-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:none}}
@keyframes uai-confirmation-sheet-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes uai-confirmation-fade{from{opacity:0}to{opacity:1}}
.uai-confirmation-dialog__button{height:32px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:13px;font-weight:500;line-height:18px;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease-out,filter 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-confirmation-dialog__button:active:not(:disabled){transform:scale(0.97)}
.uai-confirmation-dialog__button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-confirmation-dialog__button[data-tone="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-confirmation-dialog__button[data-tone="secondary"]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-confirmation-dialog__button[data-tone="trigger"]{height:28px;padding:0 12px;font-size:12.5px;background:color-mix(in oklab,var(--uai-danger) 12%,transparent);color:var(--uai-danger)}
.uai-confirmation-dialog__button[data-tone="trigger"]:hover{background:color-mix(in oklab,var(--uai-danger) 18%,transparent)}
.uai-confirmation-dialog__button[data-tone="danger"]{background:var(--uai-danger);color:oklch(0.99 0 0)}
.uai-confirmation-dialog__button[data-tone="danger"]:hover:not(:disabled){filter:brightness(1.08)}
.uai-confirmation-dialog__button[data-tone="danger"]:disabled{background:var(--uai-surface-raised);color:var(--uai-subtle);cursor:not-allowed}
.uai-confirmation-dialog[data-variant="compact"] .uai-confirmation-dialog__button{height:28px;padding:0 12px;font-size:12.5px}
.uai-confirmation-dialog__input{transition:border-color 120ms ease-out,box-shadow 120ms ease-out}
.uai-confirmation-dialog__input:hover{border-color:var(--uai-border-strong)!important}
.uai-confirmation-dialog__input:focus{outline:none;border-color:var(--uai-border-strong)!important;box-shadow:0 0 0 3px color-mix(in oklab,var(--uai-accent) 18%,transparent)}
@media (prefers-reduced-motion: reduce){.uai-confirmation-dialog[open],.uai-confirmation-dialog::backdrop{animation:none}.uai-confirmation-dialog__button,.uai-confirmation-dialog__input{transition:none}.uai-confirmation-dialog__button:active:not(:disabled){transform:none}}
`;

export function ConfirmationDialog({
  variant = "centered",
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: ConfirmationDialogProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const [phrase, setPhrase] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const current = open ?? internal;
  const setOpen = (next: boolean) => {
    if (next === current) return;
    if (!next) setTyped("");
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  return (
    <Context.Provider
      value={{
        id,
        variant,
        open: current,
        setOpen,
        phrase,
        setPhrase,
        typed,
        setTyped,
        triggerRef,
        cancelRef,
      }}
    >
      <div data-variant={variant} style={{ display: "contents" }}>
        {children}
      </div>
    </Context.Provider>
  );
}

export function ConfirmationDialogTrigger({
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useConfirmation("ConfirmationDialogTrigger");
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      {...props}
      ref={context.triggerRef}
      className={["uai-confirmation-dialog__button", className].filter(Boolean).join(" ")}
      data-tone="trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(true);
      }}
    />
  );
}

export function ConfirmationDialogContent({
  children,
  style,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"dialog">, "open">) {
  const context = useConfirmation("ConfirmationDialogContent");
  const ref = useRef<HTMLDialogElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const { open, cancelRef, triggerRef } = context;
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const active = document.activeElement;
      returnRef.current =
        active instanceof HTMLElement && active !== document.body ? active : triggerRef.current;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      const preferred = dialog.querySelector<HTMLElement>("[autofocus], [data-autofocus]");
      (preferred ?? cancelRef.current)?.focus();
    }
    if (!open && dialog.open) {
      dialog.close();
      (returnRef.current ?? triggerRef.current)?.focus();
    }
  }, [open, cancelRef, triggerRef]);
  const compact = context.variant === "compact";
  const sheet = context.variant === "sheet";
  return (
    <dialog
      role="alertdialog"
      aria-labelledby={`${context.id}-title`}
      aria-describedby={`${context.id}-description`}
      {...props}
      ref={ref}
      className={["uai-confirmation-dialog", props.className].filter(Boolean).join(" ")}
      data-variant={context.variant}
      onCancel={(event) => {
        event.preventDefault();
        context.setOpen(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape") {
          event.preventDefault();
          context.setOpen(false);
        }
      }}
      style={{
        boxSizing: "border-box",
        width: sheet
          ? "min(100%, 560px)"
          : compact
            ? "min(100% - 32px, 360px)"
            : "min(100% - 32px, 440px)",
        maxWidth: "100%",
        margin: sheet ? "auto auto 0" : "auto",
        padding: compact ? 16 : sheet ? "20px 20px 24px" : 20,
        border: 0,
        borderRadius: sheet ? "24px 24px 0 0" : compact ? 12 : 14,
        background: "var(--uai-surface)",
        color: "var(--uai-text)",
        boxShadow: "0 0 0 1px var(--uai-border-strong), 0 18px 48px -16px oklch(0 0 0 / 0.36)",
        fontSize: 13,
        lineHeight: "18px",
        ...style,
      }}
    >
      <style>{motionCss}</style>
      {context.open ? (
        <div style={{ display: "grid", gap: compact ? 12 : 16 }}>{children}</div>
      ) : null}
    </dialog>
  );
}

export function ConfirmationDialogTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useConfirmation("ConfirmationDialogTitle");
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: context.variant === "compact" ? 14 : 15,
        lineHeight: "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function ConfirmationDialogDescription({ style, ...props }: ComponentProps<"div">) {
  const context = useConfirmation("ConfirmationDialogDescription");
  return (
    <div
      {...props}
      id={`${context.id}-description`}
      style={{ display: "grid", gap: 10, color: "var(--uai-muted)", textWrap: "pretty", ...style }}
    />
  );
}

export function ConfirmationDialogImpact({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 4,
        margin: 0,
        padding: "10px 12px 10px 28px",
        listStyle: "disc",
        borderRadius: 10,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 12.5,
        ...style,
      }}
    />
  );
}

export function ConfirmationDialogInput({
  match,
  children,
  style,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue" | "id"> & {
  /** Exact text the person must type before Confirm enables. */
  match: string;
}) {
  const context = useConfirmation("ConfirmationDialogInput");
  const { setPhrase } = context;
  useLayoutEffect(() => {
    setPhrase(match);
    return () => setPhrase(null);
  }, [match, setPhrase]);
  const inputId = `${context.id}-input`;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={inputId} style={{ fontSize: 12, color: "var(--uai-muted)" }}>
        {children ?? (
          <>
            Type{" "}
            <strong
              style={{
                padding: "1px 5px",
                borderRadius: 6,
                background: "var(--uai-surface-raised)",
                color: "var(--uai-text)",
                fontWeight: 500,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11.5,
              }}
            >
              {match}
            </strong>{" "}
            to confirm
          </>
        )}
      </label>
      <input
        autoComplete="off"
        spellCheck={false}
        {...props}
        id={inputId}
        className={["uai-confirmation-dialog__input", props.className].filter(Boolean).join(" ")}
        value={context.typed}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setTyped(event.target.value);
        }}
        style={{
          height: 32,
          padding: "0 10px",
          border: "1px solid var(--uai-border)",
          borderRadius: 10,
          background: "var(--uai-canvas)",
          color: "inherit",
          font: "inherit",
          fontSize: 13,
          ...style,
        }}
      />
    </div>
  );
}

export function ConfirmationDialogActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap-reverse",
        justifyContent: "flex-end",
        gap: 8,
        ...style,
      }}
    />
  );
}

export function ConfirmationDialogCancel({
  children = "Cancel",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useConfirmation("ConfirmationDialogCancel");
  return (
    <button
      {...props}
      ref={context.cancelRef}
      type="button"
      className={["uai-confirmation-dialog__button", className].filter(Boolean).join(" ")}
      data-tone="secondary"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export function ConfirmationDialogConfirm({
  onClick,
  disabled,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useConfirmation("ConfirmationDialogConfirm");
  const blocked = disabled || (context.phrase !== null && context.typed !== context.phrase);
  return (
    <button
      {...props}
      type="button"
      disabled={blocked}
      className={["uai-confirmation-dialog__button", className].filter(Boolean).join(" ")}
      data-tone="danger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    />
  );
}
