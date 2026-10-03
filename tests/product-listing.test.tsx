import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBarReset } from "@/components/ui/uai/filter-bar";
import {
  PRODUCT_LISTING_VARIANTS,
  ProductListing,
  ProductListingBody,
  ProductListingCategories,
  ProductListingCategory,
  ProductListingCount,
  ProductListingFilters,
  ProductListingMain,
  ProductListingPage,
  ProductListingPageNext,
  ProductListingPagePrevious,
  ProductListingPagination,
  ProductListingProduct,
  ProductListingProductName,
  ProductListingProductPrice,
  type ProductListingProps,
  ProductListingResults,
  ProductListingSort,
  ProductListingTitle,
} from "@/registry/uai/blocks/product-listing";

function Fixture({
  onSort,
  onReset,
  ...props
}: ProductListingProps & { onSort?: (value: string) => void; onReset?: () => void }) {
  return (
    <ProductListing {...props}>
      <ProductListingTitle>Tableware</ProductListingTitle>
      <ProductListingCategories>
        <ProductListingCategory href="#all">All</ProductListingCategory>
        <ProductListingCategory href="#tableware" current>
          Tableware
        </ProductListingCategory>
      </ProductListingCategories>
      <ProductListingBody>
        <ProductListingMain>
          <ProductListingFilters activeCount={1} onReset={onReset}>
            <FilterBarReset />
          </ProductListingFilters>
          <ProductListingCount>2 products</ProductListingCount>
          <ProductListingSort defaultValue="featured" onValueChange={onSort}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
          </ProductListingSort>
          <ProductListingResults>
            <ProductListingProduct>
              <ProductListingProductName href="#bowl">Serving bowl</ProductListingProductName>
              <ProductListingProductPrice>$52</ProductListingProductPrice>
            </ProductListingProduct>
            <ProductListingProduct>
              <ProductListingProductName href="#cup">Espresso cup</ProductListingProductName>
              <ProductListingProductPrice>$26</ProductListingProductPrice>
            </ProductListingProduct>
          </ProductListingResults>
          <ProductListingPagination>
            <ProductListingPagePrevious disabled href="#page-0" />
            <ProductListingPage href="#page-1" current>
              1
            </ProductListingPage>
            <ProductListingPageNext href="#page-2" />
          </ProductListingPagination>
        </ProductListingMain>
      </ProductListingBody>
    </ProductListing>
  );
}

test("exposes landmarks, current links, named products, and a live count", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Tableware" })).toBeTruthy();
  const categories = screen.getByRole("navigation", { name: "Categories" });
  expect(
    within(categories).getByRole("link", { name: "Tableware" }).getAttribute("aria-current"),
  ).toBe("page");
  const results = screen.getByRole("list", { name: "Products" });
  expect(within(results).getByRole("listitem", { name: "Serving bowl" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 3, name: "Espresso cup" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("2 products");
  const pagination = screen.getByRole("navigation", { name: "Pagination" });
  const previous = within(pagination).getByText("Previous").closest("a");
  expect(previous?.getAttribute("aria-disabled")).toBe("true");
  expect(previous?.hasAttribute("href")).toBe(false);
  expect(within(pagination).getByRole("link", { name: "1" }).getAttribute("aria-current")).toBe(
    "page",
  );
});

test("sorts with a labelled select and resets filters from the keyboard", async () => {
  const user = userEvent.setup();
  const onSort = mock();
  const onReset = mock();
  render(<Fixture onSort={onSort} onReset={onReset} />);
  await user.selectOptions(screen.getByLabelText("Sort by"), "price-asc");
  expect(onSort).toHaveBeenCalledWith("price-asc");
  expect((screen.getByLabelText("Sort by") as HTMLSelectElement).value).toBe("price-asc");
  screen.getByRole("button", { name: "Reset filters" }).focus();
  await user.keyboard("{Enter}");
  expect(onReset).toHaveBeenCalledTimes(1);
});

test("renders every variant and guards regions", () => {
  const filterVariants = { grid: "toolbar", sidebar: "panel", list: "compact" };
  for (const variant of PRODUCT_LISTING_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    const section = view.container.querySelector("section");
    expect(section?.dataset.variant).toBe(variant);
    expect(
      view.container.querySelectorAll(`[data-variant="${filterVariants[variant]}"]`).length,
    ).toBe(1);
    view.unmount();
  }
  expect(() => render(<ProductListingResults />)).toThrow(
    "ProductListingResults must be used within ProductListing",
  );
  expect(() =>
    render(
      <ProductListing>
        <ProductListingProductName href="#x">X</ProductListingProductName>
      </ProductListing>,
    ),
  ).toThrow("ProductListingProductName must be used within ProductListingProduct");
});
