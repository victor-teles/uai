"use client";

import { useState } from "react";
import { AiPreview, getAiPreviewControl } from "./ai/preview";
import { AiBlocksPreview, getAiBlocksPreviewControl } from "./ai-blocks/preview";
import { AppBlocksPreview, getAppBlocksPreviewControl } from "./app-blocks/preview";
import { BrazilPreview, getBrazilPreviewControl } from "./brazil/preview";
import type { RegistryItemId } from "./catalog";
import { CommerceBlocksPreview, getCommerceBlocksPreviewControl } from "./commerce-blocks/preview";
import { CommunityPreview, getCommunityPreviewControl } from "./community/preview";
import {
  CommunityBlocksPreview,
  getCommunityBlocksPreviewControl,
} from "./community-blocks/preview";
import { CorePreview, getCorePreviewControl } from "./core/preview";
import { DataDisplayPreview, getDataDisplayPreviewControl } from "./data-display/preview";
import { FeedbackPreview, getFeedbackPreviewControl } from "./feedback/preview";
import { FormsPreview, getFormsPreviewControl } from "./forms/preview";
import { getMapsPreviewControl, MapsPreview } from "./maps/preview";
import { getMarketingPreviewControl, MarketingPreview } from "./marketing/preview";
import {
  getMarketingBlocksPreviewControl,
  MarketingBlocksPreview,
} from "./marketing-blocks/preview";
import { getNavigationPreviewControl, NavigationPreview } from "./navigation/preview";
import {
  getOnboardingBlocksPreviewControl,
  OnboardingBlocksPreview,
} from "./onboarding-blocks/preview";
import {
  getOperationsBlocksPreviewControl,
  OperationsBlocksPreview,
} from "./operations-blocks/preview";
import { PannableCanvas } from "./pannable-canvas";
import { type PreviewControl, SegmentedControl } from "./preview-chrome";

const groupPreviews = [
  { getControl: getNavigationPreviewControl, Preview: NavigationPreview },
  { getControl: getFeedbackPreviewControl, Preview: FeedbackPreview },
  { getControl: getDataDisplayPreviewControl, Preview: DataDisplayPreview },
  { getControl: getMarketingPreviewControl, Preview: MarketingPreview },
  { getControl: getCommunityPreviewControl, Preview: CommunityPreview },
  { getControl: getAiPreviewControl, Preview: AiPreview },
  { getControl: getMapsPreviewControl, Preview: MapsPreview },
  { getControl: getMarketingBlocksPreviewControl, Preview: MarketingBlocksPreview },
  { getControl: getOnboardingBlocksPreviewControl, Preview: OnboardingBlocksPreview },
  { getControl: getAppBlocksPreviewControl, Preview: AppBlocksPreview },
  { getControl: getOperationsBlocksPreviewControl, Preview: OperationsBlocksPreview },
  { getControl: getCommerceBlocksPreviewControl, Preview: CommerceBlocksPreview },
  { getControl: getCommunityBlocksPreviewControl, Preview: CommunityBlocksPreview },
  { getControl: getAiBlocksPreviewControl, Preview: AiBlocksPreview },
  { getControl: getBrazilPreviewControl, Preview: BrazilPreview },
  { getControl: getCorePreviewControl, Preview: CorePreview },
] as const;

export function getPreviewControl(itemId: RegistryItemId): PreviewControl | undefined {
  const formsControl = getFormsPreviewControl(itemId);
  if (formsControl) return formsControl;
  for (const group of groupPreviews) {
    const control = group.getControl(itemId);
    if (control) return control;
  }
}

function renderPreview(itemId: RegistryItemId, selection: string) {
  if (getFormsPreviewControl(itemId)) return <FormsPreview itemId={itemId} selection={selection} />;
  for (const { getControl, Preview } of groupPreviews) {
    if (getControl(itemId)) return <Preview itemId={itemId} selection={selection} />;
  }
  return null;
}

export function RegistryPreviewCanvas({
  itemId,
  selection,
}: {
  itemId: RegistryItemId;
  selection: string;
}) {
  return (
    <PannableCanvas resetKey={`${itemId}:${selection}`}>
      {renderPreview(itemId, selection)}
    </PannableCanvas>
  );
}

export function RegistryVariants({
  control,
  value,
  onChange,
}: {
  control: PreviewControl;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="uai-registry-variants">
      <SegmentedControl
        ariaLabel={control.ariaLabel}
        value={value}
        onChange={onChange}
        options={control.options}
      />
    </div>
  );
}

/** Self-contained specimen with its variant switch underneath, used on the overview. */
export function RegistryPreview({ itemId }: { itemId: RegistryItemId }) {
  const control = getPreviewControl(itemId);
  const [selection, setSelection] = useState(control?.defaultValue ?? "");

  return (
    <div className="uai-registry-showcase">
      <RegistryPreviewCanvas itemId={itemId} selection={selection} />
      {control ? (
        <RegistryVariants control={control} value={selection} onChange={setSelection} />
      ) : null}
    </div>
  );
}
