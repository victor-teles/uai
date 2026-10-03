import { Check, Circle, CircleAlert } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";

import { cn } from "@/lib/uai-utils";

export const ORDER_STATUS_VARIANTS = ["card", "plain", "compact"] as const;
export const ORDER_STATUS_STEP_STATUSES = ["complete", "current", "upcoming", "issue"] as const;
export const ORDER_STATUS_BADGE_TONES = ["neutral", "progress", "success", "warning"] as const;

export type OrderStatusVariant = (typeof ORDER_STATUS_VARIANTS)[number];
export type OrderStatusStepStatus = (typeof ORDER_STATUS_STEP_STATUSES)[number];
export type OrderStatusBadgeTone = (typeof ORDER_STATUS_BADGE_TONES)[number];

export type OrderStatusProps = ComponentProps<"section"> & {
  variant?: OrderStatusVariant;
};

function orderStatusChrome(variant: OrderStatusVariant) {
  const compact = variant === "compact";

  return {
    rootClass:
      variant === "plain"
        ? "bg-transparent"
        : "border border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] bg-[var(--uai-surface)]",
    rootStyle: {
      borderRadius: compact ? 12 : variant === "card" ? 14 : 0,
      padding: compact ? 12 : variant === "card" ? 18 : 0,
    },
    headerClass: compact ? "mb-4" : "mb-5",
    titleClass: compact ? "text-[13px] leading-[18px]" : "text-[15px] leading-5",
    descriptionClass: compact
      ? "mt-0.5 text-[11.5px] leading-4"
      : "mt-1 text-[12.5px] leading-[18px]",
    stepClass: compact
      ? "grid-cols-[18px_minmax(0,1fr)] gap-2.5 pb-3.5"
      : "grid-cols-[22px_minmax(0,1fr)] gap-3 pb-4",
    markerClass: compact ? "size-[18px]" : "size-[22px]",
    markerIconClass: compact ? "size-2.5" : "size-3",
    connectorClass: compact ? "left-[8.5px] top-[22px]" : "left-[10.5px] top-[26px]",
    stepLabelClass: compact ? "text-[10.5px] leading-3" : "text-[11px] leading-4",
    stepTitleClass: compact ? "text-[12.5px] leading-4" : "text-[13px] leading-[18px]",
    stepDescriptionClass: compact ? "mt-0.5 text-[11px] leading-4" : "mt-0.5 text-[12px] leading-4",
    detailsClass: compact ? "mt-4 gap-2.5 pt-3.5" : "mt-5 gap-3 pt-4",
    detailClass: compact ? "text-[12px] leading-4" : "text-[12.5px] leading-[18px]",
    detailLabelClass: compact ? "text-[11px] leading-4" : "text-[11.5px] leading-4",
    actionsClass: compact ? "mt-4 gap-1.5" : "mt-5 gap-2",
    actionClass: compact ? "h-7 px-3 text-[12px]" : "h-8 px-3.5 text-[12.5px]",
  };
}

type OrderStatusContextValue = {
  titleId: string;
  chrome: ReturnType<typeof orderStatusChrome>;
};

const OrderStatusContext = createContext<OrderStatusContextValue | null>(null);

function useOrderStatus(name: string) {
  const context = useContext(OrderStatusContext);
  if (!context) throw new Error(`${name} must be used within OrderStatus`);
  return context;
}

export function OrderStatus({
  variant = "card",
  children,
  className,
  style,
  "aria-labelledby": ariaLabelledby,
  ...props
}: OrderStatusProps) {
  const titleId = useId();
  const chrome = orderStatusChrome(variant);

  return (
    <OrderStatusContext.Provider value={{ titleId, chrome }}>
      <section
        {...props}
        className={cn("w-full text-[var(--uai-text)]", chrome.rootClass, className)}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        aria-labelledby={ariaLabelledby ?? titleId}
      >
        {children}
      </section>
    </OrderStatusContext.Provider>
  );
}

export type OrderStatusHeaderProps = ComponentProps<"header">;

export function OrderStatusHeader({ children, className, ...props }: OrderStatusHeaderProps) {
  const context = useOrderStatus("OrderStatusHeader");

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4",
        context.chrome.headerClass,
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export type OrderStatusTitleProps = ComponentProps<"h2">;

export function OrderStatusTitle({ children, className, ...props }: OrderStatusTitleProps) {
  const context = useOrderStatus("OrderStatusTitle");

  return (
    <h2
      id={context.titleId}
      className={cn("font-medium tracking-[-0.01em]", context.chrome.titleClass, className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export type OrderStatusDescriptionProps = ComponentProps<"p">;

export function OrderStatusDescription({
  children,
  className,
  ...props
}: OrderStatusDescriptionProps) {
  const context = useOrderStatus("OrderStatusDescription");

  return (
    <p
      className={cn(
        "max-w-[48ch] text-[var(--uai-muted)] text-pretty [overflow-wrap:anywhere]",
        context.chrome.descriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type OrderStatusBadgeProps = ComponentProps<"span"> & {
  tone?: OrderStatusBadgeTone;
};

const orderStatusBadgeToneClass: Record<OrderStatusBadgeTone, string> = {
  neutral: "bg-[var(--uai-surface-raised)] text-[var(--uai-muted)]",
  progress:
    "bg-[color-mix(in_oklab,var(--uai-accent)_16%,transparent)] text-[color-mix(in_oklab,var(--uai-accent)_72%,var(--uai-text))]",
  success: "bg-[color-mix(in_oklab,var(--uai-success)_14%,transparent)] text-[var(--uai-success)]",
  warning: "bg-[color-mix(in_oklab,var(--uai-warning)_14%,transparent)] text-[var(--uai-warning)]",
};

export function OrderStatusBadge({
  tone = "neutral",
  children,
  className,
  ...props
}: OrderStatusBadgeProps) {
  useOrderStatus("OrderStatusBadge");

  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2 text-[11.5px] leading-4 font-medium whitespace-nowrap tabular-nums before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
        orderStatusBadgeToneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type OrderStatusProgressProps = ComponentProps<"ol">;

export function OrderStatusProgress({
  children,
  className,
  "aria-label": ariaLabel = "Order progress",
  ...props
}: OrderStatusProgressProps) {
  useOrderStatus("OrderStatusProgress");

  return (
    <ol aria-label={ariaLabel} className={cn("grid list-none p-0", className)} {...props}>
      {children}
    </ol>
  );
}

export type OrderStatusStepProps = ComponentProps<"li"> & {
  status?: OrderStatusStepStatus;
};

const orderStatusStepLabel: Record<OrderStatusStepStatus, string> = {
  complete: "Complete",
  current: "Current",
  upcoming: "Upcoming",
  issue: "Needs attention",
};

const orderStatusStepTextClass: Record<OrderStatusStepStatus, string> = {
  complete: "text-[var(--uai-subtle)]",
  current: "text-[color-mix(in_oklab,var(--uai-accent)_72%,var(--uai-text))]",
  upcoming: "text-[var(--uai-subtle)]",
  issue: "text-[var(--uai-danger)]",
};

const orderStatusStepTitleClass: Record<OrderStatusStepStatus, string> = {
  complete: "[&_h3]:text-[var(--uai-muted)]",
  current: "[&_h3]:text-[var(--uai-text)]",
  upcoming: "[&_h3]:text-[var(--uai-muted)]",
  issue: "[&_h3]:text-[var(--uai-text)]",
};

function OrderStatusMarker({
  status,
  className,
  iconClassName,
}: {
  status: OrderStatusStepStatus;
  className: string;
  iconClassName: string;
}) {
  const markerClass = {
    complete:
      "border-transparent bg-[color-mix(in_oklab,var(--uai-success)_16%,var(--uai-surface))] text-[var(--uai-success)]",
    current:
      "border-transparent bg-[color-mix(in_oklab,var(--uai-accent)_18%,var(--uai-surface))] text-[var(--uai-accent)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--uai-accent)_10%,transparent)]",
    upcoming: "border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-subtle)]",
    issue:
      "border-transparent bg-[color-mix(in_oklab,var(--uai-danger)_16%,var(--uai-surface))] text-[var(--uai-danger)]",
  }[status];
  const Icon = status === "complete" ? Check : status === "issue" ? CircleAlert : Circle;

  return (
    <span
      className={cn(
        "relative z-10 inline-flex items-center justify-center rounded-full border",
        markerClass,
        className,
      )}
      aria-hidden="true"
    >
      <Icon
        className={cn(
          iconClassName,
          status === "current" &&
            "size-2 fill-current motion-safe:animate-pulse motion-reduce:animate-none",
        )}
        strokeWidth={status === "current" ? 0 : 2.25}
      />
    </span>
  );
}

export function OrderStatusStep({
  status = "upcoming",
  children,
  className,
  "aria-current": ariaCurrent,
  ...props
}: OrderStatusStepProps) {
  const context = useOrderStatus("OrderStatusStep");
  const complete = status === "complete";

  return (
    <li
      className={cn(
        "relative grid last:pb-0 [&:last-child>span:first-child]:hidden",
        context.chrome.stepClass,
        orderStatusStepTitleClass[status],
        className,
      )}
      aria-current={ariaCurrent ?? (status === "current" ? "step" : undefined)}
      data-status={status}
      {...props}
    >
      <span
        className={cn(
          "absolute bottom-0.5 w-px -translate-x-1/2 rounded-full",
          context.chrome.connectorClass,
          complete
            ? "bg-[color-mix(in_oklab,var(--uai-success)_55%,var(--uai-border))]"
            : "bg-[var(--uai-border)]",
        )}
        aria-hidden="true"
      />
      <OrderStatusMarker
        status={status}
        className={context.chrome.markerClass}
        iconClassName={context.chrome.markerIconClass}
      />
      <div className="min-w-0 pt-px">
        <span
          className={cn(
            "mb-0.5 block font-medium",
            context.chrome.stepLabelClass,
            orderStatusStepTextClass[status],
          )}
        >
          {orderStatusStepLabel[status]}
        </span>
        {children}
      </div>
    </li>
  );
}

export type OrderStatusStepTitleProps = ComponentProps<"h3">;

export function OrderStatusStepTitle({ children, className, ...props }: OrderStatusStepTitleProps) {
  const context = useOrderStatus("OrderStatusStepTitle");

  return (
    <h3 className={cn("font-medium", context.chrome.stepTitleClass, className)} {...props}>
      {children}
    </h3>
  );
}

export type OrderStatusStepDescriptionProps = ComponentProps<"p">;

export function OrderStatusStepDescription({
  children,
  className,
  ...props
}: OrderStatusStepDescriptionProps) {
  const context = useOrderStatus("OrderStatusStepDescription");

  return (
    <p
      className={cn(
        "text-[var(--uai-muted)] [overflow-wrap:anywhere]",
        context.chrome.stepDescriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type OrderStatusDetailsProps = ComponentProps<"dl">;

export function OrderStatusDetails({ children, className, ...props }: OrderStatusDetailsProps) {
  const context = useOrderStatus("OrderStatusDetails");

  return (
    <dl
      className={cn(
        "grid grid-cols-2 border-t border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] max-[420px]:grid-cols-1",
        context.chrome.detailsClass,
        className,
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export type OrderStatusDetailProps = ComponentProps<"div"> & {
  label: ReactNode;
};

export function OrderStatusDetail({
  label,
  children,
  className,
  ...props
}: OrderStatusDetailProps) {
  const context = useOrderStatus("OrderStatusDetail");

  return (
    <div className={cn("min-w-0", context.chrome.detailClass, className)} {...props}>
      <dt className={cn("text-[var(--uai-subtle)]", context.chrome.detailLabelClass)}>{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

export type OrderStatusActionsProps = ComponentProps<"div">;

export function OrderStatusActions({ children, className, ...props }: OrderStatusActionsProps) {
  const context = useOrderStatus("OrderStatusActions");

  return (
    <div className={cn("flex flex-wrap", context.chrome.actionsClass, className)} {...props}>
      {children}
    </div>
  );
}

export type OrderStatusActionProps = ComponentProps<"a"> & {
  emphasis?: "primary" | "secondary";
};

export function OrderStatusAction({
  emphasis = "secondary",
  children,
  className,
  ...props
}: OrderStatusActionProps) {
  const context = useOrderStatus("OrderStatusAction");

  return (
    <a
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium no-underline transition-[transform,background-color,filter] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.actionClass,
        emphasis === "primary"
          ? "bg-[var(--uai-accent)] text-[var(--uai-accent-foreground)] hover:brightness-[1.08]"
          : "bg-[var(--uai-surface-raised)] text-[var(--uai-text)] hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_85%,var(--uai-text))]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
