import {
  ACTIVITY_TIMELINE_VARIANTS,
  type ActivityTimelineVariant,
} from "@/components/ui/uai/activity-timeline";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ActivityTimelinePreview } from "./activity-timeline-preview";

export const entry: PreviewEntry = {
  control: variantControl("activity timeline variant", ACTIVITY_TIMELINE_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Feedback and state" maxWidth={460}>
      <ActivityTimelinePreview variant={selection as ActivityTimelineVariant} />
    </SpecimenStage>
  ),
};
