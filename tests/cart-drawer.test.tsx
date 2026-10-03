import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartItemContent, CartItemTitle } from "@/components/ui/uai/cart-item";
import {
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldInput,
  CouponFieldLabel,
} from "@/components/ui/uai/coupon-field";
import { PriceSummaryList, PriceSummaryTotal } from "@/components/ui/uai/price-summary";
import {
  QuantityPickerControl,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
} from "@/components/ui/uai/quantity-picker";
import {
  CART_DRAWER_VARIANTS,
  CartDrawer,
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
  type CartDrawerProps,
  CartDrawerQuantity,
  CartDrawerSummary,
  CartDrawerTitle,
  CartDrawerTrigger,
} from "@/registry/uai/blocks/cart-drawer";

function Fixture({
  onQuantity,
  onApply,
  ...props
}: CartDrawerProps & { onQuantity?: (value: number) => void; onApply?: (code: string) => void }) {
  return (
    <CartDrawer {...props}>
      <CartDrawerTrigger count={3} />
      <CartDrawerContent>
        <CartDrawerHeader>
          <CartDrawerTitle>Your cart</CartDrawerTitle>
          <CartDrawerClose />
        </CartDrawerHeader>
        <CartDrawerBody>
          <CartDrawerItems>
            <CartDrawerItem>
              <CartItemContent>
                <CartItemTitle>Pour-over set</CartItemTitle>
                <CartDrawerQuantity defaultValue={1} onValueChange={onQuantity}>
                  <QuantityPickerLabel>Quantity</QuantityPickerLabel>
                  <QuantityPickerControl>
                    <QuantityPickerInput />
                    <QuantityPickerIncrease />
                  </QuantityPickerControl>
                </CartDrawerQuantity>
              </CartItemContent>
            </CartDrawerItem>
          </CartDrawerItems>
        </CartDrawerBody>
        <CartDrawerFooter>
          <CartDrawerDiscount onApply={onApply}>
            <CouponFieldLabel>Discount code</CouponFieldLabel>
            <CouponFieldControl>
              <CouponFieldInput />
              <CouponFieldApply />
            </CouponFieldControl>
          </CartDrawerDiscount>
          <CartDrawerSummary aria-label="Cart totals">
            <PriceSummaryList>
              <PriceSummaryTotal>$136.00</PriceSummaryTotal>
            </PriceSummaryList>
          </CartDrawerSummary>
          <CartDrawerCheckout href="#checkout">Check out</CartDrawerCheckout>
          <CartDrawerContinue />
        </CartDrawerFooter>
      </CartDrawerContent>
    </CartDrawer>
  );
}

function dialog() {
  return document.querySelector("dialog") as HTMLDialogElement;
}

test("opens a labelled modal drawer, focuses Close, and restores focus to the trigger", async () => {
  const user = userEvent.setup();
  const onOpenChange = mock();
  render(<Fixture onOpenChange={onOpenChange} />);
  const trigger = screen.getByRole("button", { name: "Cart 3 items" });
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(dialog().open).toBe(false);
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(dialog().open).toBe(true);
  expect(trigger.getAttribute("aria-controls")).toBe(dialog().id);
  expect(dialog().getAttribute("aria-labelledby")).toBe(screen.getByText("Your cart").id);
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close cart" }));
  await user.keyboard("{Escape}");
  expect(dialog().open).toBe(false);
  expect(document.activeElement).toBe(trigger);
});

test("updates quantities, applies discounts, and closes from Continue shopping", async () => {
  const user = userEvent.setup();
  const onQuantity = mock();
  const onApply = mock();
  render(<Fixture defaultOpen onQuantity={onQuantity} onApply={onApply} />);
  const items = screen.getByRole("list", { name: "Items in your cart" });
  expect(within(items).getByRole("article", { name: "Pour-over set" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Increase quantity" }));
  expect(onQuantity).toHaveBeenCalledWith(2);
  await user.type(screen.getByLabelText("Discount code"), "studio10{Enter}");
  expect(onApply).toHaveBeenCalledWith("studio10");
  expect(screen.getByRole("region", { name: "Cart totals" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Check out" }).getAttribute("href")).toBe("#checkout");
  await user.click(screen.getByRole("button", { name: "Continue shopping" }));
  expect(dialog().open).toBe(false);
});

test("renders every variant and guards regions", () => {
  for (const variant of CART_DRAWER_VARIANTS) {
    const view = render(<Fixture variant={variant} defaultOpen />);
    expect(view.container.querySelector("dialog")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CartDrawerContent />)).toThrow(
    "CartDrawerContent must be used within CartDrawer",
  );
});
