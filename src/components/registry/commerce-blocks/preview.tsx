"use client";

import { CART_DRAWER_VARIANTS, type CartDrawerVariant } from "@/components/uai/cart-drawer";
import { CHECKOUT_VARIANTS, type CheckoutVariant } from "@/components/uai/checkout";
import {
  ORDER_TRACKING_VARIANTS,
  type OrderTrackingVariant,
} from "@/components/uai/order-tracking";
import {
  PRODUCT_DETAIL_VARIANTS,
  type ProductDetailVariant,
} from "@/components/uai/product-detail";
import {
  PRODUCT_LISTING_VARIANTS,
  type ProductListingVariant,
} from "@/components/uai/product-listing";
import {
  SUBSCRIPTION_MANAGEMENT_VARIANTS,
  type SubscriptionManagementVariant,
} from "@/components/uai/subscription-management";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { CartDrawerPreview } from "./cart-drawer-preview";
import { CheckoutPreview } from "./checkout-preview";
import { OrderTrackingPreview } from "./order-tracking-preview";
import { ProductDetailPreview } from "./product-detail-preview";
import { ProductListingPreview } from "./product-listing-preview";
import { SubscriptionManagementPreview } from "./subscription-management-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "product-detail": { label: "product detail variant", variants: PRODUCT_DETAIL_VARIANTS },
  "product-listing": { label: "product listing variant", variants: PRODUCT_LISTING_VARIANTS },
  "cart-drawer": { label: "cart drawer variant", variants: CART_DRAWER_VARIANTS },
  checkout: { label: "checkout variant", variants: CHECKOUT_VARIANTS },
  "order-tracking": { label: "order tracking variant", variants: ORDER_TRACKING_VARIANTS },
  "subscription-management": {
    label: "subscription management variant",
    variants: SUBSCRIPTION_MANAGEMENT_VARIANTS,
  },
};

const widths: Record<string, number> = {
  "cart-drawer": 480,
};

export function getCommerceBlocksPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function CommerceBlocksPreview({
  itemId,
  selection,
}: {
  itemId: string;
  selection: string;
}) {
  return (
    <PreviewStage label="Commerce">
      <div
        style={{
          width: "100%",
          maxWidth: widths[itemId] ?? 960,
          minWidth: 0,
          padding: "24px 0",
          display: itemId === "cart-drawer" ? "grid" : undefined,
          justifyItems: itemId === "cart-drawer" ? "center" : undefined,
        }}
      >
        {itemId === "product-detail" && (
          <ProductDetailPreview variant={selection as ProductDetailVariant} />
        )}
        {itemId === "product-listing" && (
          <ProductListingPreview variant={selection as ProductListingVariant} />
        )}
        {itemId === "cart-drawer" && <CartDrawerPreview variant={selection as CartDrawerVariant} />}
        {itemId === "checkout" && <CheckoutPreview variant={selection as CheckoutVariant} />}
        {itemId === "order-tracking" && (
          <OrderTrackingPreview variant={selection as OrderTrackingVariant} />
        )}
        {itemId === "subscription-management" && (
          <SubscriptionManagementPreview variant={selection as SubscriptionManagementVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
