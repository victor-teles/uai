import { METRIC_CARD_VARIANTS, type MetricCardVariant } from "@/components/ui/uai/metric-card";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { MetricCardPreview } from "./metric-card-preview";

export const entry: PreviewEntry = {
  control: variantControl("metric card variant", METRIC_CARD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={600}>
      <MetricCardPreview variant={selection as MetricCardVariant} />
    </SpecimenStage>
  ),
};
