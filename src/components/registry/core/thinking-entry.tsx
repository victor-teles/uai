import { THINKING_VARIANTS, type ThinkingVariant } from "@/components/ui/uai/thinking";
import type { PreviewEntry } from "../preview-chrome";
import { coreEntry, options } from "./stage";
import { ThinkingPreview } from "./thinking-preview";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Thinking variant",
  defaultValue: "card",
  options: options(THINKING_VARIANTS, {
    card: { label: "Card", scene: "Response panel" },
    inline: { label: "Inline", scene: "Chat transcript" },
    compact: { label: "Compact", scene: "Sidebar run" },
  }),
  contentClassName: "uai-preview-narrow",
  render: (selection) => <ThinkingPreview variant={selection as ThinkingVariant} />,
});
