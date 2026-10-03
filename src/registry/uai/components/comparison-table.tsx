"use client";

import { Check, Minus } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";

export const COMPARISON_TABLE_VARIANTS = ["bordered", "plain", "compact"] as const;
export type ComparisonTableVariant = (typeof COMPARISON_TABLE_VARIANTS)[number];
export type ComparisonTableProps = ComponentProps<"div"> & {
  variant?: ComparisonTableVariant;
  highlightDifferences?: boolean;
  defaultHighlightDifferences?: boolean;
  onHighlightDifferencesChange?: (highlight: boolean) => void;
};

type TableContext = {
  id: string;
  variant: ComparisonTableVariant;
  highlight: boolean;
  setHighlight: (highlight: boolean) => void;
};
const Context = createContext<TableContext | null>(null);
function useTable(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ComparisonTable`);
  return context;
}
const RowContext = createContext<{ different: boolean } | null>(null);
function useRow(part: string) {
  const context = useContext(RowContext);
  if (!context) throw new Error(`${part} must be used within ComparisonTableRow`);
  return context;
}

const marked = "color-mix(in oklab, var(--uai-accent) 9%, var(--uai-surface))";
// Rows tint on hover; the sticky row header follows so the tint spans the full row.
const rowHover = "hover:bg-[color-mix(in_oklab,var(--uai-surface-raised)_55%,var(--uai-surface))]";
const headerHover =
  "bg-[var(--uai-surface)] [tr:hover>&]:bg-[color-mix(in_oklab,var(--uai-surface-raised)_55%,var(--uai-surface))]";
// Hairlines between rows only; the last row sits on the container edge.
const cellRule = "border-b border-[var(--uai-border)] [tr:last-child>&]:border-b-0";

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export function ComparisonTable({
  variant = "bordered",
  highlightDifferences,
  defaultHighlightDifferences = false,
  onHighlightDifferencesChange,
  style,
  children,
  ...props
}: ComparisonTableProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultHighlightDifferences);
  const highlight = highlightDifferences ?? internal;
  const setHighlight = (next: boolean) => {
    if (highlightDifferences === undefined) setInternal(next);
    onHighlightDifferencesChange?.(next);
  };
  return (
    <Context.Provider value={{ id, variant, highlight, setHighlight }}>
      <div
        {...props}
        data-variant={variant}
        data-highlight-differences={highlight || undefined}
        style={{
          display: "grid",
          gap: 12,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function ComparisonTableHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        ...style,
      }}
    />
  );
}

export function ComparisonTableTitle({ style, ...props }: ComponentProps<"h3">) {
  const context = useTable("ComparisonTableTitle");
  return (
    <h3
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function ComparisonTableDifferencesToggle({
  children = "Highlight differences",
  style,
  ...props
}: Omit<ComponentProps<"input">, "type" | "checked" | "onChange">) {
  const context = useTable("ComparisonTableDifferencesToggle");
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        minHeight: 28,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      <input
        {...props}
        type="checkbox"
        checked={context.highlight}
        onChange={(event) => context.setHighlight(event.target.checked)}
        style={{ width: 14, height: 14, margin: 0, accentColor: "var(--uai-accent)" }}
      />
      {children}
    </label>
  );
}

export function ComparisonTableContent({
  style,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & { children: ReactNode }) {
  const context = useTable("ComparisonTableContent");
  const compact = context.variant === "compact";
  return (
    <section
      aria-labelledby={`${context.id}-title`}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: horizontally scrollable regions must be keyboard reachable.
      tabIndex={0}
      {...props}
      style={{
        maxWidth: "100%",
        overflowX: "auto",
        border: context.variant === "plain" ? 0 : "1px solid var(--uai-border)",
        borderRadius: compact ? 12 : 14,
        outlineOffset: 2,
        background: "var(--uai-surface)",
        ...style,
      }}
    >
      <table
        aria-labelledby={`${context.id}-title`}
        style={{
          width: "100%",
          minWidth: 520,
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: compact ? 12.5 : 13,
          lineHeight: "18px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </table>
    </section>
  );
}

export function ComparisonTableHead({ children, ...props }: ComponentProps<"thead">) {
  useTable("ComparisonTableHead");
  return (
    <thead {...props}>
      <tr>{children}</tr>
    </thead>
  );
}

function cellPadding(variant: ComparisonTableVariant) {
  return variant === "compact" ? "7px 12px" : "11px 16px";
}

export function ComparisonTableCorner({ style, ...props }: ComponentProps<"th">) {
  const context = useTable("ComparisonTableCorner");
  return (
    <th
      scope="col"
      {...props}
      style={{
        position: "sticky",
        left: 0,
        top: 0,
        zIndex: 2,
        padding: cellPadding(context.variant),
        borderBottom: "1px solid var(--uai-border)",
        background: "var(--uai-surface)",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 500,
        textAlign: "left",
        verticalAlign: "bottom",
        ...style,
      }}
    />
  );
}

export function ComparisonTableColumn({
  recommended = false,
  recommendedLabel = "Recommended",
  children,
  style,
  ...props
}: ComponentProps<"th"> & { recommended?: boolean; recommendedLabel?: string }) {
  const context = useTable("ComparisonTableColumn");
  return (
    <th
      scope="col"
      {...props}
      data-recommended={recommended || undefined}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        padding: cellPadding(context.variant),
        borderBottom: "1px solid var(--uai-border)",
        background: recommended
          ? "color-mix(in oklab, var(--uai-accent) 7%, var(--uai-surface))"
          : "var(--uai-surface)",
        boxShadow: recommended ? "inset 0 2px 0 var(--uai-accent)" : undefined,
        fontSize: context.variant === "compact" ? 12.5 : 13,
        fontWeight: 500,
        textAlign: "left",
        verticalAlign: "bottom",
        ...style,
      }}
    >
      {recommended ? (
        <span
          style={{
            display: "block",
            width: "fit-content",
            marginBottom: 6,
            padding: "1px 8px",
            borderRadius: 999,
            background: "color-mix(in oklab, var(--uai-accent) 16%, transparent)",
            color: "var(--uai-accent)",
            fontSize: 11,
            lineHeight: "16px",
            fontWeight: 500,
          }}
        >
          {recommendedLabel}
        </span>
      ) : null}
      {children}
    </th>
  );
}

export function ComparisonTableBody(props: ComponentProps<"tbody">) {
  useTable("ComparisonTableBody");
  return <tbody {...props} />;
}

export function ComparisonTableRow({
  different = false,
  style,
  className,
  ...props
}: ComponentProps<"tr"> & { different?: boolean }) {
  const context = useTable("ComparisonTableRow");
  const isMarked = context.highlight && different;
  return (
    <RowContext.Provider value={{ different }}>
      <tr
        {...props}
        data-different={different || undefined}
        className={[isMarked ? undefined : rowHover, className].filter(Boolean).join(" ")}
        style={{
          background: isMarked ? marked : undefined,
          color: context.highlight && !different ? "var(--uai-subtle)" : undefined,
          transition: "background-color 120ms ease-out, color 120ms ease-out",
          ...style,
        }}
      />
    </RowContext.Provider>
  );
}

export function ComparisonTableRowHeader({
  children,
  style,
  className,
  ...props
}: ComponentProps<"th">) {
  const context = useTable("ComparisonTableRowHeader");
  const row = useRow("ComparisonTableRowHeader");
  const isMarked = context.highlight && row.different;
  return (
    <th
      scope="row"
      {...props}
      className={[cellRule, isMarked ? undefined : headerHover, className]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "sticky",
        left: 0,
        zIndex: 1,
        minWidth: 140,
        padding: cellPadding(context.variant),
        boxShadow: isMarked ? "inset 2px 0 0 var(--uai-accent)" : undefined,
        background: isMarked ? marked : undefined,
        color: context.highlight && !row.different ? undefined : "var(--uai-muted)",
        fontWeight: 500,
        textAlign: "left",
        transition: "background-color 120ms ease-out",
        ...style,
      }}
    >
      {children}
      {isMarked ? (
        <span
          style={{
            display: "inline-block",
            marginLeft: 8,
            padding: "0 6px",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--uai-accent) 16%, transparent)",
            color: "var(--uai-accent)",
            fontSize: 11,
            lineHeight: "16px",
            fontWeight: 500,
            verticalAlign: "1px",
          }}
        >
          Differs
        </span>
      ) : null}
    </th>
  );
}

export function ComparisonTableCell({ style, className, ...props }: ComponentProps<"td">) {
  const context = useTable("ComparisonTableCell");
  return (
    <td
      {...props}
      className={[cellRule, className].filter(Boolean).join(" ")}
      style={{
        padding: cellPadding(context.variant),
        fontWeight: 500,
        verticalAlign: "top",
        ...style,
      }}
    />
  );
}

export function ComparisonTableCheck({
  value,
  includedLabel = "Included",
  excludedLabel = "Not included",
  ...props
}: ComponentProps<"span"> & { value: boolean; includedLabel?: string; excludedLabel?: string }) {
  const Icon = value ? Check : Minus;
  return (
    <span
      {...props}
      data-value={value}
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: 20,
        height: 20,
        borderRadius: 999,
        background: value ? "color-mix(in oklab, var(--uai-success) 14%, transparent)" : undefined,
        color: value ? "var(--uai-success)" : "var(--uai-subtle)",
        ...props.style,
      }}
    >
      <Icon size={value ? 13 : 14} strokeWidth={value ? 2.25 : 1.75} aria-hidden="true" />
      <span style={srOnly}>{value ? includedLabel : excludedLabel}</span>
    </span>
  );
}
