import {
  PIX_AUTOMATICO_VARIANTS,
  type PixAutomaticoVariant,
} from "@/components/ui/uai/pix-automatico";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PixAutomaticoPreview } from "./pix-automatico-preview";

export const entry: PreviewEntry = {
  control: variantControl("Pix Autom\u00e1tico variant", PIX_AUTOMATICO_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={560}>
      <PixAutomaticoPreview variant={selection as PixAutomaticoVariant} />
    </SpecimenStage>
  ),
};
