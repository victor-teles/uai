import {
  ROUTE_SUMMARY_VARIANTS,
  type RouteSummaryVariant,
} from "@/components/ui/uai/route-summary";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { RouteSummaryPreview } from "./route-summary-preview";

export const entry: PreviewEntry = {
  control: variantControl("route summary variant", ROUTE_SUMMARY_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Maps" center maxWidth={400}>
      <RouteSummaryPreview variant={selection as RouteSummaryVariant} />
    </SpecimenStage>
  ),
};
