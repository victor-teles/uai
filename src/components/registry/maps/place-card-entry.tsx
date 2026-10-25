import { PLACE_CARD_VARIANTS, type PlaceCardVariant } from "@/components/ui/uai/place-card";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { PlaceCardPreview } from "./place-card-preview";

export const entry: PreviewEntry = {
  control: variantControl("place card variant", PLACE_CARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={640}>
      <PlaceCardPreview variant={selection as PlaceCardVariant} />
    </SpecimenStage>
  ),
};
