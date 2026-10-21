import { EMPTY_STATE_VARIANTS, type EmptyStateVariant } from "@/components/ui/uai/empty-state";
import type { PreviewEntry } from "../preview-chrome";
import { EmptyStatePreview } from "./empty-state-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Empty state variant",
  defaultValue: "page",
  options: options(EMPTY_STATE_VARIANTS, {
    card: { label: "Card", scene: "Project page" },
    plain: { label: "Plain", scene: "Existing panel" },
    compact: { label: "Compact", scene: "Sidebar section" },
    page: { label: "404 Page", scene: "Not-found route" },
  }),
  stageClassName: (selection) =>
    selection === "page" ? "uai-preview-stage--empty-page" : undefined,
  contentClassName: (selection) => (selection === "page" ? undefined : "uai-preview-narrow"),
  render: (selection) => <EmptyStatePreview variant={selection as EmptyStateVariant} />,
});
