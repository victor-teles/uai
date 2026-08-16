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
import { type ComponentProps, useEffect, useId, useState } from "react";

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
  label?: string;
  placeholder?: string;
};

type ApprovalRiskProps =
  | {
      risk?: Exclude<ApprovalRisk, "critical">;
      confirmation?: never;
    }
  | {
      risk: "critical";
      confirmation: ApprovalConfirmation;
    };

export type ApprovalCardState =
  | {
      status?: "ready";
      pendingDecision?: never;
      errorMessage?: never;
    }
  | {
      status: "submitting";
      pendingDecision: ApprovalDecision;
      errorMessage?: never;
    }
  | {
      status: "approved" | "rejected";
      pendingDecision?: never;
      errorMessage?: never;
    }
  | {
      status: "error";
      pendingDecision?: never;
      errorMessage: string;
    };

export type ApprovalCardProps = Omit<ComponentProps<"section">, "title"> &
  ApprovalRiskProps &
  ApprovalCardState & {
    title: string;
    description?: string;
    variant?: ApprovalCardVariant;
    riskLabel?: string;
    statusLabel?: string;
    approveLabel?: string;
    rejectLabel?: string;
    disabled?: boolean;
    onApprove?: () => void;
    onReject?: () => void;
  };

export type ApprovalCardDetailProps = ComponentProps<"div"> & {
  label: string;
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

export function ApprovalCard(props: ApprovalCardProps) {
  const {
    title,
    description,
    variant = "compact",
    risk = "medium",
    confirmation,
    status = "ready",
    pendingDecision,
    errorMessage,
    riskLabel,
    statusLabel,
    approveLabel = "Approve",
    rejectLabel = "Reject",
    disabled = false,
    onApprove,
    onReject,
    children,
    className,
    style,
    "aria-labelledby": ariaLabelledby,
    ...sectionProps
  } = props;
  const titleId = useId();
  const confirmationId = useId();
  const [confirmationValue, setConfirmationValue] = useState("");
  const riskState = riskConfig[risk];
  const RiskIcon = riskState.icon;
  const isSubmitting = status === "submitting";
  const isTerminal = status === "approved" || status === "rejected";
  const isActionable = status === "ready" || status === "error";
  const needsConfirmation = risk === "critical";
  const confirmationPhrase = confirmation?.phrase;
  const confirmationMatches =
    !needsConfirmation || (Boolean(confirmationPhrase) && confirmationValue === confirmationPhrase);
  const actionsDisabled = disabled || !isActionable;
  const resolvedStatusLabel =
    statusLabel ??
    {
      ready: "Ready for review",
      submitting: pendingDecision === "rejected" ? "Rejecting…" : "Approving…",
      approved: "Approved",
      rejected: "Rejected",
      error: "Decision failed",
    }[status];

  useEffect(() => {
    setConfirmationValue((value) => (value === confirmationPhrase ? value : ""));
  }, [confirmationPhrase]);

  return (
    <section
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
      {...sectionProps}
    >
      <div className="flex items-start gap-3">
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
              {isSubmitting ? (
                <LoaderCircle
                  className="size-3 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : status === "approved" ? (
                <Check className="size-3 text-[var(--uai-success)]" aria-hidden="true" />
              ) : status === "rejected" ? (
                <X className="size-3 text-[var(--uai-danger)]" aria-hidden="true" />
              ) : status === "error" ? (
                <CircleAlert className="size-3 text-[var(--uai-danger)]" aria-hidden="true" />
              ) : null}
              {resolvedStatusLabel}
            </span>
          </div>
          <h3 id={titleId} className="mt-1.5 text-sm leading-5 font-medium">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 max-w-[68ch] text-[13px] leading-[18px] text-[var(--uai-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {variant === "detailed" && children ? (
        <dl className="mt-4 grid gap-3 border-t border-[var(--uai-border)] pt-3 sm:grid-cols-2">
          {children}
        </dl>
      ) : null}

      {needsConfirmation && !isTerminal ? (
        <div className="mt-4 border-t border-[var(--uai-border)] pt-3">
          <label
            htmlFor={confirmationId}
            className="block text-xs leading-[18px] text-[var(--uai-text)]"
          >
            {confirmation?.label ?? (
              <>
                Type <strong className="font-medium">{confirmation?.phrase}</strong> to confirm.
              </>
            )}
          </label>
          <input
            id={confirmationId}
            type="text"
            value={confirmationValue}
            placeholder={confirmation?.placeholder ?? confirmation?.phrase}
            autoComplete="off"
            spellCheck={false}
            disabled={disabled || isSubmitting}
            onChange={(event) => setConfirmationValue(event.target.value)}
            className="mt-2 h-9 w-full rounded-lg border border-[var(--uai-border)] bg-[var(--uai-canvas)] px-3 text-[13px] text-[var(--uai-text)] caret-[var(--uai-text)] outline-none transition-colors placeholder:text-[var(--uai-muted)] focus-visible:border-[var(--uai-border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] selection:bg-[color-mix(in_oklab,var(--uai-text)_18%,transparent)] disabled:cursor-not-allowed motion-reduce:transition-none"
          />
        </div>
      ) : null}

      {status === "error" ? (
        <p
          className="mt-4 flex items-start gap-2 border-t border-[var(--uai-border)] pt-3 text-[13px] leading-[18px] text-[var(--uai-text)]"
          role="alert"
        >
          <CircleAlert
            className="mt-0.5 size-3.5 shrink-0 text-[var(--uai-danger)]"
            aria-hidden="true"
          />
          {errorMessage}
        </p>
      ) : null}

      {!isTerminal ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="h-8 rounded-lg border border-[var(--uai-border)] px-3 text-[13px] outline-none transition-[background-color,transform] duration-150 hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none"
            disabled={actionsDisabled}
            onClick={onReject}
          >
            {rejectLabel}
          </button>
          <button
            type="button"
            className="h-8 rounded-lg bg-[var(--uai-text)] px-3 text-[13px] font-medium text-[var(--uai-surface)] outline-none transition-[filter,transform] duration-150 hover:brightness-90 focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-[var(--uai-border-strong)] disabled:text-[var(--uai-muted)] motion-reduce:transition-none"
            disabled={actionsDisabled || !confirmationMatches}
            onClick={onApprove}
          >
            {isSubmitting && pendingDecision === "approved" ? "Approving…" : approveLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
