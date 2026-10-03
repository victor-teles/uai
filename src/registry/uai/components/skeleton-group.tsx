"use client";

import { cva } from "class-variance-authority";
import { type ComponentProps, type CSSProperties, createContext, useContext } from "react";
import { cn } from "@/lib/uai-utils";

export const SKELETON_GROUP_VARIANTS = ["shimmer", "pulse", "static"] as const;
export type SkeletonGroupVariant = (typeof SKELETON_GROUP_VARIANTS)[number];
export type SkeletonGroupProps = ComponentProps<"div"> & {
  variant?: SkeletonGroupVariant;
  /** Announced to assistive technology while the placeholder is shown. */
  label?: string;
};
type Size = CSSProperties["width"];
const Context = createContext<SkeletonGroupVariant | null>(null);
function useVariant(part: string) {
  const variant = useContext(Context);
  if (!variant) throw new Error(`${part} must be used within SkeletonGroup`);
  return variant;
}

export function SkeletonGroup({
  variant = "shimmer",
  label = "Loading…",
  className,
  children,
  ...props
}: SkeletonGroupProps) {
  return (
    <Context.Provider value={variant}>
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        data-slot="skeleton-group"
        className={cn("relative grid min-w-0 gap-3", className)}
        {...props}
        data-variant={variant}
      >
        <span className="sr-only">{label}</span>
        <div aria-hidden="true" className="contents">
          {children}
        </div>
      </div>
    </Context.Provider>
  );
}

const shapeVariants = cva("block max-w-full flex-none bg-muted", {
  variants: {
    motion: {
      shimmer:
        "animate-[skeleton-shimmer_1.8s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_100%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none motion-reduce:bg-none",
      pulse: "animate-[pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none",
      static: "",
    },
  },
});

function Shape({
  part,
  slot,
  width,
  height,
  className,
  style,
  ...props
}: ComponentProps<"span"> & { part: string; slot: string; width: Size; height: Size }) {
  const variant = useVariant(part);
  return (
    <span
      data-slot={slot}
      className={cn(shapeVariants({ motion: variant }), className)}
      {...props}
      data-motion={variant}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonGroupLine({
  width = "100%",
  height = 10,
  className,
  ...props
}: ComponentProps<"span"> & { width?: Size; height?: Size }) {
  return (
    <Shape
      {...props}
      part="SkeletonGroupLine"
      slot="skeleton-group-line"
      width={width}
      height={height}
      className={cn("rounded-full", className)}
    />
  );
}

export function SkeletonGroupCircle({
  size = 28,
  className,
  ...props
}: ComponentProps<"span"> & { size?: number }) {
  return (
    <Shape
      {...props}
      part="SkeletonGroupCircle"
      slot="skeleton-group-circle"
      width={size}
      height={size}
      className={cn("rounded-full", className)}
    />
  );
}

export function SkeletonGroupBlock({
  width = "100%",
  height = 96,
  className,
  ...props
}: ComponentProps<"span"> & { width?: Size; height?: Size }) {
  return (
    <Shape
      {...props}
      part="SkeletonGroupBlock"
      slot="skeleton-group-block"
      width={width}
      height={height}
      className={cn("rounded-[10px]", className)}
    />
  );
}

export function SkeletonGroupRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-group-row"
      className={cn("flex min-w-0 items-center gap-3", className)}
      {...props}
    />
  );
}

export function SkeletonGroupStack({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-group-stack"
      className={cn("grid min-w-0 flex-[1_1_0] gap-2", className)}
      {...props}
    />
  );
}

export function SkeletonGroupCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-group-card"
      className={cn("grid min-w-0 gap-3.5 rounded-[14px] border bg-card p-4", className)}
      {...props}
    />
  );
}
