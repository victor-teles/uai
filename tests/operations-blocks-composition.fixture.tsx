import { ApprovalQueuePreview } from "@/components/registry/operations-blocks/approval-queue-preview";
import { AuditLogViewerPreview } from "@/components/registry/operations-blocks/audit-log-viewer-preview";
import { DataExplorerPreview } from "@/components/registry/operations-blocks/data-explorer-preview";
import { ImportWorkflowPreview } from "@/components/registry/operations-blocks/import-workflow-preview";
import { IncidentDashboardPreview } from "@/components/registry/operations-blocks/incident-dashboard-preview";
import { ReportBuilderPreview } from "@/components/registry/operations-blocks/report-builder-preview";
import { ResourceManagerPreview } from "@/components/registry/operations-blocks/resource-manager-preview";

export function OperationsBlocksCompositionFixture() {
  return (
    <>
      <ResourceManagerPreview />
      <DataExplorerPreview />
      <ImportWorkflowPreview />
      <ApprovalQueuePreview />
      <AuditLogViewerPreview />
      <IncidentDashboardPreview />
      <ReportBuilderPreview />
    </>
  );
}
