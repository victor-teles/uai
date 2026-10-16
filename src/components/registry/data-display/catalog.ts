import {
  CalendarDays,
  Columns3,
  List,
  ScrollText,
  SquareKanban,
  TableProperties,
  TrendingUp,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type DataDisplayItemId =
  | "data-table-toolbar"
  | "metric-card"
  | "description-list"
  | "comparison-table"
  | "kanban-board"
  | "calendar-view"
  | "audit-log";

export const dataDisplayCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "data-table-toolbar",
    name: "Data Table Toolbar",
    category: "Data Display",
    icon: TableProperties,
    description: "Search, filters, column visibility, export, and bulk actions for selected rows.",
    usage: `"use client";

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
                  background: \`color-mix(in oklab, \${statusTone[invoice.status]} 14%, transparent)\`,
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
`,
    accessibility: [
      "Search is a labelled native search input; Escape and the Clear button empty it and keep focus in the field.",
      "The Columns button is a disclosure with aria-expanded; its panel is a labelled popover with a fieldset of checkboxes, and Escape or an outside click closes it and returns focus.",
      "Bulk actions appear only while rows are selected, and a polite status region announces the selection count.",
      "Filtering, sorting, export, and row selection remain consumer-owned; the toolbar only exposes the controls.",
    ],
  },
  {
    id: "metric-card",
    name: "Metric Card",
    category: "Data Display",
    icon: TrendingUp,
    description:
      "A value with comparison, trend, an optional scrubbable sparkline, and loading, error, and empty states.",
    usage: `"use client";

import { useState } from "react";
import {
  MetricCard,
  MetricCardChart,
  MetricCardComparison,
  MetricCardDescription,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";

const mrr = [31.2, 32.8, 32.1, 35.4, 34.9, 38.2, 37.6, 41.0, 42.1, 44.6, 48.29];
const weeks = [
  "Jul 27",
  "Aug 3",
  "Aug 10",
  "Aug 17",
  "Aug 24",
  "Aug 31",
  "Sep 7",
  "Sep 14",
  "Sep 21",
  "Sep 28",
  "Oct 5",
];
const response = [21, 20, 20.5, 19, 19.5, 17, 18, 16, 16.5, 15, 14];
const days = [
  "Sat, Oct 3",
  "Sun, Oct 4",
  "Mon, Oct 5",
  "Tue, Oct 6",
  "Wed, Oct 7",
  "Thu, Oct 8",
  "Fri, Oct 9",
  "Sat, Oct 10",
  "Sun, Oct 11",
  "Mon, Oct 12",
  "Tue, Oct 13",
];

export function MetricCardPreview({ variant = "card" }: { variant?: MetricCardVariant }) {
  const [trials, setTrials] = useState<"error" | "loading" | "ready">("error");

  function retry() {
    setTrials("loading");
    window.setTimeout(() => setTrials("ready"), 900);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Monthly recurring revenue</MetricCardLabel>
          <MetricCardTrend direction="up">12.4%</MetricCardTrend>
        </MetricCardHeader>
        <MetricCardValue>$48,290</MetricCardValue>
        <MetricCardComparison>vs. $42,960 in August</MetricCardComparison>
        <MetricCardChart
          data={mrr}
          label="MRR rose from $31.2k to $48.3k over 11 weeks"
          pointLabels={mrr.map((value, index) => \`Week of \${weeks[index]} · $\${value.toFixed(1)}k\`)}
        />
      </MetricCard>
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Median first response</MetricCardLabel>
          <MetricCardTrend direction="down" sentiment="positive">
            3 min
          </MetricCardTrend>
        </MetricCardHeader>
        <MetricCardValue>
          14<span data-unit>min</span>
        </MetricCardValue>
        <MetricCardComparison>vs. 17 min last week</MetricCardComparison>
        <MetricCardChart
          data={response}
          label="Median first response fell from 21 to 14 minutes over 11 days"
          pointLabels={response.map((value, index) => \`\${days[index]} · \${value} min\`)}
        />
      </MetricCard>
      <MetricCard variant={variant} aria-busy={trials === "loading"}>
        <MetricCardHeader>
          <MetricCardLabel>Trial conversions</MetricCardLabel>
          {trials === "ready" && <MetricCardTrend direction="up">2.1 pts</MetricCardTrend>}
        </MetricCardHeader>
        <MetricCardValue className={trials === "error" ? "text-subtle-foreground" : undefined}>
          {trials === "error" ? "—" : "18.6%"}
        </MetricCardValue>
        <MetricCardComparison>
          {trials === "error" ? (
            <>
              Couldn’t load trial conversions ·{" "}
              <button
                type="button"
                onClick={retry}
                className="cursor-pointer rounded-sm border-0 bg-transparent p-0 font-medium text-[color-mix(in_oklab,var(--primary)_80%,var(--foreground))] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Retry
              </button>
            </>
          ) : (
            "vs. 16.5% in August"
          )}
        </MetricCardComparison>
        <MetricCardChart
          data={trials === "ready" ? [14.2, 15.1, 15.8, 16.5, 17.2, 18.6] : []}
          label="Trial conversions by month"
        />
      </MetricCard>
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Expansion revenue</MetricCardLabel>
        </MetricCardHeader>
        <MetricCardValue className="text-subtle-foreground">—</MetricCardValue>
        <MetricCardComparison>No data for September yet</MetricCardComparison>
        <MetricCardDescription>
          Upgrades start counting after the first renewal.
        </MetricCardDescription>
        <MetricCardChart data={[]} label="No expansion revenue yet" />
      </MetricCard>
    </div>
  );
}
`,
    accessibility: [
      "Each card is a labelled group, so the metric name is announced with its value.",
      "Trends pair an arrow with text and a visually hidden Increased, Decreased, or Unchanged prefix; color is never the only signal.",
      "Sentiment is set separately from direction, so a falling response time can read as positive.",
      "The chart is an image named by its summary. When focused, ← → Home End scrub it, and the scrubbed point is announced politely and shown in the comparison line.",
      "aria-busy on the card swaps every part for a skeleton and keeps the label for assistive tech. Changed values tick visually, while assistive tech reads only the final value.",
    ],
  },
  {
    id: "description-list",
    name: "Description List",
    category: "Data Display",
    icon: List,
    description: "Labeled facts with responsive alignment and optional actions.",
    usage: `"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  DescriptionList,
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";

export function DescriptionListPreview({
  variant = "inline",
}: {
  variant?: DescriptionListVariant;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <DescriptionList variant={variant}>
      <DescriptionListItem>
        <DescriptionListTerm>Customer</DescriptionListTerm>
        <DescriptionListDetails>Northwind Logistics</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Plan</DescriptionListTerm>
        <DescriptionListDetails>Business · 42 seats, billed yearly</DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Account ID</DescriptionListTerm>
        <DescriptionListDetails>
          <code>acct_8KQ2M7</code>
          <DescriptionListAction
            aria-label={copied ? "Account ID copied" : "Copy account ID"}
            onClick={() => setCopied(true)}
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </DescriptionListAction>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Renewal</DescriptionListTerm>
        <DescriptionListDetails>
          March 14, 2027
          <DescriptionListAction>Change</DescriptionListAction>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
}
`,
    accessibility: [
      "Renders native dl, dt, and dd elements so screen readers announce term and value pairs.",
      "Inline items wrap the value below its label on narrow widths without media queries.",
      "Actions are native buttons inside the value; give icon-only actions an aria-label.",
    ],
  },
  {
    id: "comparison-table",
    name: "Comparison Table",
    category: "Data Display",
    icon: Columns3,
    description: "Compare plans or products with sticky labels and highlighted differences.",
    usage: `import {
  ComparisonTable,
  ComparisonTableBody,
  ComparisonTableCell,
  ComparisonTableCheck,
  ComparisonTableColumn,
  ComparisonTableContent,
  ComparisonTableCorner,
  ComparisonTableDifferencesToggle,
  ComparisonTableHead,
  ComparisonTableHeader,
  ComparisonTableRow,
  ComparisonTableRowHeader,
  ComparisonTableTitle,
  type ComparisonTableVariant,
} from "@/components/ui/uai/comparison-table";

export function ComparisonTablePreview({
  variant = "bordered",
}: {
  variant?: ComparisonTableVariant;
}) {
  return (
    <ComparisonTable variant={variant} defaultHighlightDifferences>
      <ComparisonTableHeader>
        <ComparisonTableTitle>Compare plans</ComparisonTableTitle>
        <ComparisonTableDifferencesToggle />
      </ComparisonTableHeader>
      <ComparisonTableContent>
        <ComparisonTableHead>
          <ComparisonTableCorner>Feature</ComparisonTableCorner>
          <ComparisonTableColumn>Starter</ComparisonTableColumn>
          <ComparisonTableColumn recommended>Team</ComparisonTableColumn>
          <ComparisonTableColumn>Business</ComparisonTableColumn>
        </ComparisonTableHead>
        <ComparisonTableBody>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>Monthly price</ComparisonTableRowHeader>
            <ComparisonTableCell>$0</ComparisonTableCell>
            <ComparisonTableCell>$12 per seat</ComparisonTableCell>
            <ComparisonTableCell>$24 per seat</ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow>
            <ComparisonTableRowHeader>Unlimited projects</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>Version history</ComparisonTableRowHeader>
            <ComparisonTableCell>7 days</ComparisonTableCell>
            <ComparisonTableCell>90 days</ComparisonTableCell>
            <ComparisonTableCell>Unlimited</ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow different>
            <ComparisonTableRowHeader>SAML single sign-on</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value={false} />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value={false} />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
          <ComparisonTableRow>
            <ComparisonTableRowHeader>Email support</ComparisonTableRowHeader>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
            <ComparisonTableCell>
              <ComparisonTableCheck value />
            </ComparisonTableCell>
          </ComparisonTableRow>
        </ComparisonTableBody>
      </ComparisonTableContent>
    </ComparisonTable>
  );
}
`,
    accessibility: [
      "A native table with column and row headers; the scroll container is a labelled, focusable region for keyboard scrolling.",
      "Row labels stay sticky while scrolling sideways, and header cells stay sticky while scrolling down.",
      "Highlighted rows add a visible Differs label, and check marks expose Included or Not included text.",
      "Consumers mark differing rows; the table does not compare cell content itself.",
    ],
  },
  {
    id: "kanban-board",
    name: "Kanban Board",
    category: "Data Display",
    icon: SquareKanban,
    description: "Columns, cards, keyboard movement, and empty states.",
    usage: `"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCardMeta,
  KanbanBoardCards,
  KanbanBoardCardTitle,
  KanbanBoardColumn,
  KanbanBoardColumnCount,
  KanbanBoardColumnEmpty,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  type KanbanBoardValue,
  type KanbanBoardVariant,
} from "@/components/ui/uai/kanban-board";

const columns = { backlog: "Backlog", progress: "In progress", review: "In review" };
const tags = {
  Security: "bg-destructive/14 text-destructive",
  Support: "bg-primary/14 text-primary",
  Billing: "bg-success/14 text-success",
  Data: "bg-warning/14 text-warning",
};
const cards: Record<string, { title: string; tag: keyof typeof tags; due: string }> = {
  "OPS-112": { title: "Rotate staging API keys", tag: "Security", due: "Due Oct 3" },
  "OPS-118": { title: "Document the on-call handoff", tag: "Support", due: "No due date" },
  "OPS-121": { title: "Migrate invoices to the new ledger", tag: "Billing", due: "Due Oct 9" },
  "OPS-124": { title: "Fix CSV export for archived rows", tag: "Data", due: "Due Oct 1" },
};

const shimmer =
  "animate-skeleton-shimmer bg-muted bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_100%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none motion-reduce:bg-none";

/** While the board loads, keep its geometry: real columns, 62px cards, an 80px title. */
function KanbanBoardLoading({ variant }: { variant: KanbanBoardVariant }) {
  return (
    <KanbanBoard
      variant={variant}
      defaultValue={{ backlog: [], progress: [], review: [] }}
      aria-busy="true"
    >
      {Object.entries(columns).map(([column, label], index) => (
        <KanbanBoardColumn key={column} value={column} label={label}>
          <KanbanBoardColumnHeader>
            <Skeleton className={\`h-3 w-20 rounded-full \${shimmer}\`} />
          </KanbanBoardColumnHeader>
          <div className={variant === "compact" ? "grid gap-1.5" : "grid gap-2"}>
            {Array.from({ length: index === 2 ? 1 : 2 }, (_, card) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders are positional.
                key={card}
                className={\`h-[62px] \${variant === "compact" ? "rounded-lg" : "rounded-[10px]"} \${shimmer}\`}
              />
            ))}
          </div>
        </KanbanBoardColumn>
      ))}
      <span className="sr-only" role="status">
        Loading the board…
      </span>
    </KanbanBoard>
  );
}

export function KanbanBoardPreview({
  variant = "board",
  loading = false,
}: {
  variant?: KanbanBoardVariant;
  loading?: boolean;
}) {
  const [value, setValue] = useState<KanbanBoardValue>({
    backlog: ["OPS-112", "OPS-118"],
    progress: ["OPS-121", "OPS-124"],
    review: [],
  });
  if (loading) return <KanbanBoardLoading variant={variant} />;
  return (
    <KanbanBoard variant={variant} value={value} onValueChange={setValue}>
      {Object.entries(value).map(([column, ids]) => {
        const label = columns[column as keyof typeof columns];
        return (
          <KanbanBoardColumn key={column} value={column} label={label}>
            <KanbanBoardColumnHeader>
              <KanbanBoardColumnTitle>{label}</KanbanBoardColumnTitle>
              <KanbanBoardColumnCount />
            </KanbanBoardColumnHeader>
            <KanbanBoardCards>
              {ids.map((id) => {
                const card = cards[id];
                if (!card) return null;
                return (
                  <KanbanBoardCard key={id} value={id} label={card.title}>
                    <KanbanBoardCardTitle>{card.title}</KanbanBoardCardTitle>
                    <KanbanBoardCardMeta>
                      <span
                        className={\`rounded-[6px] px-1.5 text-[11px]/[18px] font-medium \${tags[card.tag]}\`}
                      >
                        {card.tag}
                      </span>
                      <span>{id}</span>
                      <span>{card.due}</span>
                    </KanbanBoardCardMeta>
                  </KanbanBoardCard>
                );
              })}
            </KanbanBoardCards>
            <KanbanBoardColumnEmpty>Nothing waiting for review.</KanbanBoardColumnEmpty>
          </KanbanBoardColumn>
        );
      })}
    </KanbanBoard>
  );
}
`,
    accessibility: [
      "Cards are focusable list items. Space or Enter picks a card up, arrow keys move it between positions and columns, and Space, Enter, or Escape drops or cancels.",
      "Every pick-up, move, drop, and cancel is announced in a live region with the column name and position.",
      "Pointer users drag a lifted copy of the card (hidden from assistive technology) and see an insertion slot where it will land; pick-up, drop, cancel, and rejected moves are announced like keyboard moves, and Escape cancels a drag.",
      "Columns are labelled sections with card counts and an empty state.",
    ],
  },
  {
    id: "calendar-view",
    name: "Calendar View",
    category: "Data Display",
    icon: CalendarDays,
    description: "Day, week, and month layouts with event overflow.",
    usage: `"use client";

import { useState } from "react";
import {
  CalendarView,
  CalendarViewGrid,
  CalendarViewHeader,
  CalendarViewModes,
  CalendarViewNavigation,
  CalendarViewTitle,
  type CalendarViewVariant,
} from "@/components/ui/uai/calendar-view";

const events = [
  { id: "1", title: "Quarterly planning", start: new Date(2026, 8, 30), allDay: true },
  {
    id: "2",
    title: "Design review",
    start: new Date(2026, 8, 30, 10),
    end: new Date(2026, 8, 30, 11),
  },
  {
    id: "3",
    title: "Billing sync",
    start: new Date(2026, 8, 30, 13, 30),
    end: new Date(2026, 8, 30, 14),
  },
  {
    id: "4",
    title: "Customer call: Northwind",
    start: new Date(2026, 8, 30, 16),
    end: new Date(2026, 8, 30, 16, 45),
  },
  { id: "5", title: "Release 4.2 freeze", start: new Date(2026, 9, 2, 9) },
  {
    id: "6",
    title: "Team offsite",
    start: new Date(2026, 8, 14),
    end: new Date(2026, 8, 16),
    allDay: true,
  },
  {
    id: "7",
    title: "Security audit kickoff",
    start: new Date(2026, 8, 22, 15),
    end: new Date(2026, 8, 22, 16),
  },
];

export function CalendarViewPreview({ variant = "card" }: { variant?: CalendarViewVariant }) {
  const [selected, setSelected] = useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <CalendarView variant={variant} today={new Date(2026, 8, 30)}>
        <CalendarViewHeader>
          <CalendarViewTitle />
          <CalendarViewNavigation />
          <CalendarViewModes />
        </CalendarViewHeader>
        <CalendarViewGrid events={events} onEventSelect={(event) => setSelected(event.title)} />
      </CalendarView>
      <p
        role="status"
        style={{ margin: 0, minHeight: 18, color: "var(--uai-muted)", fontSize: 12 }}
      >
        {selected ? \`Opened \${selected}\` : ""}
      </p>
    </div>
  );
}
`,
    accessibility: [
      'Month and week layouts are native tables with weekday column headers; each day has a full-date label and today has aria-current="date".',
      "Navigation and layout controls are buttons with explicit labels and pressed states, and the title announces the visible range.",
      "Overflow buttons say how many events are hidden and on which day, then open that day.",
      "Dates use local calendar days without timezone conversion. Pass today to keep server and client output stable.",
    ],
  },
  {
    id: "audit-log",
    name: "Audit Log",
    category: "Data Display",
    icon: ScrollText,
    description: "Actors, actions, resources, timestamps, filters, and event details.",
    usage: `"use client";

import { useState } from "react";
import {
  AuditLog,
  AuditLogAction,
  AuditLogActor,
  AuditLogDetailLabel,
  AuditLogDetailValue,
  AuditLogEmpty,
  AuditLogEvent,
  AuditLogEventDetails,
  AuditLogEventSummary,
  AuditLogFilters,
  AuditLogHeader,
  AuditLogList,
  AuditLogResource,
  AuditLogTimestamp,
  AuditLogTitle,
  type AuditLogVariant,
} from "@/components/ui/uai/audit-log";

const entries = [
  {
    id: "evt_9f21",
    actor: "Ana Souza",
    action: "changed the role of",
    resource: "marcus@northwind.io",
    category: "members",
    time: "2026-09-30T14:12:00",
    label: "Today, 2:12 PM",
    details: { Change: "Viewer → Admin", "IP address": "189.40.12.7", Client: "Web · Chrome 131" },
  },
  {
    id: "evt_9f1c",
    actor: "Deploy bot",
    action: "rotated",
    resource: "STRIPE_SECRET_KEY",
    category: "security",
    time: "2026-09-30T09:40:00",
    label: "Today, 9:40 AM",
    details: {
      Environment: "Production",
      Trigger: "Scheduled rotation",
      Client: "API token tok_41",
    },
  },
  {
    id: "evt_9e88",
    actor: "Lena Park",
    action: "exported",
    resource: "invoices-2026-q3.csv",
    category: "data",
    time: "2026-09-29T17:05:00",
    label: "Yesterday, 5:05 PM",
    details: { Rows: "1,284", Filters: "Status is Paid", Client: "Web · Safari 19" },
  },
];

export function AuditLogPreview({ variant = "card" }: { variant?: AuditLogVariant }) {
  const [category, setCategory] = useState("all");
  const visible = entries.filter((entry) => category === "all" || entry.category === category);
  return (
    <AuditLog variant={variant}>
      <AuditLogHeader>
        <AuditLogTitle>Audit log</AuditLogTitle>
        <AuditLogFilters>
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
                padding: "0 10px",
                border: 0,
                borderRadius: 999,
                background: "var(--uai-surface-raised)",
                color: "var(--uai-text)",
                font: "inherit",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <option value="all">All events</option>
              <option value="members">Members</option>
              <option value="security">Security</option>
              <option value="data">Data</option>
              <option value="billing">Billing</option>
            </select>
          </label>
        </AuditLogFilters>
      </AuditLogHeader>
      {visible.length === 0 ? (
        <AuditLogEmpty>No events match this category in the last 30 days.</AuditLogEmpty>
      ) : (
        <AuditLogList>
          {visible.map((entry) => (
            <AuditLogEvent key={entry.id}>
              <AuditLogEventSummary>
                <AuditLogActor>{entry.actor}</AuditLogActor>
                <AuditLogAction>{entry.action}</AuditLogAction>
                <AuditLogResource>{entry.resource}</AuditLogResource>
                <AuditLogTimestamp dateTime={entry.time}>{entry.label}</AuditLogTimestamp>
              </AuditLogEventSummary>
              <AuditLogEventDetails>
                <AuditLogDetailLabel>Event ID</AuditLogDetailLabel>
                <AuditLogDetailValue>{entry.id}</AuditLogDetailValue>
                {Object.entries(entry.details).map(([label, value]) => (
                  <div key={label} style={{ display: "contents" }}>
                    <AuditLogDetailLabel>{label}</AuditLogDetailLabel>
                    <AuditLogDetailValue>{value}</AuditLogDetailValue>
                  </div>
                ))}
              </AuditLogEventDetails>
            </AuditLogEvent>
          ))}
        </AuditLogList>
      )}
    </AuditLog>
  );
}
`,
    accessibility: [
      "Events are an ordered list; each summary is a button with aria-expanded that controls its details.",
      "Timestamps use the time element with a machine-readable dateTime value.",
      "Details render as a description list. Filtering and data loading remain consumer-owned, and the empty state is a status message.",
    ],
  },
];
