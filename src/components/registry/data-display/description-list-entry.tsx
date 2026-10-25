import {
  DESCRIPTION_LIST_VARIANTS,
  type DescriptionListVariant,
} from "@/components/ui/uai/description-list";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DescriptionListPreview } from "./description-list-preview";

export const entry: PreviewEntry = {
  control: variantControl("description list variant", DESCRIPTION_LIST_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={520}>
      <DescriptionListPreview variant={selection as DescriptionListVariant} />
    </SpecimenStage>
  ),
};
