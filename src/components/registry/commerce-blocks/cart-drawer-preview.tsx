"use client";

import { useState } from "react";
import {
  CartDrawer,
  CartDrawerActions,
  CartDrawerBody,
  CartDrawerCheckout,
  CartDrawerClose,
  CartDrawerContent,
  CartDrawerContinue,
  CartDrawerDiscount,
  CartDrawerFooter,
  CartDrawerHeader,
  CartDrawerItem,
  CartDrawerItems,
  CartDrawerQuantity,
  CartDrawerSummary,
  CartDrawerTitle,
  CartDrawerTrigger,
  type CartDrawerVariant,
} from "@/components/uai/cart-drawer";
import {
  CartItemActions,
  CartItemAvailability,
  CartItemContent,
  CartItemHeader,
  CartItemMedia,
  CartItemPrice,
  CartItemRemove,
  CartItemTitle,
} from "@/components/ui/uai/cart-item";
import {
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
  type CouponFieldStatus,
} from "@/components/ui/uai/coupon-field";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTotal,
} from "@/components/ui/uai/price-summary";
import {
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
} from "@/components/ui/uai/quantity-picker";

const initialLines = [
  { id: "pour-over", name: "Stoneware pour-over set", price: 68, quantity: 1, stock: 14 },
  { id: "tumbler", name: "Low tumbler, set of 2", price: 34, quantity: 2, stock: 3 },
];

export function CartDrawerPreview({ variant = "side" }: { variant?: CartDrawerVariant }) {
  const [lines, setLines] = useState(initialLines);
  const [code, setCode] = useState<string>();
  const [couponStatus, setCouponStatus] = useState<CouponFieldStatus>("idle");
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const discount = code ? Math.round(subtotal * 0.1) : 0;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <CartDrawer variant={variant}>
      <CartDrawerTrigger count={count} />
      <CartDrawerContent>
        <CartDrawerHeader>
          <CartDrawerTitle>Your cart</CartDrawerTitle>
          <CartDrawerClose />
        </CartDrawerHeader>
        <CartDrawerBody>
          {lines.length === 0 ? (
            <EmptyState variant="plain">
              <EmptyStateContent>
                <EmptyStateHeader>
                  <EmptyStateTitle>Your cart is empty</EmptyStateTitle>
                  <EmptyStateDescription>Saved items stay in your account.</EmptyStateDescription>
                </EmptyStateHeader>
              </EmptyStateContent>
            </EmptyState>
          ) : (
            <CartDrawerItems>
              {lines.map((line) => (
                <CartDrawerItem key={line.id}>
                  <CartItemMedia>
                    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                      <rect width="100" height="100" fill="#ecebe8" />
                      <rect x="28" y="38" width="44" height="42" rx="12" fill="#8f8c86" />
                    </svg>
                  </CartItemMedia>
                  <CartItemContent>
                    <CartItemHeader>
                      <CartItemTitle>{line.name}</CartItemTitle>
                      <CartItemPrice>${line.price * line.quantity}</CartItemPrice>
                    </CartItemHeader>
                    {line.stock < 5 ? (
                      <CartItemAvailability tone="low">Only {line.stock} left</CartItemAvailability>
                    ) : null}
                    <CartItemActions>
                      <CartDrawerQuantity
                        value={line.quantity}
                        max={line.stock}
                        onValueChange={(quantity) =>
                          setLines((current) =>
                            current.map((item) =>
                              item.id === line.id ? { ...item, quantity } : item,
                            ),
                          )
                        }
                      >
                        <QuantityPickerLabel>Quantity</QuantityPickerLabel>
                        <QuantityPickerControl>
                          <QuantityPickerDecrease />
                          <QuantityPickerInput />
                          <QuantityPickerIncrease />
                        </QuantityPickerControl>
                      </CartDrawerQuantity>
                      <CartItemRemove
                        aria-label={`Remove ${line.name}`}
                        onClick={() =>
                          setLines((current) => current.filter((item) => item.id !== line.id))
                        }
                      />
                    </CartItemActions>
                  </CartItemContent>
                </CartDrawerItem>
              ))}
            </CartDrawerItems>
          )}
        </CartDrawerBody>
        {lines.length > 0 ? (
          <CartDrawerFooter>
            <CartDrawerDiscount
              status={couponStatus}
              appliedCode={code}
              onApply={(next) => {
                setCouponStatus("applying");
                setTimeout(() => {
                  if (next.toUpperCase() === "STUDIO10") {
                    setCode("STUDIO10");
                    setCouponStatus("applied");
                  } else {
                    setCouponStatus("error");
                  }
                }, 600);
              }}
              onValueChange={(value) => {
                if (!value) {
                  setCode(undefined);
                  setCouponStatus("idle");
                }
              }}
            >
              <CouponFieldLabel>Discount code</CouponFieldLabel>
              <CouponFieldControl>
                <CouponFieldInput />
                <CouponFieldApply />
              </CouponFieldControl>
              <CouponFieldFeedback>
                <CouponFieldMessage>
                  {couponStatus === "applied"
                    ? "STUDIO10 saves 10% on this order."
                    : couponStatus === "error"
                      ? "That code is not valid. Try STUDIO10."
                      : couponStatus === "applying"
                        ? "Checking code…"
                        : ""}
                </CouponFieldMessage>
                <CouponFieldRemove />
              </CouponFieldFeedback>
            </CartDrawerDiscount>
            <CartDrawerSummary aria-label="Cart totals">
              <PriceSummaryList>
                <PriceSummaryItem label="Subtotal">${subtotal}.00</PriceSummaryItem>
                {discount ? (
                  <PriceSummaryItem label="Discount" tone="success">
                    −${discount}.00
                  </PriceSummaryItem>
                ) : null}
                <PriceSummaryItem label="Shipping" tone="muted">
                  Calculated at checkout
                </PriceSummaryItem>
                <PriceSummaryTotal label="Estimated total">
                  ${subtotal - discount}.00
                </PriceSummaryTotal>
              </PriceSummaryList>
              <PriceSummaryNote>Taxes are calculated at checkout.</PriceSummaryNote>
            </CartDrawerSummary>
            <CartDrawerActions>
              <CartDrawerCheckout href="#checkout">Check out</CartDrawerCheckout>
              <CartDrawerContinue />
            </CartDrawerActions>
          </CartDrawerFooter>
        ) : null}
      </CartDrawerContent>
    </CartDrawer>
  );
}
