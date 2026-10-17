import { expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  PRICE_SUMMARY_VARIANTS,
  PriceSummary,
  PriceSummaryCode,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummarySavings,
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
  expect(discountValue.className).toContain("text-success-ink");
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

function CodeFixture({ busy = false }: { busy?: boolean }) {
  const [code, setCode] = useState(true);
  return (
    <PriceSummary aria-busy={busy}>
      <PriceSummaryHeader>
        <PriceSummaryTitle>Order summary</PriceSummaryTitle>
      </PriceSummaryHeader>
      <PriceSummaryList>
        {code && (
          <PriceSummaryItem
            label={<PriceSummaryCode onRemove={() => setCode(false)}>WELCOME20</PriceSummaryCode>}
            tone="success"
          >
            −$20.00
          </PriceSummaryItem>
        )}
        <PriceSummaryItem label="Estimated tax" aria-busy={busy}>
          $9.72
        </PriceSummaryItem>
        <PriceSummaryTotal>{code ? "$117.72" : "$137.72"}</PriceSummaryTotal>
      </PriceSummaryList>
      <PriceSummarySavings>
        {code ? "You’re saving $20.00 on this order" : null}
      </PriceSummarySavings>
    </PriceSummary>
  );
}

test("renders a removable code chip and states the savings", async () => {
  const user = userEvent.setup();
  render(<CodeFixture />);
  const savings = document.querySelector("[data-slot=price-summary-savings]");
  expect(savings?.getAttribute("data-state")).toBe("open");
  expect(screen.getByText("You’re saving $20.00 on this order")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Remove code WELCOME20" }));
  await act(() => new Promise((resolve) => setTimeout(resolve, 160)));
  expect(screen.queryByText("WELCOME20")).toBeNull();
  expect(screen.getByText("$137.72").tagName).toBe("DD");
  expect(savings?.getAttribute("data-state")).toBe("closed");
  expect(savings?.getAttribute("aria-hidden")).toBe("true");
});

test("shows skeletons only for pending amounts and dims the total while busy", () => {
  render(<CodeFixture busy />);
  expect(screen.queryByText("$9.72")).toBeNull();
  expect(screen.getByText("Updating")).toBeTruthy();
  expect(screen.getByText("−$20.00").tagName).toBe("DD");
  const total = screen.getByText("$117.72");
  expect(total.getAttribute("aria-live")).toBe("polite");
  expect(total.getAttribute("aria-busy")).toBe("true");
  expect(total.className).toContain("opacity-45");
});

test("an alert note uses the danger ink", () => {
  render(
    <PriceSummary>
      <PriceSummaryNote role="alert">We couldn’t update shipping.</PriceSummaryNote>
    </PriceSummary>,
  );
  expect(screen.getByRole("alert").className).toContain("text-destructive-ink");
});
