"use client";

import { AUDIT_LOG_VARIANTS, type AuditLogVariant } from "@/components/ui/uai/audit-log";
import {
  CALENDAR_VIEW_VARIANTS,
  type CalendarViewVariant,
} from "@/components/ui/uai/calendar-view";
import {
  COMPARISON_TABLE_VARIANTS,
  type ComparisonTableVariant,
} from "@/components/ui/uai/comparison-table";
import {
  DATA_TABLE_TOOLBAR_VARIANTS,
  type DataTableToolbarVariant,
} from "@/components/ui/uai/data-table-toolbar";
import {
  DESCRIPTION_LIST_VARIANTS,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import { KANBAN_BOARD_VARIANTS, type KanbanBoardVariant } from "@/components/ui/uai/kanban-board";
import { METRIC_CARD_VARIANTS, type MetricCardVariant } from "@/components/ui/uai/metric-card";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AuditLogPreview } from "./audit-log-preview";
import { CalendarViewPreview } from "./calendar-view-preview";
import type { DataDisplayItemId } from "./catalog";
import { ComparisonTablePreview } from "./comparison-table-preview";
import { DataTableToolbarPreview } from "./data-table-toolbar-preview";
import { DescriptionListPreview } from "./description-list-preview";
import { KanbanBoardPreview } from "./kanban-board-preview";
import { MetricCardPreview } from "./metric-card-preview";

const controls: Record<DataDisplayItemId, { variants: readonly string[]; label: string }> = {
  "data-table-toolbar": { variants: DATA_TABLE_TOOLBAR_VARIANTS, label: "data table toolbar" },
  "metric-card": { variants: METRIC_CARD_VARIANTS, label: "metric card" },
  "description-list": { variants: DESCRIPTION_LIST_VARIANTS, label: "description list" },
  "comparison-table": { variants: COMPARISON_TABLE_VARIANTS, label: "comparison table" },
  "kanban-board": { variants: KANBAN_BOARD_VARIANTS, label: "kanban board" },
  "calendar-view": { variants: CALENDAR_VIEW_VARIANTS, label: "calendar view" },
  "audit-log": { variants: AUDIT_LOG_VARIANTS, label: "audit log" },
};

const wide = new Set(["comparison-table", "kanban-board", "calendar-view", "data-table-toolbar"]);

export function getDataDisplayPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId as DataDisplayItemId];
  if (!control) return undefined;
  return {
    ariaLabel: `${control.label} variant`,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function DataDisplayPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Data display">
      <div
        style={{
          width: "100%",
          maxWidth: wide.has(itemId) ? 860 : itemId === "metric-card" ? 600 : 520,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "data-table-toolbar" && (
          <DataTableToolbarPreview variant={selection as DataTableToolbarVariant} />
        )}
        {itemId === "metric-card" && <MetricCardPreview variant={selection as MetricCardVariant} />}
        {itemId === "description-list" && (
          <DescriptionListPreview variant={selection as DescriptionListVariant} />
        )}
        {itemId === "comparison-table" && (
          <ComparisonTablePreview variant={selection as ComparisonTableVariant} />
        )}
        {itemId === "kanban-board" && (
          <KanbanBoardPreview variant={selection as KanbanBoardVariant} />
        )}
        {itemId === "calendar-view" && (
          <CalendarViewPreview variant={selection as CalendarViewVariant} />
        )}
        {itemId === "audit-log" && <AuditLogPreview variant={selection as AuditLogVariant} />}
      </div>
    </PreviewStage>
  );
}
