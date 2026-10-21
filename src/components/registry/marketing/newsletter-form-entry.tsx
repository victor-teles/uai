import {
  NEWSLETTER_FORM_VARIANTS,
  type NewsletterFormVariant,
} from "@/components/ui/uai/newsletter-form";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { NewsletterFormPreview } from "./newsletter-form-preview";

export const entry: PreviewEntry = {
  control: variantControl("newsletter form variant", NEWSLETTER_FORM_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={440}>
      <NewsletterFormPreview variant={selection as NewsletterFormVariant} />
    </SpecimenStage>
  ),
};
