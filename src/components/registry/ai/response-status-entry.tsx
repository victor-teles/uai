import {
  RESPONSE_STATUS_VARIANTS,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ResponseStatusPreview } from "./response-status-preview";

export const entry: PreviewEntry = {
  control: variantControl("response status variant", RESPONSE_STATUS_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <ResponseStatusPreview variant={selection as ResponseStatusVariant} />
    </SpecimenStage>
  ),
};
