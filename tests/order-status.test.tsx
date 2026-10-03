import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import {
  ORDER_STATUS_VARIANTS,
  OrderStatus,
  OrderStatusAction,
  OrderStatusActions,
  OrderStatusBadge,
  OrderStatusDescription,
  OrderStatusDetail,
  OrderStatusDetails,
  OrderStatusHeader,
  OrderStatusProgress,
  OrderStatusStep,
  OrderStatusStepDescription,
  OrderStatusStepTitle,
  OrderStatusTitle,
  type OrderStatusVariant,
} from "@/registry/uai/components/order-status";

function OrderStatusFixture({ variant = "card" }: { variant?: OrderStatusVariant }) {
  return (
    <OrderStatus variant={variant}>
      <OrderStatusHeader>
        <div>
          <OrderStatusTitle>Arriving Friday</OrderStatusTitle>
          <OrderStatusDescription>Order #UAI-2048 · 2 items</OrderStatusDescription>
        </div>
        <OrderStatusBadge tone="progress">In transit</OrderStatusBadge>
      </OrderStatusHeader>
      <OrderStatusProgress>
        <OrderStatusStep status="complete">
          <OrderStatusStepTitle>Order confirmed</OrderStatusStepTitle>
          <OrderStatusStepDescription>Aug 15 · 9:42 AM</OrderStatusStepDescription>
        </OrderStatusStep>
        <OrderStatusStep status="current">
          <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
          <OrderStatusStepDescription>Departed the regional facility</OrderStatusStepDescription>
        </OrderStatusStep>
        <OrderStatusStep status="upcoming">
          <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
          <OrderStatusStepDescription>Expected Aug 21</OrderStatusStepDescription>
        </OrderStatusStep>
      </OrderStatusProgress>
      <OrderStatusDetails>
        <OrderStatusDetail label="Carrier">Northstar Parcel</OrderStatusDetail>
        <OrderStatusDetail label="Tracking">NSP-2048-1182</OrderStatusDetail>
      </OrderStatusDetails>
      <OrderStatusActions>
        <OrderStatusAction href="/track" emphasis="primary">
          Track package
        </OrderStatusAction>
        <OrderStatusAction href="/help">Get help</OrderStatusAction>
      </OrderStatusActions>
    </OrderStatus>
  );
}

test("labels the status and preserves progress and detail semantics", () => {
  const { container } = render(<OrderStatusFixture />);
  const section = container.querySelector("section");
  const heading = screen.getByRole("heading", { name: "Arriving Friday" });
  const progress = screen.getByRole("list", { name: "Order progress" });

  expect(section?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(progress.tagName).toBe("OL");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(
    screen.getByText("In transit", { selector: "h3" }).closest("li")?.getAttribute("aria-current"),
  ).toBe("step");
  expect(container.querySelectorAll("dl")).toHaveLength(1);
  expect(container.querySelectorAll("dt")).toHaveLength(2);
  expect(container.querySelectorAll("dd")).toHaveLength(2);
});

test("renders card, plain, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<OrderStatusFixture variant="card" />);
  const section = container.querySelector("section");

  expect(ORDER_STATUS_VARIANTS).toEqual(["card", "plain", "compact"]);
  expect(section?.dataset.variant).toBe("card");
  expect(section?.className).toContain("rounded-[14px]");
  expect(section?.className).toContain("p-[18px]");

  rerender(<OrderStatusFixture variant="plain" />);
  expect(section?.dataset.variant).toBe("plain");
  expect(section?.className).toContain("rounded-none");
  expect(section?.className).toContain("bg-transparent");

  rerender(<OrderStatusFixture variant="compact" />);
  expect(section?.dataset.variant).toBe("compact");
  expect(section?.className).toContain("rounded-xl");
  expect(section?.className).toContain("p-3");
  expect(screen.getByRole("heading", { name: "Arriving Friday" }).className).toContain(
    "text-[13px]",
  );
});

test("communicates every stage with visible text and current-step semantics", () => {
  const { rerender } = render(<OrderStatusFixture />);

  expect(screen.getByText("Complete")).toBeTruthy();
  expect(screen.getByText("Current")).toBeTruthy();
  expect(screen.getByText("Upcoming")).toBeTruthy();

  rerender(
    <OrderStatus>
      <OrderStatusTitle>Delivery update</OrderStatusTitle>
      <OrderStatusProgress>
        <OrderStatusStep status="issue">
          <OrderStatusStepTitle>Delivery attempt missed</OrderStatusStepTitle>
        </OrderStatusStep>
      </OrderStatusProgress>
    </OrderStatus>,
  );

  expect(screen.getByText("Needs attention").className).toContain("text-destructive");
  expect(screen.getByRole("listitem").getAttribute("aria-current")).toBeNull();
});

test("contains long tracking values and preserves action destinations", () => {
  render(<OrderStatusFixture variant="compact" />);

  expect(screen.getByText("NSP-2048-1182").className).toContain("wrap-anywhere");
  expect(screen.getByRole("link", { name: "Track package" }).getAttribute("href")).toBe("/track");
  expect(screen.getByRole("link", { name: "Get help" }).getAttribute("href")).toBe("/help");
});

test("compound order status children require their root", () => {
  expect(() => render(<OrderStatusStep status="current" />)).toThrow(
    "OrderStatusStep must be used within OrderStatus",
  );
});
