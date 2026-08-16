"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { type ComponentProps, useState } from "react";

import { cn } from "@/lib/uai-utils";

export type ApprovalDecision = "approved" | "rejected";

export type ApprovalCardProps = Omit<ComponentProps<"section">, "title"> & {
  title: string;
  description?: string;
  approveLabel?: string;
  rejectLabel?: string;
  onDecision?: (decision: ApprovalDecision) => void;
};

export function ApprovalCard({
  title,
  description,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  onDecision,
  className,
  ...props
}: ApprovalCardProps) {
  const [decision, setDecision] = useState<ApprovalDecision | null>(null);

  const decide = (nextDecision: ApprovalDecision) => {
    setDecision(nextDecision);
    onDecision?.(nextDecision);
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--uai-border)] bg-[var(--uai-surface)] p-4 text-[var(--uai-text)]",
        className,
      )}
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
          {decision === "approved" ? (
            <Check className="size-4 text-[var(--uai-success)]" aria-hidden="true" />
          ) : decision === "rejected" ? (
            <X className="size-4 text-[var(--uai-danger)]" aria-hidden="true" />
          ) : (
            <span className="size-2 rounded-full bg-[var(--uai-warning)]" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {description ? (
            <p className="mt-1 max-w-[62ch] text-sm leading-5 text-[var(--uai-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {decision ? (
          <>
            <span className="mr-auto text-xs text-[var(--uai-muted)]">
              {decision === "approved" ? "Approved" : "Rejected"}
            </span>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--uai-border)] px-3 text-sm outline-none transition-colors hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)]"
              onClick={() => setDecision(null)}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="h-9 rounded-lg border border-[var(--uai-border)] px-3 text-sm outline-none transition-colors hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)]"
              onClick={() => decide("rejected")}
            >
              {rejectLabel}
            </button>
            <button
              type="button"
              className="h-9 rounded-lg bg-[var(--uai-accent)] px-3 text-sm font-medium text-[var(--uai-accent-foreground)] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uai-surface)]"
              onClick={() => decide("approved")}
            >
              {approveLabel}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
