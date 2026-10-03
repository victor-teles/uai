"use client";

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
