"use client";

import { ArrowRight, X } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";

export const ANNOUNCEMENT_BAR_VARIANTS = ["bar", "card", "pill"] as const;
export type AnnouncementBarVariant = (typeof ANNOUNCEMENT_BAR_VARIANTS)[number];
export type AnnouncementBarProps = ComponentProps<"section"> & {
  variant?: AnnouncementBarVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Remembers dismissal in localStorage under this key. */
  storageKey?: string;
};
type AnnouncementContext = {
  id: string;
  variant: AnnouncementBarVariant;
  dismiss: () => void;
};
const Context = createContext<AnnouncementContext | null>(null);
function useAnnouncement(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AnnouncementBar`);
  return context;
}
const DISMISSED = "dismissed";
function readDismissed(key: string) {
  try {
    return window.localStorage.getItem(key) === DISMISSED;
  } catch {
    return false;
  }
}
function writeDismissed(key: string) {
  try {
    window.localStorage.setItem(key, DISMISSED);
  } catch {
    // Storage can be unavailable in private modes; dismissal still applies in memory.
  }
}
const shells: Record<AnnouncementBarVariant, CSSProperties> = {
  bar: {
    width: "100%",
    padding: "8px 10px 8px 16px",
    background: "color-mix(in oklab, var(--uai-accent) 9%, var(--uai-surface))",
    boxShadow: "inset 0 -1px 0 color-mix(in oklab, var(--uai-accent) 16%, var(--uai-border))",
  },
  card: {
    width: "100%",
    padding: "10px 10px 10px 14px",
    border: "1px solid var(--uai-border)",
    borderRadius: 14,
    background: "var(--uai-surface)",
  },
  pill: {
    width: "fit-content",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "4px 4px 4px 5px",
    borderRadius: 999,
    background: "var(--uai-surface)",
    boxShadow: "0 0 0 1px var(--uai-border)",
  },
};
const announcementCss = `
.uai-announcement{animation:uai-announcement-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-announcement-action{background:var(--uai-surface-raised);color:var(--uai-text);transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-announcement[data-variant=bar] .uai-announcement-action{background:var(--uai-accent);color:var(--uai-accent-foreground)}
.uai-announcement-action:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-announcement[data-variant=bar] .uai-announcement-action:hover{background:var(--uai-accent);filter:brightness(1.08)}
.uai-announcement-action:active{transform:scale(0.97)}
.uai-announcement-action svg{transition:transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-announcement-action:hover svg{transform:translateX(2px)}
.uai-announcement-dismiss{background:transparent;color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-announcement-dismiss:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-announcement[data-variant=bar] .uai-announcement-dismiss:hover{background:color-mix(in oklab,var(--uai-text) 8%,transparent)}
.uai-announcement-dismiss:active{transform:scale(0.94)}
.uai-announcement :is(a,button):focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-announcement-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-announcement,.uai-announcement-action,.uai-announcement-action svg,.uai-announcement-dismiss{animation:none;transition:none;transform:none}
}
`;
function cx(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export function AnnouncementBar({
  variant = "bar",
  open,
  defaultOpen = true,
  onOpenChange,
  storageKey,
  children,
  className,
  style,
  ...props
}: AnnouncementBarProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const current = open ?? internal;
  // biome-ignore lint/correctness/useExhaustiveDependencies: only restore stored dismissal for a new key.
  useEffect(() => {
    if (!storageKey || !readDismissed(storageKey)) return;
    if (open === undefined) setInternal(false);
    else if (open) onOpenChange?.(false);
  }, [storageKey]);
  const dismiss = () => {
    if (storageKey) writeDismissed(storageKey);
    if (open === undefined) setInternal(false);
    onOpenChange?.(false);
  };
  if (!current) return null;
  return (
    <Context.Provider value={{ id, variant, dismiss }}>
      <section
        aria-labelledby={`${id}-message`}
        {...props}
        data-variant={variant}
        className={cx("uai-announcement", className)}
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexWrap: variant === "pill" ? "nowrap" : "wrap",
          alignItems: "center",
          gap: variant === "pill" ? 10 : 12,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...shells[variant],
          ...style,
        }}
      >
        <style>{announcementCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function AnnouncementBarLabel({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        flex: "none",
        height: 20,
        padding: "0 8px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-accent) 16%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--uai-accent) 28%, transparent)",
        color: "color-mix(in oklab, var(--uai-accent) 62%, var(--uai-text))",
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function AnnouncementBarMessage({ style, ...props }: ComponentProps<"p">) {
  const context = useAnnouncement("AnnouncementBarMessage");
  return (
    <p
      {...props}
      id={`${context.id}-message`}
      style={{
        flex: context.variant === "pill" ? "0 1 auto" : "1 1 240px",
        minWidth: 0,
        margin: 0,
        color: context.variant === "pill" ? "var(--uai-muted)" : "var(--uai-text)",
        textWrap: "pretty",
        ...(context.variant === "pill"
          ? { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }
          : null),
        ...style,
      }}
    />
  );
}

export function AnnouncementBarActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginLeft: "auto",
        ...style,
      }}
    />
  );
}

export function AnnouncementBarAction({
  children,
  className,
  style,
  ...props
}: ComponentProps<"a">) {
  const context = useAnnouncement("AnnouncementBarAction");
  const pill = context.variant === "pill";
  return (
    <a
      {...props}
      className={cx("uai-announcement-action", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: pill ? 26 : 28,
        padding: pill ? "0 10px 0 12px" : "0 10px 0 14px",
        borderRadius: 999,
        fontSize: pill ? 12.5 : 13,
        fontWeight: 500,
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
      <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
    </a>
  );
}

export function AnnouncementBarDismiss({
  children = <X size={14} strokeWidth={1.75} aria-hidden="true" />,
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useAnnouncement("AnnouncementBarDismiss");
  return (
    <button
      aria-label="Dismiss announcement"
      {...props}
      type="button"
      className={cx("uai-announcement-dismiss", className)}
      style={{
        display: "grid",
        placeItems: "center",
        width: context.variant === "pill" ? 26 : 28,
        height: context.variant === "pill" ? 26 : 28,
        padding: 0,
        border: 0,
        borderRadius: context.variant === "pill" ? 999 : 8,
        cursor: "pointer",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.dismiss();
      }}
    >
      {children}
    </button>
  );
}
