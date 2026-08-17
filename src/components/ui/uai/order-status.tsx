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
        : "border border-[var(--uai-border)] bg-[var(--uai-surface)]",
    rootStyle: {
      borderRadius: compact ? 12 : variant === "card" ? 14 : 0,
      padding: compact ? 12 : variant === "card" ? 18 : 0,
    },
    headerClass: compact ? "mb-4" : "mb-5",
    titleClass: compact ? "text-[13px] leading-[18px]" : "text-sm leading-5",
    descriptionClass: compact ? "mt-0.5 text-[0.72rem] leading-4" : "mt-1 text-[12px] leading-4",
    stepClass: compact
      ? "grid-cols-[18px_minmax(0,1fr)] gap-2.5 pb-3.5"
      : "grid-cols-[22px_minmax(0,1fr)] gap-3 pb-4",
    markerClass: compact ? "size-[18px]" : "size-[22px]",
    markerIconClass: compact ? "size-2.5" : "size-3",
    connectorClass: compact ? "left-[8.5px] top-5" : "left-[10.5px] top-6",
    stepTitleClass: compact ? "text-[12px] leading-4" : "text-[12.5px] leading-[18px]",
    stepDescriptionClass: compact
      ? "mt-0.5 text-[0.7rem] leading-4"
      : "mt-0.5 text-[11.5px] leading-4",
    detailsClass: compact ? "mt-4 gap-2.5 pt-3.5" : "mt-5 gap-3 pt-4",
    detailClass: compact ? "text-[0.72rem] leading-4" : "text-[12px] leading-4",
    actionsClass: compact ? "mt-4 gap-2 pt-3.5" : "mt-5 gap-2.5 pt-4",
    actionClass: compact ? "h-8 px-3 text-[0.72rem]" : "h-[34px] px-3.5 text-[12px]",
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
        "max-w-[48ch] text-[var(--uai-muted)] [overflow-wrap:anywhere]",
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
  neutral: "border-[var(--uai-border)] bg-[var(--uai-surface-raised)] text-[var(--uai-muted)]",
  progress:
    "border-[var(--uai-border-strong)] bg-[var(--uai-surface-raised)] text-[var(--uai-text)]",
  success:
    "border-[color-mix(in_oklab,var(--uai-success)_46%,var(--uai-border))] bg-[color-mix(in_oklab,var(--uai-success)_10%,var(--uai-surface))] text-[var(--uai-success)]",
  warning:
    "border-[color-mix(in_oklab,var(--uai-warning)_48%,var(--uai-border))] bg-[color-mix(in_oklab,var(--uai-warning)_10%,var(--uai-surface))] text-[var(--uai-warning)]",
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
        "inline-flex min-h-6 shrink-0 items-center rounded-full border px-2.5 text-[0.72rem] leading-4 font-medium whitespace-nowrap",
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
  complete: "text-[var(--uai-muted)]",
  current: "text-[var(--uai-text)]",
  upcoming: "text-[var(--uai-muted)]",
  issue: "text-[var(--uai-danger)]",
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
      "border-[color-mix(in_oklab,var(--uai-success)_62%,var(--uai-border))] bg-[var(--uai-success)] text-[var(--uai-surface)]",
    current: "border-[var(--uai-text)] bg-[var(--uai-surface)] text-[var(--uai-text)]",
    upcoming: "border-[var(--uai-border-strong)] bg-[var(--uai-surface)] text-[var(--uai-muted)]",
    issue: "border-[var(--uai-danger)] bg-[var(--uai-surface)] text-[var(--uai-danger)]",
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
        className={cn(iconClassName, status === "current" && "size-1.5 fill-current")}
        strokeWidth={status === "current" ? 3 : 2}
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
        className,
      )}
      aria-current={ariaCurrent ?? (status === "current" ? "step" : undefined)}
      data-status={status}
      {...props}
    >
      <span
        className={cn(
          "absolute bottom-0 w-px -translate-x-1/2",
          context.chrome.connectorClass,
          complete ? "bg-[var(--uai-success)]" : "bg-[var(--uai-border)]",
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
            "mb-0.5 block text-[0.72rem] leading-3 font-medium tracking-[0.035em] uppercase",
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
        "grid grid-cols-2 border-t border-[var(--uai-border)] max-[420px]:grid-cols-1",
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
      <dt className="text-[var(--uai-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

export type OrderStatusActionsProps = ComponentProps<"div">;

export function OrderStatusActions({ children, className, ...props }: OrderStatusActionsProps) {
  const context = useOrderStatus("OrderStatusActions");

  return (
    <div
      className={cn(
        "flex flex-wrap border-t border-[var(--uai-border)]",
        context.chrome.actionsClass,
        className,
      )}
      {...props}
    >
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
        "inline-flex items-center justify-center rounded-[8px] border font-medium underline-offset-4 transition-[transform,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-border-strong)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.actionClass,
        emphasis === "primary"
          ? "border-[var(--uai-text)] bg-[var(--uai-text)] text-[var(--uai-surface)]"
          : "border-[var(--uai-border)] bg-transparent text-[var(--uai-text)] hover:bg-[var(--uai-surface-raised)]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
