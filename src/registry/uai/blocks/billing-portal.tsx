"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const billingPortalVariants = cva("grid min-w-0 content-start text-[13px]/[18px] text-foreground", {
  variants: { variant: { overview: "gap-4", stacked: "gap-4", compact: "gap-2.5" } },
});

export function BillingPortal({
  variant = "overview",
  children,
  className,
  ...props
}: BillingPortalProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="billing-portal"
        className={cn(billingPortalVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function BillingPortalHeader({ className, ...props }: ComponentProps<"div">) {
  usePortal("BillingPortalHeader");
  return (
    <div
      data-slot="billing-portal-header"
      className={cn("flex min-w-0 flex-wrap items-end justify-between gap-3", className)}
      {...props}
    />
  );
}

export function BillingPortalHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="billing-portal-heading"
      className={cn("grid min-w-0 flex-[1_1_240px] gap-1", className)}
      {...props}
    />
  );
}

export function BillingPortalTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = usePortal("BillingPortalTitle");
  return (
    <h2
      data-slot="billing-portal-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.01em]",
        context.variant === "compact" ? "text-[15px]/5" : "text-lg/6",
        className,
      )}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

export function BillingPortalDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="billing-portal-description"
      className={cn("m-0 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function BillingPortalActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="billing-portal-actions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

const billingPortalButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 font-medium whitespace-nowrap [transition:background-color_120ms_ease-out,filter_120ms_ease-out,transform_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:[transform:scale(0.97)] motion-reduce:transition-none motion-reduce:enabled:active:[transform:none]",
  {
    variants: {
      emphasis: {
        primary: "bg-primary text-primary-foreground enabled:hover:brightness-108",
        secondary:
          "bg-secondary text-secondary-foreground enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
      },
      compact: {
        true: "h-[26px] px-2.5 text-[12px]",
        false: "h-[30px] px-[13px] text-[12.5px]",
      },
    },
  },
);

export function BillingPortalButton({
  emphasis = "secondary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { emphasis?: "primary" | "secondary" }) {
  const context = usePortal("BillingPortalButton");
  return (
    <button
      data-slot="billing-portal-button"
      className={cn(
        billingPortalButtonVariants({ emphasis, compact: context.variant === "compact" }),
        className,
      )}
      {...props}
      type={type}
      data-emphasis={emphasis}
    />
  );
}

/** Account-level billing notice, such as a failed payment. Compose Status Banner parts inside it. */
export function BillingPortalAlert(props: Omit<StatusBannerProps, "variant">) {
  const context = usePortal("BillingPortalAlert");
  return <StatusBanner {...props} variant={bannerVariants[context.variant]} />;
}

const billingPortalGridVariants = cva("grid min-w-0", {
  variants: {
    variant: {
      overview: "grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3",
      stacked: "grid-cols-[minmax(0,1fr)] gap-3",
      compact: "grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-2",
    },
  },
});

/** Section layout. Overview tiles sections side by side; Stacked keeps one column. */
export function BillingPortalGrid({ className, ...props }: ComponentProps<"div">) {
  const { variant } = usePortal("BillingPortalGrid");
  return (
    <div
      data-slot="billing-portal-grid"
      className={cn(billingPortalGridVariants({ variant }), className)}
      {...props}
    />
  );
}

/** A billing card. Set `span` to let a section such as invoices fill the whole row. */
export function BillingPortalSection({
  span = false,
  className,
  ...props
}: ComponentProps<"section"> & { span?: boolean }) {
  const { variant } = usePortal("BillingPortalSection");
  const id = useId();
  return (
    <SectionContext.Provider value={id}>
      <section
        aria-labelledby={id}
        data-slot="billing-portal-section"
        data-span={span || undefined}
        className={cn(
          "grid min-w-0 content-start border bg-card",
          variant === "compact"
            ? "gap-2.5 rounded-xl p-3"
            : "gap-3.5 rounded-[14px] px-[18px] pt-4 pb-[18px]",
          span && "col-span-full",
          className,
        )}
        {...props}
      />
    </SectionContext.Provider>
  );
}

export function BillingPortalSectionHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="billing-portal-section-header"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function BillingPortalSectionTitle({ className, ...props }: ComponentProps<"h3">) {
  const id = useContext(SectionContext);
  if (!id) throw new Error("BillingPortalSectionTitle must be used within BillingPortalSection");
  return (
    <h3
      data-slot="billing-portal-section-title"
      className={cn("m-0 text-[13px]/[18px] font-medium", className)}
      {...props}
      id={id}
    />
  );
}

export function BillingPortalSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="billing-portal-section-description"
      className={cn("m-0 text-[12.5px]/[18px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export function BillingPortalSectionFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="billing-portal-section-footer"
      className={cn("flex flex-wrap items-center gap-1.5 pt-1", className)}
      {...props}
    />
  );
}

/** The plan price. Put the billing period in a nested span. */
export function BillingPortalPrice({ className, ...props }: ComponentProps<"p">) {
  const { variant } = usePortal("BillingPortalPrice");
  return (
    <p
      data-slot="billing-portal-price"
      className={cn(
        "m-0 flex items-baseline gap-1.5 font-semibold tracking-[-0.02em] tabular-nums",
        variant === "compact" ? "text-xl/[26px]" : "text-[26px]/8",
        className,
      )}
      {...props}
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
export function BillingPortalInvoices({ children, className, ...props }: ComponentProps<"table">) {
  usePortal("BillingPortalInvoices");
  return (
    <div
      data-slot="billing-portal-invoices-scroller"
      className="-mx-2 min-w-0 overflow-x-auto overscroll-x-contain"
    >
      <table
        data-slot="billing-portal-invoices"
        className={cn("w-full min-w-[440px] border-collapse tabular-nums", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function BillingPortalInvoicesHeader({
  children,
  className,
  ...props
}: ComponentProps<"thead">) {
  return (
    <thead data-slot="billing-portal-invoices-header" className={cn(className)} {...props}>
      <tr>{children}</tr>
    </thead>
  );
}

export function BillingPortalInvoicesColumn({
  align = "start",
  className,
  ...props
}: Omit<ComponentProps<"th">, "align"> & { align?: "start" | "end" }) {
  return (
    <th
      scope="col"
      data-slot="billing-portal-invoices-column"
      className={cn(
        "border-b px-2.5 pt-0 pb-2 text-[12px] font-medium whitespace-nowrap text-subtle-foreground",
        align === "end" ? "text-end" : "text-start",
        className,
      )}
      {...props}
    />
  );
}

export function BillingPortalInvoicesBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="billing-portal-invoices-body" className={cn(className)} {...props} />;
}

export function BillingPortalInvoice({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="billing-portal-invoice"
      className={cn(
        "transition-[background-color] duration-120 ease-[ease-out] hover:bg-accent/55 motion-reduce:transition-none [&:last-child>td]:border-b-transparent [&>td]:border-b [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg",
        className,
      )}
      {...props}
    />
  );
}

export function BillingPortalInvoiceCell({
  align = "start",
  className,
  ...props
}: Omit<ComponentProps<"td">, "align"> & { align?: "start" | "end" }) {
  const { variant } = usePortal("BillingPortalInvoiceCell");
  return (
    <td
      data-slot="billing-portal-invoice-cell"
      className={cn(
        "px-2.5 whitespace-nowrap",
        variant === "compact" ? "py-[7px]" : "py-2.5",
        align === "end" ? "text-end" : "text-start",
        className,
      )}
      {...props}
    />
  );
}

/** Cancellation confirmation. Compose Confirmation Dialog parts inside it. */
export function BillingPortalCancel(props: Omit<ConfirmationDialogProps, "variant">) {
  const context = usePortal("BillingPortalCancel");
  return <ConfirmationDialog {...props} variant={dialogVariants[context.variant]} />;
}
