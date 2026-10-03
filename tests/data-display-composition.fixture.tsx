import { AuditLogPreview } from "@/components/registry/data-display/audit-log-preview";
import { CalendarViewPreview } from "@/components/registry/data-display/calendar-view-preview";
import { ComparisonTablePreview } from "@/components/registry/data-display/comparison-table-preview";
import { DataTableToolbarPreview } from "@/components/registry/data-display/data-table-toolbar-preview";
import { DescriptionListPreview } from "@/components/registry/data-display/description-list-preview";
import { KanbanBoardPreview } from "@/components/registry/data-display/kanban-board-preview";
import { MetricCardPreview } from "@/components/registry/data-display/metric-card-preview";

export function DataDisplayCompositionFixture() {
  return (
    <>
      <DataTableToolbarPreview />
      <MetricCardPreview />
      <DescriptionListPreview />
      <ComparisonTablePreview />
      <KanbanBoardPreview />
      <CalendarViewPreview />
      <AuditLogPreview />
    </>
  );
}
