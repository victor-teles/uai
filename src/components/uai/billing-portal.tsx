"use client";

import { type ComponentProps, createContext, useContext, useId } from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionList,
  type DescriptionListProps,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import { ProgressSummary, type ProgressSummaryProps } from "@/components/ui/uai/progress-summary";
import {
  StatusBanner,
  type StatusBannerProps,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";

export const BILLING_PORTAL_VARIANTS = ["overview", "stacked", "compact"] as const;
export type BillingPortalVariant = (typeof BILLING_PORTAL_VARIANTS)[number];
export type BillingPortalProps = ComponentProps<"section"> & { variant?: BillingPortalVariant };

type PortalContext = { id: string; variant: BillingPortalVariant };
const Context = createContext<PortalContext | null>(null);
function usePortal(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within BillingPortal`);
  return context;
}
const SectionContext = createContext<string | null>(null);

const bannerVariants: Record<BillingPortalVariant, StatusBannerVariant> = {
  overview: "card",
  stacked: "tinted",
  compact: "tinted",
};
const detailVariants: Record<BillingPortalVariant, DescriptionListVariant> = {
  overview: "inline",
  stacked: "inline",
  compact: "stacked",
};
const dialogVariants: Record<BillingPortalVariant, ConfirmationDialogVariant> = {
  overview: "centered",
  stacked: "centered",
  compact: "compact",
};

const interactionCss = `
[data-uai-billing-button],[data-uai-billing-invoice]{transition:background-color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-billing-button="primary"]{background:var(--uai-accent);color:var(--uai-accent-foreground)}
[data-uai-billing-button="secondary"]{background:var(--uai-surface-raised);color:var(--uai-text)}
[data-uai-billing-button="primary"]:hover:not(:disabled){filter:brightness(1.08)}
[data-uai-billing-button="secondary"]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
[data-uai-billing-button]:active:not(:disabled){transform:scale(0.97)}
[data-uai-billing-button]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
[data-uai-billing-invoice]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 55%,transparent)}
[data-uai-billing-invoice]>td{border-bottom:1px solid var(--uai-border)}
[data-uai-billing-invoice]:last-child>td{border-bottom-color:transparent}
[data-uai-billing-invoice]>td:first-child{border-top-left-radius:8px;border-bottom-left-radius:8px}
[data-uai-billing-invoice]>td:last-child{border-top-right-radius:8px;border-bottom-right-radius:8px}
@media (prefers-reduced-motion: reduce){[data-uai-billing-button],[data-uai-billing-invoice]{transition:none}[data-uai-billing-button]:active:not(:disabled){transform:none}}`;

export function BillingPortal({
  variant = "overview",
  children,
  style,
  ...props
}: BillingPortalProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          alignContent: "start",
          gap: variant === "compact" ? 10 : 16,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{interactionCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function BillingPortalHeader({ style, ...props }: ComponentProps<"div">) {
  usePortal("BillingPortalHeader");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function BillingPortalHeading({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 4, flex: "1 1 240px", minWidth: 0, ...style }} />
  );
}

export function BillingPortalTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = usePortal("BillingPortalTitle");
  const compact = context.variant === "compact";
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: compact ? 15 : 18,
        lineHeight: compact ? "20px" : "24px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

export function BillingPortalDescription({ style, ...props }: ComponentProps<"p">) {
  return <p {...props} style={{ margin: 0, color: "var(--uai-muted)", ...style }} />;
}

export function BillingPortalActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, ...style }}
    />
  );
}

export function BillingPortalButton({
  emphasis = "secondary",
  type = "button",
  style,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = usePortal("BillingPortalButton");
  const compact = context.variant === "compact";
  return (
    <button
      {...props}
      type={type}
      data-uai-billing-button={emphasis}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: compact ? 26 : 30,
        padding: compact ? "0 10px" : "0 13px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: compact ? 12 : 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

/** Account-level billing notice, such as a failed payment. Compose Status Banner parts inside it. */
export function BillingPortalAlert(props: Omit<StatusBannerProps, "variant">) {
  const context = usePortal("BillingPortalAlert");
  return <StatusBanner {...props} variant={bannerVariants[context.variant]} />;
}

/** Section layout. Overview tiles sections side by side; Stacked keeps one column. */
export function BillingPortalGrid({ style, ...props }: ComponentProps<"div">) {
  const { variant } = usePortal("BillingPortalGrid");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns:
          variant === "stacked"
            ? "minmax(0, 1fr)"
            : `repeat(auto-fit, minmax(min(100%, ${variant === "compact" ? 240 : 320}px), 1fr))`,
        gap: variant === "compact" ? 8 : 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** A billing card. Set `span` to let a section such as invoices fill the whole row. */
export function BillingPortalSection({
  span = false,
  style,
  ...props
}: ComponentProps<"section"> & { span?: boolean }) {
  const { variant } = usePortal("BillingPortalSection");
  const id = useId();
  const compact = variant === "compact";
  return (
    <SectionContext.Provider value={id}>
      <section
        aria-labelledby={id}
        {...props}
        style={{
          display: "grid",
          alignContent: "start",
          gap: compact ? 10 : 14,
          gridColumn: span ? "1 / -1" : undefined,
          minWidth: 0,
          padding: compact ? 12 : "16px 18px 18px",
          border: "1px solid var(--uai-border)",
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </SectionContext.Provider>
  );
}

export function BillingPortalSectionHeader({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function BillingPortalSectionTitle({ style, ...props }: ComponentProps<"h3">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("BillingPortalSectionTitle must be used within BillingPortalSection");
  return (
    <h3
      {...props}
      id={id}
      style={{ margin: 0, fontSize: 13, lineHeight: "18px", fontWeight: 500, ...style }}
    />
  );
}

export function BillingPortalSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12.5, lineHeight: "18px", ...style }}
    />
  );
}

export function BillingPortalSectionFooter({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        paddingTop: 4,
        ...style,
      }}
    />
  );
}

/** The plan price. Put the billing period in a nested span. */
export function BillingPortalPrice({ style, ...props }: ComponentProps<"p">) {
  const { variant } = usePortal("BillingPortalPrice");
  return (
    <p
      {...props}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        margin: 0,
        fontSize: variant === "compact" ? 20 : 26,
        lineHeight: variant === "compact" ? "26px" : "32px",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** A usage meter without its own card chrome. Compose Progress Summary parts inside it. */
export function BillingPortalUsage(props: Omit<ProgressSummaryProps, "variant">) {
  usePortal("BillingPortalUsage");
  return <ProgressSummary {...props} variant="inline" />;
}

/** Payment method or billing contact facts. Compose Description List parts inside it. */
export function BillingPortalDetails(props: Omit<DescriptionListProps, "variant">) {
  const context = usePortal("BillingPortalDetails");
  return <DescriptionList {...props} variant={detailVariants[context.variant]} />;
}

/** Invoice history. Scrolls horizontally on narrow screens instead of squeezing columns. */
export function BillingPortalInvoices({ children, style, ...props }: ComponentProps<"table">) {
  usePortal("BillingPortalInvoices");
  return (
    <div
      style={{ minWidth: 0, margin: "0 -8px", overflowX: "auto", overscrollBehaviorX: "contain" }}
    >
      <table
        {...props}
        style={{
          width: "100%",
          minWidth: 440,
          borderCollapse: "collapse",
          fontVariantNumeric: "tabular-nums",
          ...style,
        }}
      >
        {children}
      </table>
    </div>
  );
}

export function BillingPortalInvoicesHeader({ children, ...props }: ComponentProps<"thead">) {
  return (
    <thead {...props}>
      <tr>{children}</tr>
    </thead>
  );
}

export function BillingPortalInvoicesColumn({
  align = "start",
  style,
  ...props
}: Omit<ComponentProps<"th">, "align"> & { align?: "start" | "end" }) {
  return (
    <th
      scope="col"
      {...props}
      style={{
        padding: "0 10px 8px",
        borderBottom: "1px solid var(--uai-border)",
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 500,
        textAlign: align,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

export function BillingPortalInvoicesBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function BillingPortalInvoice(props: ComponentProps<"tr">) {
  return <tr {...props} data-uai-billing-invoice="" />;
}

export function BillingPortalInvoiceCell({
  align = "start",
  style,
  ...props
}: Omit<ComponentProps<"td">, "align"> & { align?: "start" | "end" }) {
  const { variant } = usePortal("BillingPortalInvoiceCell");
  return (
    <td
      {...props}
      style={{
        padding: variant === "compact" ? "7px 10px" : "10px 10px",
        textAlign: align,
        whiteSpace: "nowrap",
        ...style,
      }}
    />
  );
}

/** Cancellation confirmation. Compose Confirmation Dialog parts inside it. */
export function BillingPortalCancel(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = usePortal("BillingPortalCancel");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}
