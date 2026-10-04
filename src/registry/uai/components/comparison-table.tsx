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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/uai-utils";

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

const marked =
  "bg-[color-mix(in_oklab,var(--primary)_9%,var(--card))] hover:bg-[color-mix(in_oklab,var(--primary)_9%,var(--card))]";
// Rows tint on hover; the sticky row header follows so the tint spans the full row.
const rowHover = "hover:bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))]";
const headerHover = "bg-card [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))]";
// Hairlines between rows only; the last row sits on the container edge.
const cellRule = "border-b [tr:last-child>&]:border-b-0";
const badge = "bg-primary/16 text-[11px]/4 font-medium text-primary";
// Uai cells size from padding and wrap; the shadcn cells are fixed-height and nowrap.
const cellReset = "h-auto whitespace-normal";

function cellPadding(variant: ComparisonTableVariant) {
  return variant === "compact" ? "px-3 py-1.75" : "px-4 py-2.75";
}

export function ComparisonTable({
  variant = "bordered",
  highlightDifferences,
  defaultHighlightDifferences = false,
  onHighlightDifferencesChange,
  className,
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
        data-slot="comparison-table"
        data-variant={variant}
        data-highlight-differences={highlight || undefined}
        className={cn("grid min-w-0 gap-3 text-[13px]/[18px] text-foreground", className)}
        {...props}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function ComparisonTableHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="comparison-table-header"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

export function ComparisonTableTitle({ className, ...props }: ComponentProps<"h3">) {
  const context = useTable("ComparisonTableTitle");
  return (
    <h3
      data-slot="comparison-table-title"
      className={cn("m-0 text-sm/5 font-semibold tracking-[-0.01em]", className)}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function ComparisonTableDifferencesToggle({
  children = "Highlight differences",
  className,
  id,
  ...props
}: Omit<
  ComponentProps<typeof Checkbox>,
  "checked" | "defaultChecked" | "onCheckedChange" | "asChild"
>) {
  const context = useTable("ComparisonTableDifferencesToggle");
  const checkboxId = id ?? `${context.id}-differences`;
  return (
    <Label
      htmlFor={checkboxId}
      data-slot="comparison-table-differences-toggle"
      className={cn(
        "inline-flex min-h-7 cursor-pointer items-center gap-2 text-[12.5px] leading-[18px] font-medium text-muted-foreground select-auto",
        className,
      )}
    >
      <Checkbox
        {...props}
        id={checkboxId}
        checked={context.highlight}
        onCheckedChange={(checked) => context.setHighlight(checked === true)}
        className="m-0 size-3.5 shadow-none [&_svg]:size-3"
      />
      {children}
    </Label>
  );
}

export function ComparisonTableContent({
  className,
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
      data-slot="comparison-table-content"
      className={cn(
        // The focusable section scrolls, so the shadcn table container must not become a second scroller.
        "max-w-full overflow-x-auto bg-card outline-offset-2 *:data-[slot=table-container]:overflow-visible",
        context.variant === "plain" ? "border-0" : "border",
        compact ? "rounded-xl" : "rounded-[14px]",
        className,
      )}
      {...props}
    >
      <Table
        aria-labelledby={`${context.id}-title`}
        className={cn(
          "w-full min-w-[520px] border-separate border-spacing-0 tabular-nums",
          compact ? "text-[12.5px]/[18px]" : "text-[13px]/[18px]",
        )}
      >
        {children}
      </Table>
    </section>
  );
}

export function ComparisonTableHead({ children, ...props }: ComponentProps<"thead">) {
  useTable("ComparisonTableHead");
  return (
    <TableHeader data-slot="comparison-table-head" {...props}>
      <TableRow className="border-0 hover:bg-transparent">{children}</TableRow>
    </TableHeader>
  );
}

export function ComparisonTableCorner({ className, ...props }: ComponentProps<"th">) {
  const context = useTable("ComparisonTableCorner");
  return (
    <TableHead
      scope="col"
      data-slot="comparison-table-corner"
      className={cn(
        "sticky top-0 left-0 z-2 border-b bg-card text-left align-bottom text-[12px] font-medium text-subtle-foreground",
        cellReset,
        cellPadding(context.variant),
        className,
      )}
      {...props}
    />
  );
}

export function ComparisonTableColumn({
  recommended = false,
  recommendedLabel = "Recommended",
  children,
  className,
  ...props
}: ComponentProps<"th"> & { recommended?: boolean; recommendedLabel?: string }) {
  const context = useTable("ComparisonTableColumn");
  return (
    <TableHead
      scope="col"
      data-slot="comparison-table-column"
      data-recommended={recommended || undefined}
      className={cn(
        "sticky top-0 z-1 border-b text-left align-bottom font-medium",
        cellReset,
        cellPadding(context.variant),
        context.variant === "compact" ? "text-[12.5px]" : "text-[13px]",
        recommended
          ? "bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))] shadow-[inset_0_2px_0_var(--primary)]"
          : "bg-card",
        className,
      )}
      {...props}
    >
      {recommended ? (
        <span className={cn("mb-1.5 block w-fit rounded-full px-2 py-px", badge)}>
          {recommendedLabel}
        </span>
      ) : null}
      {children}
    </TableHead>
  );
}

export function ComparisonTableBody(props: ComponentProps<"tbody">) {
  useTable("ComparisonTableBody");
  return <TableBody data-slot="comparison-table-body" {...props} />;
}

export function ComparisonTableRow({
  different = false,
  className,
  ...props
}: ComponentProps<"tr"> & { different?: boolean }) {
  const context = useTable("ComparisonTableRow");
  const isMarked = context.highlight && different;
  return (
    <RowContext.Provider value={{ different }}>
      <TableRow
        data-slot="comparison-table-row"
        data-different={different || undefined}
        className={cn(
          "border-0 [transition:background-color_120ms_ease-out,color_120ms_ease-out] motion-reduce:transition-none",
          isMarked ? marked : rowHover,
          context.highlight && !different && "text-subtle-foreground",
          className,
        )}
        {...props}
      />
    </RowContext.Provider>
  );
}

export function ComparisonTableRowHeader({ children, className, ...props }: ComponentProps<"th">) {
  const context = useTable("ComparisonTableRowHeader");
  const row = useRow("ComparisonTableRowHeader");
  const isMarked = context.highlight && row.different;
  return (
    <TableHead
      scope="row"
      data-slot="comparison-table-row-header"
      className={cn(
        "sticky left-0 z-1 min-w-[140px] text-left font-medium [transition:background-color_120ms_ease-out] motion-reduce:transition-none",
        cellReset,
        cellPadding(context.variant),
        cellRule,
        isMarked ? cn(marked, "shadow-[inset_2px_0_0_var(--primary)]") : headerHover,
        // Unchanged rows dim as a whole, so the row header inherits the row color.
        context.highlight && !row.different ? "text-inherit" : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {isMarked ? (
        <span className={cn("ml-2 inline-block rounded-md px-1.5 align-[1px]", badge)}>
          Differs
        </span>
      ) : null}
    </TableHead>
  );
}

export function ComparisonTableCell({ className, ...props }: ComponentProps<"td">) {
  const context = useTable("ComparisonTableCell");
  return (
    <TableCell
      data-slot="comparison-table-cell"
      className={cn(
        "align-top font-medium",
        cellReset,
        cellPadding(context.variant),
        cellRule,
        className,
      )}
      {...props}
    />
  );
}

export function ComparisonTableCheck({
  value,
  includedLabel = "Included",
  excludedLabel = "Not included",
  className,
  ...props
}: ComponentProps<"span"> & { value: boolean; includedLabel?: string; excludedLabel?: string }) {
  const Icon = value ? Check : Minus;
  return (
    <span
      data-slot="comparison-table-check"
      data-value={value}
      className={cn(
        "inline-grid size-5 place-items-center rounded-full",
        value ? "bg-success/14 text-success" : "text-subtle-foreground",
        className,
      )}
      {...props}
    >
      <Icon size={value ? 13 : 14} strokeWidth={value ? 2.25 : 1.75} aria-hidden="true" />
      <span className="sr-only">{value ? includedLabel : excludedLabel}</span>
    </span>
  );
}
