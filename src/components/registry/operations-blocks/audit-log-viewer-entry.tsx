import {
  AUDIT_LOG_VIEWER_VARIANTS,
  type AuditLogViewerVariant,
} from "@/components/uai/audit-log-viewer";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AuditLogViewerPreview } from "./audit-log-viewer-preview";

export const entry: PreviewEntry = {
  control: variantControl("audit log viewer layout", AUDIT_LOG_VIEWER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <AuditLogViewerPreview variant={selection as AuditLogViewerVariant} />
    </SpecimenStage>
  ),
};
