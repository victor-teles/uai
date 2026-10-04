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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  "cursor-pointer whitespace-nowrap rounded-full border-0 py-0 font-medium transition-[background-color,filter,color,transform] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
  {
    variants: {
      tone: {
        trigger:
          "bg-destructive/12 text-destructive hover:bg-destructive/18 hover:text-destructive dark:hover:bg-destructive/18",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        danger:
          "bg-destructive text-[oklch(0.99_0_0)] hover:bg-destructive enabled:hover:brightness-108 disabled:bg-muted disabled:text-subtle-foreground disabled:opacity-100 dark:bg-destructive dark:disabled:bg-muted",
      },
      size: {
        default: "h-8 px-3.5 text-[13px]/[18px] has-[>svg]:px-3.5",
        compact: "h-7 px-3 text-[12.5px]/[18px] has-[>svg]:px-3",
      },
    },
  },
);

const dialogVariants = cva(
  "box-border border-0 bg-popover text-[13px]/[18px] text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_18px_48px_-16px_oklch(0_0_0/0.36)] motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
  {
    variants: {
      variant: {
        centered:
          "w-[min(100%_-_32px,440px)] gap-4 rounded-[14px] p-5 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96",
        sheet:
          "top-auto bottom-0 w-[min(100%,560px)] max-w-full translate-y-0 gap-4 rounded-t-3xl rounded-b-none px-5 pt-5 pb-6 duration-300 ease-out-quint data-[size=default]:sm:max-w-[560px] data-[state=closed]:slide-out-to-bottom-[24px] data-[state=open]:slide-in-from-bottom-[24px] data-[state=closed]:[--tw-exit-scale:1]! data-[state=open]:[--tw-enter-scale:1]!",
        compact:
          "w-[min(100%_-_32px,360px)] gap-3 rounded-xl p-4 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96",
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
      <AlertDialog open={current} onOpenChange={setOpen}>
        <div data-slot="confirmation-dialog" data-variant={variant} className="contents">
          {children}
        </div>
      </AlertDialog>
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
    <AlertDialogTrigger asChild onClick={onClick}>
      <Button
        type="button"
        variant="ghost"
        data-slot="confirmation-dialog-trigger"
        className={cn(buttonTones({ tone: "trigger", size: "compact" }), className)}
        {...props}
        ref={context.triggerRef}
        data-tone="trigger"
      />
    </AlertDialogTrigger>
  );
}

export function ConfirmationDialogContent({
  className,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: Omit<ComponentProps<typeof AlertDialogContent>, "size">) {
  const context = useConfirmation("ConfirmationDialogContent");
  const returnRef = useRef<HTMLElement | null>(null);
  const { cancelRef, triggerRef } = context;
  return (
    <AlertDialogContent
      data-slot="confirmation-dialog-content"
      className={cn(dialogVariants({ variant: context.variant }), className)}
      {...props}
      data-variant={context.variant}
      onOpenAutoFocus={(event) => {
        const active = document.activeElement;
        returnRef.current =
          active instanceof HTMLElement && active !== document.body ? active : triggerRef.current;
        onOpenAutoFocus?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        const content = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
        const preferred = content?.querySelector<HTMLElement>("[autofocus], [data-autofocus]");
        (preferred ?? cancelRef.current)?.focus();
      }}
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        (returnRef.current ?? triggerRef.current)?.focus();
      }}
    />
  );
}

export function ConfirmationDialogTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useConfirmation("ConfirmationDialogTitle");
  return (
    <AlertDialogTitle
      data-slot="confirmation-dialog-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        context.variant === "compact" ? "text-[14px]/5" : "text-[15px]/5",
        className,
      )}
      {...props}
    />
  );
}

export function ConfirmationDialogDescription({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  useConfirmation("ConfirmationDialogDescription");
  return (
    <AlertDialogDescription
      asChild
      data-slot="confirmation-dialog-description"
      className={cn("grid gap-2.5 text-[13px]/[18px] text-pretty text-muted-foreground", className)}
    >
      <div {...props}>{children}</div>
    </AlertDialogDescription>
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
      <Label
        htmlFor={inputId}
        className="block text-[12px]/[18px] font-normal text-muted-foreground select-auto"
      >
        {children ?? (
          <>
            Type{" "}
            <strong className="rounded-md bg-muted px-1.25 py-px [font-family:ui-monospace,SFMono-Regular,Menlo,monospace] text-[11.5px] font-medium text-foreground">
              {match}
            </strong>{" "}
            to confirm
          </>
        )}
      </Label>
      <Input
        autoComplete="off"
        spellCheck={false}
        data-slot="confirmation-dialog-input"
        className={cn(
          "h-8 rounded-[10px] border-border bg-background px-2.5 py-0 text-[13px] text-inherit shadow-none transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong focus-visible:border-border-strong focus-visible:ring-3 focus-visible:ring-primary/18 md:text-[13px] motion-reduce:transition-none dark:bg-background",
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
    <Button
      variant="secondary"
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
    </Button>
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
    <Button
      variant="destructive"
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
