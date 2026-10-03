import { CreditCard, LayoutGrid, PackageSearch, Repeat, ShoppingBag, Truck } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type CommerceBlocksItemId =
  | "product-detail"
  | "product-listing"
  | "cart-drawer"
  | "checkout"
  | "order-tracking"
  | "subscription-management";

export const commerceBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "product-detail",
    name: "Product Detail",
    category: "Commerce",
    icon: PackageSearch,
    description: "Gallery, options, availability, price, delivery, and purchase actions.",
    usage: `"use client";

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
  return \`data:image/svg+xml,\${encodeURIComponent(svg)}\`;
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
        setAdded(\`Added \${data.get("quantity")} × \${choice?.label} set to your cart.\`);
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
              ? \`Only \${selected.stock} left in \${selected.label}\`
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
`,
    accessibility: [
      "The block is a section labelled by the product title; the gallery is a named group built on Product Gallery.",
      "Each option is a fieldset with a visible legend and native radio inputs, so arrow keys move between values and sold-out values stay listed but disabled.",
      "Availability is a polite status region whose text carries the meaning; the colored dot is decorative.",
      "Add to cart submits a real form, so required options use native validation; the button reports aria-busy while the cart responds.",
      'A compare-at price is struck through and prefixed with visually hidden "Was" text.',
    ],
  },
  {
    id: "product-listing",
    name: "Product Listing",
    category: "Commerce",
    icon: LayoutGrid,
    description: "Categories, filters, sorting, result counts, and pagination.",
    usage: `"use client";

import { useState } from "react";
import {
  ProductListing,
  ProductListingAside,
  ProductListingBody,
  ProductListingCategories,
  ProductListingCategory,
  ProductListingCount,
  ProductListingDescription,
  ProductListingFilters,
  ProductListingHeader,
  ProductListingMain,
  ProductListingPage,
  ProductListingPageNext,
  ProductListingPagePrevious,
  ProductListingPagination,
  ProductListingProduct,
  ProductListingProductBadge,
  ProductListingProductMedia,
  ProductListingProductMeta,
  ProductListingProductName,
  ProductListingProductPrice,
  ProductListingResults,
  ProductListingSort,
  ProductListingTitle,
  ProductListingToolbar,
  type ProductListingVariant,
} from "@/components/uai/product-listing";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";

const products = [
  { name: "Stoneware pour-over set", glaze: "Ash", price: 68, inStock: true, tone: "#8f8c86" },
  { name: "Low tumbler, set of 2", glaze: "Moss", price: 34, inStock: true, tone: "#7d8a6a" },
  { name: "Serving bowl, 24 cm", glaze: "Clay", price: 52, inStock: false, tone: "#b07a5c" },
  { name: "Espresso cup and saucer", glaze: "Ash", price: 26, inStock: true, tone: "#a19e97" },
  { name: "Bud vase, tall", glaze: "Moss", price: 22, inStock: true, tone: "#6f7a5e" },
  { name: "Dinner plate, 27 cm", glaze: "Clay", price: 30, inStock: true, tone: "#9c6b52" },
];

export function ProductListingPreview({ variant = "grid" }: { variant?: ProductListingVariant }) {
  const [glaze, setGlaze] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const results = products
    .filter((item) => (!glaze || item.glaze === glaze) && (!inStock || item.inStock))
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0,
    );
  const filters = (
    <ProductListingFilters
      activeCount={Number(Boolean(glaze)) + Number(inStock)}
      onReset={() => {
        setGlaze("");
        setInStock(false);
      }}
    >
      <FilterBarControls>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Glaze
          <select value={glaze} onChange={(event) => setGlaze(event.target.value)}>
            <option value="">All glazes</option>
            <option>Ash</option>
            <option>Moss</option>
            <option>Clay</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
          />
          In stock only
        </label>
      </FilterBarControls>
      <FilterBarChips>
        {glaze && <FilterBarChip onRemove={() => setGlaze("")}>Glaze: {glaze}</FilterBarChip>}
        {inStock && <FilterBarChip onRemove={() => setInStock(false)}>In stock</FilterBarChip>}
      </FilterBarChips>
      <FilterBarReset />
    </ProductListingFilters>
  );
  return (
    <ProductListing variant={variant}>
      <ProductListingHeader>
        <ProductListingTitle>Tableware</ProductListingTitle>
        <ProductListingDescription>
          Small-batch stoneware, glazed and fired in our studio.
        </ProductListingDescription>
      </ProductListingHeader>
      <ProductListingCategories>
        <ProductListingCategory href="#all">All</ProductListingCategory>
        <ProductListingCategory href="#tableware" current>
          Tableware
        </ProductListingCategory>
        <ProductListingCategory href="#brewing">Brewing</ProductListingCategory>
        <ProductListingCategory href="#vases">Vases</ProductListingCategory>
      </ProductListingCategories>
      <ProductListingBody>
        {variant === "sidebar" ? <ProductListingAside>{filters}</ProductListingAside> : null}
        <ProductListingMain>
          {variant === "sidebar" ? null : filters}
          <ProductListingToolbar>
            <ProductListingCount>
              {results.length} of {products.length} products
            </ProductListingCount>
            <ProductListingSort value={sort} onValueChange={setSort}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </ProductListingSort>
          </ProductListingToolbar>
          {results.length === 0 ? (
            <EmptyState variant="plain">
              <EmptyStateContent>
                <EmptyStateHeader>
                  <EmptyStateTitle>No products match these filters</EmptyStateTitle>
                  <EmptyStateDescription>
                    Try another glaze or include items that are back-ordered.
                  </EmptyStateDescription>
                </EmptyStateHeader>
                <EmptyStateActions>
                  <EmptyStateAction
                    onClick={() => {
                      setGlaze("");
                      setInStock(false);
                    }}
                  >
                    Clear filters
                  </EmptyStateAction>
                </EmptyStateActions>
              </EmptyStateContent>
            </EmptyState>
          ) : (
            <ProductListingResults>
              {results.map((item) => (
                <ProductListingProduct key={item.name}>
                  <ProductListingProductMedia>
                    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                      <ellipse cx="50" cy="80" rx="26" ry="3" fill="oklch(0 0 0 / 0.12)" />
                      <rect x="28" y="40" width="44" height="40" rx="12" fill={item.tone} />
                    </svg>
                  </ProductListingProductMedia>
                  <ProductListingProductName href={\`#\${item.name}\`}>
                    {item.name}
                  </ProductListingProductName>
                  <ProductListingProductMeta>
                    {item.glaze} glaze{item.inStock ? "" : " · Back-ordered"}
                  </ProductListingProductMeta>
                  <ProductListingProductPrice>\${item.price}</ProductListingProductPrice>
                  {item.price < 25 ? (
                    <ProductListingProductBadge>Under $25</ProductListingProductBadge>
                  ) : null}
                </ProductListingProduct>
              ))}
            </ProductListingResults>
          )}
          <ProductListingPagination>
            <ProductListingPagePrevious disabled href="#page-0" />
            <ProductListingPage href="#page-1" current>
              1
            </ProductListingPage>
            <ProductListingPage href="#page-2">2</ProductListingPage>
            <ProductListingPage href="#page-3">3</ProductListingPage>
            <ProductListingPageNext href="#page-2" />
          </ProductListingPagination>
        </ProductListingMain>
      </ProductListingBody>
    </ProductListing>
  );
}
`,
    accessibility: [
      'Categories and pagination are labelled nav landmarks of real links; the current entry carries aria-current="page".',
      "The result count is a polite status region, so filter and sort changes are announced without moving focus.",
      "Sort is a labelled native select; filters are Filter Bar controls with named remove buttons on each chip.",
      "Each product is a list item labelled by its h3 name; the name link stretches across the card and shows one visible focus ring on the card.",
      "Disabled previous and next links drop their href and set aria-disabled.",
    ],
  },
  {
    id: "cart-drawer",
    name: "Cart Drawer",
    category: "Commerce",
    icon: ShoppingBag,
    description: "Review items, quantities, discounts, totals, and checkout actions.",
    usage: `"use client";

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
                      <CartItemPrice>\${line.price * line.quantity}</CartItemPrice>
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
                        aria-label={\`Remove \${line.name}\`}
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
                <PriceSummaryItem label="Subtotal">\${subtotal}.00</PriceSummaryItem>
                {discount ? (
                  <PriceSummaryItem label="Discount" tone="success">
                    −\${discount}.00
                  </PriceSummaryItem>
                ) : null}
                <PriceSummaryItem label="Shipping" tone="muted">
                  Calculated at checkout
                </PriceSummaryItem>
                <PriceSummaryTotal label="Estimated total">
                  \${subtotal - discount}.00
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
`,
    accessibility: [
      "The drawer is a native modal dialog labelled by its title; the page behind it is inert while it is open.",
      "Opening moves focus to the close button (or an autofocus element); Escape, the backdrop, Close, and Continue shopping return focus to the trigger.",
      "The trigger includes the item count in its accessible name and exposes aria-haspopup, aria-expanded, and aria-controls.",
      "Cart lines are list items built on Cart Item; quantity uses Quantity Picker and discounts use Coupon Field with live feedback.",
      "The slide-in motion is removed under prefers-reduced-motion.",
    ],
  },
  {
    id: "checkout",
    name: "Checkout",
    category: "Commerce",
    icon: CreditCard,
    description: "Guide contact, delivery, payment, review, and confirmation.",
    usage: `"use client";

import { useState } from "react";
import {
  Checkout,
  CheckoutConfirmation,
  CheckoutConfirmationTitle,
  CheckoutDescription,
  CheckoutError,
  CheckoutFieldRow,
  CheckoutHeader,
  CheckoutMain,
  CheckoutPayment,
  CheckoutPaymentNote,
  CheckoutPlaceOrder,
  CheckoutProgress,
  CheckoutProgressStep,
  CheckoutSection,
  CheckoutSectionContinue,
  CheckoutSectionEdit,
  CheckoutSectionForm,
  CheckoutSectionHeader,
  CheckoutSectionSummary,
  CheckoutSectionTitle,
  CheckoutSummary,
  CheckoutSummaryTotals,
  CheckoutTitle,
  type CheckoutVariant,
} from "@/components/uai/checkout";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryTitle,
  PriceSummaryTotal,
} from "@/components/ui/uai/price-summary";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

const steps = ["contact", "delivery", "payment", "review"] as const;
const labels = { contact: "Contact", delivery: "Delivery", payment: "Payment", review: "Review" };

function PaymentPlaceholder({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "var(--uai-surface)",
          boxShadow: "inset 0 0 0 1px var(--uai-border)",
          color: "var(--uai-subtle)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CheckoutPreview({ variant = "split" }: { variant?: CheckoutVariant }) {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const field = (name: string, label: string, type = "text", autoComplete?: string) => (
    <FormField required variant={variant === "compact" ? "compact" : "outlined"}>
      <FormFieldLabel>{label}</FormFieldLabel>
      <FormFieldInput name={name} type={type} autoComplete={autoComplete} />
    </FormField>
  );
  return (
    <Checkout
      variant={variant}
      steps={steps}
      onStepComplete={(_step, data) =>
        setEntries((current) => ({
          ...current,
          ...Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value)])),
        }))
      }
      onPlaceOrder={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAttempts((count) => count + 1);
        if (attempts === 0) throw new Error("declined");
      }}
    >
      <CheckoutHeader>
        <CheckoutTitle>Checkout</CheckoutTitle>
        <CheckoutDescription>Fieldhouse Ceramics · 3 items</CheckoutDescription>
      </CheckoutHeader>
      <CheckoutProgress>
        {steps.map((step, index) => (
          <CheckoutProgressStep key={step} value={step}>
            {index + 1}. {labels[step]}
          </CheckoutProgressStep>
        ))}
      </CheckoutProgress>
      <CheckoutMain>
        <CheckoutSection value="contact">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Contact</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>{entries.email}</CheckoutSectionSummary>
          <CheckoutSectionForm>
            {field("email", "Email", "email", "email")}
            <CheckoutSectionContinue>Continue to delivery</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="delivery">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Delivery</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>
            {entries.name}, {entries.address}, {entries.postal}
          </CheckoutSectionSummary>
          <CheckoutSectionForm>
            {field("name", "Full name", "text", "name")}
            {field("address", "Street address", "text", "street-address")}
            <CheckoutFieldRow>
              {field("city", "City", "text", "address-level2")}
              {field("postal", "Postal code", "text", "postal-code")}
            </CheckoutFieldRow>
            <CheckoutSectionContinue>Continue to payment</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="payment">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Payment</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>Visa ending in 4242 · expires 08/29</CheckoutSectionSummary>
          <CheckoutSectionForm>
            <CheckoutPayment>
              <PaymentPlaceholder label="Card number" value="Hosted by your payment provider" />
              <CheckoutFieldRow>
                <PaymentPlaceholder label="Expiry" value="MM / YY" />
                <PaymentPlaceholder label="Security code" value="•••" />
              </CheckoutFieldRow>
              <CheckoutPaymentNote>
                Placeholder region. Card fields come from your payment provider; this preview
                collects nothing.
              </CheckoutPaymentNote>
            </CheckoutPayment>
            <CheckoutSectionContinue>Review order</CheckoutSectionContinue>
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="review">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Review</CheckoutSectionTitle>
          </CheckoutSectionHeader>
          <CheckoutSectionForm>
            <p style={{ margin: 0, color: "var(--uai-muted)" }}>
              Check your details, then place the order. The first attempt in this preview is
              declined so you can see the error state.
            </p>
            <CheckoutError>
              <StatusBannerTitle>Your card was declined</StatusBannerTitle>
              <StatusBannerDescription>
                Nothing was charged. Try again or use another payment method.
              </StatusBannerDescription>
            </CheckoutError>
            <CheckoutPlaceOrder>Place order · $142.00</CheckoutPlaceOrder>
          </CheckoutSectionForm>
        </CheckoutSection>
      </CheckoutMain>
      <CheckoutConfirmation>
        <CheckoutConfirmationTitle>Order FH-20418 is confirmed</CheckoutConfirmationTitle>
        <p style={{ margin: 0 }}>
          A receipt is on its way to {entries.email || "your inbox"}. We will email tracking as soon
          as your order ships.
        </p>
      </CheckoutConfirmation>
      <CheckoutSummary>
        <CheckoutSummaryTotals>
          <PriceSummaryHeader>
            <PriceSummaryTitle>Order summary</PriceSummaryTitle>
          </PriceSummaryHeader>
          <PriceSummaryList>
            <PriceSummaryItem label="Pour-over set × 1">$68.00</PriceSummaryItem>
            <PriceSummaryItem label="Low tumbler × 2">$68.00</PriceSummaryItem>
            <PriceSummaryItem label="Shipping" tone="success">
              Free
            </PriceSummaryItem>
            <PriceSummaryItem label="Tax" tone="muted">
              $6.00
            </PriceSummaryItem>
            <PriceSummaryTotal>$142.00</PriceSummaryTotal>
          </PriceSummaryList>
        </CheckoutSummaryTotals>
      </CheckoutSummary>
    </Checkout>
  );
}
`,
    accessibility: [
      "Each step is a labelled section with a native form, so required fields validate before the step completes.",
      'Continue and Edit move focus to the heading of the step that opens; completed headings include visually hidden ", complete" text.',
      'Step Indicator mirrors progress with aria-current="step" on the current step.',
      "The payment slot is a labelled fieldset for provider-hosted fields; the block never renders card inputs.",
      "A rejected order shows an assertive Status Banner; a placed order replaces the steps with a status region whose heading receives focus.",
    ],
  },
  {
    id: "order-tracking",
    name: "Order Tracking",
    category: "Commerce",
    icon: Truck,
    description: "Status, shipment events, delivery estimates, and support.",
    usage: `"use client";

import {
  OrderTracking,
  OrderTrackingColumn,
  OrderTrackingDescription,
  OrderTrackingDetails,
  OrderTrackingEarlierEvents,
  OrderTrackingEstimate,
  OrderTrackingEvent,
  OrderTrackingEvents,
  OrderTrackingHeader,
  OrderTrackingHeading,
  OrderTrackingPanel,
  OrderTrackingStatus,
  OrderTrackingSupport,
  OrderTrackingSupportAction,
  OrderTrackingSupportActions,
  OrderTrackingTitle,
  type OrderTrackingVariant,
} from "@/components/uai/order-tracking";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  OrderStatusBadge,
  OrderStatusHeader,
  OrderStatusProgress,
  OrderStatusStep,
  OrderStatusStepDescription,
  OrderStatusStepTitle,
  OrderStatusTitle,
} from "@/components/ui/uai/order-status";

export function OrderTrackingPreview({ variant = "split" }: { variant?: OrderTrackingVariant }) {
  return (
    <OrderTracking variant={variant}>
      <OrderTrackingHeader>
        <OrderTrackingHeading>
          <OrderTrackingTitle>Order FH-20418</OrderTrackingTitle>
          <OrderTrackingDescription>Placed Oct 2 · 3 items · $142.00</OrderTrackingDescription>
        </OrderTrackingHeading>
        <OrderTrackingEstimate>Thu, Oct 9 by 8 PM</OrderTrackingEstimate>
      </OrderTrackingHeader>
      <OrderTrackingColumn>
        <OrderTrackingStatus>
          <OrderStatusHeader>
            <OrderStatusTitle>Shipment progress</OrderStatusTitle>
            <OrderStatusBadge tone="progress">In transit</OrderStatusBadge>
          </OrderStatusHeader>
          <OrderStatusProgress>
            <OrderStatusStep status="complete">
              <OrderStatusStepTitle>Order confirmed</OrderStatusStepTitle>
              <OrderStatusStepDescription>Oct 2, 2:14 PM</OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="complete">
              <OrderStatusStepTitle>Packed and shipped</OrderStatusStepTitle>
              <OrderStatusStepDescription>Oct 4 from Portland, OR</OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="current">
              <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
              <OrderStatusStepDescription>Arriving at your local hub</OrderStatusStepDescription>
            </OrderStatusStep>
            <OrderStatusStep status="upcoming">
              <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
            </OrderStatusStep>
          </OrderStatusProgress>
        </OrderTrackingStatus>
        <OrderTrackingPanel title="Shipment events">
          <OrderTrackingEvents>
            <OrderTrackingEvent
              latest
              dateTime="2026-10-07T07:42"
              time="Today, 7:42 AM"
              location="Oakland, CA"
            >
              Arrived at carrier facility
            </OrderTrackingEvent>
            <OrderTrackingEvent
              dateTime="2026-10-06T21:10"
              time="Yesterday, 9:10 PM"
              location="Sacramento, CA"
            >
              Departed sorting center
            </OrderTrackingEvent>
          </OrderTrackingEvents>
          <OrderTrackingEarlierEvents label="Show 2 earlier events">
            <OrderTrackingEvent
              dateTime="2026-10-04T16:30"
              time="Oct 4, 4:30 PM"
              location="Portland, OR"
            >
              Picked up by carrier
            </OrderTrackingEvent>
            <OrderTrackingEvent
              dateTime="2026-10-04T11:05"
              time="Oct 4, 11:05 AM"
              location="Portland, OR"
            >
              Shipping label created
            </OrderTrackingEvent>
          </OrderTrackingEarlierEvents>
        </OrderTrackingPanel>
      </OrderTrackingColumn>
      <OrderTrackingColumn>
        <OrderTrackingPanel title="Delivery details">
          <OrderTrackingDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Carrier</DescriptionListTerm>
              <DescriptionListDetails>Westline Ground</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Tracking number</DescriptionListTerm>
              <DescriptionListDetails>WL 4410 2287 9035</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Ship to</DescriptionListTerm>
              <DescriptionListDetails>
                Rosa Iglesias, 418 Alder St, Oakland, CA 94607
              </DescriptionListDetails>
            </DescriptionListItem>
          </OrderTrackingDetails>
        </OrderTrackingPanel>
        <OrderTrackingPanel title="Need help with this order?">
          <OrderTrackingSupport>
            <p style={{ margin: 0 }}>
              If the package is late or arrives damaged, we will replace it or refund you.
            </p>
            <OrderTrackingSupportActions>
              <OrderTrackingSupportAction href="#support" emphasis="primary">
                Contact support
              </OrderTrackingSupportAction>
              <OrderTrackingSupportAction href="#return">Start a return</OrderTrackingSupportAction>
            </OrderTrackingSupportActions>
          </OrderTrackingSupport>
        </OrderTrackingPanel>
      </OrderTrackingColumn>
    </OrderTracking>
  );
}
`,
    accessibility: [
      "The block is a section labelled by the order title; each panel is a section labelled by its h3.",
      "Fulfillment progress uses Order Status, which names every step state in text, not color alone.",
      "Shipment events are an ordered list with machine-readable time elements, newest first.",
      "Earlier events sit behind a disclosure button with aria-expanded and aria-controls.",
      "Carrier, tracking number, and address use a Description List of term and detail pairs.",
    ],
  },
  {
    id: "subscription-management",
    name: "Subscription Management",
    category: "Commerce",
    icon: Repeat,
    description: "Change plans, usage limits, payment, renewal, and cancellation.",
    usage: `"use client";

import { useState } from "react";
import {
  SubscriptionManagement,
  SubscriptionManagementCancel,
  SubscriptionManagementColumn,
  SubscriptionManagementDescription,
  SubscriptionManagementHeader,
  SubscriptionManagementMeter,
  SubscriptionManagementMeters,
  SubscriptionManagementPanel,
  SubscriptionManagementPayment,
  SubscriptionManagementPeriod,
  SubscriptionManagementPlanDetail,
  SubscriptionManagementPlanName,
  SubscriptionManagementPlanOption,
  SubscriptionManagementPlanOptions,
  SubscriptionManagementPlanSubmit,
  SubscriptionManagementPlans,
  SubscriptionManagementPrice,
  SubscriptionManagementRenewal,
  SubscriptionManagementStatus,
  SubscriptionManagementTitle,
  type SubscriptionManagementVariant,
} from "@/components/uai/subscription-management";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  { id: "starter", name: "Starter", monthly: 12, yearly: 10, seats: "3 seats · 20 GB" },
  { id: "studio", name: "Studio", monthly: 29, yearly: 24, seats: "10 seats · 200 GB" },
  { id: "business", name: "Business", monthly: 59, yearly: 49, seats: "50 seats · 2 TB" },
];

export function SubscriptionManagementPreview({
  variant = "split",
}: {
  variant?: SubscriptionManagementVariant;
}) {
  const [current, setCurrent] = useState("studio");
  const [canceled, setCanceled] = useState(false);
  const plan = plans.find((item) => item.id === current) ?? plans[1];
  return (
    <SubscriptionManagement variant={variant}>
      <SubscriptionManagementHeader>
        <SubscriptionManagementTitle>Subscription</SubscriptionManagementTitle>
        <SubscriptionManagementDescription>
          Ledgerly workspace · billed to finance@harborpine.example
        </SubscriptionManagementDescription>
      </SubscriptionManagementHeader>
      <SubscriptionManagementColumn>
        <SubscriptionManagementPanel
          title={\`\${plan?.name} plan\`}
          aside={
            <SubscriptionManagementStatus tone={canceled ? "canceled" : "active"}>
              {canceled ? "Ends Nov 1" : "Active"}
            </SubscriptionManagementStatus>
          }
        >
          <SubscriptionManagementPrice>
            \${plan?.monthly}
            <SubscriptionManagementPeriod>per month</SubscriptionManagementPeriod>
          </SubscriptionManagementPrice>
          <SubscriptionManagementRenewal>
            {canceled
              ? "Your plan stays active until Nov 1, 2026, then the workspace becomes read-only."
              : \`Renews on Nov 1, 2026 for $\${plan?.monthly}.00 plus tax.\`}
          </SubscriptionManagementRenewal>
        </SubscriptionManagementPanel>
        <SubscriptionManagementPanel title="Change plan">
          <SubscriptionManagementPlans
            key={current}
            currentPlan={current}
            defaultPeriod="monthly"
            onPlanChange={(next) => setCurrent(next)}
          >
            <PricingToggleList aria-label="Billing period">
              <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
              <PricingToggleOption value="yearly">
                Yearly <PricingToggleSavings>Save 17%</PricingToggleSavings>
              </PricingToggleOption>
            </PricingToggleList>
            <SubscriptionManagementPlanOptions>
              {plans.map((item) => (
                <SubscriptionManagementPlanOption key={item.id} value={item.id}>
                  <SubscriptionManagementPlanName>{item.name}</SubscriptionManagementPlanName>
                  <SubscriptionManagementPlanDetail>
                    <PricingTogglePrice period="monthly">
                      \${item.monthly} / month
                    </PricingTogglePrice>
                    <PricingTogglePrice period="yearly">
                      \${item.yearly} / month, billed yearly
                    </PricingTogglePrice>
                  </SubscriptionManagementPlanDetail>
                  <SubscriptionManagementPlanDetail>{item.seats}</SubscriptionManagementPlanDetail>
                </SubscriptionManagementPlanOption>
              ))}
            </SubscriptionManagementPlanOptions>
            <SubscriptionManagementPlanSubmit />
          </SubscriptionManagementPlans>
        </SubscriptionManagementPanel>
      </SubscriptionManagementColumn>
      <SubscriptionManagementColumn>
        <SubscriptionManagementPanel title="Usage this period">
          <SubscriptionManagementMeters>
            <SubscriptionManagementMeter label="Seats" value={8} max={10} valueText="8 of 10" />
            <SubscriptionManagementMeter
              label="Storage"
              value={64}
              max={200}
              valueText="64 of 200 GB"
            />
          </SubscriptionManagementMeters>
        </SubscriptionManagementPanel>
        <SubscriptionManagementPanel title="Payment">
          <SubscriptionManagementPayment>
            <DescriptionListItem>
              <DescriptionListTerm>Method</DescriptionListTerm>
              <DescriptionListDetails>
                Visa ending in 4242
                <DescriptionListAction aria-label="Update payment method">
                  Update
                </DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Next invoice</DescriptionListTerm>
              <DescriptionListDetails>
                {canceled ? "No further invoices" : \`Nov 1, 2026 · $\${plan?.monthly}.00 plus tax\`}
              </DescriptionListDetails>
            </DescriptionListItem>
          </SubscriptionManagementPayment>
        </SubscriptionManagementPanel>
        {canceled ? null : (
          <SubscriptionManagementPanel title="Cancel subscription">
            <SubscriptionManagementRenewal>
              You keep access until the end of the billing period. Data is kept for 90 days.
            </SubscriptionManagementRenewal>
            <SubscriptionManagementCancel>
              <ConfirmationDialogTrigger style={{ justifySelf: "start" }}>
                Cancel subscription
              </ConfirmationDialogTrigger>
              <ConfirmationDialogContent>
                <ConfirmationDialogTitle>Cancel the {plan?.name} plan?</ConfirmationDialogTitle>
                <ConfirmationDialogDescription>
                  <p style={{ margin: 0 }}>On Nov 1, 2026 the workspace becomes read-only:</p>
                  <ConfirmationDialogImpact>
                    <li>8 members lose edit access</li>
                    <li>Scheduled exports stop</li>
                  </ConfirmationDialogImpact>
                </ConfirmationDialogDescription>
                <ConfirmationDialogActions>
                  <ConfirmationDialogCancel>Keep plan</ConfirmationDialogCancel>
                  <ConfirmationDialogConfirm onClick={() => setCanceled(true)}>
                    Cancel subscription
                  </ConfirmationDialogConfirm>
                </ConfirmationDialogActions>
              </ConfirmationDialogContent>
            </SubscriptionManagementCancel>
          </SubscriptionManagementPanel>
        )}
      </SubscriptionManagementColumn>
    </SubscriptionManagement>
  );
}
`,
    accessibility: [
      "Plan choices are native radio inputs in a labelled radio group; the current plan is named in text.",
      "The billing period is a Pricing Toggle radio group with arrow-key navigation, and every plan price follows it.",
      "Change plan stays disabled until a different plan is selected.",
      'Usage limits use role="meter" with aria-valuetext; the visible text matches, and the bar turns warning-toned at 80%.',
      "Cancellation opens a Confirmation Dialog that focuses the safe action and lists what the customer loses.",
    ],
  },
];
