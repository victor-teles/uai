import { HERO_SECTION_VARIANTS, type HeroSectionVariant } from "@/components/uai/hero-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { HeroSectionPreview } from "./hero-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("hero section variant", HERO_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={960}>
      <HeroSectionPreview variant={selection as HeroSectionVariant} />
    </SpecimenStage>
  ),
};
