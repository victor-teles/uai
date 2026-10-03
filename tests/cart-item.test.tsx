import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  CART_ITEM_VARIANTS,
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
} from "@/registry/uai/components/cart-item";
import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
} from "@/registry/uai/components/quantity-picker";

function CartItemFixture({
  variant = "card",
  removing = false,
  onRemove,
}: {
  variant?: CartItemVariant;
  removing?: boolean;
  onRemove?: () => void;
}) {
  return (
    <CartItem variant={variant}>
      <CartItemMedia>Product image</CartItemMedia>
      <CartItemContent>
        <CartItemHeader>
          <div>
            <CartItemTitle>Everyday Tote</CartItemTitle>
            <CartItemDescription>Heavyweight natural canvas</CartItemDescription>
          </div>
          <CartItemPrice>$96.00</CartItemPrice>
        </CartItemHeader>
        <CartItemOptions>
          <CartItemOption label="Color">Natural</CartItemOption>
          <CartItemOption label="Size">One size</CartItemOption>
        </CartItemOptions>
        <CartItemAvailability>In stock · ships in 1–2 days</CartItemAvailability>
        <CartItemActions>
          <QuantityPicker defaultValue={2} min={1} max={5}>
            <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
            <QuantityPickerControl>
              <QuantityPickerDecrease />
              <QuantityPickerInput />
              <QuantityPickerIncrease />
            </QuantityPickerControl>
            <QuantityPickerMessage className="sr-only">Maximum 5 per order</QuantityPickerMessage>
          </QuantityPicker>
          <CartItemRemove removing={removing} onClick={onRemove} />
        </CartItemActions>
      </CartItemContent>
    </CartItem>
  );
}

test("labels the cart line and preserves product-option semantics", () => {
  const { container } = render(<CartItemFixture />);
  const article = container.querySelector("article");
  const heading = screen.getByRole("heading", { name: "Everyday Tote" });

  expect(article?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(container.querySelectorAll("dl")).toHaveLength(1);
  expect(container.querySelectorAll("dt")).toHaveLength(2);
  expect(container.querySelectorAll("dd")).toHaveLength(2);
  expect(screen.getByText("$96.00").className).toContain("tabular-nums");
  expect(screen.getByRole("spinbutton", { name: "Quantity for Everyday Tote" })).toBeTruthy();
});

test("renders card, plain, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<CartItemFixture variant="card" />);
  const article = container.querySelector("article");

  expect(CART_ITEM_VARIANTS).toEqual(["card", "plain", "compact"]);
  expect(article?.dataset.variant).toBe("card");
  expect(article?.style.borderRadius).toBe("14px");
  expect(article?.style.padding).toBe("16px");

  rerender(<CartItemFixture variant="plain" />);
  expect(article?.dataset.variant).toBe("plain");
  expect(article?.style.borderRadius).toBe("0px");
  expect(article?.className).toContain("bg-transparent");

  rerender(<CartItemFixture variant="compact" />);
  expect(article?.dataset.variant).toBe("compact");
  expect(article?.style.borderRadius).toBe("12px");
  expect(article?.style.padding).toBe("12px");
  expect(screen.getByRole("heading").className).toContain("text-[13px]");
});

test("keeps availability meaning visible for every tone", () => {
  const { rerender } = render(
    <CartItem>
      <CartItemTitle>Everyday Tote</CartItemTitle>
      <CartItemAvailability tone="available">In stock</CartItemAvailability>
    </CartItem>,
  );

  expect(screen.getByText("In stock").className).toContain("text-[var(--uai-success)]");

  rerender(
    <CartItem>
      <CartItemTitle>Everyday Tote</CartItemTitle>
      <CartItemAvailability tone="low">Only 2 left</CartItemAvailability>
    </CartItem>,
  );
  expect(screen.getByText("Only 2 left").className).toContain("text-[var(--uai-warning)]");

  rerender(
    <CartItem>
      <CartItemTitle>Everyday Tote</CartItemTitle>
      <CartItemAvailability tone="unavailable">Unavailable</CartItemAvailability>
    </CartItem>,
  );
  expect(screen.getByText("Unavailable").className).toContain("text-[var(--uai-danger)]");
});

test("keeps removal consumer-controlled and blocks duplicate actions", async () => {
  const user = userEvent.setup();
  const onRemove = mock(() => {});
  const { rerender } = render(<CartItemFixture onRemove={onRemove} />);

  const remove = screen.getByRole("button", { name: "Remove" });
  expect(remove.getAttribute("type")).toBe("button");
  await user.click(remove);
  expect(onRemove).toHaveBeenCalledTimes(1);

  rerender(<CartItemFixture removing onRemove={onRemove} />);
  const removing = screen.getByRole("button", { name: "Removing…" });
  expect((removing as HTMLButtonElement).disabled).toBe(true);
  expect(removing.getAttribute("aria-busy")).toBe("true");
});

test("contains long localized product content", () => {
  render(
    <CartItem variant="compact">
      <CartItemTitle>Limited-edition heavyweight carryall for everyday travel</CartItemTitle>
      <CartItemOptions>
        <CartItemOption label="Acabamento">Azul petróleo com alças reforçadas</CartItemOption>
      </CartItemOptions>
      <CartItemPrice>R$ 123.456.789,00</CartItemPrice>
    </CartItem>,
  );

  expect(screen.getByRole("heading").className).toContain("[overflow-wrap:anywhere]");
  expect(screen.getByText("Azul petróleo com alças reforçadas").className).toContain(
    "[overflow-wrap:anywhere]",
  );
  expect(screen.getByText("R$ 123.456.789,00").className).not.toContain("truncate");
});

test("compound cart item children require their root", () => {
  expect(() => render(<CartItemRemove />)).toThrow("CartItemRemove must be used within CartItem");
});
