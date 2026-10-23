import {
  INSTALLMENT_PICKER_VARIANTS,
  type InstallmentPickerVariant,
} from "@/components/ui/uai/installment-picker";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { InstallmentPickerPreview } from "./installment-picker-preview";

export const entry: PreviewEntry = {
  control: variantControl("installment picker variant", INSTALLMENT_PICKER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={400}>
      <InstallmentPickerPreview variant={selection as InstallmentPickerVariant} />
    </SpecimenStage>
  ),
};
