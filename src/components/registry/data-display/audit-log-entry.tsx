import { AUDIT_LOG_VARIANTS, type AuditLogVariant } from "@/components/ui/uai/audit-log";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AuditLogPreview } from "./audit-log-preview";

export const entry: PreviewEntry = {
  control: variantControl("audit log variant", AUDIT_LOG_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={520}>
      <AuditLogPreview variant={selection as AuditLogVariant} />
    </SpecimenStage>
  ),
};
