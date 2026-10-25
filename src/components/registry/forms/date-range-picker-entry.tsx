import {
  DATE_RANGE_PICKER_VARIANTS,
  type DateRangePickerVariant,
} from "@/components/ui/uai/date-range-picker";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { DateRangePickerPreview } from "./date-range-picker-preview";

export const entry: PreviewEntry = {
  control: variantControl("date range picker variant", DATE_RANGE_PICKER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Forms and usability" maxWidth={440}>
      <DateRangePickerPreview variant={selection as DateRangePickerVariant} />
    </SpecimenStage>
  ),
};
