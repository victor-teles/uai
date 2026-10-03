"use client";

import { useState } from "react";
import {
  BillingPortal,
  BillingPortalAlert,
  BillingPortalButton,
  BillingPortalCancel,
  BillingPortalDescription,
  BillingPortalDetails,
  BillingPortalGrid,
  BillingPortalHeader,
  BillingPortalHeading,
  BillingPortalInvoice,
  BillingPortalInvoiceCell,
  BillingPortalInvoices,
  BillingPortalInvoicesBody,
  BillingPortalInvoicesColumn,
  BillingPortalInvoicesHeader,
  BillingPortalPrice,
  BillingPortalSection,
  BillingPortalSectionDescription,
  BillingPortalSectionFooter,
  BillingPortalSectionHeader,
  BillingPortalSectionTitle,
  BillingPortalTitle,
  BillingPortalUsage,
  type BillingPortalVariant,
} from "@/components/uai/billing-portal";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryStatusText,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";

const invoices = [
  { id: "INV-2026-009", date: "Sep 14, 2026", amount: "$48.00", status: "Failed" },
  { id: "INV-2026-008", date: "Aug 14, 2026", amount: "$48.00", status: "Paid" },
  { id: "INV-2026-007", date: "Jul 14, 2026", amount: "$48.00", status: "Paid" },
];

export function BillingPortalPreview({ variant = "overview" }: { variant?: BillingPortalVariant }) {
  const [alertOpen, setAlertOpen] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  return (
    <BillingPortal variant={variant}>
      <BillingPortalHeader>
        <BillingPortalHeading>
          <BillingPortalTitle>Billing</BillingPortalTitle>
          <BillingPortalDescription>
            Manage the Northwind Goods subscription, payment method, and invoices.
          </BillingPortalDescription>
        </BillingPortalHeading>
      </BillingPortalHeader>
      <BillingPortalAlert tone="warning" open={alertOpen} onOpenChange={setAlertOpen}>
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Your September payment failed</StatusBannerTitle>
          <StatusBannerDescription>
            We’ll retry on October 2. Update the card to avoid losing access.
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction onClick={() => setAlertOpen(false)}>Update card</StatusBannerAction>
        </StatusBannerActions>
      </BillingPortalAlert>
      <BillingPortalGrid>
        <BillingPortalSection>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Growth plan</BillingPortalSectionTitle>
          </BillingPortalSectionHeader>
          <BillingPortalPrice>
            $48
            <span style={{ color: "var(--uai-subtle)", fontSize: 13, fontWeight: 400 }}>
              per month
            </span>
          </BillingPortalPrice>
          <BillingPortalSectionDescription>
            {cancelled
              ? "Cancelled. You keep access until October 14, 2026."
              : "Renews on October 14, 2026."}
          </BillingPortalSectionDescription>
          <BillingPortalUsage value={3210} max={5000}>
            <ProgressSummaryHeader>
              <ProgressSummaryTitle>Orders this cycle</ProgressSummaryTitle>
              <ProgressSummaryStatusText>3,210 of 5,000 included orders</ProgressSummaryStatusText>
            </ProgressSummaryHeader>
            <ProgressSummaryValue />
            <ProgressSummaryBar aria-valuetext="3,210 of 5,000 orders" />
          </BillingPortalUsage>
          <BillingPortalSectionFooter>
            <BillingPortalButton emphasis="primary">Change plan</BillingPortalButton>
            <BillingPortalCancel>
              <ConfirmationDialogTrigger disabled={cancelled}>
                {cancelled ? "Cancellation scheduled" : "Cancel subscription"}
              </ConfirmationDialogTrigger>
              <ConfirmationDialogContent>
                <ConfirmationDialogTitle>Cancel the Growth plan?</ConfirmationDialogTitle>
                <ConfirmationDialogDescription>
                  <p style={{ margin: 0 }}>On October 14, 2026, Northwind Goods will:</p>
                  <ConfirmationDialogImpact>
                    <li>Stop accepting new orders</li>
                    <li>Move to read-only access for 9 team members</li>
                    <li>Keep invoices available for download</li>
                  </ConfirmationDialogImpact>
                </ConfirmationDialogDescription>
                <ConfirmationDialogActions>
                  <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
                  <ConfirmationDialogConfirm onClick={() => setCancelled(true)}>
                    Cancel subscription
                  </ConfirmationDialogConfirm>
                </ConfirmationDialogActions>
              </ConfirmationDialogContent>
            </BillingPortalCancel>
          </BillingPortalSectionFooter>
        </BillingPortalSection>
        <BillingPortalSection>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Payment method</BillingPortalSectionTitle>
          </BillingPortalSectionHeader>
          <BillingPortalDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Card</DescriptionListTerm>
              <DescriptionListDetails>
                Visa ending 4421
                <DescriptionListAction aria-label="Update card">Update</DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Expires</DescriptionListTerm>
              <DescriptionListDetails>08 / 2028</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Billing email</DescriptionListTerm>
              <DescriptionListDetails>finance@northwind.example</DescriptionListDetails>
            </DescriptionListItem>
          </BillingPortalDetails>
        </BillingPortalSection>
        <BillingPortalSection span>
          <BillingPortalSectionHeader>
            <BillingPortalSectionTitle>Invoices</BillingPortalSectionTitle>
            <BillingPortalButton>Download all</BillingPortalButton>
          </BillingPortalSectionHeader>
          <BillingPortalInvoices aria-label="Invoices">
            <BillingPortalInvoicesHeader>
              <BillingPortalInvoicesColumn>Invoice</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn>Date</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn>Status</BillingPortalInvoicesColumn>
              <BillingPortalInvoicesColumn align="end">Amount</BillingPortalInvoicesColumn>
            </BillingPortalInvoicesHeader>
            <BillingPortalInvoicesBody>
              {invoices.map((invoice) => (
                <BillingPortalInvoice key={invoice.id}>
                  <BillingPortalInvoiceCell>
                    <a
                      href={`#${invoice.id}`}
                      style={{ color: "inherit", fontWeight: 500, textDecoration: "none" }}
                    >
                      {invoice.id}
                    </a>
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell style={{ color: "var(--uai-muted)" }}>
                    {invoice.date}
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0 8px",
                        borderRadius: 999,
                        background: `color-mix(in oklab, var(${
                          invoice.status === "Failed" ? "--uai-danger" : "--uai-success"
                        }) 14%, transparent)`,
                        color:
                          invoice.status === "Failed" ? "var(--uai-danger)" : "var(--uai-success)",
                        fontSize: 11.5,
                        lineHeight: "20px",
                        fontWeight: 500,
                      }}
                    >
                      {invoice.status}
                    </span>
                  </BillingPortalInvoiceCell>
                  <BillingPortalInvoiceCell align="end">{invoice.amount}</BillingPortalInvoiceCell>
                </BillingPortalInvoice>
              ))}
            </BillingPortalInvoicesBody>
          </BillingPortalInvoices>
        </BillingPortalSection>
      </BillingPortalGrid>
    </BillingPortal>
  );
}
