import {
  BrainCircuit,
  Inbox,
  KeyRound,
  ListChecks,
  LogIn,
  type LucideIcon,
  MessageSquareText,
  PackageCheck,
  PackagePlus,
  PanelTop,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  TicketPercent,
  UserPlus,
} from "lucide-react";

export type RegistryItemId =
  | "prompt-composer"
  | "thinking"
  | "approval-card"
  | "empty-state"
  | "task-list"
  | "sign-in-card"
  | "sign-up-card"
  | "password-recovery"
  | "coupon-field"
  | "quantity-picker"
  | "cart-item"
  | "price-summary"
  | "order-status"
  | "app-header";

export type RegistryCategory =
  | "All"
  | "AI"
  | "Feedback"
  | "Forms"
  | "Data Display"
  | "Navigation"
  | "Authentication"
  | "Commerce";

export type RegistryCatalogItem = {
  id: RegistryItemId;
  name: string;
  category: Exclude<RegistryCategory, "All">;
  description: string;
  icon: LucideIcon;
  usage: string;
  accessibility: readonly string[];
};

export const registryCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "prompt-composer",
    name: "Prompt Composer",
    category: "Forms",
    description:
      "A prompt bar with ghost plus, ink send, and rounded, pill, ghost, and compact variants.",
    icon: MessageSquareText,
    usage: `import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer"

export function AskUai() {
  return (
    <PromptComposer variant="rounded" onSubmit={(prompt) => sendPrompt(prompt)}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput placeholder="Write a message…" />
      <PromptComposerActions>
        <PromptComposerModelSelect models={[{ id: "default", label: "Your model" }]} />
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>
  )
}`,
    accessibility: [
      "The textarea has a persistent accessible label.",
      "Enter submits while Shift+Enter inserts a line break.",
      "Busy, disabled, and empty states disable submission.",
      "Source and model menus expose expanded state.",
      "Every icon-only action has an accessible name.",
      "Rounded, pill, ghost, and compact keep the same keyboard contract.",
    ],
  },
  {
    id: "thinking",
    name: "Thinking",
    category: "AI",
    description:
      "A live and inspectable activity disclosure with explicit states and structured evidence.",
    icon: BrainCircuit,
    usage: `import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking"

export function ActivityState() {
  return (
    <Thinking status="complete">
      <ThinkingTrigger summary="Checking the component contract." duration="1.8s" />
      <ThinkingContent>
        <ThinkingActivity type="file" path="src/components/prompt.tsx" elapsed="0.8s">
          Read the component source
        </ThinkingActivity>
        <ThinkingActivity type="tool" tool="bun run test" elapsed="1.8s">
          Checked the implementation
        </ThinkingActivity>
      </ThinkingContent>
    </Thinking>
  )
}`,
    accessibility: [
      "The trigger exposes expanded and collapsed state.",
      "The trigger references the disclosed content.",
      "New activity is announced through a polite live log.",
      "Activity entries keep their ordered-list semantics.",
      "Status is communicated with text instead of color alone.",
      "Decorative state icons stay hidden from assistive technology.",
    ],
  },
  {
    id: "approval-card",
    name: "Approval Card",
    category: "Feedback",
    description:
      "A controlled decision surface for reviewing an AI action's risk, evidence, and impact.",
    icon: ShieldCheck,
    usage: `import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card"

export function PolicyDecision() {
  return (
    <ApprovalCard risk="high" variant="detailed">
      <ApprovalCardHeader
        title="Deploy the generated refund policy?"
        description="This changes how new refunds are routed."
      />
      <ApprovalCardDetails>
        <ApprovalCardDetail label="Affected resources">
          refund-policy-v4 · 3 queues
        </ApprovalCardDetail>
        <ApprovalCardDetail label="Downstream impact">
          New requests use this policy immediately.
        </ApprovalCardDetail>
      </ApprovalCardDetails>
      <ApprovalCardActions>
        <ApprovalCardReject onClick={() => rejectPolicy()} />
        <ApprovalCardApprove onClick={() => deployPolicy()}>Deploy policy</ApprovalCardApprove>
      </ApprovalCardActions>
    </ApprovalCard>
  )
}`,
    accessibility: [
      "Risk and status always appear as text in addition to icon and color.",
      "Approve and Reject use native buttons with visible keyboard focus.",
      "Submitting disables duplicate decisions and exposes busy state.",
      "Critical approval stays disabled until the confirmation phrase matches.",
      "Errors use an alert while preserving the evidence and retry actions.",
      "Composable details retain description-list semantics.",
    ],
  },
  {
    id: "empty-state",
    name: "Empty State",
    category: "Feedback",
    description: "A composable blank-slate surface with card, plain, compact, and page variants.",
    icon: Inbox,
    usage: `import { ArrowLeft } from "lucide-react"

import {
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateNote,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state"

export function NotFoundPage() {
  return (
    <EmptyState variant="page">
      <EmptyStateMedia aria-hidden="true">404</EmptyStateMedia>
      <EmptyStateContent>
        <EmptyStateHeader>
          <EmptyStateTitle>Page not found</EmptyStateTitle>
          <EmptyStateDescription>
            The page you’re looking for may have moved or no longer exists.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <EmptyStateAction href="/">
            <ArrowLeft aria-hidden="true" />
            Back to home
          </EmptyStateAction>
          <EmptyStateAction emphasis="secondary" href="/components">
            Browse components
          </EmptyStateAction>
        </EmptyStateActions>
        <EmptyStateNote>Error code 404 · Check the address and try again.</EmptyStateNote>
      </EmptyStateContent>
    </EmptyState>
  )
}`,
    accessibility: [
      "The root is labelled by the composed empty-state title.",
      "Static empty content does not announce itself as a live region by default.",
      "Button actions default to type button and links retain native anchor semantics.",
      "Media meaning remains consumer-authored; decorative icons stay hidden from assistive technology.",
      "Long titles and localized descriptions wrap without truncation or horizontal overflow.",
      "Card, plain, compact, and page variants preserve the same content and action contract.",
    ],
  },
  {
    id: "task-list",
    name: "Task List",
    category: "Data Display",
    description: "A composable progress list with card, timeline, and compact variants.",
    icon: ListChecks,
    usage: `import {
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
} from "@/components/ui/uai/task-list"

export function Progress() {
  return (
    <TaskList variant="timeline" aria-label="Release progress">
      <TaskListItem status="complete">
        <TaskListTitle>Review interface</TaskListTitle>
        <TaskListDescription>Props and public behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Check keyboard paths</TaskListTitle>
        <TaskListDescription>Focus and reduced-motion behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="pending">
        <TaskListTitle>Publish the registry item</TaskListTitle>
      </TaskListItem>
    </TaskList>
  )
}`,
    accessibility: [
      "Tasks retain ordered-list semantics.",
      "Every state includes text in addition to color.",
      "The active task exposes current-step semantics.",
      "Active animation respects reduced-motion preferences.",
      "Long titles and descriptions wrap instead of being truncated.",
      "Card, timeline, and compact variants preserve the same semantic contract.",
    ],
  },
  {
    id: "sign-in-card",
    name: "Sign-in Card",
    category: "Authentication",
    description: "A composable sign-in form with card, split, and compact variants.",
    icon: LogIn,
    usage: `import { type FormEvent, useState } from "react"

import {
  SignInCard,
  SignInCardBody,
  SignInCardDescription,
  SignInCardDivider,
  SignInCardError,
  SignInCardField,
  SignInCardFieldMessage,
  SignInCardFields,
  SignInCardFooter,
  SignInCardHeader,
  SignInCardInput,
  SignInCardLabel,
  SignInCardOptions,
  SignInCardProvider,
  SignInCardProviders,
  SignInCardSubmit,
  SignInCardTitle,
  type SignInCardStatus,
} from "@/components/ui/uai/sign-in-card"

export function WorkspaceSignIn() {
  const [status, setStatus] = useState<SignInCardStatus>("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")

    try {
      await authenticate(new FormData(event.currentTarget))
    } catch {
      setStatus("error")
    }
  }

  return (
    <SignInCard variant="card" status={status} onSubmit={handleSubmit}>
      <SignInCardHeader>
        <SignInCardTitle>Welcome back</SignInCardTitle>
        <SignInCardDescription>Sign in to continue to your workspace.</SignInCardDescription>
      </SignInCardHeader>
      <SignInCardBody>
        <SignInCardProviders>
          <SignInCardProvider onClick={() => signInWithSso()}>Continue with SSO</SignInCardProvider>
          <SignInCardProvider onClick={() => signInWithGitHub()}>
            Continue with GitHub
          </SignInCardProvider>
        </SignInCardProviders>
        <SignInCardDivider />
        <SignInCardFields>
          <SignInCardField>
            <SignInCardLabel>Email</SignInCardLabel>
            <SignInCardInput name="email" type="email" autoComplete="email" required />
          </SignInCardField>
          <SignInCardField invalid={status === "error"}>
            <SignInCardLabel>Password</SignInCardLabel>
            <SignInCardInput name="password" revealable autoComplete="current-password" required />
            {status === "error" ? (
              <SignInCardFieldMessage>Check your password and try again.</SignInCardFieldMessage>
            ) : null}
          </SignInCardField>
          <SignInCardOptions>
            <label><input type="checkbox" name="remember" /> Remember me</label>
            <a href="/forgot-password">Forgot password?</a>
          </SignInCardOptions>
          <SignInCardError>We could not sign you in. Check your details and try again.</SignInCardError>
          <SignInCardSubmit>{status === "error" ? "Try again" : "Sign in"}</SignInCardSubmit>
        </SignInCardFields>
      </SignInCardBody>
      <SignInCardFooter>New here? <a href="/sign-up">Create an account</a></SignInCardFooter>
    </SignInCard>
  )
}`,
    accessibility: [
      "The form is labelled by its composed heading and uses native submit behavior.",
      "Every field label is programmatically associated with its input.",
      "The password reveal control exposes its pressed state and never submits the form.",
      "Submitting exposes busy state and disables providers, fields, and duplicate submission.",
      "Credential failures use an assertive alert and associate invalid field feedback.",
      "Card, split, and compact variants preserve the same form and keyboard contract.",
    ],
  },
  {
    id: "sign-up-card",
    name: "Sign-up Card",
    category: "Authentication",
    description: "A composable account creation form with consent, guidance, and verification.",
    icon: UserPlus,
    usage: `import { type FormEvent, useState } from "react"

import {
  SignUpCard,
  SignUpCardBody,
  SignUpCardCheckbox,
  SignUpCardConsent,
  SignUpCardDescription,
  SignUpCardDivider,
  SignUpCardError,
  SignUpCardField,
  SignUpCardFieldMessage,
  SignUpCardFields,
  SignUpCardFooter,
  SignUpCardHeader,
  SignUpCardInput,
  SignUpCardLabel,
  SignUpCardPasswordGuide,
  SignUpCardPasswordRequirement,
  SignUpCardProvider,
  SignUpCardProviders,
  type SignUpCardStatus,
  SignUpCardSubmit,
  SignUpCardTitle,
  SignUpCardVerification,
} from "@/components/ui/uai/sign-up-card"

export function WorkspaceSignUp() {
  const [status, setStatus] = useState<SignUpCardStatus>("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")

    try {
      await createAccount(new FormData(event.currentTarget))
      setStatus("verification")
    } catch {
      setStatus("error")
    }
  }

  return (
    <SignUpCard variant="card" status={status} onSubmit={handleSubmit}>
      <SignUpCardHeader>
        <SignUpCardTitle>{status === "verification" ? "Check your inbox" : "Create your account"}</SignUpCardTitle>
        <SignUpCardDescription>
          {status === "verification"
            ? "We sent a verification link to hello@acme.co."
            : "Start with SSO or use your work email."}
        </SignUpCardDescription>
      </SignUpCardHeader>

      {status === "verification" ? (
        <SignUpCardVerification>Open the link to finish creating your account.</SignUpCardVerification>
      ) : (
        <SignUpCardBody>
          <SignUpCardProviders>
            <SignUpCardProvider onClick={() => signUpWithSso()}>Continue with SSO</SignUpCardProvider>
          </SignUpCardProviders>
          <SignUpCardDivider />
          <SignUpCardFields>
            <SignUpCardField>
              <SignUpCardLabel>Name</SignUpCardLabel>
              <SignUpCardInput name="name" autoComplete="name" required />
            </SignUpCardField>
            <SignUpCardField>
              <SignUpCardLabel>Work email</SignUpCardLabel>
              <SignUpCardInput name="email" type="email" autoComplete="email" required />
            </SignUpCardField>
            <SignUpCardField invalid={status === "error"}>
              <SignUpCardLabel>Password</SignUpCardLabel>
              <SignUpCardInput
                name="password"
                revealable
                autoComplete="new-password"
                aria-describedby="password-requirements"
                required
              />
              <SignUpCardPasswordGuide id="password-requirements">
                <SignUpCardPasswordRequirement met>At least 8 characters</SignUpCardPasswordRequirement>
                <SignUpCardPasswordRequirement met>One number or symbol</SignUpCardPasswordRequirement>
              </SignUpCardPasswordGuide>
              {status === "error" ? (
                <SignUpCardFieldMessage>Choose a stronger password and try again.</SignUpCardFieldMessage>
              ) : null}
            </SignUpCardField>
            <SignUpCardConsent>
              <SignUpCardCheckbox name="terms" required />
              <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span>
            </SignUpCardConsent>
            <SignUpCardError>We could not create your account. Review the fields and try again.</SignUpCardError>
            <SignUpCardSubmit>{status === "error" ? "Try again" : "Create account"}</SignUpCardSubmit>
          </SignUpCardFields>
        </SignUpCardBody>
      )}

      <SignUpCardFooter>Already have an account? <a href="/sign-in">Sign in</a></SignUpCardFooter>
    </SignUpCard>
  )
}`,
    accessibility: [
      "The form is labelled by its composed heading and keeps native submit behavior.",
      "Every account field has a programmatic label and browser autocomplete purpose.",
      "Password requirements include visible met and not-met text in addition to icons.",
      "Terms consent uses a native required checkbox and remains consumer-authored.",
      "Submitting disables duplicate provider, field, consent, and submit actions.",
      "Verification feedback uses a polite status while errors use assertive alerts.",
      "Card, split, and compact variants preserve the same form and keyboard contract.",
    ],
  },
  {
    id: "password-recovery",
    name: "Password Recovery",
    category: "Authentication",
    description: "A controlled recovery workflow with card, split, and compact variants.",
    icon: KeyRound,
    usage: `import { type FormEvent, useState } from "react"

import {
  PasswordRecovery,
  PasswordRecoveryAction,
  PasswordRecoveryActions,
  PasswordRecoveryAside,
  PasswordRecoveryDescription,
  PasswordRecoveryError,
  PasswordRecoveryField,
  PasswordRecoveryFields,
  PasswordRecoveryFooter,
  PasswordRecoveryHeader,
  PasswordRecoveryInput,
  PasswordRecoveryLabel,
  PasswordRecoveryMain,
  PasswordRecoveryProgress,
  PasswordRecoveryProgressItem,
  type PasswordRecoveryStatus,
  PasswordRecoveryStage,
  type PasswordRecoveryStep,
  PasswordRecoveryStatus as PasswordRecoveryStatusMessage,
  PasswordRecoverySubmit,
  PasswordRecoveryTitle,
} from "@/components/ui/uai/password-recovery"

export function WorkspacePasswordRecovery() {
  const [step, setStep] = useState<PasswordRecoveryStep>("request")
  const [status, setStatus] = useState<PasswordRecoveryStatus>("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")

    try {
      if (step === "reset") {
        await updatePassword(new FormData(event.currentTarget))
        setStep("success")
      } else {
        await sendPasswordReset(new FormData(event.currentTarget))
        setStep("sent")
      }
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  return (
    <PasswordRecovery variant="split" step={step} status={status} onSubmit={handleSubmit}>
      <PasswordRecoveryAside>
        <strong>Reset securely</strong>
        <PasswordRecoveryProgress aria-label="Recovery progress">
          <PasswordRecoveryProgressItem state={step === "request" ? "current" : "complete"}>
            Find account
          </PasswordRecoveryProgressItem>
          <PasswordRecoveryProgressItem state={step === "sent" ? "current" : step === "request" ? "upcoming" : "complete"}>
            Check email
          </PasswordRecoveryProgressItem>
          <PasswordRecoveryProgressItem state={step === "reset" ? "current" : step === "success" ? "complete" : "upcoming"}>
            New password
          </PasswordRecoveryProgressItem>
        </PasswordRecoveryProgress>
      </PasswordRecoveryAside>

      <PasswordRecoveryMain>
        <PasswordRecoveryHeader>
          <PasswordRecoveryTitle>Recover your account</PasswordRecoveryTitle>
          <PasswordRecoveryDescription>
            We only use your email to continue this recovery attempt.
          </PasswordRecoveryDescription>
        </PasswordRecoveryHeader>

        <PasswordRecoveryStage when="request">
          <PasswordRecoveryFields>
            <PasswordRecoveryField>
              <PasswordRecoveryLabel>Work email</PasswordRecoveryLabel>
              <PasswordRecoveryInput name="email" type="email" autoComplete="email" required />
            </PasswordRecoveryField>
            <PasswordRecoveryError>We could not send a reset link. Try again.</PasswordRecoveryError>
            <PasswordRecoverySubmit />
          </PasswordRecoveryFields>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="sent">
          <PasswordRecoveryStatusMessage tone="sent">
            If an account matches that email, its reset link is on the way.
          </PasswordRecoveryStatusMessage>
          <PasswordRecoveryActions>
            <PasswordRecoveryAction onClick={() => setStep("request")}>
              Use another email
            </PasswordRecoveryAction>
          </PasswordRecoveryActions>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="reset">
          <PasswordRecoveryFields>
            <PasswordRecoveryField>
              <PasswordRecoveryLabel>New password</PasswordRecoveryLabel>
              <PasswordRecoveryInput name="password" revealable autoComplete="new-password" required />
            </PasswordRecoveryField>
            <PasswordRecoveryError>We could not update your password. Try again.</PasswordRecoveryError>
            <PasswordRecoverySubmit />
          </PasswordRecoveryFields>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="expired">
          <PasswordRecoveryStatusMessage tone="expired">
            This reset link has expired. Request a new one to continue.
          </PasswordRecoveryStatusMessage>
          <PasswordRecoverySubmit />
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="success">
          <PasswordRecoveryStatusMessage tone="success">
            Your password has been updated. You can sign in now.
          </PasswordRecoveryStatusMessage>
        </PasswordRecoveryStage>

        <PasswordRecoveryFooter>
          Remembered it? <a href="/sign-in">Back to sign in</a>
        </PasswordRecoveryFooter>
      </PasswordRecoveryMain>
    </PasswordRecovery>
  )
}`,
    accessibility: [
      "The controlled step renders only the active recovery stage.",
      "Request feedback avoids revealing whether an account exists for the submitted email.",
      "Submitting exposes busy state and disables fields, actions, and duplicate submission.",
      "New-password guidance and validation remain programmatically associated with the field.",
      "Expired links use an assertive alert; sent and success states use polite status messages.",
      "Recovery progress includes complete, current, and upcoming text in addition to icons.",
      "Card, split, and compact variants preserve the same form and keyboard contract.",
    ],
  },
  {
    id: "coupon-field",
    name: "Coupon Field",
    category: "Commerce",
    description: "A checkout-safe discount field with rounded, pill, and compact variants.",
    icon: TicketPercent,
    usage: `import {
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
} from "@/components/ui/uai/coupon-field"

export function DiscountCode() {
  return (
    <CouponField
      variant="rounded"
      status="applied"
      appliedCode="WELCOME20"
      onApply={(code) => validateCoupon(code)}
    >
      <CouponFieldLabel>Discount code</CouponFieldLabel>
      <CouponFieldControl>
        <CouponFieldInput />
        <CouponFieldApply />
      </CouponFieldControl>
      <CouponFieldFeedback>
        <CouponFieldMessage>20% off this order</CouponFieldMessage>
        <CouponFieldRemove onClick={() => removeCoupon()} />
      </CouponFieldFeedback>
    </CouponField>
  )
}`,
    accessibility: [
      "The visible label is programmatically associated with the input.",
      "Enter applies a valid draft without introducing a nested form.",
      "Applying disables duplicate submissions and exposes busy state.",
      "Success and error feedback use the matching live-region urgency.",
      "Invalid state is communicated through text, icon, border, and aria-invalid.",
      "Apply, Replace, and Remove name the action that will happen.",
    ],
  },
  {
    id: "quantity-picker",
    name: "Quantity Picker",
    category: "Commerce",
    description: "A limit-aware stepper with direct input and rounded, pill, and compact variants.",
    icon: PackagePlus,
    usage: `import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
} from "@/components/ui/uai/quantity-picker"

export function CartQuantity() {
  return (
    <QuantityPicker
      variant="rounded"
      defaultValue={2}
      min={1}
      max={5}
      onValueChange={(quantity) => updateCart(quantity)}
    >
      <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
      <QuantityPickerControl>
        <QuantityPickerDecrease />
        <QuantityPickerInput />
        <QuantityPickerIncrease />
      </QuantityPickerControl>
      <QuantityPickerMessage>5 available</QuantityPickerMessage>
    </QuantityPicker>
  )
}`,
    accessibility: [
      "The visible product-specific label is associated with the numeric input.",
      "Increase and Decrease use native buttons with explicit accessible names.",
      "Minimum and maximum values disable the action that cannot proceed.",
      "Direct input commits on blur or Enter, while Escape restores the current value.",
      "Stock feedback is referenced by the input and can be announced by the consumer.",
      "Rounded, pill, and compact variants preserve the same keyboard contract.",
    ],
  },
  {
    id: "cart-item",
    name: "Cart Item",
    category: "Commerce",
    description: "A composable cart line with card, plain, and compact variants.",
    icon: ShoppingCart,
    usage: `import { useState } from "react"

import {
  CartItem,
  CartItemActions,
  CartItemAvailability,
  CartItemContent,
  CartItemDescription,
  CartItemHeader,
  CartItemMedia,
  CartItemOption,
  CartItemOptions,
  CartItemPrice,
  CartItemRemove,
  CartItemTitle,
} from "@/components/ui/uai/cart-item"
import {
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
} from "@/components/ui/uai/quantity-picker"

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

export function ShoppingCartLine() {
  const [quantity, setQuantity] = useState(2)

  return (
    <CartItem variant="card">
      <CartItemMedia>{productImage}</CartItemMedia>
      <CartItemContent>
        <CartItemHeader>
          <div>
            <CartItemTitle>Everyday Tote</CartItemTitle>
            <CartItemDescription>Natural canvas</CartItemDescription>
          </div>
          <CartItemPrice>{formatPrice(quantity * 48)}</CartItemPrice>
        </CartItemHeader>
        <CartItemOptions>
          <CartItemOption label="Color">Natural</CartItemOption>
          <CartItemOption label="Size">One size</CartItemOption>
        </CartItemOptions>
        <CartItemAvailability>In stock · ships in 1–2 days</CartItemAvailability>
        <CartItemActions>
          <QuantityPicker value={quantity} onValueChange={setQuantity} min={1} max={5}>
            <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
            <QuantityPickerControl>
              <QuantityPickerDecrease />
              <QuantityPickerInput />
              <QuantityPickerIncrease />
            </QuantityPickerControl>
            <QuantityPickerMessage className="sr-only">Maximum 5 per order</QuantityPickerMessage>
          </QuantityPicker>
          <CartItemRemove onClick={() => removeItem()} />
        </CartItemActions>
      </CartItemContent>
    </CartItem>
  )
}`,
    accessibility: [
      "The cart line is labelled by its composed product title.",
      "Product options retain description-list semantics.",
      "Availability is written in text and may be announced as a live status.",
      "Quantity keeps its product-specific label and limit behavior.",
      "Remove is a native button with controlled busy and disabled states.",
      "Card, plain, and compact variants preserve the same semantic contract.",
    ],
  },
  {
    id: "price-summary",
    name: "Price Summary",
    category: "Commerce",
    description: "A composable order total with card, plain, and compact variants.",
    icon: ReceiptText,
    usage: `import {
  PriceSummary,
  PriceSummaryDescription,
  PriceSummaryHeader,
  PriceSummaryItem,
  PriceSummaryList,
  PriceSummaryNote,
  PriceSummaryTitle,
  PriceSummaryTotal,
} from "@/components/ui/uai/price-summary"

export function CheckoutTotal() {
  return (
    <PriceSummary variant="card">
      <PriceSummaryHeader>
        <PriceSummaryTitle>Order summary</PriceSummaryTitle>
        <PriceSummaryDescription>3 items · USD</PriceSummaryDescription>
      </PriceSummaryHeader>
      <PriceSummaryList>
        <PriceSummaryItem label="Subtotal">$128.00</PriceSummaryItem>
        <PriceSummaryItem label="WELCOME20" tone="success">−$20.00</PriceSummaryItem>
        <PriceSummaryItem label="Shipping" tone="success">Free</PriceSummaryItem>
        <PriceSummaryItem label="Estimated tax">$9.72</PriceSummaryItem>
        <PriceSummaryTotal hint="Includes estimated tax">$117.72</PriceSummaryTotal>
      </PriceSummaryList>
      <PriceSummaryNote>The final amount is confirmed at payment.</PriceSummaryNote>
    </PriceSummary>
  )
}`,
    accessibility: [
      "The root is labelled by the composed summary title.",
      "Line items and totals retain description-list semantics.",
      "Discounts and free shipping use explicit text in addition to color.",
      "Tabular numerals keep changing amounts aligned and scannable.",
      "Long labels and localized currency values wrap without horizontal overflow.",
      "Card, plain, and compact variants preserve the same semantic structure.",
    ],
  },
  {
    id: "order-status",
    name: "Order Status",
    category: "Commerce",
    description: "A composable fulfillment timeline with card, plain, and compact variants.",
    icon: PackageCheck,
    usage: `import {
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
} from "@/components/ui/uai/order-status"

export function ShipmentProgress() {
  return (
    <OrderStatus variant="card">
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
        <OrderStatusStep>
          <OrderStatusStepTitle>Delivered</OrderStatusStepTitle>
          <OrderStatusStepDescription>Expected Aug 21</OrderStatusStepDescription>
        </OrderStatusStep>
      </OrderStatusProgress>
      <OrderStatusDetails>
        <OrderStatusDetail label="Carrier">Northstar Parcel</OrderStatusDetail>
        <OrderStatusDetail label="Tracking">NSP-2048-1182</OrderStatusDetail>
      </OrderStatusDetails>
      <OrderStatusActions>
        <OrderStatusAction href={trackingUrl} emphasis="primary">Track package</OrderStatusAction>
        <OrderStatusAction href={supportUrl}>Get help</OrderStatusAction>
      </OrderStatusActions>
    </OrderStatus>
  )
}`,
    accessibility: [
      "The root is labelled by the composed order status title.",
      "Fulfillment stages retain ordered-list semantics.",
      "The current stage exposes aria-current without relying on color.",
      "Complete, current, upcoming, and issue states include visible text labels.",
      "Tracking facts retain description-list semantics and wrap long values.",
      "Card, plain, and compact variants preserve the same semantic structure.",
    ],
  },
  {
    id: "app-header",
    name: "App Header",
    category: "Navigation",
    description: "A responsive app bar with bar, floating, and compact variants.",
    icon: PanelTop,
    usage: `import { useState } from "react"
import { Bell, Boxes } from "lucide-react"

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
} from "@/components/ui/uai/app-header"

export function WorkspaceHeader() {
  const [open, setOpen] = useState(false)

  return (
    <AppHeader variant="bar" open={open} onOpenChange={setOpen}>
      <AppHeaderBrand href="/">
        <Boxes aria-hidden="true" />
        Atlas
      </AppHeaderBrand>

      <AppHeaderOverflow>
        <AppHeaderNav>
          <AppHeaderNavItem href="/overview" active>Overview</AppHeaderNavItem>
          <AppHeaderNavItem href="/projects">Projects</AppHeaderNavItem>
          <AppHeaderNavItem href="/reports">Reports</AppHeaderNavItem>
        </AppHeaderNav>
        <AppHeaderSearch
          placeholder="Search workspace"
          onChange={(event) => searchWorkspace(event.currentTarget.value)}
        />
      </AppHeaderOverflow>

      <AppHeaderActions>
        <AppHeaderAction aria-label="Notifications">
          <Bell aria-hidden="true" />
        </AppHeaderAction>
        <AppHeaderAction aria-label="Open account menu" emphasis="primary">
          AC
        </AppHeaderAction>
      </AppHeaderActions>
      <AppHeaderMenuButton />
    </AppHeader>
  )
}`,
    accessibility: [
      "The root uses the native banner landmark and navigation keeps list semantics.",
      "The active destination exposes aria-current without relying on color.",
      "Search has a persistent accessible label and remains consumer-controlled.",
      "The mobile menu button names its action and exposes expanded and controlled state.",
      "Account actions are native buttons with explicit accessible names.",
      "Bar, floating, and compact variants preserve the same navigation contract.",
    ],
  },
] as const;

export const registryCategories: readonly RegistryCategory[] = [
  "All",
  "AI",
  "Feedback",
  "Forms",
  "Data Display",
  "Navigation",
  "Authentication",
  "Commerce",
] as const;

export function getRegistryItem(id: RegistryItemId) {
  const item = registryCatalog.find((entry) => entry.id === id);
  if (item) return item;

  const fallback = registryCatalog.at(0);
  if (!fallback) throw new Error("The Uai registry catalog is empty.");
  return fallback;
}
