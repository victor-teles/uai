import {
  ChartColumn,
  Database,
  FileClock,
  FileInput,
  ListChecks,
  Siren,
  Telescope,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type OperationsBlocksItemId =
  | "resource-manager"
  | "data-explorer"
  | "import-workflow"
  | "approval-queue"
  | "audit-log-viewer"
  | "incident-dashboard"
  | "report-builder";

export const operationsBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "resource-manager",
    name: "Resource Manager",
    category: "Operations",
    icon: Database,
    description: "List, create, inspect, edit, archive, and delete domain records.",
    usage: `"use client";

import { useState } from "react";
import {
  ResourceManager,
  ResourceManagerAction,
  ResourceManagerActions,
  ResourceManagerBody,
  ResourceManagerDelete,
  ResourceManagerDescription,
  ResourceManagerDetails,
  ResourceManagerEmpty,
  ResourceManagerForm,
  ResourceManagerHeader,
  ResourceManagerHeading,
  ResourceManagerInspector,
  ResourceManagerInspectorHeader,
  ResourceManagerInspectorTitle,
  ResourceManagerList,
  ResourceManagerRecord,
  ResourceManagerRecordMeta,
  ResourceManagerRecordStatus,
  ResourceManagerRecordTitle,
  ResourceManagerTitle,
  ResourceManagerToolbar,
  type ResourceManagerVariant,
} from "@/components/uai/resource-manager";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DataTableToolbarButton,
  DataTableToolbarSearch,
} from "@/components/ui/uai/data-table-toolbar";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";

type Supplier = {
  id: string;
  name: string;
  owner: string;
  region: string;
  renewal: string;
  spend: string;
  archived: boolean;
};

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-1042",
    name: "Northwind Freight",
    owner: "Priya Raman",
    region: "Rotterdam, NL",
    renewal: "Jan 14, 2027",
    spend: "$184,200",
    archived: false,
  },
  {
    id: "SUP-1057",
    name: "Halden Packaging",
    owner: "Marcus Lee",
    region: "Gothenburg, SE",
    renewal: "Nov 2, 2026",
    spend: "$62,950",
    archived: false,
  },
  {
    id: "SUP-1063",
    name: "Cobre Components",
    owner: "Ana Duarte",
    region: "Monterrey, MX",
    renewal: "Mar 30, 2027",
    spend: "$97,410",
    archived: false,
  },
  {
    id: "SUP-0988",
    name: "Lindqvist Textiles",
    owner: "Priya Raman",
    region: "Tampere, FI",
    renewal: "Ended Aug 31, 2026",
    spend: "$0",
    archived: true,
  },
];

export function ResourceManagerPreview({
  variant = "split",
}: {
  variant?: ResourceManagerVariant;
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [selected, setSelected] = useState("SUP-1042");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", owner: "" });
  const query = search.trim().toLowerCase();
  const visible = suppliers.filter(
    (supplier) =>
      (showArchived || !supplier.archived) &&
      \`\${supplier.name} \${supplier.id}\`.toLowerCase().includes(query),
  );
  const current = suppliers.find((supplier) => supplier.id === selected);
  const update = (patch: Partial<Supplier>) =>
    setSuppliers((list) =>
      list.map((supplier) => (supplier.id === selected ? { ...supplier, ...patch } : supplier)),
    );
  const inspect = (id: string) => {
    setSelected(id);
    setEditing(false);
  };
  const create = () => {
    const id = \`SUP-\${1100 + suppliers.length}\`;
    const name = "New supplier";
    setSuppliers((list) => [
      { id, name, owner: "Unassigned", region: "—", renewal: "—", spend: "$0", archived: false },
      ...list,
    ]);
    setSelected(id);
    setDraft({ name, owner: "Unassigned" });
    setEditing(true);
  };

  return (
    <ResourceManager variant={variant} value={selected} onValueChange={inspect}>
      <ResourceManagerHeader>
        <ResourceManagerHeading>
          <ResourceManagerTitle>Suppliers</ResourceManagerTitle>
          <ResourceManagerDescription>
            {suppliers.filter((supplier) => !supplier.archived).length} active contracts ·
            Procurement EU
          </ResourceManagerDescription>
        </ResourceManagerHeading>
        <ResourceManagerActions>
          <ResourceManagerAction emphasis="primary" onClick={create}>
            New supplier
          </ResourceManagerAction>
        </ResourceManagerActions>
      </ResourceManagerHeader>
      <ResourceManagerToolbar search={search} onSearchChange={setSearch}>
        <DataTableToolbarSearch label="Search suppliers" placeholder="Search by name or ID…" />
        <DataTableToolbarButton
          aria-pressed={showArchived}
          onClick={() => setShowArchived((value) => !value)}
        >
          Show archived
        </DataTableToolbarButton>
      </ResourceManagerToolbar>
      <ResourceManagerBody>
        {visible.length ? (
          <ResourceManagerList aria-label="Suppliers">
            {visible.map((supplier) => (
              <ResourceManagerRecord key={supplier.id} value={supplier.id}>
                <ResourceManagerRecordTitle>{supplier.name}</ResourceManagerRecordTitle>
                <ResourceManagerRecordMeta>
                  {supplier.id} · {supplier.spend}
                </ResourceManagerRecordMeta>
                <ResourceManagerRecordStatus
                  tone={
                    supplier.archived
                      ? "neutral"
                      : supplier.renewal.startsWith("Nov")
                        ? "warning"
                        : "success"
                  }
                >
                  {supplier.archived
                    ? "Archived"
                    : supplier.renewal.startsWith("Nov")
                      ? "Renews soon"
                      : "Active"}
                </ResourceManagerRecordStatus>
              </ResourceManagerRecord>
            ))}
          </ResourceManagerList>
        ) : (
          <ResourceManagerEmpty style={{ flex: "999 1 320px" }}>
            <EmptyStateContent>
              <EmptyStateHeader>
                <EmptyStateTitle>No suppliers match “{search}”</EmptyStateTitle>
                <EmptyStateDescription>
                  Check the spelling or include archived suppliers.
                </EmptyStateDescription>
              </EmptyStateHeader>
            </EmptyStateContent>
          </ResourceManagerEmpty>
        )}
        {current ? (
          <ResourceManagerInspector>
            <ResourceManagerInspectorHeader>
              <ResourceManagerInspectorTitle>{current.name}</ResourceManagerInspectorTitle>
              {editing ? null : (
                <ResourceManagerActions>
                  <ResourceManagerAction
                    onClick={() => {
                      setDraft({ name: current.name, owner: current.owner });
                      setEditing(true);
                    }}
                  >
                    Edit
                  </ResourceManagerAction>
                  <ResourceManagerAction onClick={() => update({ archived: !current.archived })}>
                    {current.archived ? "Restore" : "Archive"}
                  </ResourceManagerAction>
                  <ResourceManagerDelete>
                    <ConfirmationDialogTrigger>Delete</ConfirmationDialogTrigger>
                    <ConfirmationDialogContent>
                      <ConfirmationDialogTitle>Delete {current.name}?</ConfirmationDialogTitle>
                      <ConfirmationDialogDescription>
                        <p style={{ margin: 0 }}>
                          Purchase orders keep their history, but the supplier record and its
                          contacts are removed.
                        </p>
                      </ConfirmationDialogDescription>
                      <ConfirmationDialogActions>
                        <ConfirmationDialogCancel>Keep supplier</ConfirmationDialogCancel>
                        <ConfirmationDialogConfirm
                          onClick={() => {
                            setSuppliers((list) => list.filter((item) => item.id !== current.id));
                            setSelected("");
                          }}
                        >
                          Delete supplier
                        </ConfirmationDialogConfirm>
                      </ConfirmationDialogActions>
                    </ConfirmationDialogContent>
                  </ResourceManagerDelete>
                </ResourceManagerActions>
              )}
            </ResourceManagerInspectorHeader>
            {editing ? (
              <ResourceManagerForm
                onSubmit={(event) => {
                  event.preventDefault();
                  update({ name: draft.name.trim() || current.name, owner: draft.owner });
                  setEditing(false);
                }}
              >
                <FormField
                  variant={variant === "compact" ? "compact" : "outlined"}
                  value={draft.name}
                  onValueChange={(name) => setDraft((value) => ({ ...value, name }))}
                  required
                >
                  <FormFieldLabel>Supplier name</FormFieldLabel>
                  <FormFieldInput name="name" />
                </FormField>
                <FormField
                  variant={variant === "compact" ? "compact" : "outlined"}
                  value={draft.owner}
                  onValueChange={(owner) => setDraft((value) => ({ ...value, owner }))}
                >
                  <FormFieldLabel>Account owner</FormFieldLabel>
                  <FormFieldInput name="owner" />
                </FormField>
                <ResourceManagerActions>
                  <ResourceManagerAction type="submit" emphasis="primary">
                    Save changes
                  </ResourceManagerAction>
                  <ResourceManagerAction onClick={() => setEditing(false)}>
                    Cancel
                  </ResourceManagerAction>
                </ResourceManagerActions>
              </ResourceManagerForm>
            ) : (
              <ResourceManagerDetails>
                <DescriptionListItem>
                  <DescriptionListTerm>Supplier ID</DescriptionListTerm>
                  <DescriptionListDetails>{current.id}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Account owner</DescriptionListTerm>
                  <DescriptionListDetails>{current.owner}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Region</DescriptionListTerm>
                  <DescriptionListDetails>{current.region}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Contract renewal</DescriptionListTerm>
                  <DescriptionListDetails>{current.renewal}</DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Spend, last 12 months</DescriptionListTerm>
                  <DescriptionListDetails>{current.spend}</DescriptionListDetails>
                </DescriptionListItem>
              </ResourceManagerDetails>
            )}
          </ResourceManagerInspector>
        ) : null}
      </ResourceManagerBody>
    </ResourceManager>
  );
}
`,
    accessibility: [
      "The record list is a labelled list of buttons; the inspected record carries aria-current, and Arrow keys, Home, and End move between records.",
      "The inspector is a region labelled by the record title, and record facts use description list semantics.",
      "Deletion runs through a native modal alertdialog that traps focus, starts on Cancel, and returns focus to the trigger.",
      "Status pills pair text with color, so archived and active states never rely on color alone.",
    ],
  },
  {
    id: "data-explorer",
    name: "Data Explorer",
    category: "Operations",
    icon: Telescope,
    description: "Query surface, results, saved views, and export actions.",
    usage: `"use client";

import { useState } from "react";
import {
  DataExplorer,
  DataExplorerAction,
  DataExplorerActions,
  DataExplorerBody,
  DataExplorerCell,
  DataExplorerDescription,
  DataExplorerEmpty,
  DataExplorerHeader,
  DataExplorerHeaderCell,
  DataExplorerHeading,
  DataExplorerQuery,
  DataExplorerQueryInput,
  DataExplorerQueryLabel,
  DataExplorerResults,
  DataExplorerRun,
  DataExplorerStatus,
  DataExplorerTable,
  DataExplorerTableBody,
  DataExplorerTableHead,
  DataExplorerTableRow,
  DataExplorerTitle,
  DataExplorerToolbar,
  type DataExplorerVariant,
  DataExplorerViews,
} from "@/components/uai/data-explorer";
import {
  DataTableToolbarExport,
  DataTableToolbarGroup,
  DataTableToolbarSearch,
} from "@/components/ui/uai/data-table-toolbar";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
} from "@/components/ui/uai/page-tabs";

type Row = { account: string; plan: string; region: string; seats: number; mrr: string };

const views = {
  expansion: {
    label: "Expansion candidates",
    query:
      "select account, plan, region, seats, mrr\\nfrom accounts\\nwhere seat_utilization > 0.9\\norder by mrr desc",
    rows: [
      { account: "Halden Packaging", plan: "Business", region: "EU", seats: 64, mrr: "$4,480" },
      { account: "Fieldnote Labs", plan: "Team", region: "EU", seats: 48, mrr: "$2,880" },
      { account: "Orbit Dental", plan: "Team", region: "US", seats: 31, mrr: "$1,860" },
      { account: "Lumen Clinics", plan: "Team", region: "US", seats: 27, mrr: "$1,620" },
      { account: "Kestrel Studio", plan: "Starter", region: "APAC", seats: 12, mrr: "$540" },
    ],
  },
  churn: {
    label: "Churn risk",
    query:
      "select account, plan, region, seats, mrr\\nfrom accounts\\nwhere last_active < now() - interval '21 days'",
    rows: [{ account: "Pallet & Co", plan: "Business", region: "US", seats: 90, mrr: "$6,300" }],
  },
} satisfies Record<string, { label: string; query: string; rows: Row[] }>;
type ViewId = keyof typeof views;

const planTones: Record<string, string> = {
  Starter: "var(--uai-muted)",
  Team: "var(--uai-accent)",
  Business: "var(--uai-success)",
};

function PlanTag({ plan }: { plan: string }) {
  const tone = planTones[plan] ?? "var(--uai-muted)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        background: \`color-mix(in oklab, \${tone} 14%, transparent)\`,
        color: \`color-mix(in oklab, \${tone} 80%, var(--uai-text))\`,
        fontSize: 11.5,
        fontWeight: 500,
      }}
    >
      {plan}
    </span>
  );
}

export function DataExplorerPreview({ variant = "workbench" }: { variant?: DataExplorerVariant }) {
  const [view, setView] = useState<ViewId>("expansion");
  const [query, setQuery] = useState(views.expansion.query);
  const [rows, setRows] = useState<Row[]>(views.expansion.rows);
  const [search, setSearch] = useState("");
  const [exported, setExported] = useState(false);
  const visible = rows.filter((row) =>
    row.account.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const open = (next: string) => {
    const id = next as ViewId;
    setView(id);
    setQuery(views[id].query);
    setRows(views[id].rows);
    setSearch("");
    setExported(false);
  };

  return (
    <DataExplorer variant={variant}>
      <DataExplorerHeader>
        <DataExplorerHeading>
          <DataExplorerTitle>Accounts explorer</DataExplorerTitle>
          <DataExplorerDescription>
            Warehouse snapshot from 06:00 UTC today.
          </DataExplorerDescription>
        </DataExplorerHeading>
        <DataExplorerActions>
          <DataExplorerAction>Save view</DataExplorerAction>
        </DataExplorerActions>
      </DataExplorerHeader>
      <DataExplorerViews value={view} onValueChange={open}>
        <PageTabsBar>
          <PageTabsList aria-label="Saved views">
            {Object.entries(views).map(([id, saved]) => (
              <PageTabsTab key={id} value={id}>
                {saved.label} <PageTabsCount>{saved.rows.length}</PageTabsCount>
              </PageTabsTab>
            ))}
          </PageTabsList>
        </PageTabsBar>
        <PageTabsPanel value={view}>
          <DataExplorerBody>
            <DataExplorerQuery
              onSubmit={(event) => {
                event.preventDefault();
                setRows(query.trim() ? views[view].rows : []);
                setExported(false);
              }}
            >
              <DataExplorerQueryLabel>SQL</DataExplorerQueryLabel>
              <DataExplorerQueryInput
                name="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <DataExplorerRun />
            </DataExplorerQuery>
            <DataExplorerResults>
              <DataExplorerToolbar search={search} onSearchChange={setSearch}>
                <DataTableToolbarSearch label="Filter results" placeholder="Filter accounts…" />
                <DataTableToolbarGroup>
                  <DataTableToolbarExport disabled={!rows.length} onClick={() => setExported(true)}>
                    Export CSV
                  </DataTableToolbarExport>
                </DataTableToolbarGroup>
              </DataExplorerToolbar>
              {visible.length ? (
                <DataExplorerTable aria-label={\`\${views[view].label} results\`}>
                  <DataExplorerTableHead>
                    <tr>
                      <DataExplorerHeaderCell>Account</DataExplorerHeaderCell>
                      <DataExplorerHeaderCell>Plan</DataExplorerHeaderCell>
                      <DataExplorerHeaderCell>Region</DataExplorerHeaderCell>
                      <DataExplorerHeaderCell align="end">Seats</DataExplorerHeaderCell>
                      <DataExplorerHeaderCell align="end">MRR</DataExplorerHeaderCell>
                    </tr>
                  </DataExplorerTableHead>
                  <DataExplorerTableBody>
                    {visible.map((row) => (
                      <DataExplorerTableRow key={row.account}>
                        <DataExplorerCell>{row.account}</DataExplorerCell>
                        <DataExplorerCell>
                          <PlanTag plan={row.plan} />
                        </DataExplorerCell>
                        <DataExplorerCell>{row.region}</DataExplorerCell>
                        <DataExplorerCell align="end">{row.seats}</DataExplorerCell>
                        <DataExplorerCell align="end">{row.mrr}</DataExplorerCell>
                      </DataExplorerTableRow>
                    ))}
                  </DataExplorerTableBody>
                </DataExplorerTable>
              ) : (
                <DataExplorerEmpty>
                  <EmptyStateContent>
                    <EmptyStateHeader>
                      <EmptyStateTitle>No rows returned</EmptyStateTitle>
                      <EmptyStateDescription>
                        Write a query or clear the result filter, then run it again.
                      </EmptyStateDescription>
                    </EmptyStateHeader>
                  </EmptyStateContent>
                </DataExplorerEmpty>
              )}
              <DataExplorerStatus>
                {exported
                  ? \`Exported \${visible.length} rows to accounts.csv\`
                  : \`\${visible.length} of \${rows.length} rows · 38 ms\`}
              </DataExplorerStatus>
            </DataExplorerResults>
          </DataExplorerBody>
        </PageTabsPanel>
      </DataExplorerViews>
    </DataExplorer>
  );
}
`,
    accessibility: [
      "Saved views are APG tabs with arrow-key, Home, and End navigation and a labelled tab panel.",
      "The query editor is a labelled textarea in a named form; Run query is a native submit button.",
      "Results use a real table with column headers; the scroll container is a focusable named region so keyboard users can scroll wide results.",
      "Row counts and export confirmations are announced through a polite status region.",
    ],
  },
  {
    id: "import-workflow",
    name: "Import Workflow",
    category: "Operations",
    icon: FileInput,
    description: "File selection, column mapping, validation, preview, and completion.",
    usage: `"use client";

import { useEffect, useState } from "react";
import {
  ImportWorkflow,
  ImportWorkflowAction,
  ImportWorkflowBody,
  ImportWorkflowCell,
  ImportWorkflowDescription,
  ImportWorkflowFooter,
  ImportWorkflowHeader,
  ImportWorkflowHeaderCell,
  ImportWorkflowHeading,
  ImportWorkflowIssues,
  ImportWorkflowMapping,
  ImportWorkflowMappingRow,
  ImportWorkflowMappingSample,
  ImportWorkflowMappingSource,
  ImportWorkflowMappingTarget,
  ImportWorkflowPanel,
  ImportWorkflowPanelTitle,
  ImportWorkflowProgress,
  ImportWorkflowStep,
  ImportWorkflowSteps,
  ImportWorkflowTable,
  ImportWorkflowTableRow,
  ImportWorkflowTitle,
  ImportWorkflowUpload,
  type ImportWorkflowVariant,
} from "@/components/uai/import-workflow";
import {
  FileUploadDropzone,
  FileUploadInput,
  FileUploadItem,
  FileUploadList,
  FileUploadRemove,
  FileUploadTrigger,
} from "@/components/ui/uai/file-upload";
import {
  ProgressSummaryBar,
  ProgressSummaryHeader,
  ProgressSummaryStat,
  ProgressSummaryStatLabel,
  ProgressSummaryStats,
  ProgressSummaryStatusText,
  ProgressSummaryStatValue,
  ProgressSummaryTitle,
  ProgressSummaryValue,
} from "@/components/ui/uai/progress-summary";
import {
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";
import { StepIndicatorDescription, StepIndicatorTitle } from "@/components/ui/uai/step-indicator";

const steps = [
  { value: "file", title: "Choose file", description: "CSV up to 10 MB" },
  { value: "mapping", title: "Map columns", description: "Match CRM fields" },
  { value: "review", title: "Review", description: "Fix flagged rows" },
  { value: "import", title: "Import", description: "Write contacts" },
];
const columns = [
  { source: "email_address", sample: "ana@fieldnote.io", target: "email" },
  { source: "full_name", sample: "Ana Duarte", target: "name" },
  { source: "company", sample: "Fieldnote Labs", target: "account" },
  { source: "fax", sample: "+351 21 555 0100", target: "" },
];
const total = 2418;

export function ImportWorkflowPreview({ variant = "wizard" }: { variant?: ImportWorkflowVariant }) {
  const [step, setStep] = useState("file");
  const [file, setFile] = useState<string | null>("contacts-september.csv");
  const [mapping, setMapping] = useState(columns.map((column) => column.target));
  const [imported, setImported] = useState(0);
  const index = steps.findIndex((item) => item.value === step);
  const go = (offset: number) => setStep(steps[index + offset]?.value ?? "file");

  useEffect(() => {
    if (step !== "import") return;
    setImported(0);
    const timer = window.setInterval(() => {
      setImported((value) => Math.min(value + 403, total - 3));
    }, 400);
    return () => window.clearInterval(timer);
  }, [step]);
  const done = imported === total - 3;

  return (
    <ImportWorkflow variant={variant} value={step} onValueChange={setStep}>
      <ImportWorkflowHeader>
        <ImportWorkflowHeading>
          <ImportWorkflowTitle>Import contacts</ImportWorkflowTitle>
          <ImportWorkflowDescription>
            Add people to the Sales workspace from a spreadsheet export.
          </ImportWorkflowDescription>
        </ImportWorkflowHeading>
      </ImportWorkflowHeader>
      <ImportWorkflowBody>
        <ImportWorkflowSteps>
          {steps.map((item, position) => (
            <ImportWorkflowStep
              key={item.value}
              value={item.value}
              status={position < index ? "complete" : "upcoming"}
            >
              <StepIndicatorTitle>{item.title}</StepIndicatorTitle>
              {variant === "compact" ? null : (
                <StepIndicatorDescription>{item.description}</StepIndicatorDescription>
              )}
            </ImportWorkflowStep>
          ))}
        </ImportWorkflowSteps>
        <ImportWorkflowPanel value="file">
          <ImportWorkflowPanelTitle>Choose a CSV file</ImportWorkflowPanelTitle>
          <ImportWorkflowUpload
            accept=".csv"
            maxSize={10_000_000}
            maxFiles={1}
            multiple={false}
            fileCount={file ? 1 : 0}
            onFilesAccepted={(files) => setFile(files[0]?.name ?? null)}
          >
            <FileUploadDropzone>
              <span>Drop a .csv file here, or</span>
              <FileUploadTrigger>Choose file</FileUploadTrigger>
              <FileUploadInput />
            </FileUploadDropzone>
            {file ? (
              <FileUploadList>
                <FileUploadItem status="complete">
                  <strong>{file}</strong>
                  <FileUploadRemove onClick={() => setFile(null)} />
                </FileUploadItem>
              </FileUploadList>
            ) : null}
          </ImportWorkflowUpload>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="mapping">
          <ImportWorkflowPanelTitle>Map columns to contact fields</ImportWorkflowPanelTitle>
          <ImportWorkflowMapping>
            {columns.map((column, position) => (
              <ImportWorkflowMappingRow key={column.source}>
                <ImportWorkflowMappingSource>
                  {column.source}
                  <ImportWorkflowMappingSample>{column.sample}</ImportWorkflowMappingSample>
                </ImportWorkflowMappingSource>
                <ImportWorkflowMappingTarget
                  value={mapping[position]}
                  onChange={(event) =>
                    setMapping((current) =>
                      current.map((target, item) =>
                        item === position ? event.target.value : target,
                      ),
                    )
                  }
                >
                  <option value="">Skip this column</option>
                  <option value="email">Email</option>
                  <option value="name">Name</option>
                  <option value="account">Account</option>
                  <option value="phone">Phone</option>
                </ImportWorkflowMappingTarget>
              </ImportWorkflowMappingRow>
            ))}
          </ImportWorkflowMapping>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="review">
          <ImportWorkflowPanelTitle>Review before importing</ImportWorkflowPanelTitle>
          <ImportWorkflowIssues tone="warning">
            <StatusBannerIcon />
            <StatusBannerContent>
              <StatusBannerTitle>
                3 of {total.toLocaleString("en-US")} rows will be skipped
              </StatusBannerTitle>
              <StatusBannerDescription>
                Their email addresses are missing or malformed. Everything else is ready.
              </StatusBannerDescription>
            </StatusBannerContent>
          </ImportWorkflowIssues>
          <ImportWorkflowTable aria-label="First rows of contacts-september.csv">
            <thead>
              <tr>
                <ImportWorkflowHeaderCell>Email</ImportWorkflowHeaderCell>
                <ImportWorkflowHeaderCell>Name</ImportWorkflowHeaderCell>
                <ImportWorkflowHeaderCell>Account</ImportWorkflowHeaderCell>
              </tr>
            </thead>
            <tbody>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell>ana@fieldnote.io</ImportWorkflowCell>
                <ImportWorkflowCell>Ana Duarte</ImportWorkflowCell>
                <ImportWorkflowCell>Fieldnote Labs</ImportWorkflowCell>
              </ImportWorkflowTableRow>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell tone="error">
                  jonas.orbit-dental.com · Missing @
                </ImportWorkflowCell>
                <ImportWorkflowCell>Jonas Berg</ImportWorkflowCell>
                <ImportWorkflowCell>Orbit Dental</ImportWorkflowCell>
              </ImportWorkflowTableRow>
              <ImportWorkflowTableRow>
                <ImportWorkflowCell>mei@kestrel.studio</ImportWorkflowCell>
                <ImportWorkflowCell>Mei Tanaka</ImportWorkflowCell>
                <ImportWorkflowCell>Kestrel Studio</ImportWorkflowCell>
              </ImportWorkflowTableRow>
            </tbody>
          </ImportWorkflowTable>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="import">
          <ImportWorkflowPanelTitle>
            {done ? "Import complete" : "Importing contacts"}
          </ImportWorkflowPanelTitle>
          <ImportWorkflowProgress
            value={imported}
            max={total - 3}
            status={done ? "complete" : "running"}
          >
            <ProgressSummaryHeader>
              <ProgressSummaryTitle>contacts-september.csv</ProgressSummaryTitle>
              <ProgressSummaryStatusText />
            </ProgressSummaryHeader>
            <ProgressSummaryValue />
            <ProgressSummaryBar />
            <ProgressSummaryStats>
              <ProgressSummaryStat>
                <ProgressSummaryStatLabel>Imported</ProgressSummaryStatLabel>
                <ProgressSummaryStatValue>
                  {imported.toLocaleString("en-US")}
                </ProgressSummaryStatValue>
              </ProgressSummaryStat>
              <ProgressSummaryStat>
                <ProgressSummaryStatLabel>Skipped</ProgressSummaryStatLabel>
                <ProgressSummaryStatValue>3</ProgressSummaryStatValue>
              </ProgressSummaryStat>
            </ProgressSummaryStats>
          </ImportWorkflowProgress>
        </ImportWorkflowPanel>
      </ImportWorkflowBody>
      <ImportWorkflowFooter>
        {index > 0 && step !== "import" ? (
          <ImportWorkflowAction onClick={() => go(-1)}>Back</ImportWorkflowAction>
        ) : null}
        {step === "import" ? (
          <ImportWorkflowAction emphasis="primary" disabled={!done} onClick={() => go(-3)}>
            Import another file
          </ImportWorkflowAction>
        ) : (
          <ImportWorkflowAction emphasis="primary" disabled={!file} onClick={() => go(1)}>
            {step === "review" ? "Import 2,415 contacts" : "Continue"}
          </ImportWorkflowAction>
        )}
      </ImportWorkflowFooter>
    </ImportWorkflow>
  );
}
`,
    accessibility: [
      'Steps are an ordered list; the current step carries aria-current="step" and every step states its status in text.',
      "Each step renders as a section labelled by its heading, and only the current step is in the document.",
      "Every mapping select is labelled by its source column and sample value.",
      "Validation uses an alert banner, invalid preview cells include the reason as text, and import progress is a labelled progressbar with a status message.",
    ],
  },
  {
    id: "approval-queue",
    name: "Approval Queue",
    category: "Operations",
    icon: ListChecks,
    description: "Pending decisions grouped by risk, age, owner, and impact.",
    usage: `"use client";

import { useState } from "react";
import {
  ApprovalQueue,
  ApprovalQueueDescription,
  ApprovalQueueEmpty,
  ApprovalQueueFilters,
  ApprovalQueueGroup,
  ApprovalQueueGroupBy,
  ApprovalQueueGroupByOption,
  ApprovalQueueGroupCount,
  ApprovalQueueGroupHeader,
  ApprovalQueueGroups,
  ApprovalQueueGroupTitle,
  ApprovalQueueHeader,
  ApprovalQueueHeading,
  ApprovalQueueItem,
  ApprovalQueueItems,
  ApprovalQueueMetric,
  ApprovalQueueSummary,
  ApprovalQueueTitle,
  type ApprovalQueueVariant,
} from "@/components/uai/approval-queue";
import {
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarCount,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  MetricCardComparison,
  MetricCardLabel,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";

type Request = {
  id: string;
  title: string;
  description: string;
  risk: "low" | "medium" | "high";
  owner: string;
  age: string;
  ageGroup: string;
  impact: string;
  team: string;
};

const requests: Request[] = [
  {
    id: "REQ-311",
    title: "Refund $1,240 to Pallet & Co",
    description: "Duplicate annual charge after a plan migration.",
    risk: "high",
    owner: "Finance",
    age: "4 days",
    ageGroup: "Over 3 days",
    impact: "Customer-facing",
    team: "Finance",
  },
  {
    id: "REQ-318",
    title: "Raise API rate limit for Orbit Dental",
    description: "From 600 to 1,200 requests per minute for 30 days.",
    risk: "medium",
    owner: "Platform",
    age: "2 days",
    ageGroup: "1–3 days",
    impact: "Customer-facing",
    team: "Platform",
  },
  {
    id: "REQ-322",
    title: "Grant Mei Tanaka billing admin",
    description: "Temporary access while the finance lead is on leave.",
    risk: "high",
    owner: "Security",
    age: "5 hours",
    ageGroup: "Under a day",
    impact: "Internal",
    team: "Finance",
  },
  {
    id: "REQ-325",
    title: "Extend Fieldnote Labs trial by 14 days",
    description: "Procurement review is still in progress.",
    risk: "low",
    owner: "Sales",
    age: "1 hour",
    ageGroup: "Under a day",
    impact: "Customer-facing",
    team: "Sales",
  },
];

const groupings = {
  risk: (request: Request) =>
    \`\${request.risk.charAt(0).toUpperCase()}\${request.risk.slice(1)} risk\`,
  age: (request: Request) => request.ageGroup,
  owner: (request: Request) => request.owner,
  impact: (request: Request) => request.impact,
};
type Grouping = keyof typeof groupings;

export function ApprovalQueuePreview({ variant = "grouped" }: { variant?: ApprovalQueueVariant }) {
  const [groupBy, setGroupBy] = useState<Grouping>("risk");
  const [team, setTeam] = useState<string | null>("Finance");
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const visible = requests.filter((request) => !team || request.team === team);
  const pending = requests.filter((request) => !decisions[request.id]);
  const groups = new Map<string, Request[]>();
  for (const request of visible) {
    const key = groupings[groupBy](request);
    groups.set(key, [...(groups.get(key) ?? []), request]);
  }
  const decide = (id: string, decision: "approved" | "rejected") =>
    setDecisions((current) => ({ ...current, [id]: decision }));

  return (
    <ApprovalQueue variant={variant}>
      <ApprovalQueueHeader>
        <ApprovalQueueHeading>
          <ApprovalQueueTitle>Approvals</ApprovalQueueTitle>
          <ApprovalQueueDescription>
            Requests that need a second reviewer before they run.
          </ApprovalQueueDescription>
        </ApprovalQueueHeading>
        <ApprovalQueueGroupBy
          value={groupBy}
          onValueChange={(value) => setGroupBy(value as Grouping)}
        >
          <ApprovalQueueGroupByOption value="risk">Risk</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="age">Age</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="owner">Owner</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="impact">Impact</ApprovalQueueGroupByOption>
        </ApprovalQueueGroupBy>
      </ApprovalQueueHeader>
      <ApprovalQueueSummary>
        <ApprovalQueueMetric>
          <MetricCardLabel>Waiting</MetricCardLabel>
          <MetricCardValue>{pending.length}</MetricCardValue>
          <MetricCardComparison>across 3 teams</MetricCardComparison>
        </ApprovalQueueMetric>
        <ApprovalQueueMetric>
          <MetricCardLabel>High risk</MetricCardLabel>
          <MetricCardValue>
            {pending.filter((request) => request.risk === "high").length}
          </MetricCardValue>
          <MetricCardComparison>need two reviewers</MetricCardComparison>
        </ApprovalQueueMetric>
        <ApprovalQueueMetric>
          <MetricCardLabel>Oldest request</MetricCardLabel>
          <MetricCardValue>4 days</MetricCardValue>
          <MetricCardComparison>target is 2 days</MetricCardComparison>
        </ApprovalQueueMetric>
      </ApprovalQueueSummary>
      <ApprovalQueueFilters activeCount={team ? 1 : 0} onReset={() => setTeam(null)}>
        <FilterBarControls>
          {(["Finance", "Platform", "Sales"] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={team === name}
              onClick={() => setTeam(team === name ? null : name)}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid var(--uai-border)",
                borderRadius: 999,
                background: team === name ? "var(--uai-surface-raised)" : "var(--uai-surface)",
                color: "inherit",
                fontSize: 12,
              }}
            >
              {name}
            </button>
          ))}
        </FilterBarControls>
        <FilterBarChips>
          {team ? <FilterBarChip onRemove={() => setTeam(null)}>Team: {team}</FilterBarChip> : null}
        </FilterBarChips>
        <FilterBarCount>{visible.length} requests</FilterBarCount>
        <FilterBarReset />
      </ApprovalQueueFilters>
      {groups.size ? (
        <ApprovalQueueGroups>
          {Array.from(groups, ([label, items]) => (
            <ApprovalQueueGroup key={label}>
              <ApprovalQueueGroupHeader>
                <ApprovalQueueGroupTitle>{label}</ApprovalQueueGroupTitle>
                <ApprovalQueueGroupCount>{items.length}</ApprovalQueueGroupCount>
              </ApprovalQueueGroupHeader>
              <ApprovalQueueItems>
                {items.map((request) => (
                  <ApprovalQueueItem
                    key={request.id}
                    risk={request.risk}
                    status={decisions[request.id] ?? "ready"}
                  >
                    <ApprovalCardHeader title={request.title} description={request.description} />
                    {variant === "grouped" ? (
                      <ApprovalCardDetails>
                        <ApprovalCardDetail label="Owner">{request.owner}</ApprovalCardDetail>
                        <ApprovalCardDetail label="Waiting">{request.age}</ApprovalCardDetail>
                        <ApprovalCardDetail label="Impact">{request.impact}</ApprovalCardDetail>
                      </ApprovalCardDetails>
                    ) : null}
                    <ApprovalCardActions>
                      <ApprovalCardReject onClick={() => decide(request.id, "rejected")} />
                      <ApprovalCardApprove onClick={() => decide(request.id, "approved")} />
                    </ApprovalCardActions>
                  </ApprovalQueueItem>
                ))}
              </ApprovalQueueItems>
            </ApprovalQueueGroup>
          ))}
        </ApprovalQueueGroups>
      ) : (
        <ApprovalQueueEmpty>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>Nothing is waiting on you</EmptyStateTitle>
              <EmptyStateDescription>
                New requests appear here as soon as they are filed.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyStateContent>
        </ApprovalQueueEmpty>
      )}
    </ApprovalQueue>
  );
}
`,
    accessibility: [
      "Group by is a fieldset of native radios, so arrow keys move the selection and a visible focus ring follows the focused option.",
      "Each group is a section labelled by its heading, and its decisions form a list labelled by the same heading.",
      "Approval cards name their risk in text, mark busy decisions with aria-busy, and replace actions with the outcome once decided.",
      "Filter chips have named remove buttons, and the result count is a polite status message.",
    ],
  },
  {
    id: "audit-log-viewer",
    name: "Audit Log Viewer",
    category: "Operations",
    icon: FileClock,
    description: "Filters, events, details, and export controls.",
    usage: `"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import {
  AuditLogViewer,
  AuditLogViewerAction,
  AuditLogViewerActions,
  AuditLogViewerBody,
  AuditLogViewerDateRange,
  AuditLogViewerDescription,
  AuditLogViewerFilters,
  AuditLogViewerHeader,
  AuditLogViewerHeading,
  AuditLogViewerLog,
  AuditLogViewerMain,
  AuditLogViewerStatus,
  AuditLogViewerTitle,
  type AuditLogViewerVariant,
} from "@/components/uai/audit-log-viewer";
import {
  AuditLogAction,
  AuditLogActor,
  AuditLogDetailLabel,
  AuditLogDetailValue,
  AuditLogEmpty,
  AuditLogEvent,
  AuditLogEventDetails,
  AuditLogEventSummary,
  AuditLogHeader,
  AuditLogList,
  AuditLogResource,
  AuditLogTimestamp,
  AuditLogTitle,
} from "@/components/ui/uai/audit-log";
import {
  DateRangePickerInput,
  DateRangePickerInputs,
  DateRangePickerPreset,
  DateRangePickerPresets,
} from "@/components/ui/uai/date-range-picker";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";

const events = [
  {
    id: "evt_a41c",
    actor: "Priya Raman",
    action: "removed",
    resource: "jonas@orbit-dental.com",
    category: "Members",
    date: "2026-09-30",
    time: "2026-09-30T15:22:00",
    label: "Today, 3:22 PM",
    details: { Reason: "Offboarding request #4471", "IP address": "84.21.190.4" },
  },
  {
    id: "evt_a3f0",
    actor: "Deploy bot",
    action: "rotated",
    resource: "WAREHOUSE_READ_TOKEN",
    category: "Security",
    date: "2026-09-30",
    time: "2026-09-30T06:00:00",
    label: "Today, 6:00 AM",
    details: { Trigger: "Scheduled rotation", Environment: "Production" },
  },
  {
    id: "evt_a2b9",
    actor: "Marcus Lee",
    action: "changed SSO enforcement on",
    resource: "Sales workspace",
    category: "Security",
    date: "2026-09-26",
    time: "2026-09-26T11:48:00",
    label: "Sep 26, 11:48 AM",
    details: { Change: "Optional → Required", Client: "Web · Firefox 142" },
  },
  {
    id: "evt_a17e",
    actor: "Ana Duarte",
    action: "exported",
    resource: "contacts-q3.csv",
    category: "Data",
    date: "2026-09-12",
    time: "2026-09-12T09:15:00",
    label: "Sep 12, 9:15 AM",
    details: { Rows: "2,415", Filters: "Region is EU" },
  },
];

const allTime = { start: "2026-09-01", end: "2026-09-30" };

export function AuditLogViewerPreview({
  variant = "sidebar",
}: {
  variant?: AuditLogViewerVariant;
}) {
  const [category, setCategory] = useState("");
  const [range, setRange] = useState(allTime);
  const [exported, setExported] = useState(false);
  const visible = events.filter(
    (event) =>
      (!category || event.category === category) &&
      (!range.start || event.date >= range.start) &&
      (!range.end || event.date <= range.end),
  );
  const ranged = range.start !== allTime.start || range.end !== allTime.end;

  return (
    <AuditLogViewer variant={variant}>
      <AuditLogViewerHeader>
        <AuditLogViewerHeading>
          <AuditLogViewerTitle>Audit log</AuditLogViewerTitle>
          <AuditLogViewerDescription>
            Events are retained for 400 days on the Business plan.
          </AuditLogViewerDescription>
        </AuditLogViewerHeading>
        <AuditLogViewerActions>
          <AuditLogViewerAction disabled={!visible.length} onClick={() => setExported(true)}>
            <Download size={14} strokeWidth={1.75} aria-hidden="true" />
            Export CSV
          </AuditLogViewerAction>
        </AuditLogViewerActions>
      </AuditLogViewerHeader>
      <AuditLogViewerBody>
        <AuditLogViewerFilters
          activeCount={Number(Boolean(category)) + Number(ranged)}
          onReset={() => {
            setCategory("");
            setRange(allTime);
          }}
        >
          <FilterBarControls>
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "var(--uai-subtle)",
                fontSize: 12,
              }}
            >
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={{
                  height: 28,
                  padding: "0 8px",
                  border: 0,
                  borderRadius: 8,
                  background: "var(--uai-surface-raised)",
                  color: "var(--uai-text)",
                  fontSize: 13,
                }}
              >
                <option value="">All events</option>
                <option>Members</option>
                <option>Security</option>
                <option>Data</option>
              </select>
            </label>
          </FilterBarControls>
          <AuditLogViewerDateRange
            value={range}
            onValueChange={setRange}
            min="2026-01-01"
            max="2026-09-30"
          >
            <DateRangePickerPresets>
              <DateRangePickerPreset value={{ start: "2026-09-30", end: "2026-09-30" }}>
                Today
              </DateRangePickerPreset>
              <DateRangePickerPreset value={{ start: "2026-09-24", end: "2026-09-30" }}>
                Last 7 days
              </DateRangePickerPreset>
              <DateRangePickerPreset value={allTime}>September</DateRangePickerPreset>
            </DateRangePickerPresets>
            <DateRangePickerInputs>
              <DateRangePickerInput boundary="start">From</DateRangePickerInput>
              <DateRangePickerInput boundary="end">To</DateRangePickerInput>
            </DateRangePickerInputs>
          </AuditLogViewerDateRange>
          <FilterBarChips>
            {category ? (
              <FilterBarChip onRemove={() => setCategory("")}>Category: {category}</FilterBarChip>
            ) : null}
          </FilterBarChips>
          <FilterBarReset />
        </AuditLogViewerFilters>
        <AuditLogViewerMain>
          <AuditLogViewerLog>
            <AuditLogHeader>
              <AuditLogTitle>Events</AuditLogTitle>
            </AuditLogHeader>
            {visible.length ? (
              <AuditLogList>
                {visible.map((event) => (
                  <AuditLogEvent key={event.id}>
                    <AuditLogEventSummary>
                      <AuditLogActor>{event.actor}</AuditLogActor>
                      <AuditLogAction>{event.action}</AuditLogAction>
                      <AuditLogResource>{event.resource}</AuditLogResource>
                      <AuditLogTimestamp dateTime={event.time}>{event.label}</AuditLogTimestamp>
                    </AuditLogEventSummary>
                    <AuditLogEventDetails>
                      <AuditLogDetailLabel>Event ID</AuditLogDetailLabel>
                      <AuditLogDetailValue>{event.id}</AuditLogDetailValue>
                      {Object.entries(event.details).map(([label, value]) => (
                        <div key={label} style={{ display: "contents" }}>
                          <AuditLogDetailLabel>{label}</AuditLogDetailLabel>
                          <AuditLogDetailValue>{value}</AuditLogDetailValue>
                        </div>
                      ))}
                    </AuditLogEventDetails>
                  </AuditLogEvent>
                ))}
              </AuditLogList>
            ) : (
              <AuditLogEmpty>No events match these filters.</AuditLogEmpty>
            )}
          </AuditLogViewerLog>
          <AuditLogViewerStatus>
            {exported
              ? \`Exported \${visible.length} events to audit-log.csv\`
              : \`\${visible.length} of \${events.length} events\`}
          </AuditLogViewerStatus>
        </AuditLogViewerMain>
      </AuditLogViewerBody>
    </AuditLogViewer>
  );
}
`,
    accessibility: [
      "Filters form a named group with labelled native controls, toggle-button date presets, and labelled date inputs.",
      "Each event summary is a disclosure button with aria-expanded that controls its details list.",
      "Timestamps use the time element with machine-readable dateTime values.",
      "Result counts and export confirmations are announced through a polite status region.",
    ],
  },
  {
    id: "incident-dashboard",
    name: "Incident Dashboard",
    category: "Operations",
    icon: Siren,
    description: "Status, impact, timeline, responders, and updates.",
    usage: `"use client";

import { useState } from "react";
import {
  IncidentDashboard,
  IncidentDashboardAction,
  IncidentDashboardActions,
  IncidentDashboardBody,
  IncidentDashboardDescription,
  IncidentDashboardHeader,
  IncidentDashboardHeading,
  IncidentDashboardImpact,
  IncidentDashboardMetric,
  IncidentDashboardMetrics,
  IncidentDashboardPanel,
  IncidentDashboardPanelTitle,
  IncidentDashboardResponder,
  IncidentDashboardResponderAvatar,
  IncidentDashboardResponderName,
  IncidentDashboardResponderRole,
  IncidentDashboardResponders,
  IncidentDashboardSeverity,
  IncidentDashboardStatus,
  IncidentDashboardTimeline,
  IncidentDashboardTitle,
  IncidentDashboardUpdate,
  IncidentDashboardUpdateInput,
  IncidentDashboardUpdateLabel,
  IncidentDashboardUpdateSubmit,
  type IncidentDashboardVariant,
} from "@/components/uai/incident-dashboard";
import {
  ActivityTimelineActor,
  ActivityTimelineContent,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineMarker,
  ActivityTimelineTime,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  MetricCardComparison,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";
import {
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";

const responders = [
  { initials: "PR", name: "Priya Raman", role: "Incident commander" },
  { initials: "ML", name: "Marcus Lee", role: "Payments on-call" },
  { initials: "AD", name: "Ana Duarte", role: "Customer communications" },
];

const initialUpdates = [
  {
    id: "u3",
    actor: "Marcus Lee",
    text: "Rolled back payments-api to v4.18.2. Error rate is falling.",
    time: "14:41",
  },
  {
    id: "u2",
    actor: "Priya Raman",
    text: "Card authorizations time out for EU merchants after the 14:00 deploy.",
    time: "14:12",
  },
  {
    id: "u1",
    actor: "Alerting",
    text: "Checkout error rate crossed 2% for 5 minutes.",
    time: "14:02",
  },
];

export function IncidentDashboardPreview({
  variant = "overview",
}: {
  variant?: IncidentDashboardVariant;
}) {
  const [resolved, setResolved] = useState(false);
  const [updates, setUpdates] = useState(initialUpdates);
  const [draft, setDraft] = useState("");

  return (
    <IncidentDashboard variant={variant}>
      <IncidentDashboardHeader>
        <IncidentDashboardHeading>
          <IncidentDashboardSeverity level={resolved ? "minor" : "critical"}>
            SEV 1
          </IncidentDashboardSeverity>
          <IncidentDashboardTitle>
            INC-2291 · Checkout payments failing in EU
          </IncidentDashboardTitle>
          <IncidentDashboardDescription>
            Opened 47 minutes ago by Alerting
          </IncidentDashboardDescription>
        </IncidentDashboardHeading>
        <IncidentDashboardActions>
          <IncidentDashboardAction>Open war room</IncidentDashboardAction>
        </IncidentDashboardActions>
      </IncidentDashboardHeader>
      <IncidentDashboardStatus tone={resolved ? "success" : "error"}>
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>{resolved ? "Resolved" : "Mitigating"}</StatusBannerTitle>
          <StatusBannerDescription>
            {resolved
              ? "Error rate has been under 0.1% for 15 minutes."
              : "A rollback is in progress. Next update due at 15:00 UTC."}
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction onClick={() => setResolved((value) => !value)}>
            {resolved ? "Reopen" : "Mark resolved"}
          </StatusBannerAction>
        </StatusBannerActions>
      </IncidentDashboardStatus>
      <IncidentDashboardMetrics>
        <IncidentDashboardMetric>
          <MetricCardHeader>
            <MetricCardLabel>Checkout error rate</MetricCardLabel>
            <MetricCardTrend direction="down" sentiment="positive">
              6.1 pts
            </MetricCardTrend>
          </MetricCardHeader>
          <MetricCardValue>{resolved ? "0.08%" : "4.8%"}</MetricCardValue>
          <MetricCardComparison>Peak 10.9% at 14:18</MetricCardComparison>
        </IncidentDashboardMetric>
        <IncidentDashboardMetric>
          <MetricCardLabel>Failed orders</MetricCardLabel>
          <MetricCardValue>1,312</MetricCardValue>
          <MetricCardComparison>€184,900 at risk</MetricCardComparison>
        </IncidentDashboardMetric>
        <IncidentDashboardMetric>
          <MetricCardLabel>Duration</MetricCardLabel>
          <MetricCardValue>47 min</MetricCardValue>
          <MetricCardComparison>Since 14:02 UTC</MetricCardComparison>
        </IncidentDashboardMetric>
      </IncidentDashboardMetrics>
      <IncidentDashboardBody>
        <IncidentDashboardPanel span="wide">
          <IncidentDashboardPanelTitle>Updates</IncidentDashboardPanelTitle>
          <IncidentDashboardUpdate
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setUpdates((list) => [
                { id: \`u\${list.length + 1}\`, actor: "You", text: draft.trim(), time: "Now" },
                ...list,
              ]);
              setDraft("");
            }}
          >
            <IncidentDashboardUpdateLabel>New update</IncidentDashboardUpdateLabel>
            <IncidentDashboardUpdateInput
              name="update"
              rows={2}
              value={draft}
              placeholder="What changed, and when is the next update?"
              onChange={(event) => setDraft(event.target.value)}
            />
            <IncidentDashboardUpdateSubmit disabled={!draft.trim()} />
          </IncidentDashboardUpdate>
          <IncidentDashboardTimeline>
            <ActivityTimelineEvents>
              {updates.map((update) => (
                <ActivityTimelineEvent key={update.id}>
                  <ActivityTimelineMarker />
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>{update.actor}</ActivityTimelineActor> {update.text}
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime>{update.time}</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              ))}
            </ActivityTimelineEvents>
          </IncidentDashboardTimeline>
        </IncidentDashboardPanel>
        <IncidentDashboardPanel>
          <IncidentDashboardPanelTitle>Impact</IncidentDashboardPanelTitle>
          <IncidentDashboardImpact>
            <DescriptionListItem>
              <DescriptionListTerm>Customers</DescriptionListTerm>
              <DescriptionListDetails>EU merchants using card payments</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Services</DescriptionListTerm>
              <DescriptionListDetails>payments-api, checkout-web</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Workaround</DescriptionListTerm>
              <DescriptionListDetails>
                Retrying succeeds for about 60% of orders
              </DescriptionListDetails>
            </DescriptionListItem>
          </IncidentDashboardImpact>
        </IncidentDashboardPanel>
        <IncidentDashboardPanel>
          <IncidentDashboardPanelTitle>Responders</IncidentDashboardPanelTitle>
          <IncidentDashboardResponders>
            {responders.map((responder) => (
              <IncidentDashboardResponder key={responder.name}>
                <IncidentDashboardResponderAvatar>
                  {responder.initials}
                </IncidentDashboardResponderAvatar>
                <IncidentDashboardResponderName>{responder.name}</IncidentDashboardResponderName>
                <IncidentDashboardResponderRole>{responder.role}</IncidentDashboardResponderRole>
              </IncidentDashboardResponder>
            ))}
          </IncidentDashboardResponders>
        </IncidentDashboardPanel>
      </IncidentDashboardBody>
    </IncidentDashboard>
  );
}
`,
    accessibility: [
      "Active incidents use an alert banner; resolved incidents switch to a polite status banner.",
      "Severity is written as text beside its color dot, and metric trends pair arrows with words.",
      "Each panel is a section labelled by its heading; the update form has a labelled textarea and a native submit button.",
      "Responder initials are decorative; names and roles are always present as text.",
    ],
  },
  {
    id: "report-builder",
    name: "Report Builder",
    category: "Operations",
    icon: ChartColumn,
    description: "Select metrics, dimensions, filters, visualization, and export format.",
    usage: `"use client";

import { useState } from "react";
import {
  ReportBuilder,
  ReportBuilderAction,
  ReportBuilderActions,
  ReportBuilderBar,
  ReportBuilderBarLabel,
  ReportBuilderBarValue,
  ReportBuilderBody,
  ReportBuilderCanvas,
  ReportBuilderCanvasTitle,
  ReportBuilderChart,
  ReportBuilderConfig,
  ReportBuilderDescription,
  ReportBuilderFilters,
  ReportBuilderHeader,
  ReportBuilderHeading,
  ReportBuilderMetric,
  ReportBuilderOption,
  ReportBuilderOptions,
  ReportBuilderSection,
  ReportBuilderSectionTitle,
  ReportBuilderStatus,
  ReportBuilderTitle,
  type ReportBuilderVariant,
} from "@/components/uai/report-builder";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  MetricCardComparison,
  MetricCardLabel,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";

const metrics = {
  revenue: { label: "Net revenue", format: (value: number) => \`$\${value}k\` },
  orders: { label: "Orders", format: (value: number) => value.toLocaleString("en-US") },
};
const data = {
  region: [
    { label: "North America", revenue: 412, orders: 3810 },
    { label: "Europe", revenue: 296, orders: 2955 },
    { label: "Asia Pacific", revenue: 158, orders: 1640 },
    { label: "Latin America", revenue: 74, orders: 902 },
  ],
  channel: [
    { label: "Self-serve", revenue: 388, orders: 6120 },
    { label: "Sales-led", revenue: 471, orders: 2210 },
    { label: "Partners", revenue: 81, orders: 977 },
  ],
};
type Metric = keyof typeof metrics;
type Dimension = keyof typeof data;

export function ReportBuilderPreview({ variant = "sidebar" }: { variant?: ReportBuilderVariant }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [dimension, setDimension] = useState<Dimension>("region");
  const [chart, setChart] = useState("bars");
  const [format, setFormat] = useState("csv");
  const [refunds, setRefunds] = useState(true);
  const [exported, setExported] = useState("");
  const rows = data[dimension].map((row) => ({
    label: row.label,
    value: refunds ? Math.round(row[metric] * 0.96) : row[metric],
  }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value));
  const { label, format: display } = metrics[metric];

  return (
    <ReportBuilder variant={variant}>
      <ReportBuilderHeader>
        <ReportBuilderHeading>
          <ReportBuilderTitle>Quarterly business review</ReportBuilderTitle>
          <ReportBuilderDescription>Q3 2026 · Refreshed 12 minutes ago</ReportBuilderDescription>
        </ReportBuilderHeading>
        <ReportBuilderActions>
          <ReportBuilderAction>Save report</ReportBuilderAction>
          <ReportBuilderAction
            emphasis="primary"
            onClick={() => setExported(\`Exported qbr-q3-2026.\${format}\`)}
          >
            Export
          </ReportBuilderAction>
        </ReportBuilderActions>
      </ReportBuilderHeader>
      <ReportBuilderBody>
        <ReportBuilderConfig onSubmit={(event) => event.preventDefault()}>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Metric</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {(Object.keys(metrics) as Metric[]).map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="metric"
                  checked={metric === id}
                  onChange={() => setMetric(id)}
                >
                  {metrics[id].label}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Break down by</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              <ReportBuilderOption
                type="radio"
                name="dimension"
                checked={dimension === "region"}
                onChange={() => setDimension("region")}
              >
                Region
              </ReportBuilderOption>
              <ReportBuilderOption
                type="radio"
                name="dimension"
                checked={dimension === "channel"}
                onChange={() => setDimension("channel")}
              >
                Channel
              </ReportBuilderOption>
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Visualization</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {["bars", "columns", "number"].map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="chart"
                  checked={chart === id}
                  onChange={() => setChart(id)}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Export format</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {["csv", "xlsx", "pdf"].map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="format"
                  checked={format === id}
                  onChange={() => setFormat(id)}
                >
                  {id.toUpperCase()}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
        </ReportBuilderConfig>
        <ReportBuilderCanvas>
          <ReportBuilderFilters activeCount={refunds ? 1 : 0} onReset={() => setRefunds(false)}>
            <FilterBarControls>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={refunds}
                  onChange={(event) => setRefunds(event.target.checked)}
                />
                Exclude refunds
              </label>
            </FilterBarControls>
            <FilterBarChips>
              {refunds ? (
                <FilterBarChip onRemove={() => setRefunds(false)}>Refunds excluded</FilterBarChip>
              ) : null}
            </FilterBarChips>
            <FilterBarReset />
          </ReportBuilderFilters>
          <ReportBuilderCanvasTitle>
            {label} by {dimension}
          </ReportBuilderCanvasTitle>
          {chart === "number" ? (
            <ReportBuilderMetric>
              <MetricCardLabel>Total {label.toLowerCase()}</MetricCardLabel>
              <MetricCardValue>{display(total)}</MetricCardValue>
              <MetricCardComparison>Across {rows.length} segments</MetricCardComparison>
            </ReportBuilderMetric>
          ) : (
            <ReportBuilderChart
              aria-label={\`\${label} by \${dimension}\`}
              max={max}
              orientation={chart === "columns" ? "vertical" : "horizontal"}
            >
              {rows.map((row) => (
                <ReportBuilderBar key={row.label} value={row.value}>
                  <ReportBuilderBarLabel>{row.label}</ReportBuilderBarLabel>
                  <ReportBuilderBarValue>{display(row.value)}</ReportBuilderBarValue>
                </ReportBuilderBar>
              ))}
            </ReportBuilderChart>
          )}
          <ReportBuilderStatus>
            {exported || \`\${rows.length} rows · \${format.toUpperCase()} export ready\`}
          </ReportBuilderStatus>
        </ReportBuilderCanvas>
      </ReportBuilderBody>
    </ReportBuilder>
  );
}
`,
    accessibility: [
      "Each setting is a fieldset with a legend; options are native radios or checkboxes styled as pills, with a visible focus ring.",
      "The chart is a labelled list where every bar includes its label and formatted value as text; bar fills are decorative.",
      "The report canvas is a section labelled by its title, so the current metric and dimension are announced together.",
      "Export results are announced through a polite status region.",
    ],
  },
];
