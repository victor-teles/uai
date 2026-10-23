import {
  CONTACT_SECTION_VARIANTS,
  type ContactSectionVariant,
} from "@/components/uai/contact-section";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ContactSectionPreview } from "./contact-section-preview";

export const entry: PreviewEntry = {
  control: variantControl("contact section variant", CONTACT_SECTION_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Marketing sites" maxWidth={960}>
      <ContactSectionPreview variant={selection as ContactSectionVariant} />
    </SpecimenStage>
  ),
};
