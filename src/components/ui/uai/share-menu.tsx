"use client";

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
const floatingShadow =
  "0 0 0 1px var(--uai-border-strong), 0 12px 28px -10px oklch(0 0 0 / 0.32), 0 2px 6px -2px oklch(0 0 0 / 0.12)";
const shareCss = `
.uai-share-trigger{background:var(--uai-surface);box-shadow:inset 0 0 0 1px var(--uai-border);color:var(--uai-text);transition:background-color 120ms ease-out,box-shadow 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-share-trigger:hover,.uai-share-trigger[aria-expanded=true]{background:var(--uai-surface-raised);box-shadow:inset 0 0 0 1px var(--uai-border-strong)}
.uai-share[data-variant=ghost] .uai-share-trigger{background:transparent;box-shadow:none;color:var(--uai-muted)}
.uai-share[data-variant=ghost] .uai-share-trigger:hover,.uai-share[data-variant=ghost] .uai-share-trigger[aria-expanded=true]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-share[data-variant=compact] .uai-share-trigger{background:var(--uai-surface-raised);box-shadow:none}
.uai-share[data-variant=compact] .uai-share-trigger:hover,.uai-share[data-variant=compact] .uai-share-trigger[aria-expanded=true]{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-share-trigger:active{transform:scale(0.97)}
.uai-share-trigger:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-share-trigger[data-copied] svg{color:var(--uai-success);animation:uai-share-check 220ms cubic-bezier(0.16,1,0.3,1)}
.uai-share-item{background:transparent;transition:background-color 120ms ease-out}
.uai-share-item:focus,.uai-share-item:hover{background:var(--uai-surface-raised);outline:none}
.uai-share-item:focus-visible{outline:none}
.uai-share-item svg{flex:none;color:var(--uai-muted);transition:color 120ms ease-out}
.uai-share-item:is(:focus,:hover) svg{color:var(--uai-text)}
@keyframes uai-share-check{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-share-trigger,.uai-share-item,.uai-share-item svg{transition:none}
.uai-share-trigger:active{transform:none}
.uai-share-trigger[data-copied] svg{animation:none}
}
`;
function cx(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(" ");
}
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
  style,
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
        ref={rootRef}
        {...props}
        data-variant={variant}
        className={cx("uai-share", className)}
        style={{
          position: "relative",
          display: "inline-flex",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{shareCss}</style>
        {children}
        <span
          role="status"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clipPath: "inset(50%)",
            whiteSpace: "nowrap",
          }}
        >
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
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useShare("ShareMenuTrigger");
  const compact = context.variant === "compact";
  const Icon = context.copied ? Check : Share2;
  return (
    <button
      ref={context.triggerRef}
      {...props}
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
      className={cx("uai-share-trigger", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: compact ? 24 : 28,
        padding: compact ? "0 10px 0 8px" : "0 12px 0 10px",
        border: 0,
        borderRadius: 999,
        fontSize: compact ? 12 : 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
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
  style,
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
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        [align === "end" ? "insetInlineEnd" : "insetInlineStart"]: 0,
        zIndex: 20,
        display: "grid",
        gap: 1,
        minWidth: context.variant === "compact" ? 184 : 200,
        padding: 4,
        borderRadius: 14,
        background: "var(--uai-surface)",
        boxShadow: floatingShadow,
        transformOrigin: align === "end" ? "top right" : "top left",
        ...style,
      }}
    />
  );
}

const itemStyle = (compact: boolean): React.CSSProperties => ({
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: compact ? 8 : 10,
  width: "100%",
  minHeight: compact ? 28 : 32,
  padding: compact ? "0 8px" : "0 10px",
  border: 0,
  borderRadius: 10,
  color: "var(--uai-text)",
  fontSize: compact ? 12.5 : 13,
  lineHeight: "18px",
  textAlign: "start",
  textDecoration: "none",
  cursor: "pointer",
  outlineOffset: -2,
});
const ITEM = "uai-share-item";
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
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useShare("ShareMenuNative");
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof navigator.share === "function"), []);
  if (!supported) return null;
  return (
    <button
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
      className={cx(ITEM, className)}
      style={{ ...itemStyle(context.variant === "compact"), ...style }}
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
  style,
  ...props
}: ComponentProps<"button"> & { copiedMessage?: string; errorMessage?: string }) {
  const context = useShare("ShareMenuCopy");
  return (
    <button
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
      className={cx(ITEM, className)}
      style={{ ...itemStyle(context.variant === "compact"), ...style }}
    >
      <Link2 size={14} strokeWidth={1.75} aria-hidden="true" />
      {children}
    </button>
  );
}

/** A link to a share destination. The menu closes after the link is followed. */
export function ShareMenuChannel({ className, style, ...props }: ComponentProps<"a">) {
  const context = useShare("ShareMenuChannel");
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      {...highlight}
      role="menuitem"
      tabIndex={-1}
      className={cx(ITEM, className)}
      style={{ ...itemStyle(context.variant === "compact"), ...style }}
    />
  );
}

export function ShareMenuSeparator({ style, ...props }: ComponentProps<"hr">) {
  useShare("ShareMenuSeparator");
  return (
    <hr
      {...props}
      style={{
        height: 1,
        margin: "4px 8px",
        border: 0,
        background: "var(--uai-border)",
        ...style,
      }}
    />
  );
}
