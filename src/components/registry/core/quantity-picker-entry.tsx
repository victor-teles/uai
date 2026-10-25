import {
  QUANTITY_PICKER_VARIANTS,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";
import type { PreviewEntry } from "../preview-chrome";
import { QuantityPickerPreview } from "./quantity-picker-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Quantity picker variant",
  defaultValue: "rounded",
  options: options(QUANTITY_PICKER_VARIANTS, {
    rounded: { label: "Rounded", scene: "Product detail" },
    pill: { label: "Pill", scene: "Cart line" },
    compact: { label: "Compact", scene: "Cart drawer" },
  }),
  contentClassName: "uai-preview-medium",
  render: (selection) => <QuantityPickerPreview variant={selection as QuantityPickerVariant} />,
});
