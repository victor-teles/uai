"use client";

import { useState } from "react";
import type { RegistryItemId } from "./catalog";
import { PannableCanvas } from "./pannable-canvas";
import { type PreviewControl, SegmentedControl } from "./preview-chrome";
import { previewEntries } from "./preview-entries.generated";

export function getPreviewControl(itemId: RegistryItemId): PreviewControl | undefined {
  return previewEntries[itemId]?.control;
}

function renderPreview(itemId: RegistryItemId, selection: string) {
  return previewEntries[itemId]?.render(selection) ?? null;
}

export function RegistryPreviewCanvas({
  itemId,
  selection,
}: {
  itemId: RegistryItemId;
  selection: string;
}) {
  return (
    <PannableCanvas
      resetKey={`${itemId}:${selection}`}
      className={`uai-registry-specimen--${itemId}`}
    >
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
