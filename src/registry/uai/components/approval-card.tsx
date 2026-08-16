"use client";

import {
  Check,
  CircleAlert,
  LoaderCircle,
  OctagonAlert,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/uai-utils";

export const APPROVAL_CARD_RISKS = ["low", "medium", "high", "critical"] as const;
export const APPROVAL_CARD_VARIANTS = ["compact", "detailed"] as const;
export const APPROVAL_CARD_STATUSES = [
  "ready",
  "submitting",
  "approved",
  "rejected",
  "error",
] as const;

export type ApprovalRisk = (typeof APPROVAL_CARD_RISKS)[number];
export type ApprovalCardVariant = (typeof APPROVAL_CARD_VARIANTS)[number];
export type ApprovalCardStatus = (typeof APPROVAL_CARD_STATUSES)[number];
export type ApprovalDecision = "approved" | "rejected";

export type ApprovalConfirmation = {
  phrase: string;
  label?: ReactNode;
  placeholder?: string;
};

type ApprovalRiskProps =
  | { risk?: Exclude<ApprovalRisk, "critical">; confirmation?: never }
  | { risk: "critical"; confirmation: ApprovalConfirmation };

export type ApprovalCardState =
  | { status?: "ready"; pendingDecision?: never }
  | { status: "submitting"; pendingDecision: ApprovalDecision }
  | { status: "approved" | "rejected" | "error"; pendingDecision?: never };

export type ApprovalCardProps = ComponentProps<"section"> &
  ApprovalRiskProps &
  ApprovalCardState & {
    variant?: ApprovalCardVariant;
    disabled?: boolean;
  };

const riskConfig = {
  low: { label: "Low risk", icon: ShieldCheck, iconClassName: "text-[var(--uai-success)]" },
  medium: {
    label: "Medium risk",
    icon: CircleAlert,
    iconClassName: "text-[var(--uai-warning)]",
  },
  high: {
    label: "High risk",
    icon: TriangleAlert,
    iconClassName: "text-[var(--uai-danger)]",
  },
  critical: {
    label: "Critical risk",
    icon: OctagonAlert,
    iconClassName: "text-[var(--uai-danger)]",
  },
} satisfies Record<
  ApprovalRisk,
  { label: string; icon: typeof ShieldCheck; iconClassName: string }
>;

type ApprovalCardContextValue = {
  risk: ApprovalRisk;
  variant: ApprovalCardVariant;
  status: ApprovalCardStatus;
  pendingDecision?: ApprovalDecision;
  confirmation?: ApprovalConfirmation;
  confirmationValue: string;
  setConfirmationValue: (value: string) => void;
  confirmationMatches: boolean;
  disabled: boolean;
  isSubmitting: boolean;
  isTerminal: boolean;
  isActionable: boolean;
  titleId: string;
  confirmationId: string;
};

const ApprovalCardContext = createContext<ApprovalCardContextValue | null>(null);

function useApprovalCard(name: string) {
  const context = useContext(ApprovalCardContext);
  if (!context) throw new Error(`${name} must be used within ApprovalCard`);
  return context;
}

export function ApprovalCard(props: ApprovalCardProps) {
  const {
    variant = "compact",
    risk = "medium",
    confirmation,
    status = "ready",
    pendingDecision,
    disabled = false,
    children,
    className,
    style,
    "aria-labelledby": ariaLabelledby,
    ...sectionProps
  } = props;
  const titleId = useId();
  const confirmationId = useId();
  const [confirmationValue, setConfirmationValue] = useState("");
  const isSubmitting = status === "submitting";
  const isTerminal = status === "approved" || status === "rejected";
  const isActionable = status === "ready" || status === "error";
  const confirmationMatches =
    risk !== "critical" ||
    (Boolean(confirmation?.phrase) && confirmationValue === confirmation?.phrase);

  useEffect(() => {
    setConfirmationValue((current) => (current === confirmation?.phrase ? current : ""));
  }, [confirmation?.phrase]);

  const context: ApprovalCardContextValue = {
    risk,
    variant,
    status,
    pendingDecision,
    confirmation,
    confirmationValue,
    setConfirmationValue,
    confirmationMatches,
    disabled,
    isSubmitting,
    isTerminal,
    isActionable,
    titleId,
    confirmationId,
  };

  return (
    <ApprovalCardContext.Provider value={context}>
      <section
        {...sectionProps}
        className={cn(
          "border bg-[var(--uai-surface)] text-[var(--uai-text)] transition-colors duration-150 motion-reduce:transition-none",
          variant === "compact" ? "p-3.5" : "p-4",
          risk === "critical" ? "border-[var(--uai-danger)]" : "border-[var(--uai-border)]",
          disabled && "opacity-55",
          className,
        )}
        style={{ ...style, borderRadius: 14 }}
        aria-busy={isSubmitting}
        aria-labelledby={ariaLabelledby ?? titleId}
      >
        {children}
      </section>
    </ApprovalCardContext.Provider>
  );
}

export type ApprovalCardHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  riskLabel?: ReactNode;
  statusLabel?: ReactNode;
};

export function ApprovalCardHeader({
  title,
  description,
  riskLabel,
  statusLabel,
  className,
  ...props
}: ApprovalCardHeaderProps) {
  const context = useApprovalCard("ApprovalCardHeader");
  const riskState = riskConfig[context.risk];
  const RiskIcon = riskState.icon;
  const resolvedStatusLabel =
    statusLabel ??
    {
      ready: "Ready for review",
      submitting: context.pendingDecision === "rejected" ? "Rejecting…" : "Approving…",
      approved: "Approved",
      rejected: "Rejected",
      error: "Decision failed",
    }[context.status];

  return (
    <div className={cn("flex items-start gap-3", className)} {...props}>
      <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
        <RiskIcon className={cn("size-3.5", riskState.iconClassName)} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-[0.66rem] leading-4 font-medium text-[var(--uai-text)]">
            {riskLabel ?? riskState.label}
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[0.66rem] leading-4 text-[var(--uai-muted)]"
            role="status"
            aria-live="polite"
          >
            {context.isSubmitting ? (
              <LoaderCircle
                className="size-3 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : context.status === "approved" ? (
              <Check className="size-3 text-[var(--uai-success)]" aria-hidden="true" />
            ) : context.status === "rejected" ? (
              <X className="size-3 text-[var(--uai-danger)]" aria-hidden="true" />
            ) : context.status === "error" ? (
              <CircleAlert className="size-3 text-[var(--uai-danger)]" aria-hidden="true" />
            ) : null}
            {resolvedStatusLabel}
          </span>
        </div>
        <h3 id={context.titleId} className="mt-1.5 text-sm leading-5 font-medium">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-[68ch] text-[13px] leading-[18px] text-[var(--uai-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export type ApprovalCardDetailsProps = ComponentProps<"dl">;

export function ApprovalCardDetails({ children, className, ...props }: ApprovalCardDetailsProps) {
  const context = useApprovalCard("ApprovalCardDetails");
  if (context.variant !== "detailed") return null;

  return (
    <dl
      className={cn(
        "mt-4 grid gap-3 border-t border-[var(--uai-border)] pt-3 sm:grid-cols-2",
        className,
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export type ApprovalCardDetailProps = ComponentProps<"div"> & { label: ReactNode };

export function ApprovalCardDetail({
  label,
  children,
  className,
  ...props
}: ApprovalCardDetailProps) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      <dt className="text-[0.66rem] leading-4 font-medium text-[var(--uai-muted)]">{label}</dt>
      <dd className="mt-1 min-w-0 text-[13px] leading-[18px] text-[var(--uai-text)] [&_li+li]:mt-1 [&_ul]:list-inside [&_ul]:list-disc">
        {children}
      </dd>
    </div>
  );
}

export type ApprovalCardConfirmationProps = ComponentProps<"div">;

export function ApprovalCardConfirmation({ className, ...props }: ApprovalCardConfirmationProps) {
  const context = useApprovalCard("ApprovalCardConfirmation");
  if (context.risk !== "critical" || context.isTerminal || !context.confirmation) return null;

  return (
    <div className={cn("mt-4 border-t border-[var(--uai-border)] pt-3", className)} {...props}>
      <label
        htmlFor={context.confirmationId}
        className="block text-xs leading-[18px] text-[var(--uai-text)]"
      >
        {context.confirmation.label ?? (
          <>
            Type <strong className="font-medium">{context.confirmation.phrase}</strong> to confirm.
          </>
        )}
      </label>
      <input
        id={context.confirmationId}
        type="text"
        value={context.confirmationValue}
        placeholder={context.confirmation.placeholder ?? context.confirmation.phrase}
        autoComplete="off"
        spellCheck={false}
        disabled={context.disabled || context.isSubmitting}
        onChange={(event) => context.setConfirmationValue(event.target.value)}
        className="mt-2 h-9 w-full rounded-lg border border-[var(--uai-border)] bg-[var(--uai-canvas)] px-3 text-[13px] text-[var(--uai-text)] caret-[var(--uai-text)] outline-none transition-colors placeholder:text-[var(--uai-muted)] focus-visible:border-[var(--uai-border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] selection:bg-[color-mix(in_oklab,var(--uai-text)_18%,transparent)] disabled:cursor-not-allowed motion-reduce:transition-none"
      />
    </div>
  );
}

export type ApprovalCardErrorProps = ComponentProps<"p">;

export function ApprovalCardError({ className, children, ...props }: ApprovalCardErrorProps) {
  const context = useApprovalCard("ApprovalCardError");
  if (context.status !== "error") return null;

  return (
    <p
      className={cn(
        "mt-4 flex items-start gap-2 border-t border-[var(--uai-border)] pt-3 text-[13px] leading-[18px] text-[var(--uai-text)]",
        className,
      )}
      {...props}
      role="alert"
    >
      <CircleAlert
        className="mt-0.5 size-3.5 shrink-0 text-[var(--uai-danger)]"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

export type ApprovalCardActionsProps = ComponentProps<"div">;

export function ApprovalCardActions({ className, children, ...props }: ApprovalCardActionsProps) {
  const context = useApprovalCard("ApprovalCardActions");
  if (context.isTerminal) return null;

  return (
    <div className={cn("mt-4 flex flex-wrap items-center justify-end gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export type ApprovalCardRejectProps = ComponentProps<"button">;

export function ApprovalCardReject({
  children = "Reject",
  className,
  disabled,
  ...props
}: ApprovalCardRejectProps) {
  const context = useApprovalCard("ApprovalCardReject");

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "h-8 rounded-lg border border-[var(--uai-border)] px-3 text-[13px] outline-none transition-[background-color,transform] duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none",
        className,
      )}
      disabled={context.disabled || !context.isActionable || disabled}
    >
      {children}
    </button>
  );
}

export type ApprovalCardApproveProps = ComponentProps<"button">;

export function ApprovalCardApprove({
  children = "Approve",
  className,
  disabled: disabledProp,
  ...props
}: ApprovalCardApproveProps) {
  const context = useApprovalCard("ApprovalCardApprove");
  const disabled =
    context.disabled || !context.isActionable || !context.confirmationMatches || disabledProp;

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "h-8 rounded-lg bg-[var(--uai-text)] px-3 text-[13px] font-medium text-[var(--uai-surface)] outline-none transition-[filter,transform] duration-150 hover:brightness-90 focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[var(--uai-border-strong)] disabled:text-[var(--uai-muted)] motion-reduce:transition-none",
        className,
      )}
      disabled={disabled}
    >
      {context.isSubmitting && context.pendingDecision === "approved" ? "Approving…" : children}
    </button>
  );
}
