"use client";

import {
  APPROVAL_QUEUE_VARIANTS,
  type ApprovalQueueVariant,
} from "@/components/uai/approval-queue";
import {
  AUDIT_LOG_VIEWER_VARIANTS,
  type AuditLogViewerVariant,
} from "@/components/uai/audit-log-viewer";
import { DATA_EXPLORER_VARIANTS, type DataExplorerVariant } from "@/components/uai/data-explorer";
import {
  IMPORT_WORKFLOW_VARIANTS,
  type ImportWorkflowVariant,
} from "@/components/uai/import-workflow";
import {
  INCIDENT_DASHBOARD_VARIANTS,
  type IncidentDashboardVariant,
} from "@/components/uai/incident-dashboard";
import {
  REPORT_BUILDER_VARIANTS,
  type ReportBuilderVariant,
} from "@/components/uai/report-builder";
import {
  RESOURCE_MANAGER_VARIANTS,
  type ResourceManagerVariant,
} from "@/components/uai/resource-manager";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { ApprovalQueuePreview } from "./approval-queue-preview";
import { AuditLogViewerPreview } from "./audit-log-viewer-preview";
import type { OperationsBlocksItemId } from "./catalog";
import { DataExplorerPreview } from "./data-explorer-preview";
import { ImportWorkflowPreview } from "./import-workflow-preview";
import { IncidentDashboardPreview } from "./incident-dashboard-preview";
import { ReportBuilderPreview } from "./report-builder-preview";
import { ResourceManagerPreview } from "./resource-manager-preview";

const controls: Record<OperationsBlocksItemId, { variants: readonly string[]; label: string }> = {
  "resource-manager": { variants: RESOURCE_MANAGER_VARIANTS, label: "resource manager" },
  "data-explorer": { variants: DATA_EXPLORER_VARIANTS, label: "data explorer" },
  "import-workflow": { variants: IMPORT_WORKFLOW_VARIANTS, label: "import workflow" },
  "approval-queue": { variants: APPROVAL_QUEUE_VARIANTS, label: "approval queue" },
  "audit-log-viewer": { variants: AUDIT_LOG_VIEWER_VARIANTS, label: "audit log viewer" },
  "incident-dashboard": { variants: INCIDENT_DASHBOARD_VARIANTS, label: "incident dashboard" },
  "report-builder": { variants: REPORT_BUILDER_VARIANTS, label: "report builder" },
};

export function getOperationsBlocksPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId as OperationsBlocksItemId];
  if (!control) return undefined;
  return {
    ariaLabel: `${control.label} layout`,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function OperationsBlocksPreview({
  itemId,
  selection,
}: {
  itemId: string;
  selection: string;
}) {
  return (
    <PreviewStage label="Operations">
      <div style={{ width: "100%", maxWidth: 960, minWidth: 0, padding: "24px 0" }}>
        {itemId === "resource-manager" && (
          <ResourceManagerPreview variant={selection as ResourceManagerVariant} />
        )}
        {itemId === "data-explorer" && (
          <DataExplorerPreview variant={selection as DataExplorerVariant} />
        )}
        {itemId === "import-workflow" && (
          <ImportWorkflowPreview variant={selection as ImportWorkflowVariant} />
        )}
        {itemId === "approval-queue" && (
          <ApprovalQueuePreview variant={selection as ApprovalQueueVariant} />
        )}
        {itemId === "audit-log-viewer" && (
          <AuditLogViewerPreview variant={selection as AuditLogViewerVariant} />
        )}
        {itemId === "incident-dashboard" && (
          <IncidentDashboardPreview variant={selection as IncidentDashboardVariant} />
        )}
        {itemId === "report-builder" && (
          <ReportBuilderPreview variant={selection as ReportBuilderVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
