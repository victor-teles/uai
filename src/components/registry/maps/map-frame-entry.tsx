import { MAP_FRAME_VARIANTS, type MapFrameVariant } from "@/components/ui/uai/map-frame";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MapFramePreview, type MapFramePreviewState } from "./map-frame-preview";

export const entry: PreviewEntry = {
  control: variantControl("map frame variant", MAP_FRAME_VARIANTS, [
    { id: "loading", label: "Loading" },
    { id: "error", label: "Error" },
    { id: "empty", label: "Empty results" },
  ]),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={640}>
      {MAP_FRAME_VARIANTS.includes(selection as MapFrameVariant) ? (
        <MapFramePreview variant={selection as MapFrameVariant} />
      ) : (
        <MapFramePreview state={selection as MapFramePreviewState} />
      )}
    </SpecimenStage>
  ),
};
