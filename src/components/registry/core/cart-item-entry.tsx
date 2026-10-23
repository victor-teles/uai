import { CART_ITEM_VARIANTS, type CartItemVariant } from "@/components/ui/uai/cart-item";
import type { PreviewEntry } from "../preview-chrome";
import { CartItemPreview } from "./cart-item-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Cart item variant",
  defaultValue: "card",
  options: options(CART_ITEM_VARIANTS, {
    card: { label: "Card", scene: "Shopping cart" },
    plain: { label: "Plain", scene: "Checkout review" },
    compact: { label: "Compact", scene: "Cart drawer" },
  }),
  contentClassName: "uai-preview-medium",
  render: (selection) => <CartItemPreview variant={selection as CartItemVariant} />,
});
