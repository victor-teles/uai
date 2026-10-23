import { CEP_FIELD_VARIANTS, type CepFieldVariant } from "@/components/ui/uai/cep-field";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CepFieldPreview } from "./cep-field-preview";

export const entry: PreviewEntry = {
  control: variantControl("CEP field variant", CEP_FIELD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Brazil" maxWidth={400} minHeight={180}>
      <CepFieldPreview variant={selection as CepFieldVariant} />
    </SpecimenStage>
  ),
};
