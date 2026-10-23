import { FORM_FIELD_VARIANTS, type FormFieldVariant } from "@/components/ui/uai/form-field";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FormFieldPreview } from "./form-field-preview";

export const entry: PreviewEntry = {
  control: variantControl("form field variant", FORM_FIELD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <FormFieldPreview variant={selection as FormFieldVariant} />
    </SpecimenStage>
  ),
};
