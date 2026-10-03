import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryTitle,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBannerContent,
  StatusBannerDismiss,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";
import {
  BILLING_PORTAL_VARIANTS,
  BillingPortal,
  BillingPortalAlert,
  BillingPortalCancel,
  BillingPortalDetails,
  BillingPortalGrid,
  BillingPortalInvoice,
  BillingPortalInvoiceCell,
  BillingPortalInvoices,
  BillingPortalInvoicesBody,
  BillingPortalInvoicesColumn,
  BillingPortalInvoicesHeader,
  BillingPortalPrice,
  BillingPortalSection,
  BillingPortalSectionTitle,
  BillingPortalTitle,
  BillingPortalUsage,
  type BillingPortalVariant,
} from "@/registry/uai/blocks/billing-portal";

function Fixture({ variant, onCancel }: { variant?: BillingPortalVariant; onCancel?: () => void }) {
  return (
    <BillingPortal variant={variant}>
      <BillingPortalTitle>Billing</BillingPortalTitle>
      <BillingPortalAlert tone="warning">
        <StatusBannerContent>
          <StatusBannerTitle>Your payment failed</StatusBannerTitle>
        </StatusBannerContent>
        <StatusBannerDismiss />
      </BillingPortalAlert>
      <BillingPortalGrid>
        <BillingPortalSection>
          <BillingPortalSectionTitle>Growth plan</BillingPortalSectionTitle>
          <BillingPortalPrice>$48</BillingPortalPrice>
          <BillingPortalUsage value={3210} max={5000}>
            <ProgressSummaryHeader>
              <ProgressSummaryTitle>Orders this cycle</ProgressSummaryTitle>
            </ProgressSummaryHeader>
            <ProgressSummaryBar aria-valuetext="3,210 of 5,000 orders" />
          </BillingPortalUsage>
          <BillingPortalCancel>
            <ConfirmationDialogTrigger>Cancel subscription</ConfirmationDialogTrigger>
            <ConfirmationDialogContent>
              <ConfirmationDialogTitle>Cancel the Growth plan?</ConfirmationDialogTitle>
              <ConfirmationDialogActions>
                <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
                <ConfirmationDialogConfirm onClick={onCancel}>Confirm</ConfirmationDialogConfirm>
              </ConfirmationDialogActions>
            </ConfirmationDialogContent>
          </BillingPortalCancel>
        </BillingPortalSection>
        <BillingPortalSection>
          <BillingPortalSectionTitle>Payment method</BillingPortalSectionTitle>
          <BillingPortalDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Card</DescriptionListTerm>
              <DescriptionListDetails>Visa ending 4421</DescriptionListDetails>
            </DescriptionListItem>
          </BillingPortalDetails>
        </BillingPortalSection>
        <BillingPortalSection span>
          <BillingPortalSectionTitle>Invoices</BillingPortalSectionTitle>
          <BillingPortalInvoices aria-label="Invoices">
            <BillingPortalInvoicesHeader>
              <BillingPortalInvoicesColumn>Invoice</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn align="end">Amount</BillingPortalInvoicesColumn>
            </BillingPortalInvoicesHeader>
            <BillingPortalInvoicesBody>
              <BillingPortalInvoice>
                <BillingPortalInvoiceCell>INV-2026-009</BillingPortalInvoiceCell>
                <BillingPortalInvoiceCell align="end">$48.00</BillingPortalInvoiceCell>
              </BillingPortalInvoice>
            </BillingPortalInvoicesBody>
          </BillingPortalInvoices>
        </BillingPortalSection>
      </BillingPortalGrid>
    </BillingPortal>
  );
}

test("exposes the alert, usage meter, details, and invoice table", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Billing" })).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("Your payment failed");
  const meter = screen.getByRole("progressbar", { name: "Orders this cycle" });
  expect(meter.getAttribute("aria-valuenow")).toBe("3210");
  expect(meter.getAttribute("aria-valuetext")).toBe("3,210 of 5,000 orders");
  expect(screen.getByText("Card").tagName).toBe("DT");
  const table = screen.getByRole("table", { name: "Invoices" });
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
    "Invoice",
    "Amount",
  ]);
  expect(table.parentElement?.className).toContain("overflow-x-auto");
  expect(screen.getByRole("region", { name: "Invoices" }).className).toContain("col-span-full");
});

test("dismisses the alert and confirms cancellation in a modal", async () => {
  const user = userEvent.setup();
  let cancelled = 0;
  render(<Fixture onCancel={() => cancelled++} />);
  await user.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(screen.queryByRole("alert")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Cancel subscription" }));
  expect(document.activeElement?.textContent).toBe("Keep plan");
  await user.click(screen.getByRole("button", { name: "Confirm" }));
  expect(cancelled).toBe(1);
});

test("maps variants and guards regions outside the portal", () => {
  const banner = { overview: "card", stacked: "tinted", compact: "tinted" };
  const details = { overview: "inline", stacked: "inline", compact: "stacked" };
  for (const variant of BILLING_PORTAL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("alert").getAttribute("data-variant")).toBe(banner[variant]);
    expect(view.container.querySelector("dl")?.getAttribute("data-variant")).toBe(details[variant]);
    view.unmount();
  }
  expect(() => render(<BillingPortalPrice>$48</BillingPortalPrice>)).toThrow(
    "BillingPortalPrice must be used within BillingPortal",
  );
  expect(() =>
    render(
      <BillingPortal>
        <BillingPortalSectionTitle>Plan</BillingPortalSectionTitle>
      </BillingPortal>,
    ),
  ).toThrow("BillingPortalSectionTitle must be used within BillingPortalSection");
});
