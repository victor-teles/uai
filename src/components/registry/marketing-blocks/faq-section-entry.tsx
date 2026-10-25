import { FAQ_SECTION_VARIANTS, type FaqSectionVariant } from "@/components/uai/faq-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { FaqSectionPreview } from "./faq-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("FAQ section variant", FAQ_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={840}>
      <FaqSectionPreview variant={selection as FaqSectionVariant} />
    </SpecimenStage>
  ),
};
