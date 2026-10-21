import { SIGN_UP_CARD_VARIANTS, type SignUpCardVariant } from "@/components/ui/uai/sign-up-card";
import type { PreviewEntry } from "../preview-chrome";
import { SignUpCardPreview } from "./sign-up-card-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Sign-up card variant",
  defaultValue: "card",
  options: options(SIGN_UP_CARD_VARIANTS, {
    card: { label: "Card", scene: "Account creation" },
    split: { label: "Split", scene: "Sign-up page" },
    compact: { label: "Compact", scene: "Team invitation" },
  }),
  stageClassName: "uai-preview-stage--sign-in",
  contentClassName: "uai-preview-medium",
  render: (selection) => <SignUpCardPreview variant={selection as SignUpCardVariant} />,
});
