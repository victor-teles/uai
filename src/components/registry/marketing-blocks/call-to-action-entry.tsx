import { CALL_TO_ACTION_VARIANTS, type CallToActionVariant } from "@/components/uai/call-to-action";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CallToActionPreview } from "./call-to-action-preview";

export const entry: PreviewEntry = {
  control: variantControl("call to action variant", CALL_TO_ACTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={760}>
      <CallToActionPreview variant={selection as CallToActionVariant} />
    </SpecimenStage>
  ),
};
