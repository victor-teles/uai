import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/registry/uai/components/approval-card";
import {
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
} from "@/registry/uai/components/coupon-field";
import {
  OrderStatus,
  OrderStatusBadge,
  OrderStatusHeader,
  OrderStatusProgress,
  OrderStatusStep,
  OrderStatusStepTitle,
  OrderStatusTitle,
} from "@/registry/uai/components/order-status";
import {
  PriceSummary,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryTitle,
  PriceSummaryTotal,
} from "@/registry/uai/components/price-summary";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/registry/uai/components/prompt-composer";
import { TaskList, TaskListItem, TaskListTitle } from "@/registry/uai/components/task-list";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/registry/uai/components/thinking";

export function RegistryCompositionFixture() {
  return (
    <>
      <Thinking>
        <ThinkingTrigger summary="Checking the interface." />
        <ThinkingContent>
          <ThinkingActivity type="progress">Started the review</ThinkingActivity>
        </ThinkingContent>
      </Thinking>
      <ApprovalCard>
        <ApprovalCardHeader title="Publish this change?" />
        <ApprovalCardActions>
          <ApprovalCardReject />
          <ApprovalCardApprove />
        </ApprovalCardActions>
      </ApprovalCard>
      <TaskList variant="timeline">
        <TaskListItem status="active">
          <TaskListTitle>Validate the registry</TaskListTitle>
        </TaskListItem>
      </TaskList>
      <PromptComposer>
        <PromptComposerAdd>
          <PromptComposerFileItem />
        </PromptComposerAdd>
        <PromptComposerInput />
        <PromptComposerActions>
          <PromptComposerSubmit />
        </PromptComposerActions>
      </PromptComposer>
      <CouponField variant="pill" status="applied" appliedCode="SAVE20">
        <CouponFieldLabel />
        <CouponFieldControl>
          <CouponFieldInput />
          <CouponFieldApply />
        </CouponFieldControl>
        <CouponFieldFeedback>
          <CouponFieldMessage>20% off this order</CouponFieldMessage>
          <CouponFieldRemove />
        </CouponFieldFeedback>
      </CouponField>
      <PriceSummary variant="compact">
        <PriceSummaryHeader>
          <PriceSummaryTitle>Order summary</PriceSummaryTitle>
        </PriceSummaryHeader>
        <PriceSummaryList>
          <PriceSummaryItem label="Subtotal">$90.00</PriceSummaryItem>
          <PriceSummaryTotal>$72.00</PriceSummaryTotal>
        </PriceSummaryList>
      </PriceSummary>
      <OrderStatus variant="plain">
        <OrderStatusHeader>
          <OrderStatusTitle>Arriving Friday</OrderStatusTitle>
          <OrderStatusBadge tone="progress">In transit</OrderStatusBadge>
        </OrderStatusHeader>
        <OrderStatusProgress>
          <OrderStatusStep status="current">
            <OrderStatusStepTitle>In transit</OrderStatusStepTitle>
          </OrderStatusStep>
        </OrderStatusProgress>
      </OrderStatus>
    </>
  );
}
