import { CartDrawerPreview } from "@/components/registry/commerce-blocks/cart-drawer-preview";
import { CheckoutPreview } from "@/components/registry/commerce-blocks/checkout-preview";
import { OrderTrackingPreview } from "@/components/registry/commerce-blocks/order-tracking-preview";
import { ProductDetailPreview } from "@/components/registry/commerce-blocks/product-detail-preview";
import { ProductListingPreview } from "@/components/registry/commerce-blocks/product-listing-preview";
import { SubscriptionManagementPreview } from "@/components/registry/commerce-blocks/subscription-management-preview";

export function CommerceBlocksCompositionFixture() {
  return (
    <>
      <ProductDetailPreview />
      <ProductListingPreview />
      <CartDrawerPreview />
      <CheckoutPreview />
      <OrderTrackingPreview />
      <SubscriptionManagementPreview />
    </>
  );
}
