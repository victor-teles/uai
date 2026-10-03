"use client";

import { type ComponentProps, type CSSProperties, createContext, useContext } from "react";

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
const motionCss = `
@keyframes uai-skeleton-shimmer{from{background-position:150% 0}to{background-position:-50% 0}}
@keyframes uai-skeleton-pulse{50%{opacity:0.5}}
.uai-skeleton[data-motion="shimmer"]{background-image:linear-gradient(90deg,transparent 0%,color-mix(in oklab,var(--uai-text) 7%,transparent) 50%,transparent 100%);background-size:200% 100%;background-repeat:no-repeat;animation:uai-skeleton-shimmer 1.8s cubic-bezier(0.4,0,0.6,1) infinite}
.uai-skeleton[data-motion="pulse"]{animation:uai-skeleton-pulse 1.6s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.uai-skeleton{animation:none!important;background-image:none!important}}
`;

export function SkeletonGroup({
  variant = "shimmer",
  label = "Loading…",
  children,
  style,
  ...props
}: SkeletonGroupProps) {
  return (
    <Context.Provider value={variant}>
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        {...props}
        data-variant={variant}
        style={{ position: "relative", display: "grid", gap: 12, minWidth: 0, ...style }}
      >
        <style>{motionCss}</style>
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div aria-hidden="true" style={{ display: "contents" }}>
          {children}
        </div>
      </div>
    </Context.Provider>
  );
}

function Shape({
  part,
  width,
  height,
  radius,
  style,
  ...props
}: ComponentProps<"span"> & { part: string; width: Size; height: Size; radius: number }) {
  const variant = useVariant(part);
  return (
    <span
      {...props}
      className="uai-skeleton"
      data-motion={variant}
      style={{
        display: "block",
        flex: "none",
        width,
        maxWidth: "100%",
        height,
        borderRadius: radius,
        backgroundColor: "var(--uai-surface-raised)",
        ...style,
      }}
    />
  );
}

export function SkeletonGroupLine({
  width = "100%",
  height = 10,
  ...props
}: ComponentProps<"span"> & { width?: Size; height?: Size }) {
  return <Shape {...props} part="SkeletonGroupLine" width={width} height={height} radius={999} />;
}

export function SkeletonGroupCircle({
  size = 28,
  ...props
}: ComponentProps<"span"> & { size?: number }) {
  return <Shape {...props} part="SkeletonGroupCircle" width={size} height={size} radius={999} />;
}

export function SkeletonGroupBlock({
  width = "100%",
  height = 96,
  ...props
}: ComponentProps<"span"> & { width?: Size; height?: Size }) {
  return <Shape {...props} part="SkeletonGroupBlock" width={width} height={height} radius={10} />;
}

export function SkeletonGroupRow({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, ...style }}
    />
  );
}

export function SkeletonGroupStack({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 8, flex: "1 1 0", minWidth: 0, ...style }} />
  );
}

export function SkeletonGroupCard({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: 14,
        padding: 16,
        border: "1px solid var(--uai-border)",
        borderRadius: 14,
        background: "var(--uai-surface)",
        minWidth: 0,
        ...style,
      }}
    />
  );
}
