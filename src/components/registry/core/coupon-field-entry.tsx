import { COUPON_FIELD_VARIANTS, type CouponFieldVariant } from "@/components/ui/uai/coupon-field";
import type { PreviewEntry } from "../preview-chrome";
import { CouponFieldPreview } from "./coupon-field-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "Coupon field variant",
  defaultValue: "rounded",
  options: options(COUPON_FIELD_VARIANTS, {
    rounded: { label: "Rounded", scene: "Checkout summary" },
    pill: { label: "Pill", scene: "Promotion panel" },
    compact: { label: "Compact", scene: "Cart drawer" },
  }),
  contentClassName: "uai-preview-medium",
  render: (selection) => <CouponFieldPreview variant={selection as CouponFieldVariant} />,
});
