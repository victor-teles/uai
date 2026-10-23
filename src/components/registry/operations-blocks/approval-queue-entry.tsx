import {
  APPROVAL_QUEUE_VARIANTS,
  type ApprovalQueueVariant,
} from "@/components/uai/approval-queue";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ApprovalQueuePreview } from "./approval-queue-preview";

export const entry: PreviewEntry = {
  control: variantControl("approval queue layout", APPROVAL_QUEUE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <ApprovalQueuePreview variant={selection as ApprovalQueueVariant} />
    </SpecimenStage>
  ),
};
