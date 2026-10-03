"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, createContext, useContext } from "react";
import { cn } from "@/lib/uai-utils";

export const STEP_INDICATOR_VARIANTS = ["horizontal", "vertical", "compact"] as const;
export type StepIndicatorVariant = (typeof STEP_INDICATOR_VARIANTS)[number];
export type StepIndicatorStatus = "upcoming" | "current" | "complete" | "blocked" | "error";
const Context = createContext<StepIndicatorVariant | null>(null);

const stepIndicatorVariants = cva(
  "m-0 flex list-none flex-wrap p-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        horizontal: "flex-row gap-2.5",
        vertical: "flex-col gap-0.5",
        compact: "flex-row gap-1",
      },
    },
  },
);

const dotTone: Record<StepIndicatorStatus, string> = {
  complete: "bg-foreground",
  current: "bg-primary",
  error: "bg-destructive",
  blocked: "bg-border-strong",
  upcoming: "bg-border",
};
const verticalTone: Record<StepIndicatorStatus, string> = {
  complete: "shadow-[inset_2px_0_0_var(--foreground)]",
  current: "shadow-[inset_2px_0_0_var(--primary)]",
  error: "shadow-[inset_2px_0_0_var(--destructive)]",
  blocked: "shadow-[inset_2px_0_0_var(--border-strong)]",
  upcoming: "shadow-[inset_2px_0_0_var(--border)]",
};
const horizontalTone: Record<StepIndicatorStatus, string> = {
  complete: "shadow-[inset_0_3px_0_var(--foreground)]",
  current: "shadow-[inset_0_3px_0_var(--primary)]",
  error: "shadow-[inset_0_3px_0_var(--destructive)]",
  blocked: "shadow-[inset_0_3px_0_var(--border-strong)]",
  upcoming: "shadow-[inset_0_3px_0_var(--border)]",
};

export function StepIndicator({
  variant = "horizontal",
  className,
  ...props
}: ComponentProps<"ol"> & { variant?: StepIndicatorVariant }) {
  return (
    <Context.Provider value={variant}>
      <ol
        aria-label="Form progress"
        data-slot="step-indicator"
        className={cn(stepIndicatorVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      />
    </Context.Provider>
  );
}
export function StepIndicatorStep({
  status = "upcoming",
  optional = false,
  children,
  className,
  ...props
}: ComponentProps<"li"> & { status?: StepIndicatorStatus; optional?: boolean }) {
  const variant = useContext(Context);
  if (!variant) throw new Error("StepIndicatorStep must be used within StepIndicator");
  const active = status === "current";
  const muted = status === "upcoming" || status === "blocked";
  const label = (
    <span
      className={cn(
        "text-[11.5px]/4",
        status === "error"
          ? "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]"
          : active
            ? "text-primary"
            : "text-subtle-foreground",
        variant === "compact" && "sr-only",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {optional ? " · Optional" : ""}
    </span>
  );
  if (variant === "compact")
    return (
      <li
        data-slot="step-indicator-step"
        className={cn(
          "relative inline-flex h-7 min-w-0 items-center gap-1.5 rounded-full pr-3 pl-2.5 text-[12.5px] transition-[background-color,color] duration-120 ease-[ease-out] motion-reduce:transition-none",
          active ? "bg-accent" : "bg-transparent",
          muted ? "text-subtle-foreground" : "text-foreground",
          className,
        )}
        {...props}
        aria-current={active ? "step" : undefined}
        data-status={status}
      >
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", dotTone[status])}
        />
        {children}
        {label}
      </li>
    );
  return (
    <li
      data-slot="step-indicator-step"
      className={cn(
        "grid min-w-0 content-start gap-1 [transition:box-shadow_240ms_var(--ease-out-quint),color_120ms_ease-out] motion-reduce:transition-none",
        muted ? "text-muted-foreground" : "text-foreground",
        variant === "vertical"
          ? cn("rounded-none pt-2 pr-0 pb-2.5 pl-3.5", verticalTone[status])
          : cn("flex-[1_1_110px] rounded-t-[2px] pt-3", horizontalTone[status]),
        className,
      )}
      {...props}
      aria-current={active ? "step" : undefined}
      data-status={status}
    >
      {children}
      {label}
    </li>
  );
}
export function StepIndicatorTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="step-indicator-title"
      className={cn("font-medium wrap-anywhere", className)}
      {...props}
    />
  );
}
export function StepIndicatorDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="step-indicator-description"
      className={cn("m-0 text-xs/4 text-muted-foreground", className)}
      {...props}
    />
  );
}
