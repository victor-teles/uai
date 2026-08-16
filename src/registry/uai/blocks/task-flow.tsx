import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/uai-utils";

export type TaskFlowProps = ComponentProps<"section">;

export function TaskFlow({ className, children, ...props }: TaskFlowProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--uai-border)] bg-[var(--uai-canvas)] p-3 text-[var(--uai-text)] sm:p-4",
        className,
      )}
      aria-label="Task flow"
      {...props}
    >
      <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-[17px] before:top-8 before:w-px before:bg-[var(--uai-accent)] before:opacity-60 sm:before:left-[120px]">
        {children}
      </ol>
    </section>
  );
}

export type TaskFlowStepProps = ComponentProps<"li"> & {
  label: ReactNode;
  icon: ReactNode;
  active?: boolean;
};

export function TaskFlowStep({
  label,
  icon,
  active = false,
  className,
  children,
  ...props
}: TaskFlowStepProps) {
  return (
    <li
      className={cn("relative grid gap-2 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-5", className)}
      {...props}
    >
      <div className="relative z-10 flex items-center gap-2 bg-[var(--uai-canvas)] py-1 text-[0.66rem] font-medium uppercase tracking-[0.08em] text-[var(--uai-muted)] sm:justify-end sm:text-right">
        <span
          data-active={active ? "true" : undefined}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface)] sm:order-2",
            active && "border-[var(--uai-accent)] text-[var(--uai-accent)]",
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  );
}
