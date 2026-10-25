import { ADDRESS_FORM_VARIANTS, type AddressFormVariant } from "@/components/uai/address-form";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { AddressFormPreview } from "./address-form-preview";

const widths: Record<string, number> = { stacked: 440, split: 800, compact: 340 };

export const entry: PreviewEntry = {
  control: variantControl("address form variant", ADDRESS_FORM_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={widths[selection] ?? 800}>
      <AddressFormPreview variant={selection as AddressFormVariant} />
    </SpecimenStage>
  ),
};
