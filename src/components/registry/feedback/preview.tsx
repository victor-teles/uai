"use client";

import {
  ACTIVITY_TIMELINE_VARIANTS,
  type ActivityTimelineVariant,
} from "@/components/ui/uai/activity-timeline";
import {
  CONFIRMATION_DIALOG_VARIANTS,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";
import {
  INLINE_FEEDBACK_VARIANTS,
  type InlineFeedbackVariant,
} from "@/components/ui/uai/inline-feedback";
import {
  PROGRESS_SUMMARY_VARIANTS,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";
import {
  SKELETON_GROUP_VARIANTS,
  type SkeletonGroupVariant,
} from "@/components/ui/uai/skeleton-group";
import {
  STATUS_BANNER_VARIANTS,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";
import type { PreviewControl } from "../preview-chrome";
import { PreviewStage } from "../preview-chrome";
import { ActivityTimelinePreview } from "./activity-timeline-preview";
import { ConfirmationDialogPreview } from "./confirmation-dialog-preview";
import { InlineFeedbackPreview } from "./inline-feedback-preview";
import { ProgressSummaryPreview } from "./progress-summary-preview";
import { SkeletonGroupPreview } from "./skeleton-group-preview";
import { StatusBannerPreview } from "./status-banner-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "status-banner": { label: "status banner variant", variants: STATUS_BANNER_VARIANTS },
  "progress-summary": { label: "progress summary variant", variants: PROGRESS_SUMMARY_VARIANTS },
  "inline-feedback": { label: "inline feedback variant", variants: INLINE_FEEDBACK_VARIANTS },
  "confirmation-dialog": {
    label: "confirmation dialog variant",
    variants: CONFIRMATION_DIALOG_VARIANTS,
  },
  "activity-timeline": { label: "activity timeline variant", variants: ACTIVITY_TIMELINE_VARIANTS },
  "skeleton-group": { label: "skeleton group variant", variants: SKELETON_GROUP_VARIANTS },
};

export function getFeedbackPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function FeedbackPreview({ itemId, selection }: { itemId: string; selection: string }) {
  if (!controls[itemId]) return null;
  return (
    <PreviewStage label="Feedback and state">
      <div
        style={{
          width: "100%",
          maxWidth: itemId === "status-banner" || itemId === "progress-summary" ? 560 : 460,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "status-banner" && (
          <StatusBannerPreview variant={selection as StatusBannerVariant} />
        )}
        {itemId === "progress-summary" && (
          <ProgressSummaryPreview variant={selection as ProgressSummaryVariant} />
        )}
        {itemId === "inline-feedback" && (
          <InlineFeedbackPreview variant={selection as InlineFeedbackVariant} />
        )}
        {itemId === "confirmation-dialog" && (
          <ConfirmationDialogPreview variant={selection as ConfirmationDialogVariant} />
        )}
        {itemId === "activity-timeline" && (
          <ActivityTimelinePreview variant={selection as ActivityTimelineVariant} />
        )}
        {itemId === "skeleton-group" && (
          <SkeletonGroupPreview variant={selection as SkeletonGroupVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
