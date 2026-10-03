"use client";

import { type ComponentProps, createContext, useContext } from "react";

export const DESCRIPTION_LIST_VARIANTS = ["inline", "stacked", "grid"] as const;
export type DescriptionListVariant = (typeof DESCRIPTION_LIST_VARIANTS)[number];
export type DescriptionListProps = ComponentProps<"dl"> & { variant?: DescriptionListVariant };

const Context = createContext<DescriptionListVariant | null>(null);
function useVariant(part: string) {
  const variant = useContext(Context);
  if (!variant) throw new Error(`${part} must be used within DescriptionList`);
  return variant;
}

export function DescriptionList({ variant = "inline", style, ...props }: DescriptionListProps) {
  return (
    <Context.Provider value={variant}>
      <dl
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gridTemplateColumns:
            variant === "grid"
              ? "repeat(auto-fit, minmax(min(100%, 180px), 1fr))"
              : "minmax(0, 1fr)",
          gap: variant === "grid" ? 8 : 0,
          margin: 0,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      />
    </Context.Provider>
  );
}

export function DescriptionListItem({ style, className, ...props }: ComponentProps<"div">) {
  const variant = useVariant("DescriptionListItem");
  return (
    <div
      {...props}
      className={[
        variant === "grid" ? undefined : "border-b border-[var(--uai-border)] last:border-b-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: variant === "inline" ? "row" : "column",
        alignItems: variant === "inline" ? "baseline" : "stretch",
        columnGap: 16,
        rowGap: variant === "stacked" ? 2 : 4,
        minWidth: 0,
        padding: variant === "grid" ? "10px 12px" : variant === "stacked" ? "10px 0" : "9px 0",
        borderRadius: variant === "grid" ? 10 : 0,
        background: variant === "grid" ? "var(--uai-surface-raised)" : "transparent",
        ...style,
      }}
    />
  );
}

export function DescriptionListTerm({ style, ...props }: ComponentProps<"dt">) {
  const variant = useVariant("DescriptionListTerm");
  return (
    <dt
      {...props}
      style={{
        flex: variant === "inline" ? "1 1 140px" : undefined,
        maxWidth: variant === "inline" ? 200 : undefined,
        color: variant === "inline" ? "var(--uai-muted)" : "var(--uai-subtle)",
        fontSize: variant === "inline" ? 12.5 : 11.5,
        lineHeight: variant === "inline" ? "18px" : "16px",
        fontWeight: 400,
        ...style,
      }}
    />
  );
}

export function DescriptionListDetails({ style, ...props }: ComponentProps<"dd">) {
  const variant = useVariant("DescriptionListDetails");
  return (
    <dd
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        flex: variant === "inline" ? "999 1 220px" : undefined,
        minWidth: 0,
        minHeight: variant === "inline" ? 28 : undefined,
        margin: 0,
        fontWeight: 500,
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

export function DescriptionListAction({ style, className, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type="button"
      className={[
        "bg-transparent text-[var(--uai-muted)] [transition:background-color_120ms_ease-out,color_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
        minWidth: 26,
        height: 26,
        padding: "0 10px",
        border: 0,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}
