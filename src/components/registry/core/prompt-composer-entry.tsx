import {
  PROMPT_COMPOSER_VARIANTS,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import type { PreviewEntry } from "../preview-chrome";
import { PromptComposerPreview } from "./prompt-composer-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Composer variant",
  defaultValue: "rounded",
  options: options(PROMPT_COMPOSER_VARIANTS, {
    rounded: { label: "Rounded", scene: "Floating card" },
    pill: { label: "Pill", scene: "Capsule" },
    ghost: { label: "Ghost", scene: "Dock" },
    compact: { label: "Compact", scene: "Sidebar" },
  }),
  render: (selection) => (
    <div className="uai-prompt-frame" data-scene={selection}>
      <div className={selection === "ghost" ? "uai-prompt-dock" : undefined}>
        <PromptComposerPreview variant={selection as PromptComposerVariant} />
      </div>
    </div>
  ),
});
