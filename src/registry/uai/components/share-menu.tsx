"use client";

import { cva } from "class-variance-authority";
import { Check, Link2, Share, Share2 } from "lucide-react";
import { type ComponentProps, createContext, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  variant: ShareMenuVariant;
  url: string;
  shareTitle?: string;
  shareText?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusTarget: React.RefObject<"first" | "last">;
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
  "gap-1.5 rounded-full border-0 py-0 font-medium whitespace-nowrap transition-[background-color,box-shadow,color,scale] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] data-copied:[&_svg]:animate-in data-copied:[&_svg]:fade-in-0 data-copied:[&_svg]:zoom-in-60 data-copied:[&_svg]:text-success data-copied:[&_svg]:duration-220 data-copied:[&_svg]:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:data-copied:[&_svg]:animate-none",
  {
    variants: {
      variant: {
        outlined:
          "h-7 bg-card pr-3 pl-2.5 text-[12.5px] text-foreground shadow-[inset_0_0_0_1px_var(--border)] hover:bg-accent hover:text-foreground hover:shadow-[inset_0_0_0_1px_var(--border-strong)] has-[>svg]:pr-3 has-[>svg]:pl-2.5 aria-expanded:bg-accent aria-expanded:shadow-[inset_0_0_0_1px_var(--border-strong)] dark:bg-card dark:hover:bg-accent dark:aria-expanded:bg-accent",
        ghost:
          "h-7 bg-transparent pr-3 pl-2.5 text-[12.5px] text-muted-foreground shadow-none hover:bg-accent hover:text-foreground has-[>svg]:pr-3 has-[>svg]:pl-2.5 aria-expanded:bg-accent aria-expanded:text-foreground dark:hover:bg-accent",
        compact:
          "h-6 bg-secondary pr-2.5 pl-2 text-[12px] text-foreground shadow-none hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] has-[>svg]:pr-2.5 has-[>svg]:pl-2 aria-expanded:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
    },
  },
);
const shareMenuTriggerButtonVariant = {
  outlined: "outline",
  ghost: "ghost",
  compact: "secondary",
} as const satisfies Record<ShareMenuVariant, ComponentProps<typeof Button>["variant"]>;
const shareMenuItemVariants = cva(
  "box-border flex w-full cursor-pointer items-center rounded-[10px] border-0 bg-transparent py-0 text-start text-foreground no-underline outline-offset-[-2px] transition-[background-color] duration-120 ease-[ease-out] focus:bg-accent focus:text-foreground focus:outline-none [&_svg]:flex-none [&_svg]:text-muted-foreground [&_svg]:transition-[color] [&_svg]:duration-120 [&_svg]:ease-[ease-out] focus:[&_svg]:text-foreground motion-reduce:transition-none motion-reduce:[&_svg]:transition-none [&_svg:not([class*='size-'])]:size-auto",
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
  const focusTarget = useRef<"first" | "last">("first");
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const current = open ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <Context.Provider
      value={{
        variant,
        url,
        shareTitle,
        shareText,
        open: current,
        setOpen,
        focusTarget,
        copied,
        announce: (next, didCopy = false) => {
          setMessage(next);
          setCopied(didCopy);
        },
      }}
    >
      <DropdownMenu open={current} onOpenChange={setOpen} modal={false}>
        <div
          data-slot="share-menu"
          data-variant={variant}
          className={cn("relative inline-flex text-[13px]/[18px] text-foreground", className)}
          {...props}
        >
          {children}
          <span role="status" className="sr-only">
            {message}
          </span>
        </div>
      </DropdownMenu>
    </Context.Provider>
  );
}

export function ShareMenuTrigger({
  children = "Share",
  onKeyDown,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useShare("ShareMenuTrigger");
  const compact = context.variant === "compact";
  const Icon = context.copied ? Check : Share2;
  return (
    <DropdownMenuTrigger
      asChild
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        context.focusTarget.current = event.key === "ArrowUp" ? "last" : "first";
        if (event.key === "ArrowUp") {
          event.preventDefault();
          context.setOpen(true);
        }
      }}
    >
      <Button
        variant={shareMenuTriggerButtonVariant[context.variant]}
        data-slot="share-menu-trigger"
        className={cn(shareMenuTriggerVariants({ variant: context.variant }), className)}
        {...props}
        type="button"
        data-copied={context.copied ? "" : undefined}
      >
        <Icon
          key={context.copied ? "copied" : "share"}
          className={compact ? "size-[13px]" : "size-3.5"}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {children}
      </Button>
    </DropdownMenuTrigger>
  );
}

export function ShareMenuContent({
  align = "start",
  "aria-label": label = "Share options",
  onFocus,
  className,
  ...props
}: Omit<ComponentProps<typeof DropdownMenuContent>, "align"> & { align?: "start" | "end" }) {
  const context = useShare("ShareMenuContent");
  const { focusTarget } = context;
  return (
    <DropdownMenuContent
      aria-label={label}
      align={align}
      sideOffset={6}
      loop
      data-slot="share-menu-content"
      data-align={align}
      className={cn(
        "z-20 grid gap-px rounded-[14px] border-0 bg-popover p-1 shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)]",
        "duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[state=open]:[--tw-enter-translate-x:0]! data-[state=open]:[--tw-enter-translate-y:0]! motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
        context.variant === "compact" ? "min-w-[184px]" : "min-w-[200px]",
        className,
      )}
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        // ArrowUp on the trigger opens the menu on its last item.
        const target = focusTarget.current;
        focusTarget.current = "first";
        if (target !== "last") return;
        event.preventDefault();
        const items = event.currentTarget.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([data-disabled])',
        );
        items[items.length - 1]?.focus();
      }}
    />
  );
}

/** Opens the operating system share sheet. Renders only where `navigator.share` exists. */
export function ShareMenuNative({
  children = "Share via…",
  onClick,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem>) {
  const context = useShare("ShareMenuNative");
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof navigator.share === "function"), []);
  if (!supported) return null;
  return (
    <DropdownMenuItem
      data-slot="share-menu-native"
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
      {...props}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
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
      <Share className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {children}
    </DropdownMenuItem>
  );
}

export function ShareMenuCopy({
  children = "Copy link",
  copiedMessage = "Link copied to clipboard",
  errorMessage = "Couldn’t copy the link",
  onClick,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem> & { copiedMessage?: string; errorMessage?: string }) {
  const context = useShare("ShareMenuCopy");
  return (
    <DropdownMenuItem
      data-slot="share-menu-copy"
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
      {...props}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        try {
          await navigator.clipboard.writeText(context.url);
          context.announce(copiedMessage, true);
        } catch {
          context.announce(errorMessage);
        }
      }}
    >
      <Link2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {children}
    </DropdownMenuItem>
  );
}

/** A link to a share destination. The menu closes after the link is followed. */
export function ShareMenuChannel({ className, ...props }: ComponentProps<"a">) {
  const context = useShare("ShareMenuChannel");
  return (
    <DropdownMenuItem
      asChild
      className={cn(shareMenuItemVariants({ variant: context.variant }), className)}
    >
      <a target="_blank" rel="noopener noreferrer" data-slot="share-menu-channel" {...props} />
    </DropdownMenuItem>
  );
}

export function ShareMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSeparator>) {
  useShare("ShareMenuSeparator");
  return (
    <DropdownMenuSeparator
      data-slot="share-menu-separator"
      className={cn("mx-2 my-1 h-px border-0 bg-border", className)}
      {...props}
    />
  );
}
