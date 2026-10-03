"use client";

import { RotateCcw, Truck } from "lucide-react";
import { useState } from "react";
import {
  ProductDetail,
  ProductDetailActions,
  ProductDetailAddToCart,
  ProductDetailAvailability,
  ProductDetailComparePrice,
  ProductDetailDelivery,
  ProductDetailDeliveryItem,
  ProductDetailDescription,
  ProductDetailEyebrow,
  ProductDetailGallery,
  ProductDetailHeader,
  ProductDetailInfo,
  ProductDetailOption,
  ProductDetailOptionValue,
  ProductDetailPrice,
  ProductDetailPurchase,
  ProductDetailQuantity,
  ProductDetailSecondaryAction,
  ProductDetailTitle,
  type ProductDetailVariant,
} from "@/components/uai/product-detail";
import {
  ProductGalleryItem,
  ProductGalleryThumbnails,
  ProductGalleryViewport,
  ProductGalleryZoom,
} from "@/components/ui/uai/product-gallery";
import {
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
} from "@/components/ui/uai/quantity-picker";

function placeholder(shapes: string) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
    '<rect width="400" height="400" fill="#ecebe8"/>' +
    shapes +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const glazes = [
  { value: "ash", label: "Ash", swatch: "#b5b2ab", stock: 14 },
  { value: "moss", label: "Moss", swatch: "#7d8a6a", stock: 3 },
  { value: "clay", label: "Clay", swatch: "#b07a5c", stock: 0 },
];

const views = [
  {
    value: "front",
    alt: "Pour-over set from the front: a dripper resting on a squat carafe.",
    shapes:
      '<ellipse cx="200" cy="330" rx="120" ry="14" fill="#d8d6d1"/>' +
      '<rect x="130" y="210" width="140" height="120" rx="30" fill="#8f8c86"/>' +
      '<path d="M135 110h130l-34 100h-62z" fill="#b5b2ab"/>',
  },
  {
    value: "top",
    alt: "Top-down view into the dripper showing three drainage holes.",
    shapes:
      '<circle cx="200" cy="200" r="130" fill="#b5b2ab"/>' +
      '<circle cx="200" cy="200" r="80" fill="#a19e97"/>' +
      '<circle cx="184" cy="190" r="7" fill="#5f5c57"/>' +
      '<circle cx="216" cy="190" r="7" fill="#5f5c57"/>' +
      '<circle cx="200" cy="218" r="7" fill="#5f5c57"/>',
  },
  {
    value: "detail",
    alt: "Close-up of the unglazed foot ring with visible speckles in the clay.",
    shapes:
      '<rect x="40" y="150" width="320" height="100" rx="50" fill="#8f8c86"/>' +
      '<rect x="40" y="200" width="320" height="50" rx="25" fill="#c9c5bd"/>' +
      '<circle cx="120" cy="224" r="4" fill="#6d6a64"/>' +
      '<circle cx="210" cy="218" r="3" fill="#6d6a64"/>',
  },
];

export function ProductDetailPreview({ variant = "split" }: { variant?: ProductDetailVariant }) {
  const [glaze, setGlaze] = useState("ash");
  const [added, setAdded] = useState("");
  const selected = glazes.find((item) => item.value === glaze) ?? glazes[0];
  return (
    <ProductDetail
      variant={variant}
      onAddToCart={async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const choice = glazes.find((item) => item.value === data.get("glaze"));
        setAdded(`Added ${data.get("quantity")} × ${choice?.label} set to your cart.`);
      }}
    >
      <ProductDetailGallery defaultValue="front">
        <ProductGalleryViewport>
          <ProductGalleryZoom />
        </ProductGalleryViewport>
        <ProductGalleryThumbnails aria-label="Pour-over set images">
          {views.map((view) => (
            <ProductGalleryItem
              key={view.value}
              value={view.value}
              src={placeholder(view.shapes)}
              alt={view.alt}
            />
          ))}
        </ProductGalleryThumbnails>
      </ProductDetailGallery>
      <ProductDetailInfo>
        <ProductDetailHeader>
          <ProductDetailEyebrow>Fieldhouse Ceramics · Brewing</ProductDetailEyebrow>
          <ProductDetailTitle>Stoneware pour-over set</ProductDetailTitle>
          <ProductDetailPrice>
            $68
            <ProductDetailComparePrice>$84</ProductDetailComparePrice>
          </ProductDetailPrice>
        </ProductDetailHeader>
        <ProductDetailDescription>
          A wheel-thrown dripper and 600 ml carafe. Three drainage holes give a steady 3-minute brew
          for one or two cups.
        </ProductDetailDescription>
        <ProductDetailPurchase>
          <ProductDetailOption
            name="glaze"
            label="Glaze"
            selection={selected?.label}
            onValueChange={setGlaze}
          >
            {glazes.map((item) => (
              <ProductDetailOptionValue
                key={item.value}
                value={item.value}
                swatch={item.swatch}
                defaultChecked={item.value === "ash"}
                disabled={item.stock === 0}
              >
                {item.label}
                {item.stock === 0 ? " · Sold out" : ""}
              </ProductDetailOptionValue>
            ))}
          </ProductDetailOption>
          <ProductDetailAvailability tone={selected && selected.stock < 5 ? "low" : "available"}>
            {selected && selected.stock < 5
              ? `Only ${selected.stock} left in ${selected.label}`
              : "In stock, ships in 1–2 business days"}
          </ProductDetailAvailability>
          <ProductDetailActions>
            <ProductDetailQuantity defaultValue={1} max={selected?.stock || 1}>
              <QuantityPickerLabel>Quantity</QuantityPickerLabel>
              <QuantityPickerControl>
                <QuantityPickerDecrease />
                <QuantityPickerInput name="quantity" />
                <QuantityPickerIncrease />
              </QuantityPickerControl>
            </ProductDetailQuantity>
            <ProductDetailAddToCart />
            <ProductDetailSecondaryAction>Save</ProductDetailSecondaryAction>
          </ProductDetailActions>
          <p role="status" style={{ margin: 0, color: "var(--uai-muted)", minHeight: 18 }}>
            {added}
          </p>
        </ProductDetailPurchase>
        <ProductDetailDelivery>
          <ProductDetailDeliveryItem label="Free delivery" icon={<Truck size={16} />}>
            Arrives Thu, Oct 9 when you order within 4 hours.
          </ProductDetailDeliveryItem>
          <ProductDetailDeliveryItem label="30-day returns" icon={<RotateCcw size={16} />}>
            Unused pieces in original packaging.
          </ProductDetailDeliveryItem>
        </ProductDetailDelivery>
      </ProductDetailInfo>
    </ProductDetail>
  );
}
