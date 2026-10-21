import { ORDER_STATUS_VARIANTS, type OrderStatusVariant } from "@/components/ui/uai/order-status";
import type { PreviewEntry } from "../preview-chrome";
import { OrderStatusPreview } from "./order-status-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Order status variant",
  defaultValue: "card",
  options: options(ORDER_STATUS_VARIANTS, {
    card: { label: "Card", scene: "Account order" },
    plain: { label: "Plain", scene: "Confirmation page" },
    compact: { label: "Compact", scene: "Order drawer" },
  }),
  contentClassName: "uai-preview-narrow",
  render: (selection) => <OrderStatusPreview variant={selection as OrderStatusVariant} />,
});
