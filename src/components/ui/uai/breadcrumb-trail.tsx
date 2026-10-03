"use client";

import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import {
  Children,
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const BREADCRUMB_TRAIL_VARIANTS = ["chevron", "slash", "contained"] as const;
export type BreadcrumbTrailVariant = (typeof BREADCRUMB_TRAIL_VARIANTS)[number];
export type BreadcrumbTrailProps = ComponentProps<"nav"> & {
  variant?: BreadcrumbTrailVariant;
  /** Media query that switches to the compact back-link fallback. */
  compactQuery?: string;
  /** Force the compact fallback on or off instead of using compactQuery. */
  compact?: boolean;
};
type TrailContext = { variant: BreadcrumbTrailVariant; compact: boolean };
const Context = createContext<TrailContext | null>(null);
function useTrail(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within BreadcrumbTrail`);
  return context;
}

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

export function BreadcrumbTrail({
  variant = "chevron",
  compactQuery = "(max-width: 479px)",
  compact,
  children,
  style,
  ...props
}: BreadcrumbTrailProps) {
  const narrow = useMediaQuery(compactQuery);
  const isCompact = compact ?? narrow;
  return (
    <Context.Provider value={{ variant, compact: isCompact }}>
      <nav
        aria-label="Breadcrumb"
        {...props}
        data-variant={variant}
        data-compact={isCompact || undefined}
        style={{
          minWidth: 0,
          color: "var(--uai-muted)",
          fontSize: 13,
          lineHeight: "18px",
          fontWeight: 500,
          ...style,
        }}
      >
        <ol
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: variant === "slash" ? 0 : 2,
            maxWidth: "100%",
            margin: 0,
            padding: variant === "contained" ? 3 : 0,
            listStyle: "none",
            borderRadius: variant === "contained" ? 999 : 0,
            background: variant === "contained" ? "var(--uai-surface-raised)" : undefined,
            boxShadow:
              variant === "contained"
                ? "inset 0 0 0 1px color-mix(in oklab, var(--uai-border) 70%, transparent)"
                : undefined,
          }}
        >
          {children}
        </ol>
      </nav>
    </Context.Provider>
  );
}

function Separator({ variant }: { variant: BreadcrumbTrailVariant }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: variant === "slash" ? 14 : 16,
        color: "var(--uai-subtle)",
        opacity: 0.7,
        fontWeight: 400,
      }}
    >
      {variant === "slash" ? "/" : <ChevronRight size={14} strokeWidth={1.75} />}
    </span>
  );
}

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
  maxWidth: "100%",
  height: 28,
  padding: "0 8px",
  borderRadius: 999,
  textDecoration: "none",
};
// Hover and press feedback; inline styles own the resting state.
const interactive =
  "bg-transparent text-[inherit] [transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_70%,transparent)] hover:text-[var(--uai-text)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100";
const labelStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export type BreadcrumbTrailItemProps = Omit<ComponentProps<"li">, "children"> & {
  href?: string;
  /** Marks the current page. It renders as text with aria-current="page". */
  current?: boolean;
  /** Marks the direct parent. It becomes the back link in the compact fallback. */
  parent?: boolean;
  /** Truncate the label beyond this width. The full label stays in the title. */
  maxWidth?: number;
  title?: string;
  children: ReactNode;
};

export function BreadcrumbTrailItem({
  href,
  current = false,
  parent = false,
  maxWidth = 160,
  title,
  children,
  style,
  ...props
}: BreadcrumbTrailItemProps) {
  const context = useTrail("BreadcrumbTrailItem");
  const fullTitle = title ?? (typeof children === "string" ? children : undefined);
  if (context.compact && !parent) return null;
  if (context.compact) {
    return (
      <li {...props} style={{ display: "inline-flex", minWidth: 0, ...style }}>
        <a
          href={href}
          className={interactive}
          style={{ ...linkStyle, color: "var(--uai-text)", paddingLeft: 4 }}
        >
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span style={{ ...labelStyle, maxWidth: 240 }} title={fullTitle}>
            <span style={visuallyHidden}>Back to </span>
            {children}
          </span>
        </a>
      </li>
    );
  }
  return (
    <li {...props} style={{ display: "inline-flex", alignItems: "center", minWidth: 0, ...style }}>
      {current ? (
        <span
          aria-current="page"
          title={fullTitle}
          style={{
            ...linkStyle,
            ...labelStyle,
            display: "block",
            lineHeight: "28px",
            maxWidth,
            color: "var(--uai-text)",
            ...(context.variant === "contained"
              ? {
                  background: "var(--uai-surface)",
                  boxShadow: "0 0 0 1px var(--uai-border), 0 1px 2px oklch(0 0 0 / 0.06)",
                }
              : null),
          }}
        >
          {children}
        </span>
      ) : (
        <a href={href} title={fullTitle} className={interactive} style={linkStyle}>
          <span style={{ ...labelStyle, maxWidth }}>{children}</span>
        </a>
      )}
      {current ? null : <Separator variant={context.variant} />}
    </li>
  );
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export type BreadcrumbTrailCollapsedProps = Omit<ComponentProps<"li">, "children"> & {
  /** Accessible label for the reveal button. */
  label?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

/** Hides intermediate levels behind an ellipsis button until the reader asks for them. */
export function BreadcrumbTrailCollapsed({
  label = "Show hidden levels",
  defaultExpanded = false,
  children,
  style,
  ...props
}: BreadcrumbTrailCollapsedProps) {
  const context = useTrail("BreadcrumbTrailCollapsed");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reveal = useRef<{ list: Element; index: number } | null>(null);
  const count = Children.count(children);
  useEffect(() => {
    if (!expanded || !reveal.current) return;
    const { list, index } = reveal.current;
    reveal.current = null;
    list.children[index]?.querySelector<HTMLElement>("a, [aria-current]")?.focus();
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    for (let offset = 0; offset < count; offset++) {
      list.children[index + offset]?.animate?.(
        [
          { opacity: 0, transform: "translateX(-4px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 220,
          delay: offset * 40,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "backwards",
        },
      );
    }
  }, [expanded, count]);
  if (context.compact) return null;
  if (expanded) return children;
  return (
    <li {...props} style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={false}
        onClick={(event) => {
          const item = event.currentTarget.closest("li");
          const list = item?.parentElement;
          if (item && list)
            reveal.current = { list, index: Array.from(list.children).indexOf(item) };
          setExpanded(true);
        }}
        className={interactive}
        style={{
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          padding: 0,
          border: 0,
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        <Ellipsis size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <Separator variant={context.variant} />
    </li>
  );
}
