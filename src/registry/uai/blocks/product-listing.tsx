"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";

export const PRODUCT_LISTING_VARIANTS = ["grid", "sidebar", "list"] as const;
export type ProductListingVariant = (typeof PRODUCT_LISTING_VARIANTS)[number];
export type ProductListingProps = ComponentProps<"section"> & { variant?: ProductListingVariant };

type ListingContext = { id: string; variant: ProductListingVariant };
const Context = createContext<ListingContext | null>(null);
function useListing(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ProductListing`);
  return context;
}

const layoutCss = `
[data-uai-listing-body]{display:grid;gap:16px;align-items:start;min-width:0}
[data-uai-listing-results]{display:grid;gap:16px;margin:0;padding:0;list-style:none;min-width:0}
[data-uai-listing="grid"] [data-uai-listing-results]{grid-template-columns:repeat(auto-fill,minmax(min(100%,180px),1fr))}
[data-uai-listing="sidebar"] [data-uai-listing-results]{grid-template-columns:repeat(auto-fill,minmax(min(100%,160px),1fr))}
[data-uai-listing="list"] [data-uai-listing-results]{grid-template-columns:minmax(0,1fr);gap:2px}
[data-uai-listing="list"] [data-uai-listing-product]{grid-template-columns:64px minmax(0,1fr) auto;grid-template-rows:1fr auto 1fr;align-items:start;padding:8px 14px 8px 8px;transition:background-color 120ms ease-out}
[data-uai-listing="list"] [data-uai-listing-product]>h3{align-self:end}
[data-uai-listing="list"] [data-uai-listing-product]:hover{background:var(--uai-surface)}
[data-uai-listing="list"] [data-uai-listing-product-price]{grid-column:3;grid-row:1 / span 3;align-self:center}
@container (min-width: 760px){
  [data-uai-listing="sidebar"] [data-uai-listing-body]{grid-template-columns:220px minmax(0,1fr);column-gap:28px}
  [data-uai-listing="sidebar"] [data-uai-listing-aside]{position:sticky;top:16px}
}
@container (max-width: 420px){
  [data-uai-listing="list"] [data-uai-listing-product]{grid-template-columns:56px minmax(0,1fr);grid-template-rows:auto}
  [data-uai-listing="list"] [data-uai-listing-product-price]{grid-column:2;grid-row:auto}
}
.uai-listing-link{color:inherit;text-decoration:none}
.uai-listing-link::after{content:"";position:absolute;inset:0;border-radius:inherit}
.uai-listing-link:focus-visible{outline:none}
[data-uai-listing-product]:has(.uai-listing-link:focus-visible){outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-listing-link:hover{text-decoration:none}
[data-uai-listing-media]{transition:background-color 120ms ease-out}
[data-uai-listing-media]>*{transition:transform 300ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-listing-product]:hover [data-uai-listing-media]>*{transform:scale(1.03)}
.uai-listing-pill{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-listing-pill:not([aria-current]):not([aria-disabled]):hover{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-listing-pill:not([aria-disabled]):active{transform:scale(0.97)}
.uai-listing-pill:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-listing-sort{transition:background-color 120ms ease-out}
.uai-listing-sort:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-listing-sort:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion: reduce){
  [data-uai-listing-media]>*,.uai-listing-pill,.uai-listing-sort,[data-uai-listing-product]{transition:none}
  [data-uai-listing-product]:hover [data-uai-listing-media]>*{transform:none}
  .uai-listing-pill:not([aria-disabled]):active{transform:none}
}
`;

const filterVariants: Record<ProductListingVariant, FilterBarVariant> = {
  grid: "toolbar",
  sidebar: "panel",
  list: "compact",
};

/** Categories, filters, sorting, result counts, and pagination for a product catalog page. */
export function ProductListing({
  variant = "grid",
  children,
  style,
  ...props
}: ProductListingProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-listing={variant}
        style={{
          boxSizing: "border-box",
          display: "grid",
          gap: 20,
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        {children}
      </section>
    </Context.Provider>
  );
}

export function ProductListingHeader({ style, ...props }: ComponentProps<"header">) {
  return <header {...props} style={{ display: "grid", gap: 6, ...style }} />;
}

export function ProductListingTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useListing("ProductListingTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: "clamp(20px, 2cqi + 12px, 26px)",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.015em",
        ...style,
      }}
    />
  );
}

export function ProductListingDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** Category navigation. Compose ProductListingCategory links inside. */
export function ProductListingCategories({
  "aria-label": ariaLabel = "Categories",
  children,
  style,
  ...props
}: ComponentProps<"nav">) {
  useListing("ProductListingCategories");
  return (
    <nav aria-label={ariaLabel} {...props} style={{ minWidth: 0, ...style }}>
      <ul
        style={{
          display: "flex",
          gap: 2,
          margin: 0,
          padding: "2px",
          overflowX: "auto",
          listStyle: "none",
        }}
      >
        {children}
      </ul>
    </nav>
  );
}

export type ProductListingCategoryProps = ComponentProps<"a"> & { current?: boolean };

/** A category link. The current category is a graphite pill and is announced as the current page. */
export function ProductListingCategory({
  current = false,
  style,
  ...props
}: ProductListingCategoryProps) {
  return (
    <li style={{ flex: "none" }}>
      <a
        aria-current={current ? "page" : undefined}
        {...props}
        className={joinClass("uai-listing-pill", props.className)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 28,
          padding: "0 12px",
          borderRadius: 999,
          background: current ? "var(--uai-surface-raised)" : "transparent",
          color: current ? "var(--uai-text)" : "var(--uai-muted)",
          fontWeight: 500,
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...style,
        }}
      />
    </li>
  );
}

/** Wraps the filters and results. In the sidebar layout, the aside becomes a left column. */
export function ProductListingBody({ style, ...props }: ComponentProps<"div">) {
  useListing("ProductListingBody");
  return <div {...props} data-uai-listing-body="" style={style} />;
}

export function ProductListingAside({
  "aria-label": ariaLabel = "Filters",
  style,
  ...props
}: ComponentProps<"aside">) {
  return (
    <aside
      aria-label={ariaLabel}
      {...props}
      data-uai-listing-aside=""
      style={{ display: "grid", gap: 12, minWidth: 0, ...style }}
    />
  );
}

export function ProductListingMain({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 16, minWidth: 0, ...style }} />;
}

/** Filter controls. Compose FilterBar parts inside; the block picks the filter layout. */
export function ProductListingFilters(props: Omit<FilterBarProps, "variant">) {
  const { variant } = useListing("ProductListingFilters");
  return <FilterBar {...props} variant={filterVariants[variant]} />;
}

/** The row above results that holds the result count and the sort control. */
export function ProductListingToolbar({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** Result count. A polite live region, so filter changes are announced. */
export function ProductListingCount({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12.5,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export type ProductListingSortProps = Omit<
  ComponentProps<"select">,
  "value" | "defaultValue" | "onChange"
> & {
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** A labelled native select for sort order. Compose option elements inside. */
export function ProductListingSort({
  label = "Sort by",
  value,
  defaultValue = "",
  onValueChange,
  style,
  ...props
}: ProductListingSortProps) {
  useListing("ProductListingSort");
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <label htmlFor={id} style={{ color: "var(--uai-subtle)", fontSize: 12.5 }}>
        {label}
      </label>
      <select
        {...props}
        id={id}
        value={value ?? internal}
        onChange={(event) => {
          if (value === undefined) setInternal(event.target.value);
          onValueChange?.(event.target.value);
        }}
        className={joinClass("uai-listing-sort", props.className)}
        style={{
          height: 28,
          padding: "0 10px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
          ...style,
        }}
      />
    </div>
  );
}

/** The product results list. Compose ProductListingProduct items inside. */
export function ProductListingResults({
  "aria-label": ariaLabel = "Products",
  ...props
}: ComponentProps<"ul">) {
  useListing("ProductListingResults");
  return <ul aria-label={ariaLabel} {...props} data-uai-listing-results="" />;
}

type ProductContext = { id: string };
const ProductContext = createContext<ProductContext | null>(null);
function useProduct(part: string) {
  const context = useContext(ProductContext);
  if (!context) throw new Error(`${part} must be used within ProductListingProduct`);
  return context;
}

/** One product card. The whole card is clickable through ProductListingProductName's link. */
export function ProductListingProduct({ style, ...props }: ComponentProps<"li">) {
  const { variant } = useListing("ProductListingProduct");
  const id = useId();
  return (
    <ProductContext.Provider value={{ id }}>
      <li
        aria-labelledby={`${id}-name`}
        {...props}
        data-uai-listing-product=""
        style={{
          position: "relative",
          display: "grid",
          columnGap: 14,
          rowGap: 4,
          alignContent: "start",
          minWidth: 0,
          borderRadius: variant === "list" ? 12 : 14,
          ...style,
        }}
      />
    </ProductContext.Provider>
  );
}

export function ProductListingProductMedia({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useListing("ProductListingProductMedia");
  const list = variant === "list";
  return (
    <div
      {...props}
      data-uai-listing-media=""
      style={{
        gridRow: list ? "1 / span 3" : undefined,
        aspectRatio: list ? "1 / 1" : "4 / 5",
        marginBottom: list ? 0 : 8,
        overflow: "hidden",
        borderRadius: list ? 8 : 14,
        background: "var(--uai-surface-raised)",
        ...style,
      }}
    />
  );
}

export type ProductListingProductNameProps = ComponentProps<"a">;

/** Product name as an h3 link; its hit area covers the card. */
export function ProductListingProductName({
  className,
  style,
  ...props
}: ProductListingProductNameProps) {
  const product = useProduct("ProductListingProductName");
  return (
    <h3
      id={`${product.id}-name`}
      style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: "18px", ...style }}
    >
      <a {...props} className={["uai-listing-link", className].filter(Boolean).join(" ")} />
    </h3>
  );
}

export function ProductListingProductMeta({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

export function ProductListingProductPrice({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      data-uai-listing-product-price=""
      style={{ margin: 0, fontWeight: 500, fontVariantNumeric: "tabular-nums", ...style }}
    />
  );
}

/** A small text badge on a product, such as "Back in stock". */
export function ProductListingProductBadge({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        justifySelf: "start",
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--uai-accent) 16%, transparent)",
        color: "color-mix(in oklab, var(--uai-accent) 70%, var(--uai-text))",
        fontSize: 11.5,
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

/** Page navigation. Compose ProductListingPage links and the previous and next links. */
export function ProductListingPagination({
  "aria-label": ariaLabel = "Pagination",
  children,
  style,
  ...props
}: ComponentProps<"nav">) {
  useListing("ProductListingPagination");
  return (
    <nav aria-label={ariaLabel} {...props} style={{ minWidth: 0, ...style }}>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {children}
      </ul>
    </nav>
  );
}

const pageLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  minWidth: 28,
  height: 28,
  padding: "0 8px",
  borderRadius: 999,
  color: "var(--uai-text)",
  textDecoration: "none",
  fontVariantNumeric: "tabular-nums",
} as const;

export function ProductListingPage({
  current = false,
  style,
  ...props
}: ComponentProps<"a"> & { current?: boolean }) {
  return (
    <li>
      <a
        aria-current={current ? "page" : undefined}
        {...props}
        className={joinClass("uai-listing-pill", props.className)}
        style={{
          ...pageLinkStyle,
          background: current ? "var(--uai-surface-raised)" : "transparent",
          color: current ? "var(--uai-text)" : "var(--uai-muted)",
          fontWeight: 500,
          ...style,
        }}
      />
    </li>
  );
}

export type ProductListingPageStepProps = ComponentProps<"a"> & { disabled?: boolean };

function PageStep({
  direction,
  disabled = false,
  href,
  children,
  style,
  ...props
}: ProductListingPageStepProps & { direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <li>
      <a
        {...props}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        className={joinClass("uai-listing-pill", props.className)}
        style={{
          ...pageLinkStyle,
          padding: "0 10px",
          color: disabled ? "var(--uai-subtle)" : "var(--uai-muted)",
          fontWeight: 500,
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
      >
        {direction === "previous" ? <Icon size={14} aria-hidden="true" /> : null}
        {children}
        {direction === "next" ? <Icon size={14} aria-hidden="true" /> : null}
      </a>
    </li>
  );
}

export function ProductListingPagePrevious({
  children = "Previous",
  ...props
}: ProductListingPageStepProps) {
  return (
    <PageStep {...props} direction="previous">
      {children}
    </PageStep>
  );
}

export function ProductListingPageNext({
  children = "Next",
  ...props
}: ProductListingPageStepProps) {
  return (
    <PageStep {...props} direction="next">
      {children}
    </PageStep>
  );
}

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}
