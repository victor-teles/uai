import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import {
  PRICE_SUMMARY_VARIANTS,
  PriceSummary,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTitle,
  PriceSummaryTotal,
  type PriceSummaryVariant,
} from "@/registry/uai/components/price-summary";

function PriceSummaryFixture({ variant = "card" }: { variant?: PriceSummaryVariant }) {
  return (
    <PriceSummary variant={variant}>
      <PriceSummaryHeader>
        <PriceSummaryTitle>Order summary</PriceSummaryTitle>
        <PriceSummaryDescription>3 items · USD</PriceSummaryDescription>
      </PriceSummaryHeader>
      <PriceSummaryList>
        <PriceSummaryItem label="Subtotal">$128.00</PriceSummaryItem>
        <PriceSummaryItem label="WELCOME20" tone="success">
          −$20.00
        </PriceSummaryItem>
        <PriceSummaryItem label="Shipping" tone="success">
          Free
        </PriceSummaryItem>
        <PriceSummaryItem label="Estimated tax">$9.72</PriceSummaryItem>
        <PriceSummaryTotal hint="Includes estimated tax">$117.72</PriceSummaryTotal>
      </PriceSummaryList>
      <PriceSummaryNote>The final amount is confirmed at payment.</PriceSummaryNote>
    </PriceSummary>
  );
}

test("labels the summary and preserves description-list semantics", () => {
  const { container } = render(<PriceSummaryFixture />);
  const section = container.querySelector("section");
  const heading = screen.getByRole("heading", { name: "Order summary" });

  expect(section?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(container.querySelectorAll("dl")).toHaveLength(1);
  expect(container.querySelectorAll("dt")).toHaveLength(5);
  expect(container.querySelectorAll("dd")).toHaveLength(5);
  expect(screen.getByText("$117.72").className).toContain("tabular-nums");
});

test("renders card, plain, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<PriceSummaryFixture variant="card" />);
  const section = container.querySelector("section");

  expect(PRICE_SUMMARY_VARIANTS).toEqual(["card", "plain", "compact"]);
  expect(section?.dataset.variant).toBe("card");
  expect(section?.className).toContain("rounded-[14px]");
  expect(section?.className).toContain("p-[18px]");

  rerender(<PriceSummaryFixture variant="plain" />);
  expect(section?.dataset.variant).toBe("plain");
  expect(section?.className).toContain("rounded-none");
  expect(section?.className).toContain("bg-transparent");

  rerender(<PriceSummaryFixture variant="compact" />);
  expect(section?.dataset.variant).toBe("compact");
  expect(section?.className).toContain("rounded-xl");
  expect(section?.className).toContain("p-3");
  expect(screen.getByRole("heading").className).toContain("text-[13px]");
});

test("keeps discount meaning visible in text and semantic markup", () => {
  render(<PriceSummaryFixture />);

  const discountValue = screen.getByText("−$20.00");
  expect(discountValue.tagName).toBe("DD");
  expect(discountValue.className).toContain("text-success");
  expect(screen.getByText("WELCOME20").tagName).toBe("DT");
});

test("contains long localized labels and totals", () => {
  render(
    <PriceSummary variant="compact">
      <PriceSummaryHeader>
        <PriceSummaryTitle>Order summary</PriceSummaryTitle>
      </PriceSummaryHeader>
      <PriceSummaryList>
        <PriceSummaryItem label="International priority shipping and handling">
          R$ 1.234,56
        </PriceSummaryItem>
        <PriceSummaryTotal hint="Includes estimated import taxes">
          R$ 123.456.789,00
        </PriceSummaryTotal>
      </PriceSummaryList>
    </PriceSummary>,
  );

  expect(screen.getByText("International priority shipping and handling").className).toContain(
    "wrap-anywhere",
  );
  expect(screen.getByText("R$ 123.456.789,00").className).toContain("max-w-[58%]");
  expect(screen.getByText("R$ 123.456.789,00").className).not.toContain("shrink-0");
});

test("compound price summary children require their root", () => {
  expect(() => render(<PriceSummaryItem label="Subtotal">$10.00</PriceSummaryItem>)).toThrow(
    "PriceSummaryItem must be used within PriceSummary",
  );
});
