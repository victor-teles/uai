import {
  PRICE_SUMMARY_VARIANTS,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";
import type { PreviewEntry } from "../preview-chrome";
import { PriceSummaryPreview } from "./price-summary-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Price summary variant",
  defaultValue: "card",
  options: options(PRICE_SUMMARY_VARIANTS, {
    card: { label: "Card", scene: "Checkout sidebar" },
    plain: { label: "Plain", scene: "Payment step" },
    compact: { label: "Compact", scene: "Cart drawer" },
  }),
  contentClassName: "uai-preview-narrow",
  render: (selection) => <PriceSummaryPreview variant={selection as PriceSummaryVariant} />,
});
