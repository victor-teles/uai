"use client";

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
                  <ProductListingProductName href={`#${item.name}`}>
                    {item.name}
                  </ProductListingProductName>
                  <ProductListingProductMeta>
                    {item.glaze} glaze{item.inStock ? "" : " · Back-ordered"}
                  </ProductListingProductMeta>
                  <ProductListingProductPrice>${item.price}</ProductListingProductPrice>
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
