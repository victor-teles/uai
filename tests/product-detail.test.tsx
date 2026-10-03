import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGalleryItem, ProductGalleryThumbnails } from "@/components/ui/uai/product-gallery";
import {
  QuantityPickerControl,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
} from "@/components/ui/uai/quantity-picker";
import {
  PRODUCT_DETAIL_VARIANTS,
  ProductDetail,
  ProductDetailAddToCart,
  ProductDetailAvailability,
  ProductDetailComparePrice,
  ProductDetailGallery,
  ProductDetailInfo,
  ProductDetailOption,
  ProductDetailOptionValue,
  ProductDetailPrice,
  type ProductDetailProps,
  ProductDetailPurchase,
  ProductDetailQuantity,
  ProductDetailTitle,
} from "@/registry/uai/blocks/product-detail";

function Fixture({
  onValueChange,
  ...props
}: ProductDetailProps & { onValueChange?: (value: string) => void }) {
  return (
    <ProductDetail {...props}>
      <ProductDetailGallery defaultValue="front">
        <ProductGalleryThumbnails aria-label="Images">
          <ProductGalleryItem value="front" src="data:image/png;base64," alt="Front view" />
        </ProductGalleryThumbnails>
      </ProductDetailGallery>
      <ProductDetailInfo>
        <ProductDetailTitle>Pour-over set</ProductDetailTitle>
        <ProductDetailPrice>
          $68 <ProductDetailComparePrice>$84</ProductDetailComparePrice>
        </ProductDetailPrice>
        <ProductDetailPurchase>
          <ProductDetailOption name="glaze" label="Glaze" onValueChange={onValueChange}>
            <ProductDetailOptionValue value="ash">Ash</ProductDetailOptionValue>
            <ProductDetailOptionValue value="moss">Moss</ProductDetailOptionValue>
            <ProductDetailOptionValue value="clay" disabled>
              Clay
            </ProductDetailOptionValue>
          </ProductDetailOption>
          <ProductDetailAvailability tone="low">Only 3 left</ProductDetailAvailability>
          <ProductDetailQuantity defaultValue={1} max={3}>
            <QuantityPickerLabel>Quantity</QuantityPickerLabel>
            <QuantityPickerControl>
              <QuantityPickerInput name="quantity" />
              <QuantityPickerIncrease />
            </QuantityPickerControl>
          </ProductDetailQuantity>
          <ProductDetailAddToCart />
        </ProductDetailPurchase>
      </ProductDetailInfo>
    </ProductDetail>
  );
}

test("submits the selected option and quantity and reports pending state", async () => {
  const user = userEvent.setup();
  let resolve: () => void = () => {};
  const onAddToCart = mock((_data: FormData) => new Promise<void>((done) => (resolve = done)));
  const onValueChange = mock();
  render(<Fixture onAddToCart={onAddToCart} onValueChange={onValueChange} />);
  expect(screen.getByRole("region", { name: "Pour-over set" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Product images" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Glaze" })).toBeTruthy();
  expect((screen.getByRole("radio", { name: "Clay" }) as HTMLInputElement).disabled).toBe(true);
  await user.click(screen.getByRole("radio", { name: "Moss" }));
  expect(onValueChange).toHaveBeenCalledWith("moss");
  await user.click(screen.getByRole("button", { name: "Increase quantity" }));
  await user.click(screen.getByRole("button", { name: "Add to cart" }));
  expect(onAddToCart).toHaveBeenCalledTimes(1);
  const data = onAddToCart.mock.calls[0]?.[0] as FormData;
  expect(data.get("glaze")).toBe("moss");
  expect(data.get("quantity")).toBe("2");
  const pending = screen.getByRole("button", { name: "Adding…" }) as HTMLButtonElement;
  expect(pending.disabled).toBe(true);
  expect(pending.getAttribute("aria-busy")).toBe("true");
  resolve();
  await waitFor(() => expect(screen.getByRole("button", { name: "Add to cart" })).toBeTruthy());
});

test("supports arrow-key option selection and announces availability", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const ash = screen.getByRole("radio", { name: "Ash" });
  await user.click(ash);
  await user.keyboard("{ArrowRight}");
  expect((screen.getByRole("radio", { name: "Moss" }) as HTMLInputElement).checked).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Only 3 left");
  expect(screen.getByText("$84").closest("s")?.textContent).toBe("Was $84");
});

test("renders every variant and guards regions", () => {
  for (const variant of PRODUCT_DETAIL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ProductDetailTitle />)).toThrow(
    "ProductDetailTitle must be used within ProductDetail",
  );
  expect(() =>
    render(
      <ProductDetail>
        <ProductDetailOptionValue value="x">X</ProductDetailOptionValue>
      </ProductDetail>,
    ),
  ).toThrow("ProductDetailOptionValue must be used within ProductDetailOption");
});
