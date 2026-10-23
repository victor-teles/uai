import {
  CALENDAR_VIEW_VARIANTS,
  type CalendarViewVariant,
} from "@/components/ui/uai/calendar-view";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CalendarViewPreview } from "./calendar-view-preview";

export const entry: PreviewEntry = {
  control: variantControl("calendar view variant", CALENDAR_VIEW_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={860}>
      <CalendarViewPreview variant={selection as CalendarViewVariant} />
    </SpecimenStage>
  ),
};
