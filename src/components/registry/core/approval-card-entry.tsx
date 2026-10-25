import type { PreviewEntry } from "../preview-chrome";
import {
  ApprovalCardPreview,
  type ApprovalScenario,
  approvalScenarios,
} from "./approval-card-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Approval card variant",
  defaultValue: "compact",
  options: options(approvalScenarios, {
    compact: { label: "Compact", scene: "Routine action" },
    detailed: { label: "Detailed", scene: "Impact review" },
    critical: { label: "Critical", scene: "Protected action" },
    error: { label: "Error", scene: "Recovery state" },
  }),
  stageClassName: (selection) =>
    selection === "critical"
      ? "uai-preview-stage--approval-critical"
      : selection === "compact"
        ? undefined
        : "uai-preview-stage--approval-detailed",
  contentClassName: "uai-preview-medium",
  render: (selection) => <ApprovalCardPreview scenario={selection as ApprovalScenario} />,
});
