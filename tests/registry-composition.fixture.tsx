import {
  AppHeader,
  AppHeaderAction,
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderMenuButton,
  AppHeaderNav,
  AppHeaderNavItem,
  AppHeaderOverflow,
  AppHeaderSearch,
} from "@/registry/uai/components/app-header";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/registry/uai/components/approval-card";
import {
  CartItem,
  CartItemActions,
  CartItemAvailability,
  CartItemContent,
  CartItemHeader,
  CartItemMedia,
  CartItemOption,
  CartItemOptions,
  CartItemPrice,
  CartItemRemove,
  CartItemTitle,
} from "@/registry/uai/components/cart-item";
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
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/registry/uai/components/empty-state";
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
  PasswordRecovery,
  PasswordRecoveryAside,
  PasswordRecoveryField,
  PasswordRecoveryFields,
  PasswordRecoveryHeader,
  PasswordRecoveryInput,
  PasswordRecoveryLabel,
  PasswordRecoveryMain,
  PasswordRecoveryProgress,
  PasswordRecoveryProgressItem,
  PasswordRecoveryStage,
  PasswordRecoverySubmit,
  PasswordRecoveryTitle,
} from "@/registry/uai/components/password-recovery";
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
import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
} from "@/registry/uai/components/quantity-picker";
import {
  SignInCard,
  SignInCardBody,
  SignInCardDivider,
  SignInCardField,
  SignInCardFields,
  SignInCardHeader,
  SignInCardInput,
  SignInCardLabel,
  SignInCardProvider,
  SignInCardProviders,
  SignInCardSubmit,
  SignInCardTitle,
} from "@/registry/uai/components/sign-in-card";
import {
  SignUpCard,
  SignUpCardBody,
  SignUpCardCheckbox,
  SignUpCardConsent,
  SignUpCardField,
  SignUpCardFields,
  SignUpCardHeader,
  SignUpCardInput,
  SignUpCardLabel,
  SignUpCardSubmit,
  SignUpCardTitle,
} from "@/registry/uai/components/sign-up-card";
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
      <EmptyState variant="compact">
        <EmptyStateContent>
          <EmptyStateHeader>
            <EmptyStateTitle>No projects yet</EmptyStateTitle>
            <EmptyStateDescription>Create a project to get started.</EmptyStateDescription>
          </EmptyStateHeader>
          <EmptyStateActions>
            <EmptyStateAction>Create project</EmptyStateAction>
          </EmptyStateActions>
        </EmptyStateContent>
      </EmptyState>
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
      <SignInCard variant="split">
        <SignInCardHeader>
          <SignInCardTitle>Welcome back</SignInCardTitle>
        </SignInCardHeader>
        <SignInCardBody>
          <SignInCardProviders>
            <SignInCardProvider>Continue with SSO</SignInCardProvider>
          </SignInCardProviders>
          <SignInCardDivider />
          <SignInCardFields>
            <SignInCardField>
              <SignInCardLabel>Email</SignInCardLabel>
              <SignInCardInput name="email" type="email" />
            </SignInCardField>
            <SignInCardSubmit />
          </SignInCardFields>
        </SignInCardBody>
      </SignInCard>
      <SignUpCard variant="compact">
        <SignUpCardHeader>
          <SignUpCardTitle>Create your account</SignUpCardTitle>
        </SignUpCardHeader>
        <SignUpCardBody>
          <SignUpCardFields>
            <SignUpCardField>
              <SignUpCardLabel>Work email</SignUpCardLabel>
              <SignUpCardInput name="email" type="email" />
            </SignUpCardField>
            <SignUpCardConsent>
              <SignUpCardCheckbox name="terms" />
              <span>I agree to the terms.</span>
            </SignUpCardConsent>
            <SignUpCardSubmit />
          </SignUpCardFields>
        </SignUpCardBody>
      </SignUpCard>
      <PasswordRecovery variant="split" step="request">
        <PasswordRecoveryAside>
          <PasswordRecoveryProgress>
            <PasswordRecoveryProgressItem state="current">
              Find account
            </PasswordRecoveryProgressItem>
          </PasswordRecoveryProgress>
        </PasswordRecoveryAside>
        <PasswordRecoveryMain>
          <PasswordRecoveryHeader>
            <PasswordRecoveryTitle>Recover your account</PasswordRecoveryTitle>
          </PasswordRecoveryHeader>
          <PasswordRecoveryStage when="request">
            <PasswordRecoveryFields>
              <PasswordRecoveryField>
                <PasswordRecoveryLabel>Work email</PasswordRecoveryLabel>
                <PasswordRecoveryInput name="email" type="email" />
              </PasswordRecoveryField>
              <PasswordRecoverySubmit />
            </PasswordRecoveryFields>
          </PasswordRecoveryStage>
        </PasswordRecoveryMain>
      </PasswordRecovery>
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
      <QuantityPicker variant="compact" defaultValue={2} max={5}>
        <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
        <QuantityPickerControl>
          <QuantityPickerDecrease />
          <QuantityPickerInput />
          <QuantityPickerIncrease />
        </QuantityPickerControl>
        <QuantityPickerMessage>5 available</QuantityPickerMessage>
      </QuantityPicker>
      <CartItem variant="compact">
        <CartItemMedia>Product image</CartItemMedia>
        <CartItemContent>
          <CartItemHeader>
            <CartItemTitle>Everyday Tote</CartItemTitle>
            <CartItemPrice>$96.00</CartItemPrice>
          </CartItemHeader>
          <CartItemOptions>
            <CartItemOption label="Color">Natural</CartItemOption>
          </CartItemOptions>
          <CartItemAvailability>In stock</CartItemAvailability>
          <CartItemActions>
            <QuantityPicker defaultValue={2} max={5}>
              <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
              <QuantityPickerControl>
                <QuantityPickerDecrease />
                <QuantityPickerInput />
                <QuantityPickerIncrease />
              </QuantityPickerControl>
              <QuantityPickerMessage className="sr-only">Maximum 5 per order</QuantityPickerMessage>
            </QuantityPicker>
            <CartItemRemove />
          </CartItemActions>
        </CartItemContent>
      </CartItem>
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
      <AppHeader variant="floating">
        <AppHeaderBrand href="/">Atlas</AppHeaderBrand>
        <AppHeaderOverflow>
          <AppHeaderNav>
            <AppHeaderNavItem href="/overview" active>
              Overview
            </AppHeaderNavItem>
          </AppHeaderNav>
          <AppHeaderSearch />
        </AppHeaderOverflow>
        <AppHeaderActions>
          <AppHeaderAction aria-label="Open account menu">AC</AppHeaderAction>
        </AppHeaderActions>
        <AppHeaderMenuButton />
      </AppHeader>
    </>
  );
}
