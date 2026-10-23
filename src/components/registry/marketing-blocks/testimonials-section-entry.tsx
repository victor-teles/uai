import {
  TESTIMONIALS_SECTION_VARIANTS,
  type TestimonialsSectionVariant,
} from "@/components/uai/testimonials-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { TestimonialsSectionPreview } from "./testimonials-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("testimonials section variant", TESTIMONIALS_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={960}>
      <TestimonialsSectionPreview variant={selection as TestimonialsSectionVariant} />
    </SpecimenStage>
  ),
};
