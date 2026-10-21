import {
  FORM_ERROR_SUMMARY_VARIANTS,
  type FormErrorSummaryVariant,
} from "@/components/ui/uai/form-error-summary";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FormErrorSummaryPreview } from "./form-error-summary-preview";

export const entry: PreviewEntry = {
  control: variantControl("form error summary variant", FORM_ERROR_SUMMARY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <FormErrorSummaryPreview variant={selection as FormErrorSummaryVariant} />
    </SpecimenStage>
  ),
};
