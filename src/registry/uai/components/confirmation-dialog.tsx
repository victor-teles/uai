"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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
const buttonTones = cva(
  "cursor-pointer whitespace-nowrap rounded-full border-0 font-medium transition-[background-color,filter,color,transform] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      tone: {
        trigger: "bg-destructive/12 text-destructive hover:bg-destructive/18",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        danger:
          "bg-destructive text-[oklch(0.99_0_0)] enabled:hover:brightness-108 disabled:cursor-not-allowed disabled:bg-muted disabled:text-subtle-foreground",
      },
      size: {
        default: "h-8 px-3.5 text-[13px]/[18px]",
        compact: "h-7 px-3 text-[12.5px]/[18px]",
      },
    },
  },
);

const dialogVariants = cva(
  "box-border max-w-full border-0 bg-popover text-[13px]/[18px] text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_18px_48px_-16px_oklch(0_0_0/0.36)] open:animate-in open:fade-in-0 backdrop:bg-background/62 backdrop:backdrop-blur-[2px] backdrop:animate-in backdrop:fade-in-0 backdrop:duration-180 backdrop:ease-out motion-reduce:open:animate-none motion-reduce:backdrop:animate-none",
  {
    variants: {
      variant: {
        centered:
          "m-auto w-[min(100%_-_32px,440px)] rounded-[14px] p-5 open:zoom-in-96 open:duration-180 open:ease-[cubic-bezier(0.16,1,0.3,1)]",
        sheet:
          "mx-auto mt-auto mb-0 w-[min(100%,560px)] rounded-t-3xl rounded-b-none px-5 pt-5 pb-6 open:slide-in-from-bottom-[24px] open:duration-300 open:ease-out-quint",
        compact:
          "m-auto w-[min(100%_-_32px,360px)] rounded-xl p-4 open:zoom-in-96 open:duration-180 open:ease-[cubic-bezier(0.16,1,0.3,1)]",
      },
    },
  },
);

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
      <div data-slot="confirmation-dialog" data-variant={variant} className="contents">
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
      data-slot="confirmation-dialog-trigger"
      className={cn(buttonTones({ tone: "trigger", size: "compact" }), className)}
      {...props}
      ref={context.triggerRef}
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
  className,
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
  return (
    <dialog
      role="alertdialog"
      aria-labelledby={`${context.id}-title`}
      aria-describedby={`${context.id}-description`}
      data-slot="confirmation-dialog-content"
      className={cn(dialogVariants({ variant: context.variant }), className)}
      {...props}
      ref={ref}
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
    >
      {context.open ? (
        <div className={cn("grid", compact ? "gap-3" : "gap-4")}>{children}</div>
      ) : null}
    </dialog>
  );
}

export function ConfirmationDialogTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useConfirmation("ConfirmationDialogTitle");
  return (
    <h2
      data-slot="confirmation-dialog-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        context.variant === "compact" ? "text-[14px]/5" : "text-[15px]/5",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ConfirmationDialogDescription({ className, ...props }: ComponentProps<"div">) {
  const context = useConfirmation("ConfirmationDialogDescription");
  return (
    <div
      data-slot="confirmation-dialog-description"
      className={cn("grid gap-2.5 text-pretty text-muted-foreground", className)}
      {...props}
      id={`${context.id}-description`}
    />
  );
}

export function ConfirmationDialogImpact({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="confirmation-dialog-impact"
      className={cn(
        "m-0 grid list-disc gap-1 rounded-[10px] bg-muted py-2.5 pr-3 pl-7 text-[12.5px] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function ConfirmationDialogInput({
  match,
  children,
  className,
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
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-[12px] text-muted-foreground">
        {children ?? (
          <>
            Type{" "}
            <strong className="rounded-md bg-muted px-1.25 py-px [font-family:ui-monospace,SFMono-Regular,Menlo,monospace] text-[11.5px] font-medium text-foreground">
              {match}
            </strong>{" "}
            to confirm
          </>
        )}
      </label>
      <input
        autoComplete="off"
        spellCheck={false}
        data-slot="confirmation-dialog-input"
        className={cn(
          "h-8 rounded-[10px] border bg-background px-2.5 text-[13px] text-inherit transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong focus:border-border-strong focus:outline-none focus:ring-3 focus:ring-primary/18 motion-reduce:transition-none",
          className,
        )}
        {...props}
        id={inputId}
        value={context.typed}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setTyped(event.target.value);
        }}
      />
    </div>
  );
}

export function ConfirmationDialogActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="confirmation-dialog-actions"
      className={cn("flex flex-wrap-reverse justify-end gap-2", className)}
      {...props}
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
      data-slot="confirmation-dialog-cancel"
      className={cn(
        buttonTones({
          tone: "secondary",
          size: context.variant === "compact" ? "compact" : "default",
        }),
        className,
      )}
      {...props}
      ref={context.cancelRef}
      type="button"
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
      data-slot="confirmation-dialog-confirm"
      className={cn(
        buttonTones({
          tone: "danger",
          size: context.variant === "compact" ? "compact" : "default",
        }),
        className,
      )}
      {...props}
      type="button"
      disabled={blocked}
      data-tone="danger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    />
  );
}
