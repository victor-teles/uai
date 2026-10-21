import {
  IMPORT_WORKFLOW_VARIANTS,
  type ImportWorkflowVariant,
} from "@/components/uai/import-workflow";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ImportWorkflowPreview } from "./import-workflow-preview";

export const entry: PreviewEntry = {
  control: variantControl("import workflow layout", IMPORT_WORKFLOW_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <ImportWorkflowPreview variant={selection as ImportWorkflowVariant} />
    </SpecimenStage>
  ),
};
