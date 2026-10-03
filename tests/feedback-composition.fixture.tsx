import { ActivityTimelinePreview } from "@/components/registry/feedback/activity-timeline-preview";
import { ConfirmationDialogPreview } from "@/components/registry/feedback/confirmation-dialog-preview";
import { InlineFeedbackPreview } from "@/components/registry/feedback/inline-feedback-preview";
import { ProgressSummaryPreview } from "@/components/registry/feedback/progress-summary-preview";
import { SkeletonGroupPreview } from "@/components/registry/feedback/skeleton-group-preview";
import { StatusBannerPreview } from "@/components/registry/feedback/status-banner-preview";

export function FeedbackCompositionFixture() {
  return (
    <>
      <StatusBannerPreview />
      <ProgressSummaryPreview />
      <InlineFeedbackPreview />
      <ConfirmationDialogPreview />
      <ActivityTimelinePreview />
      <SkeletonGroupPreview />
    </>
  );
}
