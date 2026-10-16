"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CartItem,
  CartItemActions,
  CartItemAvailability,
  CartItemContent,
  CartItemDescription,
  CartItemHeader,
  CartItemMedia,
  CartItemOption,
  CartItemOptions,
  CartItemPrice,
  CartItemRemove,
  CartItemTitle,
  type CartItemVariant,
} from "@/components/ui/uai/cart-item";
import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";

const cartItemQuantityVariant: Record<CartItemVariant, QuantityPickerVariant> = {
  card: "rounded",
  plain: "pill",
  compact: "compact",
};

export function CartItemPreview({ variant = "card" }: { variant?: CartItemVariant }) {
  const [quantity, setQuantity] = useState(2);
  const [removing, setRemoving] = useState(false);
  const removeTimerRef = useRef<number | null>(null);
  const atLimit = quantity === 5;

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    };
  }, []);

  function removeItem() {
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    setRemoving(true);
    removeTimerRef.current = window.setTimeout(() => setRemoving(false), 900);
  }

  return (
    <div className={variant === "compact" ? "w-full max-w-[360px]" : "w-full max-w-[480px]"}>
      <CartItem variant={variant}>
        <CartItemMedia role="img" aria-label="Natural canvas Everyday Tote">
          <div className="flex size-full items-center justify-center text-[var(--uai-muted)]">
            <ShoppingBag className="size-8" strokeWidth={1.35} aria-hidden="true" />
          </div>
        </CartItemMedia>
        <CartItemContent>
          <CartItemHeader>
            <div className="min-w-0">
              <CartItemTitle>Everyday Tote</CartItemTitle>
              <CartItemDescription>Heavyweight natural canvas</CartItemDescription>
            </div>
            <CartItemPrice>${(quantity * 48).toFixed(2)}</CartItemPrice>
          </CartItemHeader>
          <CartItemOptions>
            <CartItemOption label="Color">Natural</CartItemOption>
            <CartItemOption label="Size">One size</CartItemOption>
          </CartItemOptions>
          <CartItemAvailability tone={atLimit ? "low" : "available"} role="status">
            {atLimit ? "Order limit reached · 5 available" : "In stock · ships in 1–2 days"}
          </CartItemAvailability>
          <CartItemActions>
            <QuantityPicker
              variant={cartItemQuantityVariant[variant]}
              value={quantity}
              onValueChange={setQuantity}
              min={1}
              max={5}
            >
              <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
              <QuantityPickerControl>
                <QuantityPickerDecrease />
                <QuantityPickerInput />
                <QuantityPickerIncrease />
              </QuantityPickerControl>
              <QuantityPickerMessage className="sr-only">Maximum 5 per order</QuantityPickerMessage>
            </QuantityPicker>
            <CartItemRemove removing={removing} onClick={removeItem} />
          </CartItemActions>
        </CartItemContent>
      </CartItem>
    </div>
  );
}
