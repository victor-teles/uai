"use client";

import { cva } from "class-variance-authority";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

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

const breadcrumbTrailListVariants = cva(
  "m-0 inline-flex max-w-full list-none flex-wrap items-center text-[13px]/[18px] font-medium break-normal text-muted-foreground",
  {
    variants: {
      variant: {
        chevron: "gap-0.5 p-0 sm:gap-0.5",
        slash: "gap-0 p-0 sm:gap-0",
        contained:
          "gap-0.5 rounded-full sm:gap-0.5 bg-muted p-0.75 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--border)_70%,transparent)]",
      },
    },
  },
);

export function BreadcrumbTrail({
  variant = "chevron",
  compactQuery = "(max-width: 479px)",
  compact,
  children,
  className,
  ...props
}: BreadcrumbTrailProps) {
  const narrow = useMediaQuery(compactQuery);
  const isCompact = compact ?? narrow;
  return (
    <Context.Provider value={{ variant, compact: isCompact }}>
      <Breadcrumb
        aria-label="Breadcrumb"
        data-slot="breadcrumb-trail"
        data-variant={variant}
        data-compact={isCompact || undefined}
        className={cn("min-w-0 text-[13px]/[18px] font-medium text-muted-foreground", className)}
        {...props}
      >
        <BreadcrumbList className={breadcrumbTrailListVariants({ variant })}>
          {children}
        </BreadcrumbList>
      </Breadcrumb>
    </Context.Provider>
  );
}

function Separator({ variant }: { variant: BreadcrumbTrailVariant }) {
  return (
    <BreadcrumbSeparator
      className={cn(
        "inline-grid place-items-center font-normal text-subtle-foreground opacity-70",
        variant === "slash" ? "w-3.5" : "w-4",
      )}
    >
      {variant === "slash" ? (
        "/"
      ) : (
        <ChevronRight size={14} className="size-3.5" strokeWidth={1.75} />
      )}
    </BreadcrumbSeparator>
  );
}

const link = "inline-flex h-7 min-w-0 max-w-full items-center gap-1 rounded-full px-2 no-underline";
// Hover and press feedback.
const interactive =
  "bg-transparent text-inherit transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-accent/70 hover:text-foreground active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:active:scale-100";

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
  className,
  ...props
}: BreadcrumbTrailItemProps) {
  const context = useTrail("BreadcrumbTrailItem");
  const fullTitle = title ?? (typeof children === "string" ? children : undefined);
  if (context.compact && !parent) return null;
  if (context.compact) {
    return (
      <BreadcrumbItem
        data-slot="breadcrumb-trail-item"
        className={cn("inline-flex min-w-0 gap-0", className)}
        {...props}
      >
        <BreadcrumbLink href={href} className={cn(link, interactive, "pl-1 text-foreground")}>
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="max-w-60 truncate" title={fullTitle}>
            <span className="sr-only">Back to </span>
            {children}
          </span>
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  }
  return (
    <>
      <BreadcrumbItem
        data-slot="breadcrumb-trail-item"
        className={cn("inline-flex min-w-0 items-center gap-0", className)}
        {...props}
      >
        {current ? (
          <BreadcrumbPage
            title={fullTitle}
            className={cn(
              link,
              "block truncate leading-7 font-medium text-foreground",
              context.variant === "contained" &&
                "bg-card shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.06)]",
            )}
            style={{ maxWidth }}
          >
            {children}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={href} title={fullTitle} className={cn(link, interactive)}>
            <span className="truncate" style={{ maxWidth }}>
              {children}
            </span>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {current ? null : <Separator variant={context.variant} />}
    </>
  );
}

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
  className,
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
    // Each revealed level renders an item and its separator.
    for (let offset = 0; offset < count * 2; offset++) {
      list.children[index + offset]?.animate?.(
        [
          { opacity: 0, transform: "translateX(-4px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 220,
          delay: Math.floor(offset / 2) * 40,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "backwards",
        },
      );
    }
  }, [expanded, count]);
  if (context.compact) return null;
  if (expanded) return children;
  return (
    <>
      <BreadcrumbItem
        data-slot="breadcrumb-trail-collapsed"
        className={cn("inline-flex items-center gap-0", className)}
        {...props}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-expanded={false}
          onClick={(event) => {
            const item = event.currentTarget.closest("li");
            const list = item?.parentElement;
            if (item && list)
              reveal.current = { list, index: Array.from(list.children).indexOf(item) };
            setExpanded(true);
          }}
          className={cn(
            interactive,
            "grid size-7 cursor-pointer place-items-center rounded-full border-0 p-0 focus-visible:ring-0 dark:hover:bg-accent/70",
          )}
        >
          <Ellipsis size={16} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </BreadcrumbItem>
      <Separator variant={context.variant} />
    </>
  );
}
