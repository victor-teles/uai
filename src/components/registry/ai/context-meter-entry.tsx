import {
  CONTEXT_METER_VARIANTS,
  type ContextMeterVariant,
} from "@/components/ui/uai/context-meter";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ContextMeterPreview } from "./context-meter-preview";

export const entry: PreviewEntry = {
  control: variantControl("context meter variant", CONTEXT_METER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <ContextMeterPreview variant={selection as ContextMeterVariant} />
    </SpecimenStage>
  ),
};
