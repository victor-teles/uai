"use client";

import {
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
} from "@/components/ui/uai/order-status";

export function OrderStatusPreview({ variant = "card" }: { variant?: OrderStatusVariant }) {
  return (
    <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
      <OrderStatus variant={variant}>
        <OrderStatusHeader>
          <div className="min-w-0">
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
          <OrderStatusStep status="complete">
            <OrderStatusStepTitle>Shipped</OrderStatusStepTitle>
            <OrderStatusStepDescription>Aug 17 · Northstar Parcel</OrderStatusStepDescription>
          </OrderStatusStep>
          <OrderStatusStep status="current">
            <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
            <OrderStatusStepDescription>
              Departed the regional facility in Austin, TX
            </OrderStatusStepDescription>
          </OrderStatusStep>
          <OrderStatusStep status="upcoming">
            <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
            <OrderStatusStepDescription>Expected Aug 21 by 8:00 PM</OrderStatusStepDescription>
          </OrderStatusStep>
        </OrderStatusProgress>
        <OrderStatusDetails>
          <OrderStatusDetail label="Carrier">Northstar Parcel</OrderStatusDetail>
          <OrderStatusDetail label="Tracking">NSP-2048-1182</OrderStatusDetail>
        </OrderStatusDetails>
        <OrderStatusActions>
          <OrderStatusAction href="https://example.com/track" emphasis="primary">
            Track package
          </OrderStatusAction>
          <OrderStatusAction href="https://example.com/help">Get help</OrderStatusAction>
        </OrderStatusActions>
      </OrderStatus>
    </div>
  );
}
