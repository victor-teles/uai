import {
  PASSWORD_RECOVERY_VARIANTS,
  type PasswordRecoveryVariant,
} from "@/components/ui/uai/password-recovery";
import type { PreviewEntry } from "../preview-chrome";
import { PasswordRecoveryPreview } from "./password-recovery-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Password recovery variant",
  defaultValue: "card",
  options: options(PASSWORD_RECOVERY_VARIANTS, {
    card: { label: "Card", scene: "Recovery dialog" },
    split: { label: "Split", scene: "Recovery page" },
    compact: { label: "Compact", scene: "Account support" },
  }),
  stageClassName: "uai-preview-stage--sign-in",
  contentClassName: "uai-preview-medium",
  render: (selection) => <PasswordRecoveryPreview variant={selection as PasswordRecoveryVariant} />,
});
