import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";

import { cn } from "@/lib/uai-utils";

export const EMPTY_STATE_VARIANTS = ["card", "plain", "compact", "page"] as const;
export const EMPTY_STATE_ACTION_EMPHASES = ["primary", "secondary"] as const;

export type EmptyStateVariant = (typeof EMPTY_STATE_VARIANTS)[number];
export type EmptyStateActionEmphasis = (typeof EMPTY_STATE_ACTION_EMPHASES)[number];

export type EmptyStateProps = ComponentProps<"section"> & {
  variant?: EmptyStateVariant;
};

function emptyStateChrome(variant: EmptyStateVariant) {
  const compact = variant === "compact";
  const page = variant === "page";

  return {
    compact,
    page,
    rootClass: page
      ? "flex flex-wrap items-center justify-center bg-transparent text-left"
      : compact
        ? "flex items-start border border-[var(--uai-border)] bg-[var(--uai-surface)] text-left"
        : cn(
            "flex flex-col items-center text-center",
            variant === "card"
              ? "border border-[var(--uai-border)] bg-[var(--uai-surface)]"
              : "bg-transparent",
          ),
    rootStyle: {
      borderRadius: compact ? 12 : variant === "card" ? 14 : 0,
      gap: page ? 32 : compact ? 12 : 18,
      minHeight: page ? 400 : undefined,
      padding: page ? "48px 32px" : compact ? 14 : variant === "card" ? "32px 28px" : "28px 20px",
    } satisfies CSSProperties,
    mediaClass: page
      ? "border-transparent bg-transparent text-[var(--uai-text)]"
      : "border-[var(--uai-border)] bg-[var(--uai-surface-raised)] text-[var(--uai-muted)] [&>svg]:size-[45%]",
    mediaStyle: page
      ? ({
          width: 160,
          height: 160,
          borderColor: "transparent",
          borderRadius: 0,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: "clamp(3.5rem, 10vw, 6rem)",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          lineHeight: 1,
        } satisfies CSSProperties)
      : ({
          width: compact ? 36 : 48,
          height: compact ? 36 : 48,
          borderRadius: compact ? 10 : 14,
        } satisfies CSSProperties),
    contentClass: page || compact ? "items-start text-left" : "items-center text-center",
    contentStyle: page ? ({ minWidth: "min(100%, 260px)" } satisfies CSSProperties) : undefined,
    titleClass: page
      ? "text-xl leading-7 font-semibold tracking-tight"
      : compact
        ? "text-[13px] leading-[18px]"
        : "text-sm leading-5",
    descriptionClass: page
      ? "text-sm leading-5"
      : compact
        ? "text-[0.72rem] leading-4"
        : "text-[12px] leading-[18px]",
    noteClass: page
      ? "text-xs leading-4"
      : compact
        ? "text-[0.7rem] leading-4"
        : "text-[11.5px] leading-4",
    actionHeight: page ? 36 : compact ? 32 : 34,
  };
}

type EmptyStateContextValue = {
  titleId: string;
  chrome: ReturnType<typeof emptyStateChrome>;
};

const EmptyStateContext = createContext<EmptyStateContextValue | null>(null);

function useEmptyState(name: string) {
  const context = useContext(EmptyStateContext);
  if (!context) throw new Error(`${name} must be used within EmptyState`);
  return context;
}

export function EmptyState({
  variant = "card",
  children,
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: EmptyStateProps) {
  const titleId = useId();
  const chrome = emptyStateChrome(variant);

  return (
    <EmptyStateContext.Provider value={{ titleId, chrome }}>
      <section
        {...props}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby ?? (ariaLabel ? undefined : titleId)}
        className={cn("w-full min-w-0 text-[var(--uai-text)]", chrome.rootClass, className)}
        data-variant={variant}
        style={{ ...chrome.rootStyle, ...style }}
      >
        {children}
      </section>
    </EmptyStateContext.Provider>
  );
}

export type EmptyStateMediaProps = ComponentProps<"div">;

export function EmptyStateMedia({ children, className, style, ...props }: EmptyStateMediaProps) {
  const context = useEmptyState("EmptyStateMedia");

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center border",
        context.chrome.mediaClass,
        className,
      )}
      style={{ ...context.chrome.mediaStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export type EmptyStateContentProps = ComponentProps<"div">;

export function EmptyStateContent({
  children,
  className,
  style,
  ...props
}: EmptyStateContentProps) {
  const context = useEmptyState("EmptyStateContent");

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-[52ch] flex-1 flex-col gap-4",
        context.chrome.contentClass,
        className,
      )}
      style={{ ...context.chrome.contentStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export type EmptyStateHeaderProps = ComponentProps<"header">;

export function EmptyStateHeader({ children, className, ...props }: EmptyStateHeaderProps) {
  return (
    <header className={cn("grid min-w-0 gap-1.5", className)} {...props}>
      {children}
    </header>
  );
}

export type EmptyStateTitleProps = ComponentProps<"h2">;

export function EmptyStateTitle({ children, className, ...props }: EmptyStateTitleProps) {
  const context = useEmptyState("EmptyStateTitle");

  return (
    <h2
      id={context.titleId}
      className={cn(
        "font-medium tracking-[-0.01em] text-balance [overflow-wrap:anywhere]",
        context.chrome.titleClass,
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export type EmptyStateDescriptionProps = ComponentProps<"p">;

export function EmptyStateDescription({
  children,
  className,
  ...props
}: EmptyStateDescriptionProps) {
  const context = useEmptyState("EmptyStateDescription");

  return (
    <p
      className={cn(
        "text-pretty text-[color-mix(in_oklab,var(--uai-muted)_60%,var(--uai-text))] [overflow-wrap:anywhere]",
        context.chrome.descriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type EmptyStateActionsProps = ComponentProps<"div">;

export function EmptyStateActions({ children, className, ...props }: EmptyStateActionsProps) {
  const context = useEmptyState("EmptyStateActions");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        context.chrome.page || context.chrome.compact ? "justify-start" : "justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type EmptyStateActionAppearanceProps = {
  emphasis?: EmptyStateActionEmphasis;
};

type EmptyStateButtonActionProps = ComponentProps<"button"> &
  EmptyStateActionAppearanceProps & {
    href?: undefined;
  };

type EmptyStateLinkActionProps = ComponentProps<"a"> &
  EmptyStateActionAppearanceProps & {
    href: string;
  };

export type EmptyStateActionProps = EmptyStateButtonActionProps | EmptyStateLinkActionProps;

const emptyStateActionClass: Record<EmptyStateActionEmphasis, string> = {
  primary: "border-[var(--uai-text)] bg-[var(--uai-text)] text-[var(--uai-surface)]",
  secondary:
    "border-[var(--uai-border)] bg-transparent text-[var(--uai-text)] hover:bg-[var(--uai-surface-raised)]",
};

export function EmptyStateAction({
  emphasis = "primary",
  className,
  style,
  ...props
}: EmptyStateActionProps) {
  const context = useEmptyState("EmptyStateAction");
  const actionClassName = cn(
    "inline-flex items-center justify-center gap-2 border px-3 text-[12px] leading-4 font-medium underline-offset-4 transition-[transform,background-color,border-color,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-border-strong)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none motion-reduce:active:scale-100",
    emptyStateActionClass[emphasis],
    className,
  );
  const actionStyle = {
    minHeight: context.chrome.actionHeight,
    borderRadius: 8,
    ...style,
  };

  if (typeof props.href === "string") {
    return <a {...props} className={actionClassName} style={actionStyle} />;
  }

  const { type = "button", ...buttonProps } = props;
  return <button {...buttonProps} type={type} className={actionClassName} style={actionStyle} />;
}

export type EmptyStateNoteProps = ComponentProps<"p">;

export function EmptyStateNote({ children, className, ...props }: EmptyStateNoteProps) {
  const context = useEmptyState("EmptyStateNote");

  return (
    <p
      className={cn(
        "max-w-[50ch] text-[color-mix(in_oklab,var(--uai-muted)_60%,var(--uai-text))] [overflow-wrap:anywhere]",
        context.chrome.noteClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
