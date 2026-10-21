import {
  TESTIMONIAL_CARD_VARIANTS,
  type TestimonialCardVariant,
} from "@/components/ui/uai/testimonial-card";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { TestimonialCardPreview } from "./testimonial-card-preview";

export const entry: PreviewEntry = {
  control: variantControl("testimonial card variant", TESTIMONIAL_CARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing and conversion" maxWidth={480}>
      <TestimonialCardPreview variant={selection as TestimonialCardVariant} />
    </SpecimenStage>
  ),
};
