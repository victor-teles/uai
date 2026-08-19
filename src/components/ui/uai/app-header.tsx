"use client";

import { Menu, Search, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const APP_HEADER_VARIANTS = ["bar", "floating", "compact"] as const;

export type AppHeaderVariant = (typeof APP_HEADER_VARIANTS)[number];

export type AppHeaderProps = ComponentProps<"header"> & {
  variant?: AppHeaderVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function appHeaderChrome(variant: AppHeaderVariant) {
  const compact = variant === "compact";

  return {
    rootClass:
      variant === "bar"
        ? "border-b border-[var(--uai-border)] bg-[var(--uai-surface)]"
        : "border border-[var(--uai-border)] bg-[var(--uai-surface)]",
    rootStyle: {
      minHeight: compact ? 44 : 56,
      borderRadius: variant === "bar" ? 0 : compact ? 12 : 14,
      padding: compact ? "4px 6px" : variant === "floating" ? 8 : "0 16px",
      boxShadow:
        variant === "floating"
          ? "0 14px 32px -26px color-mix(in oklab, var(--uai-text) 55%, transparent)"
          : undefined,
    },
    gapClass: compact ? "gap-1.5" : "gap-2.5",
    brandClass: compact ? "h-7 gap-1.5 text-[12px]" : "h-[34px] gap-2 text-[13px]",
    overflowClass: compact ? "gap-2 md:gap-3" : "gap-3 md:gap-5",
    navClass: compact ? "gap-0.5" : "gap-1",
    navItemClass: compact ? "h-7 px-2 text-[0.72rem]" : "h-[34px] px-2.5 text-[12px]",
    searchClass: compact ? "h-7 md:w-36" : "h-[34px] md:w-48 lg:w-56",
    actionClass: compact ? "size-7 text-[0.72rem]" : "size-[34px] text-[12px]",
  };
}

type AppHeaderContextValue = {
  chrome: ReturnType<typeof appHeaderChrome>;
  open: boolean;
  overflowId: string;
  setOpen: (open: boolean) => void;
};

const AppHeaderContext = createContext<AppHeaderContextValue | null>(null);

function useAppHeader(name: string) {
  const context = useContext(AppHeaderContext);
  if (!context) throw new Error(`${name} must be used within AppHeader`);
  return context;
}

export function AppHeader({
  variant = "bar",
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  style,
  ...props
}: AppHeaderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
  const overflowId = useId();
  const chrome = appHeaderChrome(variant);

  function setOpen(nextOpen: boolean) {
    if (open === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <AppHeaderContext.Provider value={{ chrome, open: resolvedOpen, overflowId, setOpen }}>
      <header
        {...props}
        className={cn(
          "flex w-full flex-wrap items-center text-[var(--uai-text)]",
          chrome.gapClass,
          chrome.rootClass,
          className,
        )}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        data-open={resolvedOpen || undefined}
      >
        {children}
      </header>
    </AppHeaderContext.Provider>
  );
}

export type AppHeaderBrandProps = ComponentProps<"a">;

export function AppHeaderBrand({ children, className, ...props }: AppHeaderBrandProps) {
  const context = useAppHeader("AppHeaderBrand");

  return (
    <a
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center rounded-[8px] font-medium tracking-[-0.015em] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uai-border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)]",
        context.chrome.brandClass,
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export type AppHeaderOverflowProps = Omit<ComponentProps<"div">, "id">;

export function AppHeaderOverflow({ children, className, ...props }: AppHeaderOverflowProps) {
  const context = useAppHeader("AppHeaderOverflow");

  return (
    <div
      {...props}
      id={context.overflowId}
      className={cn(
        "order-4 min-w-0 basis-full flex-col border-t border-[var(--uai-border)] pt-2 md:order-none md:flex md:basis-auto md:flex-row md:items-center md:border-0 md:pt-0",
        context.open ? "flex" : "hidden",
        context.chrome.overflowClass,
        className,
      )}
      data-state={context.open ? "open" : "closed"}
    >
      {children}
    </div>
  );
}

export type AppHeaderNavProps = ComponentProps<"nav">;

export function AppHeaderNav({
  children,
  className,
  "aria-label": ariaLabel = "Primary navigation",
  ...props
}: AppHeaderNavProps) {
  const context = useAppHeader("AppHeaderNav");

  return (
    <nav aria-label={ariaLabel} className={cn("min-w-0", className)} {...props}>
      <ul className={cn("flex list-none flex-col p-0 md:flex-row", context.chrome.navClass)}>
        {children}
      </ul>
    </nav>
  );
}

export type AppHeaderNavItemProps = ComponentProps<"a"> & {
  active?: boolean;
};

export function AppHeaderNavItem({
  active = false,
  children,
  className,
  "aria-current": ariaCurrent,
  ...props
}: AppHeaderNavItemProps) {
  const context = useAppHeader("AppHeaderNavItem");

  return (
    <li className="min-w-0">
      <a
        aria-current={ariaCurrent ?? (active ? "page" : undefined)}
        className={cn(
          "flex min-w-0 items-center rounded-[8px] font-medium whitespace-nowrap outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--uai-border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
          active
            ? "bg-[var(--uai-surface-raised)] text-[var(--uai-text)]"
            : "text-[var(--uai-muted)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)]",
          context.chrome.navItemClass,
          className,
        )}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

export type AppHeaderSearchProps = Omit<ComponentProps<"input">, "type"> & {
  label?: ReactNode;
};

export function AppHeaderSearch({
  label = "Search",
  className,
  placeholder = "Search",
  ...props
}: AppHeaderSearchProps) {
  const context = useAppHeader("AppHeaderSearch");

  return (
    <label
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-[8px] border border-[var(--uai-border)] bg-[var(--uai-canvas)] px-2.5 text-[var(--uai-muted)] transition-[border-color,background-color] duration-150 focus-within:border-[var(--uai-border-strong)] focus-within:bg-[var(--uai-surface)] md:ml-auto motion-reduce:transition-none",
        context.chrome.searchClass,
      )}
    >
      <Search className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-[12px] text-[var(--uai-text)] outline-none placeholder:text-[var(--uai-muted)] [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
}

export type AppHeaderActionsProps = ComponentProps<"div">;

export function AppHeaderActions({ children, className, ...props }: AppHeaderActionsProps) {
  const context = useAppHeader("AppHeaderActions");

  return (
    <div
      className={cn("ml-auto flex shrink-0 items-center", context.chrome.gapClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type AppHeaderActionProps = ComponentProps<"button"> & {
  emphasis?: "primary" | "secondary";
};

export function AppHeaderAction({
  emphasis = "secondary",
  type = "button",
  children,
  className,
  ...props
}: AppHeaderActionProps) {
  const context = useAppHeader("AppHeaderAction");

  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[8px] border font-medium outline-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[var(--uai-border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100",
        emphasis === "primary"
          ? "border-[var(--uai-text)] bg-[var(--uai-text)] text-[var(--uai-surface)]"
          : "border-[var(--uai-border)] bg-transparent text-[var(--uai-muted)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)]",
        context.chrome.actionClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type AppHeaderMenuButtonProps = Omit<
  ComponentProps<"button">,
  "aria-controls" | "aria-expanded"
>;

export function AppHeaderMenuButton({
  type = "button",
  className,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: AppHeaderMenuButtonProps) {
  const context = useAppHeader("AppHeaderMenuButton");
  const Icon = context.open ? X : Menu;

  return (
    <button
      {...props}
      type={type}
      aria-label={ariaLabel ?? (context.open ? "Close navigation" : "Open navigation")}
      aria-controls={context.overflowId}
      aria-expanded={context.open}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[8px] border border-[var(--uai-border)] text-[var(--uai-muted)] outline-none transition-[background-color,color,transform] duration-150 hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] focus-visible:ring-2 focus-visible:ring-[var(--uai-border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)] active:scale-[0.96] md:hidden motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.actionClass,
        className,
      )}
      onClick={(event) => {
        context.setOpen(!context.open);
        onClick?.(event);
      }}
    >
      <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
