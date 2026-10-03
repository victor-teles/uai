"use client";

import { useState } from "react";
import {
  DataTableToolbar,
  DataTableToolbarBulkActions,
  DataTableToolbarButton,
  DataTableToolbarClearSelection,
  DataTableToolbarColumn,
  DataTableToolbarColumns,
  DataTableToolbarExport,
  DataTableToolbarGroup,
  DataTableToolbarSearch,
  DataTableToolbarSelectionCount,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";

const invoices = [
  { id: "INV-2041", customer: "Northwind Logistics", status: "Overdue", amount: "$4,820.00" },
  { id: "INV-2042", customer: "Lumen Studio", status: "Paid", amount: "$1,260.00" },
  { id: "INV-2043", customer: "Harbor & Pine", status: "Draft", amount: "$932.50" },
];

const statusTone: Record<string, string> = {
  Overdue: "var(--uai-danger)",
  Paid: "var(--uai-success)",
  Draft: "var(--uai-muted)",
};

export function DataTableToolbarPreview({
  variant = "toolbar",
}: {
  variant?: DataTableToolbarVariant;
}) {
  const [selected, setSelected] = useState<string[]>(["INV-2041", "INV-2043"]);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [columns, setColumns] = useState(["customer", "status", "amount"]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DataTableToolbar
        variant={variant}
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
      >
        <DataTableToolbarSearch label="Search invoices" placeholder="Search invoices…" />
        <DataTableToolbarGroup>
          <DataTableToolbarButton
            aria-pressed={overdueOnly}
            onClick={() => setOverdueOnly((current) => !current)}
          >
            Overdue only
          </DataTableToolbarButton>
          <DataTableToolbarColumns value={columns} onValueChange={setColumns}>
            <DataTableToolbarColumn value="customer">Customer</DataTableToolbarColumn>
            <DataTableToolbarColumn value="status">Status</DataTableToolbarColumn>
            <DataTableToolbarColumn value="amount">Amount</DataTableToolbarColumn>
            <DataTableToolbarColumn value="due">Due date</DataTableToolbarColumn>
          </DataTableToolbarColumns>
          <DataTableToolbarExport />
        </DataTableToolbarGroup>
        <DataTableToolbarBulkActions>
          <DataTableToolbarSelectionCount />
          <DataTableToolbarButton>Send reminder</DataTableToolbarButton>
          <DataTableToolbarButton>Mark as paid</DataTableToolbarButton>
          <DataTableToolbarClearSelection />
        </DataTableToolbarBulkActions>
      </DataTableToolbar>
      <fieldset style={{ display: "grid", gap: 2, margin: 0, padding: 0, border: 0, fontSize: 13 }}>
        <legend style={{ marginBottom: 6, color: "var(--uai-subtle)", fontSize: 11.5 }}>
          Select invoices
        </legend>
        {invoices.map((invoice) => {
          const checked = selected.includes(invoice.id);
          return (
            <label
              key={invoice.id}
              style={{
                display: "grid",
                gridTemplateColumns: "16px 76px minmax(0, 1fr) auto 88px",
                gap: 12,
                alignItems: "center",
                minHeight: 36,
                padding: "0 10px",
                borderRadius: 8,
                background: checked
                  ? "color-mix(in oklab, var(--uai-accent) 8%, transparent)"
                  : "transparent",
                transition: "background-color 120ms ease-out",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, invoice.id]
                      : current.filter((id) => id !== invoice.id),
                  )
                }
                style={{ width: 14, height: 14, margin: 0, accentColor: "var(--uai-accent)" }}
              />
              <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>{invoice.id}</span>
              <span style={{ fontWeight: 500 }}>{invoice.customer}</span>
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 999,
                  background: `color-mix(in oklab, ${statusTone[invoice.status]} 14%, transparent)`,
                  color: statusTone[invoice.status],
                  fontSize: 11.5,
                  fontWeight: 500,
                }}
              >
                {invoice.status}
              </span>
              <span
                style={{ textAlign: "right", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
              >
                {invoice.amount}
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
