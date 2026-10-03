"use client";

import { ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const APP_SIDEBAR_VARIANTS = ["panel", "inset", "compact"] as const;
export type AppSidebarVariant = (typeof APP_SIDEBAR_VARIANTS)[number];
export type AppSidebarProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: AppSidebarVariant;
  /** The active item value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Mobile disclosure state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Media query that switches to the mobile disclosure. */
  mobileQuery?: string;
};
type SidebarContext = {
  id: string;
  variant: AppSidebarVariant;
  value: string;
  select: (value: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobile: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
};
const Context = createContext<SidebarContext | null>(null);
function useSidebar(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within AppSidebar`);
  return context;
}
const GroupContext = createContext<string | null>(null);
type SubmenuContext = { id: string; open: boolean; setOpen: (open: boolean) => void };
const Submenu = createContext<SubmenuContext | null>(null);
const ItemContext = createContext(false);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [query]);
  return matches;
}
function useControllable<T>(value: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = useState(initial);
  const current = value ?? internal;
  const set = (next: T) => {
    if (Object.is(next, current)) return;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return [current, set] as const;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
/** Fades a disclosure in when it opens. Skips the first render and reduced motion. */
function useReveal(ref: React.RefObject<HTMLElement | null>, open: boolean) {
  const mounted = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const element = ref.current;
    if (!open || !element || typeof element.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    element.animate(
      [
        { opacity: 0, transform: "translateY(-4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 220, easing: easeOut },
    );
  }, [open]);
}
// Hover and press feedback for rows and icon buttons. Inline styles own the resting state.
const rowInteraction =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_70%,transparent)] hover:text-[var(--uai-text)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100";
const iconButtonInteraction =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100";
function classes(...values: (string | false | undefined)[]) {
  return values.filter(Boolean).join(" ");
}
const hidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export function AppSidebar({
  variant = "panel",
  value,
  defaultValue = "",
  onValueChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  open,
  defaultOpen = false,
  onOpenChange,
  mobileQuery = "(max-width: 767px)",
  style,
  ...props
}: AppSidebarProps) {
  const id = useId();
  const mobile = useMediaQuery(mobileQuery);
  const [active, select] = useControllable(value, defaultValue, onValueChange);
  const [isCollapsed, setCollapsed] = useControllable(
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
  );
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const showCollapsed = isCollapsed && !mobile;
  const compact = variant === "compact";
  // Escape closes the mobile disclosure and returns focus to its trigger.
  useEffect(() => {
    if (!mobile || !isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const root = document.querySelector(`[data-app-sidebar="${id}"]`);
      if (!root?.contains(document.activeElement)) return;
      event.preventDefault();
      setOpen(false);
      document.getElementById(`${id}-trigger`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobile, isOpen, id, setOpen]);
  return (
    <Context.Provider
      value={{
        id,
        variant,
        value: active,
        select: (next) => {
          select(next);
          if (mobile) setOpen(false);
        },
        collapsed: showCollapsed,
        setCollapsed,
        mobile,
        open: isOpen,
        setOpen,
      }}
    >
      <div
        {...props}
        data-variant={variant}
        data-collapsed={showCollapsed || undefined}
        data-mobile={mobile || undefined}
        data-app-sidebar={id}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 8 : 12,
          width: mobile ? "100%" : showCollapsed ? (compact ? 44 : 56) : compact ? 216 : 248,
          minWidth: 0,
          height: mobile ? "auto" : "100%",
          padding: compact ? 6 : 8,
          border: variant === "panel" ? "1px solid var(--uai-border)" : 0,
          borderRadius: compact ? 12 : 14,
          background: variant === "inset" ? "var(--uai-canvas)" : "var(--uai-surface)",
          boxShadow: variant === "inset" ? "inset 0 0 0 1px var(--uai-border)" : undefined,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          overflow: "hidden",
          transition: `width 240ms ${easeOut}`,
          ...style,
        }}
      />
    </Context.Provider>
  );
}

/** Top row for the workspace switcher, toggles, and mobile trigger. */
export function AppSidebarHeader({ style, ...props }: ComponentProps<"div">) {
  const context = useSidebar("AppSidebarHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: context.collapsed ? "column" : "row",
        alignItems: "center",
        gap: 6,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Text that hides when the sidebar collapses, such as a workspace name. */
export function AppSidebarTitle({ style, ...props }: ComponentProps<"span">) {
  const context = useSidebar("AppSidebarTitle");
  return (
    <span
      {...props}
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        paddingLeft: context.variant === "compact" ? 4 : 6,
        fontSize: context.variant === "compact" ? 12.5 : 13,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        ...(context.collapsed ? hidden : null),
        ...style,
      }}
    />
  );
}

function iconButtonStyle(variant: AppSidebarVariant): React.CSSProperties {
  const size = variant === "compact" ? 24 : 28;
  return {
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    width: size,
    height: size,
    padding: 0,
    border: 0,
    borderRadius: variant === "compact" ? 7 : 8,
    color: "var(--uai-muted)",
    cursor: "pointer",
  };
}

export function AppSidebarCollapseToggle({
  style,
  className,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = useSidebar("AppSidebarCollapseToggle");
  if (context.mobile) return null;
  const Icon = context.collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      type="button"
      aria-label={context.collapsed ? "Expand sidebar" : "Collapse sidebar"}
      {...props}
      aria-expanded={!context.collapsed}
      aria-controls={`${context.id}-nav`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setCollapsed(!context.collapsed);
      }}
      className={classes("bg-transparent", iconButtonInteraction, className)}
      style={{ ...iconButtonStyle(context.variant), ...style }}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

export function AppSidebarMobileTrigger({
  style,
  className,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const context = useSidebar("AppSidebarMobileTrigger");
  if (!context.mobile) return null;
  const Icon = context.open ? X : Menu;
  return (
    <button
      type="button"
      aria-label={context.open ? "Close navigation" : "Open navigation"}
      {...props}
      id={`${context.id}-trigger`}
      aria-expanded={context.open}
      aria-controls={`${context.id}-nav`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(!context.open);
      }}
      className={classes("bg-transparent", iconButtonInteraction, className)}
      style={{ ...iconButtonStyle(context.variant), marginLeft: "auto", ...style }}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

export function AppSidebarNav({ style, ...props }: ComponentProps<"nav">) {
  const context = useSidebar("AppSidebarNav");
  const hiddenOnMobile = context.mobile && !context.open;
  return (
    <nav
      aria-label="Main"
      {...props}
      id={`${context.id}-nav`}
      hidden={hiddenOnMobile}
      style={{
        display: hiddenOnMobile ? "none" : "flex",
        flex: 1,
        flexDirection: "column",
        gap: context.variant === "compact" ? 10 : 16,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        ...style,
      }}
    />
  );
}

export function AppSidebarGroup({ style, ...props }: ComponentProps<"div">) {
  useSidebar("AppSidebarGroup");
  const labelId = useId();
  return (
    <GroupContext.Provider value={labelId}>
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this labels a set of links. */}
      <div
        role="group"
        aria-labelledby={labelId}
        {...props}
        style={{ display: "grid", gap: 1, ...style }}
      />
    </GroupContext.Provider>
  );
}

export function AppSidebarGroupLabel({ style, ...props }: ComponentProps<"div">) {
  const labelId = useContext(GroupContext);
  const context = useSidebar("AppSidebarGroupLabel");
  if (!labelId) throw new Error("AppSidebarGroupLabel must be used within AppSidebarGroup");
  return (
    <div
      {...props}
      id={labelId}
      style={{
        padding: "2px 8px 4px",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 400,
        ...(context.collapsed ? hidden : null),
        ...style,
      }}
    />
  );
}

export function AppSidebarList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{ display: "grid", gap: 1, margin: 0, padding: 0, listStyle: "none", ...style }}
    />
  );
}

function rowStyle(context: SidebarContext, active: boolean, nested: boolean): React.CSSProperties {
  const compact = context.variant === "compact";
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: context.collapsed ? "center" : "flex-start",
    gap: compact ? 8 : 10,
    width: "100%",
    minWidth: 0,
    height: compact ? 26 : 30,
    padding: context.collapsed ? 0 : nested ? `0 8px 0 ${compact ? 30 : 36}px` : "0 8px",
    border: 0,
    borderRadius: compact ? 6 : 7,
    // Active rows are a raised pill; idle rows stay transparent so hover classes can tint them.
    background: active
      ? context.variant === "inset"
        ? "var(--uai-surface)"
        : "var(--uai-surface-raised)"
      : undefined,
    boxShadow:
      active && context.variant === "inset"
        ? "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.06)"
        : undefined,
    color: active ? "var(--uai-text)" : undefined,
    font: "inherit",
    fontSize: compact ? 12 : 12.5,
    fontWeight: 500,
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
  };
}

export type AppSidebarItemProps = Omit<ComponentProps<"a">, "children"> & {
  value: string;
  /** Accessible name and tooltip when collapsed. Defaults to the label text. */
  label?: string;
  children: React.ReactNode;
};

export function AppSidebarItem({
  value,
  label,
  href,
  children,
  style,
  className,
  onClick,
  ...props
}: AppSidebarItemProps) {
  const context = useSidebar("AppSidebarItem");
  const submenu = useContext(Submenu);
  const active = context.value === value;
  return (
    <li style={{ minWidth: 0 }}>
      <ItemContext.Provider value={true}>
        <a
          href={href ?? `#${value}`}
          title={context.collapsed ? label : undefined}
          {...props}
          aria-current={active ? "page" : undefined}
          data-active={active || undefined}
          onClick={(event) => {
            onClick?.(event);
            context.select(value);
          }}
          className={classes(
            !active && "bg-transparent text-[var(--uai-muted)]",
            rowInteraction,
            className,
          )}
          style={{ ...rowStyle(context, active, Boolean(submenu)), ...style }}
        >
          {children}
        </a>
      </ItemContext.Provider>
    </li>
  );
}

export function AppSidebarItemIcon({ style, ...props }: ComponentProps<"span">) {
  const context = useSidebar("AppSidebarItemIcon");
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        width: context.variant === "compact" ? 16 : 18,
        height: context.variant === "compact" ? 16 : 18,
        opacity: 0.9,
        ...style,
      }}
    />
  );
}

/** Row label. It stays in the accessibility tree when collapsed. */
export function AppSidebarItemLabel({ style, ...props }: ComponentProps<"span">) {
  const context = useSidebar("AppSidebarItemLabel");
  if (!useContext(ItemContext)) {
    throw new Error("AppSidebarItemLabel must be used within AppSidebarItem or AppSidebarSubmenu");
  }
  return (
    <span
      {...props}
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...(context.collapsed ? hidden : null),
        ...style,
      }}
    />
  );
}

/** A trailing count or status beside a row label. Hidden when collapsed. */
export function AppSidebarItemBadge({ style, ...props }: ComponentProps<"span">) {
  const context = useSidebar("AppSidebarItemBadge");
  if (context.collapsed) return null;
  return (
    <span
      {...props}
      style={{
        marginLeft: "auto",
        minWidth: 18,
        padding: "0 6px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-text) 7%, transparent)",
        color: "var(--uai-muted)",
        fontSize: 11,
        lineHeight: "17px",
        fontWeight: 500,
        textAlign: "center",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function AppSidebarSubmenu({
  open,
  defaultOpen = false,
  onOpenChange,
  style,
  ...props
}: ComponentProps<"li"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  useSidebar("AppSidebarSubmenu");
  const id = useId();
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  return (
    <Submenu.Provider value={{ id, open: isOpen, setOpen }}>
      <li {...props} style={{ display: "grid", gap: 1, minWidth: 0, ...style }} />
    </Submenu.Provider>
  );
}

function useSubmenu(part: string) {
  const context = useContext(Submenu);
  if (!context) throw new Error(`${part} must be used within AppSidebarSubmenu`);
  return context;
}

export function AppSidebarSubmenuTrigger({
  label,
  children,
  style,
  className,
  onClick,
  ...props
}: ComponentProps<"button"> & { label?: string }) {
  const context = useSidebar("AppSidebarSubmenuTrigger");
  const submenu = useSubmenu("AppSidebarSubmenuTrigger");
  const expanded = submenu.open && !context.collapsed;
  return (
    <ItemContext.Provider value={true}>
      <button
        type="button"
        title={context.collapsed ? label : undefined}
        {...props}
        aria-expanded={expanded}
        aria-controls={`${submenu.id}-list`}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (context.collapsed) {
            context.setCollapsed(false);
            submenu.setOpen(true);
          } else submenu.setOpen(!submenu.open);
        }}
        className={classes("bg-transparent text-[var(--uai-muted)]", rowInteraction, className)}
        style={{ ...rowStyle(context, false, false), ...style }}
      >
        {children}
        {context.collapsed ? null : (
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
            style={{
              marginLeft: "auto",
              flex: "0 0 auto",
              color: "var(--uai-subtle)",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: `transform 180ms ${easeOut}`,
            }}
          />
        )}
      </button>
    </ItemContext.Provider>
  );
}

export function AppSidebarSubmenuList({ style, ...props }: ComponentProps<"ul">) {
  const context = useSidebar("AppSidebarSubmenuList");
  const submenu = useSubmenu("AppSidebarSubmenuList");
  const isHidden = !submenu.open || context.collapsed;
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref, !isHidden);
  return (
    <ul
      {...props}
      ref={ref}
      id={`${submenu.id}-list`}
      hidden={isHidden}
      style={{
        display: isHidden ? "none" : "grid",
        gap: 1,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

/** Bottom row for account or settings links. */
export function AppSidebarFooter({ style, ...props }: ComponentProps<"div">) {
  const context = useSidebar("AppSidebarFooter");
  if (context.mobile && !context.open) return null;
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: 1,
        paddingTop: 8,
        borderTop: "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}
