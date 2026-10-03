"use client";

import { cva } from "class-variance-authority";
import { Check, Link2, Share, Share2 } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const SHARE_MENU_VARIANTS = ["outlined", "ghost", "compact"] as const;
export type ShareMenuVariant = (typeof SHARE_MENU_VARIANTS)[number];
export type ShareMenuProps = ComponentProps<"div"> & {
  variant?: ShareMenuVariant;
  /** The link to share and copy. */
  url: string;
  /** Title passed to the native share sheet. */
  shareTitle?: string;
  /** Text passed to the native share sheet. */
  shareText?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
type ShareContext = {
  id: string;
  variant: ShareMenuVariant;
  url: string;
  shareTitle?: string;
  shareText?: string;
  open: boolean;
  setOpen: (open: boolean, focus?: "trigger" | "first" | "last") => void;
  focusTarget: React.RefObject<"first" | "last">;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  copied: boolean;
  announce: (message: string, copied?: boolean) => void;
};
const Context = createContext<ShareContext | null>(null);
function useShare(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ShareMenu`);
  return context;
}
const shareMenuTriggerVariants = cva(
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:background-color_120ms_ease-out,box-shadow_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:[transform:scale(0.97)] data-copied:[&_svg]:animate-in data-copied:[&_svg]:fade-in-0 data-copied:[&_svg]:zoom-in-60 data-copied:[&_svg]:text-success data-copied:[&_svg]:duration-220 data-copied:[&_svg]:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:active:[transform:none] motion-reduce:data-copied:[&_svg]:animate-none",
  {
    variants: {
      variant: {
        outlined:
          "h-7 bg-card pr-3 pl-2.5 text-[12.5px] text-foreground shadow-[inset_0_0_0_1px_var(--border)] hover:bg-accent hover:shadow-[inset_0_0_0_1px_var(--border-strong)] aria-expanded:bg-accent aria-expanded:shadow-[inset_0_0_0_1px_var(--border-strong)]",
        ghost:
          "h-7 bg-transparent pr-3 pl-2.5 text-[12.5px] text-muted-foreground shadow-none hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground",
        compact:
          "h-6 bg-secondary pr-2.5 pl-2 text-[12px] text-foreground shadow-none hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] aria-expanded:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
    },
  },
);
const shareMenuItemVariants = cva(
  "box-border flex w-full cursor-pointer items-center rounded-[10px] border-0 bg-transparent text-start text-foreground no-underline outline-offset-[-2px] transition-[background-color] duration-120 ease-[ease-out] hover:bg-accent focus:bg-accent focus:outline-none [&_svg]:flex-none [&_svg]:text-muted-foreground [&_svg]:transition-[color] [&_svg]:duration-120 [&_svg]:ease-[ease-out] hover:[&_svg]:text-foreground focus:[&_svg]:text-foreground motion-reduce:transition-none motion-reduce:[&_svg]:transition-none",
  {
    variants: {
      variant: {
        outlined: "min-h-8 gap-2.5 px-2.5 text-[13px]/[18px]",
        ghost: "min-h-8 gap-2.5 px-2.5 text-[13px]/[18px]",
        compact: "min-h-7 gap-2 px-2 text-[12.5px]/[18px]",
      },
    },
  },
);
function menuItems(menu: HTMLElement | null) {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
  );
}

export function ShareMenu({
  variant = "outlined",
  url,
  shareTitle,
  shareText,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: ShareMenuProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<"first" | "last">("first");
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const current = open ?? internalOpen;
  const setOpen = (next: boolean, focus?: "trigger" | "first" | "last") => {
    if (focus === "first" || focus === "last") focusTarget.current = focus;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (focus === "trigger") triggerRef.current?.focus();
  };
  const closeOnOutside = useRef(setOpen);
  closeOnOutside.current = setOpen;
  useEffect(() => {
    if (!current) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeOnOutside.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [current]);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <Context.Provider
      value={{
        id,
        variant,
        url,
        shareTitle,
        shareText,
        open: current,
        setOpen,
        focusTarget,
        triggerRef,
        copied,
        announce: (next, didCopy = false) => {
          setMessage(next);
          setCopied(didCopy);
        },
      }}
    >
      <div
        data-slot="share-menu"
        data-variant={variant}
        className={cn("relative inline-flex text-[13px]/[18px] text-foreground", className)}
        {...props}
        ref={rootRef}
      >
        {children}
        <span role="status" className="sr-only">
          {message}
        </span>
      </div>
    </Context.Provider>
  );
}

export function ShareMenuTrigger({
  children = "Share",
  onClick,
  onKeyDown,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useShare("ShareMenuTrigger");
  const compact = context.variant === "compact";
  const Icon = context.copied ? Check : Share2;
  return (
    <button
      data-slot="share-menu-trigger"
      className={cn(shareMenuTriggerVariants({ variant: context.variant }), className)}
      {...props}
      ref={context.triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={context.open}
      aria-controls={context.open ? `${context.id}-menu` : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(!context.open, "first");
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          context.setOpen(true, event.key === "ArrowUp" ? "last" : "first");
        }
      }}
      data-copied={context.copied ? "" : undefined}
    >
      <Icon
        key={context.copied ? "copied" : "share"}
        size={compact ? 13 : 14}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {children}
    </button>
  );
}

export function ShareMenuContent({
  align = "start",
  "aria-label": label = "Share options",
  onClick,
  onKeyDown,
  className,
  ...props
}: ComponentProps<"div"> & { align?: "start" | "end" }) {
  const context = useShare("ShareMenuContent");
  const menuRef = useRef<HTMLDivElement>(null);
  const { open, focusTarget } = context;
  useEffect(() => {
    if (!open) return;
    const items = menuItems(menuRef.current);
    (focusTarget.current === "last" ? items.at(-1) : items[0])?.focus();
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce)
      menuRef.current?.animate?.(
        [
          { opacity: 0, transform: "scale(0.96)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
  }, [open, focusTarget]);
  if (!open) return null;
  return (
    <div
      ref={menuRef}
      id={`${context.id}-menu`}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      data-slot="share-menu-content"
      data-align={align}
      className={cn(
        "absolute top-[calc(100%+6px)] z-20 grid gap-px rounded-[14px] bg-popover p-1 shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)]",
        align === "end" ? "end-0 origin-top-right" : "start-0 origin-top-left",
        context.variant === "compact" ? "min-w-[184px]" : "min-w-[200px]",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const link = (event.target as HTMLElement).closest('a[role="menuitem"]');
        if (!event.defaultPrevented && link) context.setOpen(false, "trigger");
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const items = menuItems(menuRef.current);
        const index = items.indexOf(document.activeElement as HTMLElement);
        const move = (next: number) => {
          event.preventDefault();
          items[(next + items.length) % items.length]?.focus();
        };
        if (event.key === "ArrowDown") move(index + 1);
        else if (event.key === "ArrowUp") move(index - 1);
        else if (event.key === "Home") move(0);
        else if (event.key === "End") move(items.length - 1);
        else if (event.key === "Escape") {
          event.preventDefault();
          context.setOpen(false, "trigger");
        } else if (event.key === "Tab") context.setOpen(false);
      }}
    />
  );
}

const highlight = {
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus();
  },
};

/** Opens the operating system share sheet. Renders only where `navigator.share` exists. */
export function ShareMenuNative({
  children = "Share via…",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useShare("ShareMenuNative");
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof navigator.share === "function"), []);
  if (!supported) return null;
  return (
    <button
      data-slot="share-menu-native"
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
      {...props}
      {...highlight}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        context.setOpen(false, "trigger");
        try {
          await navigator.share({
            url: context.url,
            title: context.shareTitle,
            text: context.shareText,
          });
        } catch (error) {
          if ((error as Error)?.name !== "AbortError") context.announce("Sharing failed");
        }
      }}
    >
      <Share size={14} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </button>
  );
}

export function ShareMenuCopy({
  children = "Copy link",
  copiedMessage = "Link copied to clipboard",
  errorMessage = "Couldn’t copy the link",
  onClick,
  className,
  ...props
}: ComponentProps<"button"> & { copiedMessage?: string; errorMessage?: string }) {
  const context = useShare("ShareMenuCopy");
  return (
    <button
      data-slot="share-menu-copy"
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
      {...props}
      {...highlight}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        context.setOpen(false, "trigger");
        try {
          await navigator.clipboard.writeText(context.url);
          context.announce(copiedMessage, true);
        } catch {
          context.announce(errorMessage);
        }
      }}
    >
      <Link2 size={14} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </button>
  );
}

/** A link to a share destination. The menu closes after the link is followed. */
export function ShareMenuChannel({ className, ...props }: ComponentProps<"a">) {
  const context = useShare("ShareMenuChannel");
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      data-slot="share-menu-channel"
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
      {...props}
      {...highlight}
      role="menuitem"
      tabIndex={-1}
    />
  );
}

export function ShareMenuSeparator({ className, ...props }: ComponentProps<"hr">) {
  useShare("ShareMenuSeparator");
  return (
    <hr
      data-slot="share-menu-separator"
      className={cn("mx-2 my-1 h-px border-0 bg-border", className)}
      {...props}
    />
  );
}
