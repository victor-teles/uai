"use client";

import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilterBar,
  type FilterBarProps,
  type FilterBarVariant,
} from "@/components/ui/uai/filter-bar";
import { cn } from "@/lib/uai-utils";

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

const filterVariants: Record<ProductListingVariant, FilterBarVariant> = {
  grid: "toolbar",
  sidebar: "panel",
  list: "compact",
};

/** Reads the layout variant without requiring the root, for parts that render standalone. */
function useListingVariant() {
  return useContext(Context)?.variant;
}

const pillInteraction =
  "py-0 text-[13px]/[18px] transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";
const pillHover = "hover:bg-accent hover:text-foreground dark:hover:bg-accent";
const pillPress = "active:scale-[0.97] motion-reduce:active:scale-100";

const productListingVariants = cva(
  "@container box-border grid min-w-0 gap-5 text-[13px]/[18px] text-foreground",
  { variants: { variant: { grid: "", sidebar: "", list: "" } } },
);

/** Categories, filters, sorting, result counts, and pagination for a product catalog page. */
export function ProductListing({
  variant = "grid",
  className,
  children,
  ...props
}: ProductListingProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <section
        aria-labelledby={`${id}-title`}
        data-slot="product-listing"
        data-variant={variant}
        className={cn(productListingVariants({ variant }), className)}
        {...props}
      >
        {children}
      </section>
    </Context.Provider>
  );
}

export function ProductListingHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="product-listing-header"
      className={cn("grid gap-1.5", className)}
      {...props}
    />
  );
}

export function ProductListingTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useListing("ProductListingTitle");
  return (
    <h2
      data-slot="product-listing-title"
      className={cn(
        "m-0 text-[clamp(20px,2cqi_+_12px,26px)] leading-[1.2] font-semibold tracking-[-0.015em]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ProductListingDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="product-listing-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Category navigation. Compose ProductListingCategory links inside. */
export function ProductListingCategories({
  "aria-label": ariaLabel = "Categories",
  className,
  children,
  ...props
}: ComponentProps<"nav">) {
  useListing("ProductListingCategories");
  return (
    <nav
      aria-label={ariaLabel}
      data-slot="product-listing-categories"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ul className="m-0 flex list-none gap-0.5 overflow-x-auto p-0.5">{children}</ul>
    </nav>
  );
}

export type ProductListingCategoryProps = ComponentProps<"a"> & { current?: boolean };

/** A category link. The current category is a graphite pill and is announced as the current page. */
export function ProductListingCategory({
  current = false,
  className,
  ...props
}: ProductListingCategoryProps) {
  return (
    <li className="flex-none">
      <Button
        asChild
        variant="ghost"
        className={cn(
          "h-7 rounded-full px-3 no-underline has-[>svg]:px-3",
          pillInteraction,
          pillPress,
          current
            ? cn("bg-accent text-foreground", pillHover)
            : cn("bg-transparent text-muted-foreground", pillHover),
          className,
        )}
      >
        <a
          aria-current={current ? "page" : undefined}
          data-slot="product-listing-category"
          {...props}
        />
      </Button>
    </li>
  );
}

/** Wraps the filters and results. In the sidebar layout, the aside becomes a left column. */
export function ProductListingBody({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useListing("ProductListingBody");
  return (
    <div
      data-slot="product-listing-body"
      className={cn(
        "grid min-w-0 items-start gap-4",
        variant === "sidebar" &&
          "@min-[760px]:grid-cols-[220px_minmax(0,1fr)] @min-[760px]:gap-x-7",
        className,
      )}
      {...props}
    />
  );
}

export function ProductListingAside({
  "aria-label": ariaLabel = "Filters",
  className,
  ...props
}: ComponentProps<"aside">) {
  const variant = useListingVariant();
  return (
    <aside
      aria-label={ariaLabel}
      data-slot="product-listing-aside"
      className={cn(
        "grid min-w-0 gap-3",
        variant === "sidebar" && "@min-[760px]:sticky @min-[760px]:top-4",
        className,
      )}
      {...props}
    />
  );
}

export function ProductListingMain({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="product-listing-main"
      className={cn("grid min-w-0 gap-4", className)}
      {...props}
    />
  );
}

/** Filter controls. Compose FilterBar parts inside; the block picks the filter layout. */
export function ProductListingFilters(props: Omit<FilterBarProps, "variant">) {
  const { variant } = useListing("ProductListingFilters");
  return <FilterBar {...props} variant={filterVariants[variant]} />;
}

/** The row above results that holds the result count and the sort control. */
export function ProductListingToolbar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="product-listing-toolbar"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

/** Result count. A polite live region, so filter changes are announced. */
export function ProductListingCount({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="status"
      data-slot="product-listing-count"
      className={cn("m-0 text-[12.5px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export type ProductListingSortProps = Omit<
  ComponentProps<typeof SelectTrigger>,
  "id" | "size" | "value" | "defaultValue" | "onChange" | "name"
> & {
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
};

/** A labelled select for sort order. Compose ProductListingSortOption items inside. */
export function ProductListingSort({
  label = "Sort by",
  value,
  defaultValue,
  onValueChange,
  name,
  className,
  children,
  ...props
}: ProductListingSortProps) {
  useListing("ProductListingSort");
  const id = useId();
  return (
    <div data-slot="product-listing-sort" className="inline-flex items-center gap-2">
      <Label
        htmlFor={id}
        className="text-[12.5px] leading-[inherit] font-normal text-subtle-foreground select-auto"
      >
        {label}
      </Label>
      <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger
          data-slot="product-listing-sort-select"
          className={cn(
            "w-auto cursor-pointer gap-1 rounded-full border-0 bg-secondary py-0 pr-2 pl-2.5 text-[12.5px]/[18px] font-medium text-foreground shadow-none data-[size=default]:h-7 dark:bg-secondary [&_svg]:size-3.5",
            "transition-[background-color] duration-120 ease-[ease-out] hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] motion-reduce:transition-none dark:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
            "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid",
            className,
          )}
          {...props}
          id={id}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="end"
          className="min-w-40 rounded-[14px] border-0 bg-popover text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[state=open]:[--tw-enter-translate-x:0]! data-[state=open]:[--tw-enter-translate-y:0]! motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
        >
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

/** One sort order inside ProductListingSort. */
export function ProductListingSortOption({
  className,
  ...props
}: ComponentProps<typeof SelectItem>) {
  useListing("ProductListingSortOption");
  return (
    <SelectItem
      data-slot="product-listing-sort-option"
      className={cn(
        "min-h-8 cursor-pointer rounded-[10px] py-1.5 pr-8 pl-2.5 text-[13px]/[18px] text-foreground focus:bg-accent focus:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

const resultsLayout: Record<ProductListingVariant, string> = {
  grid: "gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))]",
  sidebar: "gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))]",
  list: "gap-0.5 grid-cols-[minmax(0,1fr)]",
};

/** The product results list. Compose ProductListingProduct items inside. */
export function ProductListingResults({
  "aria-label": ariaLabel = "Products",
  className,
  ...props
}: ComponentProps<"ul">) {
  const { variant } = useListing("ProductListingResults");
  return (
    <ul
      aria-label={ariaLabel}
      data-slot="product-listing-results"
      className={cn("m-0 grid min-w-0 list-none p-0", resultsLayout[variant], className)}
      {...props}
    />
  );
}

type ProductContext = { id: string };
const ProductContext = createContext<ProductContext | null>(null);
function useProduct(part: string) {
  const context = useContext(ProductContext);
  if (!context) throw new Error(`${part} must be used within ProductListingProduct`);
  return context;
}

/** One product card. The whole card is clickable through ProductListingProductName's link. */
export function ProductListingProduct({ className, ...props }: ComponentProps<"li">) {
  const { variant } = useListing("ProductListingProduct");
  const id = useId();
  const list = variant === "list";
  return (
    <ProductContext.Provider value={{ id }}>
      <li
        aria-labelledby={`${id}-name`}
        data-slot="product-listing-product"
        className={cn(
          "group/product relative grid min-w-0 content-start gap-x-3.5 gap-y-1",
          "has-[[data-slot=product-listing-product-link]:focus-visible]:outline-2 has-[[data-slot=product-listing-product-link]:focus-visible]:outline-offset-2 has-[[data-slot=product-listing-product-link]:focus-visible]:outline-ring",
          list
            ? cn(
                "grid-cols-[64px_minmax(0,1fr)_auto] grid-rows-[1fr_auto_1fr] items-start rounded-xl py-2 pr-3.5 pl-2",
                "transition-[background-color] duration-120 ease-[ease-out] hover:bg-card motion-reduce:transition-none",
                "@max-[420px]:grid-cols-[56px_minmax(0,1fr)] @max-[420px]:grid-rows-[auto]",
              )
            : "rounded-[14px]",
          className,
        )}
        {...props}
      />
    </ProductContext.Provider>
  );
}

export function ProductListingProductMedia({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useListing("ProductListingProductMedia");
  const list = variant === "list";
  return (
    <div
      data-slot="product-listing-product-media"
      className={cn(
        "overflow-hidden bg-muted transition-[background-color] duration-120 ease-[ease-out] motion-reduce:transition-none",
        "*:transition-transform *:duration-300 *:ease-out-quint *:motion-reduce:transition-none *:group-hover/product:motion-safe:scale-[1.03]",
        list ? "row-[1/span_3] mb-0 aspect-square rounded-lg" : "mb-2 aspect-[4/5] rounded-[14px]",
        className,
      )}
      {...props}
    />
  );
}

export type ProductListingProductNameProps = ComponentProps<"a">;

/** Product name as an h3 link; its hit area covers the card. */
export function ProductListingProductName({ className, ...props }: ProductListingProductNameProps) {
  const product = useProduct("ProductListingProductName");
  const variant = useListingVariant();
  return (
    <h3
      id={`${product.id}-name`}
      data-slot="product-listing-product-name"
      className={cn("m-0 text-[13px]/[18px] font-medium", variant === "list" && "self-end")}
    >
      <a
        data-slot="product-listing-product-link"
        className={cn(
          "text-inherit no-underline after:absolute after:inset-0 after:rounded-[inherit] hover:no-underline focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    </h3>
  );
}

export function ProductListingProductMeta({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="product-listing-product-meta"
      className={cn("m-0 text-xs/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function ProductListingProductPrice({ className, ...props }: ComponentProps<"p">) {
  const variant = useListingVariant();
  return (
    <p
      data-slot="product-listing-product-price"
      className={cn(
        "m-0 font-medium tabular-nums",
        variant === "list" &&
          "col-3 row-[1/span_3] self-center @max-[420px]:col-2 @max-[420px]:row-auto",
        className,
      )}
      {...props}
    />
  );
}

/** A small text badge on a product, such as "Back in stock". */
export function ProductListingProductBadge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="product-listing-product-badge"
      className={cn(
        "inline-flex h-5 items-center justify-self-start rounded-full bg-primary/16 px-2 text-[11.5px] font-medium text-[color-mix(in_oklab,var(--primary)_70%,var(--foreground))]",
        className,
      )}
      {...props}
    />
  );
}

/** Page navigation. Compose ProductListingPage links and the previous and next links. */
export function ProductListingPagination({
  "aria-label": ariaLabel = "Pagination",
  className,
  children,
  ...props
}: ComponentProps<"nav">) {
  useListing("ProductListingPagination");
  return (
    <nav
      aria-label={ariaLabel}
      data-slot="product-listing-pagination"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-1 p-0">
        {children}
      </ul>
    </nav>
  );
}

const pageLinkClass = "h-7 min-w-7 gap-1 rounded-full no-underline tabular-nums";

export function ProductListingPage({
  current = false,
  className,
  ...props
}: ComponentProps<"a"> & { current?: boolean }) {
  return (
    <li>
      <Button
        asChild
        variant="ghost"
        className={cn(
          pageLinkClass,
          "px-2 has-[>svg]:px-2",
          pillInteraction,
          pillPress,
          current
            ? cn("bg-accent text-foreground", pillHover)
            : cn("bg-transparent text-muted-foreground", pillHover),
          className,
        )}
      >
        <a
          aria-current={current ? "page" : undefined}
          data-slot="product-listing-page"
          {...props}
        />
      </Button>
    </li>
  );
}

export type ProductListingPageStepProps = ComponentProps<"a"> & { disabled?: boolean };

function PageStep({
  direction,
  disabled = false,
  href,
  children,
  className,
  ...props
}: ProductListingPageStepProps & { direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <li>
      <Button
        asChild
        variant="ghost"
        className={cn(
          pageLinkClass,
          "px-2.5 has-[>svg]:px-2.5",
          pillInteraction,
          disabled
            ? "text-subtle-foreground opacity-50 hover:bg-transparent hover:text-subtle-foreground dark:hover:bg-transparent"
            : cn("text-muted-foreground", pillHover, pillPress),
          className,
        )}
      >
        <a
          data-slot={
            direction === "previous" ? "product-listing-page-previous" : "product-listing-page-next"
          }
          {...props}
          href={disabled ? undefined : href}
          aria-disabled={disabled || undefined}
        >
          {direction === "previous" ? (
            <Icon size={14} aria-hidden="true" className="size-3.5" />
          ) : null}
          {children}
          {direction === "next" ? <Icon size={14} aria-hidden="true" className="size-3.5" /> : null}
        </a>
      </Button>
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
