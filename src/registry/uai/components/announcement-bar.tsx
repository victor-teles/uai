"use client";

import { cva } from "class-variance-authority";
import { ArrowRight, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type Ref,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

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
function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
const announcementBarVariants = cva(
  "box-border flex min-w-0 animate-in items-center text-[13px]/[18px] text-foreground duration-240 ease-out-quint fade-in-0 slide-in-from-top-1 fill-mode-both data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150 data-[state=closed]:ease-out data-[state=closed]:fill-mode-forwards motion-reduce:animate-none [&_:is(a,button)]:focus-visible:outline-2 [&_:is(a,button)]:focus-visible:outline-offset-2 [&_:is(a,button)]:focus-visible:outline-ring",
  {
    variants: {
      variant: {
        // The bar sits in flow, so it fades for as long as its row collapses.
        bar: "w-full flex-wrap gap-3 data-[state=closed]:duration-300 bg-[color-mix(in_oklab,var(--primary)_9%,var(--card))] py-2 pr-2.5 pl-4 shadow-[inset_0_-1px_0_color-mix(in_oklab,var(--primary)_16%,var(--border))]",
        card: "w-full flex-wrap gap-3 rounded-[14px] border bg-card py-2.5 pr-2.5 pl-3.5",
        pill: "mx-auto my-0 w-fit max-w-full flex-nowrap gap-2.5 rounded-full bg-card py-1 pr-1 pl-1.25 shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
);

export function AnnouncementBar({
  variant = "bar",
  open,
  defaultOpen = true,
  onOpenChange,
  storageKey,
  children,
  className,
  ref,
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
  const bar = useRef<HTMLElement | null>(null);
  const collapse = useRef<HTMLDivElement | null>(null);
  // Stay mounted while the exit plays; reduced motion has no animation, so unmount at once.
  const [rendered, setRendered] = useState(current);
  if (current && !rendered) setRendered(true);
  useEffect(() => {
    if (current) return;
    const node = bar.current;
    const animation = node ? window.getComputedStyle(node).animationName : "";
    if (!animation || animation === "none") return setRendered(false);
    // The in-flow bar also gives its row back instead of letting content jump up.
    collapse.current?.animate?.([{ gridTemplateRows: "1fr" }, { gridTemplateRows: "0fr" }], {
      duration: 300,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      fill: "forwards",
    });
  }, [current]);
  const dismiss = () => {
    if (storageKey) writeDismissed(storageKey);
    if (open === undefined) setInternal(false);
    onOpenChange?.(false);
  };
  if (!current && !rendered) return null;
  // Only a closing bar is wrapped, so an open bar stays a direct child (and can be sticky).
  const closingBar = !current && variant === "bar";
  const element = (
    <section
      aria-labelledby={`${id}-message`}
      data-slot="announcement-bar"
      className={cn(announcementBarVariants({ variant }), className)}
      {...props}
      ref={(node) => {
        bar.current = node;
        assignRef(ref, node);
      }}
      data-variant={variant}
      data-state={current ? "open" : "closed"}
      inert={!current}
      onAnimationEnd={(event) => {
        props.onAnimationEnd?.(event);
        if (event.target === event.currentTarget && !current) setRendered(false);
      }}
    >
      {children}
    </section>
  );
  return (
    <Context.Provider value={{ id, variant, dismiss }}>
      {closingBar ? (
        <div ref={collapse} className="grid">
          <div className="min-h-0 overflow-hidden">{element}</div>
        </div>
      ) : (
        element
      )}
    </Context.Provider>
  );
}

export function AnnouncementBarLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="announcement-bar-label"
      className={cn(
        "inline-flex h-5 flex-none items-center rounded-full bg-primary/16 px-2 text-[11.5px]/4 font-medium whitespace-nowrap text-[color-mix(in_oklab,var(--primary)_62%,var(--foreground))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_28%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export function AnnouncementBarMessage({ className, ref, ...props }: ComponentProps<"p">) {
  const context = useAnnouncement("AnnouncementBarMessage");
  const message = useRef<HTMLParagraphElement | null>(null);
  const truncates = context.variant === "pill" && props.title === undefined;
  // The pill truncates its message, so expose the full text as a tooltip when it is cut off.
  useEffect(() => {
    const element = message.current;
    if (!truncates || !element) return;
    const update = () => {
      if (element.scrollWidth > element.clientWidth) element.title = element.textContent ?? "";
      else element.removeAttribute("title");
    };
    update();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [truncates]);
  return (
    <p
      data-slot="announcement-bar-message"
      className={cn(
        "m-0 min-w-0 text-pretty",
        context.variant === "pill"
          ? "flex-[0_1_auto] truncate text-muted-foreground"
          : "flex-[1_1_240px] text-foreground",
        className,
      )}
      {...props}
      ref={(node) => {
        message.current = node;
        assignRef(ref, node);
      }}
      id={`${context.id}-message`}
    />
  );
}

export function AnnouncementBarActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="announcement-bar-actions"
      className={cn("ml-auto flex items-center gap-1", className)}
      {...props}
    />
  );
}

const actionVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap no-underline transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:[transition:translate_140ms_cubic-bezier(0.23,1,0.32,1)] hover:[&_svg]:translate-x-0.5 motion-reduce:[&_svg]:transition-none motion-reduce:hover:[&_svg]:translate-x-0",
  {
    variants: {
      variant: {
        bar: "h-7 bg-primary pr-2.5 pl-3.5 text-[13px] text-primary-foreground hover:bg-primary hover:brightness-108 has-[>svg]:pr-2.5 has-[>svg]:pl-3.5",
        card: "h-7 bg-secondary pr-2.5 pl-3.5 text-[13px] text-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] has-[>svg]:pr-2.5 has-[>svg]:pl-3.5",
        pill: "h-6.5 bg-secondary pr-2.5 pl-3 text-[12.5px] text-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] has-[>svg]:pr-2.5 has-[>svg]:pl-3",
      },
    },
  },
);

export function AnnouncementBarAction({ children, className, ...props }: ComponentProps<"a">) {
  const context = useAnnouncement("AnnouncementBarAction");
  return (
    <Button
      asChild
      variant={context.variant === "bar" ? "default" : "secondary"}
      size="sm"
      className={cn(actionVariants({ variant: context.variant }), className)}
    >
      <a data-slot="announcement-bar-action" {...props}>
        {children}
        <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" className="size-3.5" />
      </a>
    </Button>
  );
}

export function AnnouncementBarDismiss({
  children = <X size={14} strokeWidth={1.75} aria-hidden="true" className="size-3.5" />,
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useAnnouncement("AnnouncementBarDismiss");
  const pill = context.variant === "pill";
  return (
    <Button
      aria-label="Dismiss announcement"
      data-slot="announcement-bar-dismiss"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "grid cursor-pointer place-items-center border-0 bg-transparent p-0 text-muted-foreground transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:text-foreground focus-visible:ring-0 focus-visible:outline-solid active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100",
        pill ? "size-6.5 rounded-full" : "size-7 rounded-lg",
        context.variant === "bar"
          ? "hover:bg-foreground/8 dark:hover:bg-foreground/8"
          : "hover:bg-accent dark:hover:bg-accent",
        className,
      )}
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.dismiss();
      }}
    >
      {children}
    </Button>
  );
}
