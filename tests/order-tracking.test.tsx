import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  OrderStatusProgress,
  OrderStatusStep,
  OrderStatusStepTitle,
  OrderStatusTitle,
} from "@/components/ui/uai/order-status";
import {
  ORDER_TRACKING_VARIANTS,
  OrderTracking,
  OrderTrackingDetails,
  OrderTrackingEarlierEvents,
  OrderTrackingEstimate,
  OrderTrackingEvent,
  OrderTrackingEvents,
  OrderTrackingHeader,
  OrderTrackingPanel,
  type OrderTrackingProps,
  OrderTrackingStatus,
  OrderTrackingSupportAction,
  OrderTrackingTitle,
} from "@/registry/uai/blocks/order-tracking";

function Fixture(props: OrderTrackingProps) {
  return (
    <OrderTracking {...props}>
      <OrderTrackingHeader>
        <OrderTrackingTitle>Order FH-20418</OrderTrackingTitle>
        <OrderTrackingEstimate>Thu, Oct 9</OrderTrackingEstimate>
      </OrderTrackingHeader>
      <OrderTrackingStatus>
        <OrderStatusTitle>Shipment progress</OrderStatusTitle>
        <OrderStatusProgress>
          <OrderStatusStep status="complete">
            <OrderStatusStepTitle>Shipped</OrderStatusStepTitle>
          </OrderStatusStep>
          <OrderStatusStep status="current">
            <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
          </OrderStatusStep>
        </OrderStatusProgress>
      </OrderTrackingStatus>
      <OrderTrackingPanel title="Shipment events">
        <OrderTrackingEvents>
          <OrderTrackingEvent latest dateTime="2026-10-07T07:42" time="7:42 AM" location="Oakland">
            Arrived at facility
          </OrderTrackingEvent>
        </OrderTrackingEvents>
        <OrderTrackingEarlierEvents label="Show 1 earlier event">
          <OrderTrackingEvent dateTime="2026-10-04T11:05" time="Oct 4">
            Label created
          </OrderTrackingEvent>
        </OrderTrackingEarlierEvents>
      </OrderTrackingPanel>
      <OrderTrackingPanel title="Delivery details">
        <OrderTrackingDetails>
          <DescriptionListItem>
            <DescriptionListTerm>Carrier</DescriptionListTerm>
            <DescriptionListDetails>Westline Ground</DescriptionListDetails>
          </DescriptionListItem>
        </OrderTrackingDetails>
        <OrderTrackingSupportAction href="#support">Contact support</OrderTrackingSupportAction>
      </OrderTrackingPanel>
    </OrderTracking>
  );
}

test("labels the order, panels, and estimate and keeps progress state in text", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Order FH-20418" })).toBeTruthy();
  expect(screen.getByText("Estimated delivery")).toBeTruthy();
  const events = screen.getByRole("region", { name: "Shipment events" });
  const time = within(events).getByText("7:42 AM");
  expect(time.tagName).toBe("TIME");
  expect(time.getAttribute("dateTime")).toBe("2026-10-07T07:42");
  expect(screen.getByRole("listitem", { current: "step" }).textContent).toContain("In transit");
  expect(screen.getByText("Carrier").tagName).toBe("DT");
  expect(screen.getByRole("link", { name: "Contact support" })).toBeTruthy();
});

test("discloses earlier events with the keyboard", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const toggle = screen.getByRole("button", { name: "Show 1 earlier event" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const list = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
  expect(list?.hidden).toBe(true);
  toggle.focus();
  await user.keyboard("{Enter}");
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(list?.hidden).toBe(false);
  expect(toggle.textContent).toBe("Hide earlier events");
  await user.keyboard(" ");
  expect(list?.hidden).toBe(true);
});

test("renders every variant and guards regions", () => {
  for (const variant of ORDER_TRACKING_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<OrderTrackingEvents />)).toThrow(
    "OrderTrackingEvents must be used within OrderTracking",
  );
});
