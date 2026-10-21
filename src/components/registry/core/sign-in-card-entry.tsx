import { SIGN_IN_CARD_VARIANTS, type SignInCardVariant } from "@/components/ui/uai/sign-in-card";
import type { PreviewEntry } from "../preview-chrome";
import { SignInCardPreview } from "./sign-in-card-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Sign-in card variant",
  defaultValue: "card",
  options: options(SIGN_IN_CARD_VARIANTS, {
    card: { label: "Card", scene: "Workspace sign-in" },
    split: { label: "Split", scene: "Authentication page" },
    compact: { label: "Compact", scene: "Account prompt" },
  }),
  stageClassName: "uai-preview-stage--sign-in",
  contentClassName: "uai-preview-medium",
  render: (selection) => <SignInCardPreview variant={selection as SignInCardVariant} />,
});
