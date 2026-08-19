"use client";

import {
  ArrowLeft,
  Bell,
  Boxes,
  Building2,
  Code2,
  FileText,
  FolderOpen,
  Globe,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import {
  APP_HEADER_VARIANTS,
  AppHeader,
  AppHeaderAction,
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderMenuButton,
  AppHeaderNav,
  AppHeaderNavItem,
  AppHeaderOverflow,
  AppHeaderSearch,
  type AppHeaderVariant,
} from "@/components/ui/uai/app-header";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardConfirmation,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardError,
  ApprovalCardHeader,
  ApprovalCardReject,
  type ApprovalCardStatus,
  type ApprovalDecision,
} from "@/components/ui/uai/approval-card";
import {
  CART_ITEM_VARIANTS,
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
  type CartItemVariant,
} from "@/components/ui/uai/cart-item";
import {
  COUPON_FIELD_VARIANTS,
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
  type CouponFieldStatus,
  type CouponFieldVariant,
} from "@/components/ui/uai/coupon-field";
import {
  EMPTY_STATE_VARIANTS,
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateNote,
  EmptyStateTitle,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";
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
} from "@/components/ui/uai/order-status";
import {
  PASSWORD_RECOVERY_VARIANTS,
  PasswordRecovery,
  PasswordRecoveryAction,
  PasswordRecoveryActions,
  PasswordRecoveryAside,
  PasswordRecoveryDescription,
  PasswordRecoveryError,
  PasswordRecoveryField,
  PasswordRecoveryFieldMessage,
  PasswordRecoveryFields,
  PasswordRecoveryFooter,
  PasswordRecoveryHeader,
  PasswordRecoveryInput,
  PasswordRecoveryLabel,
  PasswordRecoveryMain,
  PasswordRecoveryPasswordGuide,
  PasswordRecoveryPasswordRequirement,
  PasswordRecoveryProgress,
  PasswordRecoveryProgressItem,
  PasswordRecoveryStage,
  type PasswordRecoveryStatus,
  PasswordRecoveryStatus as PasswordRecoveryStatusMessage,
  type PasswordRecoveryStep,
  PasswordRecoverySubmit,
  PasswordRecoveryTitle,
  type PasswordRecoveryVariant,
} from "@/components/ui/uai/password-recovery";
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
} from "@/components/ui/uai/price-summary";
import {
  PROMPT_COMPOSER_VARIANTS,
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerAddItem,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import {
  QUANTITY_PICKER_VARIANTS,
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";
import {
  SIGN_IN_CARD_VARIANTS,
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
  type SignInCardStatus,
  SignInCardSubmit,
  SignInCardTitle,
  type SignInCardVariant,
} from "@/components/ui/uai/sign-in-card";
import {
  SIGN_UP_CARD_VARIANTS,
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
  type SignUpCardVariant,
  SignUpCardVerification,
} from "@/components/ui/uai/sign-up-card";
import {
  TASK_LIST_VARIANTS,
  TaskList,
  TaskListDescription,
  TaskListItem,
  TaskListTitle,
  type TaskListVariant,
} from "@/components/ui/uai/task-list";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/components/ui/uai/thinking";

import type { RegistryItemId } from "./catalog";
import { PreviewStage, SegmentedControl } from "./preview-chrome";

const composerModels = [
  { id: "your-model", label: "Your model" },
  { id: "fast", label: "Fast" },
  { id: "precise", label: "Precise" },
] as const;

function ComposerSourceItems() {
  return (
    <>
      <PromptComposerFileItem />
      <PromptComposerAddItem
        icon={<FileText className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        description="Attach saved context"
      >
        Workspace notes
      </PromptComposerAddItem>
      <PromptComposerAddItem
        icon={<Globe className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        description="Live results"
      >
        Web search
      </PromptComposerAddItem>
      <div className="mt-1 border-t border-[var(--uai-border)] px-2 pt-[7px] pb-[5px] text-[11px] text-[var(--uai-muted)]">
        Attach files or mention a source
      </div>
    </>
  );
}

function RegistryTaskItems() {
  return (
    <>
      <TaskListItem status="complete">
        <TaskListTitle>Review the component interface</TaskListTitle>
        <TaskListDescription>Props and public behavior</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="active">
        <TaskListTitle>Check keyboard interaction</TaskListTitle>
        <TaskListDescription>Focus and submit paths</TaskListDescription>
      </TaskListItem>
      <TaskListItem status="pending">
        <TaskListTitle>Build the registry item</TaskListTitle>
        <TaskListDescription>Files and dependencies</TaskListDescription>
      </TaskListItem>
    </>
  );
}

const taskListVariantCopy: Record<TaskListVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Project checklist" },
  timeline: { label: "Timeline", scene: "Workflow progress" },
  compact: { label: "Compact", scene: "Sidebar queue" },
};

function TaskListPreview({ variant }: { variant: TaskListVariant }) {
  const copy = taskListVariantCopy[variant];
  const swapping = useSwapFlag(variant);

  return (
    <PreviewStage contentClassName="uai-preview-medium" label={copy.scene} swapping={swapping}>
      <div className="w-full max-w-[420px]">
        <TaskList variant={variant} aria-label="Release progress">
          <RegistryTaskItems />
        </TaskList>
      </div>
    </PreviewStage>
  );
}

const variantCopy: Record<PromptComposerVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Floating card" },
  pill: { label: "Pill", scene: "Capsule" },
  ghost: { label: "Ghost", scene: "Dock" },
  compact: { label: "Compact", scene: "Sidebar" },
};

function useSwapFlag(token: string) {
  const [swapping, setSwapping] = useState(false);
  const previousToken = useRef(token);

  useEffect(() => {
    if (previousToken.current === token) return;
    previousToken.current = token;
    setSwapping(true);
    const timer = window.setTimeout(() => setSwapping(false), 160);
    return () => window.clearTimeout(timer);
  }, [token]);

  return swapping;
}

function PromptComposerPreview({ variant }: { variant: PromptComposerVariant }) {
  const [submitted, setSubmitted] = useState(false);
  const swapping = useSwapFlag(variant);
  const copy = variantCopy[variant];

  return (
    <PreviewStage
      label={copy.scene}
      status={submitted ? <span role="status">Submitted</span> : null}
      swapping={swapping}
    >
      <div className="uai-prompt-frame" data-scene={variant}>
        <div className={variant === "ghost" ? "uai-prompt-dock" : undefined}>
          <PromptComposer variant={variant} onSubmit={() => setSubmitted(true)}>
            <PromptComposerAdd>
              <ComposerSourceItems />
            </PromptComposerAdd>
            <PromptComposerInput placeholder="Write a message…" />
            <PromptComposerActions>
              <PromptComposerModelSelect models={composerModels} />
              <PromptComposerSubmit />
            </PromptComposerActions>
          </PromptComposer>
        </div>
      </div>
    </PreviewStage>
  );
}

function ThinkingActivities({ status }: { status: "thinking" | "complete" | "error" }) {
  return (
    <>
      <ThinkingActivity type="search" query="Thinking component accessibility" elapsed="0.3s">
        Found the component contract
      </ThinkingActivity>
      <ThinkingActivity type="file" path="src/registry/uai/components/thinking.tsx" elapsed="0.8s">
        Read the public interface
      </ThinkingActivity>
      <ThinkingActivity
        type="tool"
        tool="bun run registry:build"
        elapsed={status === "thinking" ? undefined : status === "complete" ? "3.4s" : "2.6s"}
      >
        {status === "error" ? "Registry build failed" : "Checked the registry output"}
      </ThinkingActivity>
    </>
  );
}

function ThinkingPreview({ status }: { status: "thinking" | "complete" | "error" }) {
  const swapping = useSwapFlag(status);
  const copy = {
    thinking: {
      summary: "Checking the component interface and useful states.",
      duration: "1.8s",
    },
    complete: {
      summary: "The component contract is ready to review.",
      duration: "3.4s",
    },
    error: {
      summary: "The registry build stopped before validation.",
      duration: "2.6s",
    },
  }[status];

  return (
    <PreviewStage contentClassName="uai-preview-narrow" swapping={swapping}>
      <Thinking status={status}>
        <ThinkingTrigger summary={copy.summary} duration={copy.duration} />
        <ThinkingContent>
          <ThinkingActivities status={status} />
        </ThinkingContent>
      </Thinking>
    </PreviewStage>
  );
}

const approvalScenarios = ["compact", "detailed", "critical", "error"] as const;
type ApprovalScenario = (typeof approvalScenarios)[number];

type ApprovalPreviewState =
  | { status: Exclude<ApprovalCardStatus, "submitting" | "error"> }
  | { status: "submitting"; pendingDecision: ApprovalDecision }
  | { status: "error" };

const approvalScenarioCopy: Record<ApprovalScenario, { label: string; scene: string }> = {
  compact: { label: "Compact", scene: "Routine action" },
  detailed: { label: "Detailed", scene: "Impact review" },
  critical: { label: "Critical", scene: "Protected action" },
  error: { label: "Error", scene: "Recovery state" },
};

function DetailedApprovalContent({ critical = false }: { critical?: boolean }) {
  return (
    <>
      <ApprovalCardDetail label="Requested by">Operations agent · Refund triage</ApprovalCardDetail>
      <ApprovalCardDetail label="Affected resources">
        {critical ? "support-search-prod · 8.2M indexed records" : "refund-policy-v4 · 3 queues"}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Proposed changes">
        <ul>
          <li>
            {critical ? "Delete the production search index" : "Route refunds over $500 to review"}
          </li>
          <li>
            {critical ? "Remove its replicas and stored vectors" : "Notify the operations lead"}
          </li>
        </ul>
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Supporting evidence">
        {critical
          ? "No restorable snapshot exists."
          : "A 14-day replay matched 98.6% of prior decisions."}
      </ApprovalCardDetail>
      <ApprovalCardDetail label="Downstream impact" className="sm:col-span-2">
        {critical
          ? "Search will be unavailable until the index is rebuilt from source documents."
          : "New refund requests begin using this policy immediately after approval."}
      </ApprovalCardDetail>
    </>
  );
}

function ApprovalDecisionActions({
  decide,
  approveLabel,
}: {
  decide: (decision: ApprovalDecision) => void;
  approveLabel?: string;
}) {
  return (
    <ApprovalCardActions>
      <ApprovalCardReject onClick={() => decide("rejected")} />
      <ApprovalCardApprove onClick={() => decide("approved")}>{approveLabel}</ApprovalCardApprove>
    </ApprovalCardActions>
  );
}

function ApprovalCardPreview({ scenario }: { scenario: ApprovalScenario }) {
  const [state, setState] = useState<ApprovalPreviewState>({ status: "ready" });
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(scenario);
  const copy = approvalScenarioCopy[scenario];

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState(scenario === "error" ? { status: "error" } : { status: "ready" });
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [scenario]);

  const decide = (decision: ApprovalDecision) => {
    setState({ status: "submitting", pendingDecision: decision });
    timerRef.current = window.setTimeout(() => setState({ status: decision }), 900);
  };

  return (
    <PreviewStage
      className={
        scenario === "critical"
          ? "uai-preview-stage--approval-critical"
          : scenario === "compact"
            ? undefined
            : "uai-preview-stage--approval-detailed"
      }
      contentClassName="uai-preview-medium"
      label={copy.scene}
      swapping={swapping}
    >
      {scenario === "compact" ? (
        <ApprovalCard key={scenario} {...state} risk="low">
          <ApprovalCardHeader
            title="Archive 3 resolved conversations?"
            description="They remain searchable and can be restored later."
          />
          <ApprovalDecisionActions decide={decide} />
        </ApprovalCard>
      ) : scenario === "critical" ? (
        <ApprovalCard
          key={scenario}
          {...state}
          risk="critical"
          variant="detailed"
          confirmation={{ phrase: "support-search-prod" }}
        >
          <ApprovalCardHeader
            title="Delete the production search index?"
            description="This removes the index and every replica. It cannot be undone."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent critical />
          </ApprovalCardDetails>
          <ApprovalCardConfirmation />
          <ApprovalDecisionActions decide={decide} approveLabel="Delete index" />
        </ApprovalCard>
      ) : (
        <ApprovalCard key={scenario} {...state} risk="high" variant="detailed">
          <ApprovalCardHeader
            title="Deploy the generated refund policy?"
            description="This changes how new customer refunds are routed."
          />
          <ApprovalCardDetails>
            <DetailedApprovalContent />
          </ApprovalCardDetails>
          <ApprovalCardError>
            The approval service did not respond. Review the impact and try again.
          </ApprovalCardError>
          <ApprovalDecisionActions
            decide={decide}
            approveLabel={scenario === "error" ? "Try again" : "Deploy policy"}
          />
        </ApprovalCard>
      )}
    </PreviewStage>
  );
}

const emptyStateVariantCopy: Record<EmptyStateVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Project page" },
  plain: { label: "Plain", scene: "Existing panel" },
  compact: { label: "Compact", scene: "Sidebar section" },
  page: { label: "404 Page", scene: "Not-found route" },
};

function EmptyStatePreview({ variant }: { variant: EmptyStateVariant }) {
  const [started, setStarted] = useState(false);
  const swapping = useSwapFlag(variant);
  const copy = emptyStateVariantCopy[variant];
  const page = variant === "page";

  return (
    <PreviewStage
      className={page ? "uai-preview-stage--empty-page" : undefined}
      contentClassName={page ? undefined : "uai-preview-narrow"}
      label={copy.scene}
      swapping={swapping}
    >
      <div
        className={
          page
            ? "w-full max-w-[760px]"
            : variant === "compact"
              ? "w-full max-w-[360px]"
              : "w-full max-w-[420px]"
        }
      >
        <EmptyState variant={variant}>
          <EmptyStateMedia aria-hidden="true">
            {page ? "404" : <FolderOpen strokeWidth={1.7} />}
          </EmptyStateMedia>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>{page ? "Page not found" : "No projects yet"}</EmptyStateTitle>
              <EmptyStateDescription>
                {page
                  ? "The page you’re looking for may have moved or no longer exists."
                  : "Create a project to organize files, feedback, and release notes."}
              </EmptyStateDescription>
            </EmptyStateHeader>
            <EmptyStateActions>
              {page ? (
                <>
                  <EmptyStateAction href="/">
                    <ArrowLeft className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                    Back to home
                  </EmptyStateAction>
                  <EmptyStateAction emphasis="secondary" href="#components">
                    Browse components
                  </EmptyStateAction>
                </>
              ) : (
                <EmptyStateAction disabled={started} onClick={() => setStarted(true)}>
                  <Plus className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                  {started ? "Creation started" : "Create project"}
                </EmptyStateAction>
              )}
            </EmptyStateActions>
            <EmptyStateNote role={!page && started ? "status" : undefined}>
              {page
                ? "Error code 404 · Check the address and try again."
                : started
                  ? "Project setup is ready for the consuming application."
                  : "You can invite collaborators after setup."}
            </EmptyStateNote>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </PreviewStage>
  );
}

const signInCardVariantCopy: Record<SignInCardVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Workspace sign-in" },
  split: { label: "Split", scene: "Authentication page" },
  compact: { label: "Compact", scene: "Account prompt" },
};

function SignInCardPreview({ variant }: { variant: SignInCardVariant }) {
  const [status, setStatus] = useState<SignInCardStatus>("idle");
  const [signedIn, setSignedIn] = useState(false);
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = signInCardVariantCopy[variant];

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function finishAuthentication(success: boolean) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setSignedIn(false);
    setStatus("submitting");
    timerRef.current = window.setTimeout(() => {
      setStatus(success ? "idle" : "error");
      setSignedIn(success);
    }, 800);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    finishAuthentication(password === "preview");
  }

  return (
    <PreviewStage
      className="uai-preview-stage--sign-in"
      contentClassName="uai-preview-medium"
      label={copy.scene}
      status={signedIn ? <span role="status">Signed in</span> : null}
      swapping={swapping}
    >
      <div
        className={
          variant === "split"
            ? "w-full max-w-[680px]"
            : variant === "compact"
              ? "w-full max-w-[320px]"
              : "w-full max-w-[380px]"
        }
      >
        <SignInCard variant={variant} status={status} onSubmit={handleSubmit}>
          <SignInCardHeader>
            <SignInCardTitle>Welcome back</SignInCardTitle>
            <SignInCardDescription>Sign in to continue to your workspace.</SignInCardDescription>
          </SignInCardHeader>
          <SignInCardBody>
            <SignInCardProviders>
              <SignInCardProvider onClick={() => finishAuthentication(true)}>
                <Building2 strokeWidth={1.8} aria-hidden="true" />
                Continue with SSO
              </SignInCardProvider>
              <SignInCardProvider onClick={() => finishAuthentication(true)}>
                <Code2 strokeWidth={1.8} aria-hidden="true" />
                Continue with GitHub
              </SignInCardProvider>
            </SignInCardProviders>
            <SignInCardDivider />
            <SignInCardFields>
              <SignInCardField>
                <SignInCardLabel>Email</SignInCardLabel>
                <SignInCardInput
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue="hello@acme.co"
                  required
                />
              </SignInCardField>
              <SignInCardField invalid={status === "error"}>
                <SignInCardLabel>Password</SignInCardLabel>
                <SignInCardInput
                  name="password"
                  revealable
                  autoComplete="current-password"
                  defaultValue="preview"
                  required
                />
                {status === "error" ? (
                  <SignInCardFieldMessage>
                    That password did not match. Enter “preview” and try again.
                  </SignInCardFieldMessage>
                ) : null}
              </SignInCardField>
              <SignInCardOptions>
                <label>
                  <input type="checkbox" name="remember" defaultChecked /> Remember me
                </label>
                <a href="#recovery">Forgot password?</a>
              </SignInCardOptions>
              <SignInCardError>
                We could not sign you in. Check your details and try again.
              </SignInCardError>
              <SignInCardSubmit>{status === "error" ? "Try again" : "Sign in"}</SignInCardSubmit>
            </SignInCardFields>
          </SignInCardBody>
          <SignInCardFooter>
            New here? <a href="#sign-up">Create an account</a>
          </SignInCardFooter>
        </SignInCard>
      </div>
    </PreviewStage>
  );
}

const signUpCardVariantCopy: Record<SignUpCardVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Account creation" },
  split: { label: "Split", scene: "Sign-up page" },
  compact: { label: "Compact", scene: "Team invitation" },
};

function SignUpCardPreview({ variant }: { variant: SignUpCardVariant }) {
  const [status, setStatus] = useState<SignUpCardStatus>("idle");
  const [password, setPassword] = useState("Preview123!");
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = signUpCardVariantCopy[variant];
  const hasMinimumLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d\W]/.test(password);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function finishAccountCreation(success: boolean) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("submitting");
    timerRef.current = window.setTimeout(() => setStatus(success ? "verification" : "error"), 800);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finishAccountCreation(hasMinimumLength && hasNumberOrSymbol);
  }

  return (
    <PreviewStage
      className="uai-preview-stage--sign-in"
      contentClassName="uai-preview-medium"
      label={copy.scene}
      status={status === "verification" ? <span>Verification sent</span> : null}
      swapping={swapping}
    >
      <div
        className={
          variant === "split"
            ? "w-full max-w-[680px]"
            : variant === "compact"
              ? "w-full max-w-[320px]"
              : "w-full max-w-[400px]"
        }
      >
        <SignUpCard variant={variant} status={status} onSubmit={handleSubmit}>
          <SignUpCardHeader>
            <SignUpCardTitle>
              {status === "verification" ? "Check your inbox" : "Create your account"}
            </SignUpCardTitle>
            <SignUpCardDescription>
              {status === "verification"
                ? "We sent a verification link to hello@acme.co."
                : "Start with SSO or use your work email."}
            </SignUpCardDescription>
          </SignUpCardHeader>

          {status === "verification" ? (
            <SignUpCardVerification>
              <span>Open the link to finish creating your account.</span>
              <button
                type="button"
                className="font-medium text-[var(--uai-text)] underline underline-offset-4"
                onClick={() => setStatus("idle")}
              >
                Use another email
              </button>
            </SignUpCardVerification>
          ) : (
            <SignUpCardBody>
              <SignUpCardProviders>
                <SignUpCardProvider onClick={() => finishAccountCreation(true)}>
                  <Building2 strokeWidth={1.8} aria-hidden="true" />
                  Continue with SSO
                </SignUpCardProvider>
                <SignUpCardProvider onClick={() => finishAccountCreation(true)}>
                  <Code2 strokeWidth={1.8} aria-hidden="true" />
                  Continue with GitHub
                </SignUpCardProvider>
              </SignUpCardProviders>
              <SignUpCardDivider />
              <SignUpCardFields>
                <SignUpCardField>
                  <SignUpCardLabel>Name</SignUpCardLabel>
                  <SignUpCardInput
                    name="name"
                    autoComplete="name"
                    defaultValue="Alex Morgan"
                    required
                  />
                </SignUpCardField>
                <SignUpCardField>
                  <SignUpCardLabel>Work email</SignUpCardLabel>
                  <SignUpCardInput
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue="hello@acme.co"
                    required
                  />
                </SignUpCardField>
                <SignUpCardField invalid={status === "error"}>
                  <SignUpCardLabel>Password</SignUpCardLabel>
                  <SignUpCardInput
                    name="password"
                    revealable
                    autoComplete="new-password"
                    aria-describedby="preview-password-requirements"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.currentTarget.value);
                      if (status === "error") setStatus("idle");
                    }}
                    required
                  />
                  <SignUpCardPasswordGuide id="preview-password-requirements">
                    <SignUpCardPasswordRequirement met={hasMinimumLength}>
                      At least 8 characters
                    </SignUpCardPasswordRequirement>
                    <SignUpCardPasswordRequirement met={hasNumberOrSymbol}>
                      One number or symbol
                    </SignUpCardPasswordRequirement>
                  </SignUpCardPasswordGuide>
                  {status === "error" ? (
                    <SignUpCardFieldMessage>
                      Meet both password requirements and try again.
                    </SignUpCardFieldMessage>
                  ) : null}
                </SignUpCardField>
                <SignUpCardConsent>
                  <SignUpCardCheckbox name="terms" defaultChecked required />
                  <span>
                    I agree to the <a href="#terms">Terms</a> and{" "}
                    <a href="#privacy">Privacy Policy</a>.
                  </span>
                </SignUpCardConsent>
                <SignUpCardError>
                  We could not create your account. Review the password and try again.
                </SignUpCardError>
                <SignUpCardSubmit>
                  {status === "error" ? "Try again" : "Create account"}
                </SignUpCardSubmit>
              </SignUpCardFields>
            </SignUpCardBody>
          )}

          <SignUpCardFooter>
            Already have an account? <a href="#sign-in">Sign in</a>
          </SignUpCardFooter>
        </SignUpCard>
      </div>
    </PreviewStage>
  );
}

const passwordRecoveryVariantCopy: Record<
  PasswordRecoveryVariant,
  { label: string; scene: string }
> = {
  card: { label: "Card", scene: "Recovery dialog" },
  split: { label: "Split", scene: "Recovery page" },
  compact: { label: "Compact", scene: "Account support" },
};

function PasswordRecoveryPreview({ variant }: { variant: PasswordRecoveryVariant }) {
  const [step, setStep] = useState<PasswordRecoveryStep>("request");
  const [status, setStatus] = useState<PasswordRecoveryStatus>("idle");
  const [password, setPassword] = useState("Preview123!");
  const [confirmation, setConfirmation] = useState("Preview123!");
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = passwordRecoveryVariantCopy[variant];
  const passwordValid = password.length >= 8 && /[\d\W]/.test(password);
  const passwordsMatch = password === confirmation;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function moveTo(nextStep: PasswordRecoveryStep) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("idle");
    setStep(nextStep);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("submitting");

    timerRef.current = window.setTimeout(() => {
      if (step === "reset") {
        setStatus(passwordValid && passwordsMatch ? "idle" : "error");
        if (passwordValid && passwordsMatch) setStep("success");
        return;
      }

      setStatus("idle");
      setStep("sent");
    }, 800);
  }

  const progress = {
    account: step === "request" ? "current" : "complete",
    email:
      step === "sent" || step === "expired"
        ? "current"
        : step === "request"
          ? "upcoming"
          : "complete",
    password: step === "reset" ? "current" : step === "success" ? "complete" : "upcoming",
  } as const;

  const heading = {
    request: "Recover your account",
    sent: "Check your inbox",
    reset: "Choose a new password",
    expired: "Reset link expired",
    success: "Password updated",
  }[step];

  const description = {
    request: "Enter the email you use for this workspace.",
    sent: "The next step is available from your recovery email.",
    reset: "Use a password you have not used for this account before.",
    expired: "Request a fresh link to continue securely.",
    success: "Your account is ready for you to sign in again.",
  }[step];

  return (
    <PreviewStage
      className="uai-preview-stage--sign-in"
      contentClassName="uai-preview-medium"
      label={copy.scene}
      status={<span>{heading}</span>}
      swapping={swapping}
    >
      <div
        className={
          variant === "split"
            ? "w-full max-w-[680px]"
            : variant === "compact"
              ? "w-full max-w-[320px]"
              : "w-full max-w-[400px]"
        }
      >
        <PasswordRecovery variant={variant} step={step} status={status} onSubmit={handleSubmit}>
          <PasswordRecoveryAside>
            <strong>Reset securely</strong>
            <p>Three clear steps keep the recovery path visible.</p>
            <PasswordRecoveryProgress aria-label="Recovery progress">
              <PasswordRecoveryProgressItem state={progress.account}>
                Find account
              </PasswordRecoveryProgressItem>
              <PasswordRecoveryProgressItem state={progress.email}>
                Check email
              </PasswordRecoveryProgressItem>
              <PasswordRecoveryProgressItem state={progress.password}>
                New password
              </PasswordRecoveryProgressItem>
            </PasswordRecoveryProgress>
          </PasswordRecoveryAside>

          <PasswordRecoveryMain>
            <PasswordRecoveryHeader>
              <PasswordRecoveryTitle>{heading}</PasswordRecoveryTitle>
              <PasswordRecoveryDescription>{description}</PasswordRecoveryDescription>
            </PasswordRecoveryHeader>

            <PasswordRecoveryStage when="request">
              <PasswordRecoveryFields>
                <PasswordRecoveryField>
                  <PasswordRecoveryLabel>Work email</PasswordRecoveryLabel>
                  <PasswordRecoveryInput
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue="hello@acme.co"
                    required
                  />
                  <PasswordRecoveryFieldMessage>
                    We will not reveal whether an account matches this email.
                  </PasswordRecoveryFieldMessage>
                </PasswordRecoveryField>
                <PasswordRecoveryError>
                  We could not send the reset link. Check your connection and try again.
                </PasswordRecoveryError>
                <PasswordRecoverySubmit />
              </PasswordRecoveryFields>
            </PasswordRecoveryStage>

            <PasswordRecoveryStage when="sent">
              <PasswordRecoveryStatusMessage tone="sent">
                <span>
                  If an account matches{" "}
                  <strong className="text-[var(--uai-text)]">hello@acme.co</strong>, its reset link
                  is on the way.
                </span>
              </PasswordRecoveryStatusMessage>
              <PasswordRecoveryActions>
                <PasswordRecoveryAction onClick={() => moveTo("reset")}>
                  Open preview reset link
                </PasswordRecoveryAction>
                <PasswordRecoveryAction onClick={() => moveTo("expired")}>
                  Preview expired link
                </PasswordRecoveryAction>
                <PasswordRecoveryAction onClick={() => moveTo("request")}>
                  Use another email
                </PasswordRecoveryAction>
              </PasswordRecoveryActions>
            </PasswordRecoveryStage>

            <PasswordRecoveryStage when="reset">
              <PasswordRecoveryFields>
                <PasswordRecoveryField invalid={status === "error" && !passwordValid}>
                  <PasswordRecoveryLabel>New password</PasswordRecoveryLabel>
                  <PasswordRecoveryInput
                    name="password"
                    revealable
                    autoComplete="new-password"
                    aria-describedby="preview-reset-password-requirements"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.currentTarget.value);
                      if (status === "error") setStatus("idle");
                    }}
                    required
                  />
                  <PasswordRecoveryPasswordGuide id="preview-reset-password-requirements">
                    <PasswordRecoveryPasswordRequirement met={password.length >= 8}>
                      At least 8 characters
                    </PasswordRecoveryPasswordRequirement>
                    <PasswordRecoveryPasswordRequirement met={/[\d\W]/.test(password)}>
                      One number or symbol
                    </PasswordRecoveryPasswordRequirement>
                  </PasswordRecoveryPasswordGuide>
                </PasswordRecoveryField>
                <PasswordRecoveryField invalid={status === "error" && !passwordsMatch}>
                  <PasswordRecoveryLabel>Confirm new password</PasswordRecoveryLabel>
                  <PasswordRecoveryInput
                    name="confirmation"
                    revealable
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(event.currentTarget.value);
                      if (status === "error") setStatus("idle");
                    }}
                    required
                  />
                  {status === "error" && !passwordsMatch ? (
                    <PasswordRecoveryFieldMessage>
                      Enter the same password in both fields.
                    </PasswordRecoveryFieldMessage>
                  ) : null}
                </PasswordRecoveryField>
                <PasswordRecoveryError>
                  Review the new password and try again.
                </PasswordRecoveryError>
                <PasswordRecoverySubmit />
              </PasswordRecoveryFields>
            </PasswordRecoveryStage>

            <PasswordRecoveryStage when="expired">
              <PasswordRecoveryStatusMessage tone="expired">
                This reset link has expired. Request a fresh link to continue.
              </PasswordRecoveryStatusMessage>
              <PasswordRecoverySubmit />
            </PasswordRecoveryStage>

            <PasswordRecoveryStage when="success">
              <PasswordRecoveryStatusMessage tone="success">
                Your password has been updated. You can sign in with it now.
              </PasswordRecoveryStatusMessage>
              <PasswordRecoveryActions>
                <PasswordRecoveryAction onClick={() => moveTo("request")}>
                  Start over
                </PasswordRecoveryAction>
              </PasswordRecoveryActions>
            </PasswordRecoveryStage>

            <PasswordRecoveryFooter>
              Remembered it? <a href="#sign-in">Back to sign in</a>
            </PasswordRecoveryFooter>
          </PasswordRecoveryMain>
        </PasswordRecovery>
      </div>
    </PreviewStage>
  );
}

const couponVariantCopy: Record<CouponFieldVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Checkout summary" },
  pill: { label: "Pill", scene: "Promotion panel" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

function CouponFieldPreview({ variant }: { variant: CouponFieldVariant }) {
  const [status, setStatus] = useState<CouponFieldStatus>("applied");
  const [appliedCode, setAppliedCode] = useState<string | undefined>("WELCOME20");
  const [draft, setDraft] = useState("WELCOME20");
  const timerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = couponVariantCopy[variant];

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const applyCoupon = (code: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setDraft(code);
    setStatus("applying");
    timerRef.current = window.setTimeout(() => {
      const normalizedCode = code.toUpperCase();
      if (normalizedCode === "WELCOME20" || normalizedCode === "SAVE20") {
        setDraft(normalizedCode);
        setAppliedCode(normalizedCode);
        setStatus("applied");
        return;
      }

      setStatus("error");
    }, 700);
  };

  const removeCoupon = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setAppliedCode(undefined);
    setStatus("idle");
  };

  const feedback =
    status === "applying"
      ? "Checking this code…"
      : status === "error"
        ? `${draft.trim().toUpperCase() || "This code"} wasn’t recognized. Check it and try again.${appliedCode ? ` ${appliedCode} still applies.` : ""}`
        : status === "applied"
          ? `${appliedCode} applied · 20% off this order`
          : "Add a code before you check out.";

  return (
    <PreviewStage contentClassName="uai-preview-medium" label={copy.scene} swapping={swapping}>
      <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
        <div className="mb-5 flex items-baseline justify-between border-b border-[var(--uai-border)] pb-3">
          <h2 className="text-sm leading-5 font-medium">Order summary</h2>
          <span className="text-[12px] text-[var(--uai-muted)]">2 items</span>
        </div>

        <CouponField
          variant={variant}
          status={status}
          appliedCode={appliedCode}
          value={draft}
          onValueChange={setDraft}
          onApply={applyCoupon}
        >
          <CouponFieldLabel>Discount code</CouponFieldLabel>
          <CouponFieldControl>
            <CouponFieldInput />
            <CouponFieldApply />
          </CouponFieldControl>
          <CouponFieldFeedback>
            <CouponFieldMessage>{feedback}</CouponFieldMessage>
            <CouponFieldRemove onClick={removeCoupon} />
          </CouponFieldFeedback>
        </CouponField>

        <dl className="mt-5 space-y-2 border-t border-[var(--uai-border)] pt-4 text-[12px] leading-4 tabular-nums">
          <div className="flex justify-between text-[var(--uai-muted)]">
            <dt>Subtotal</dt>
            <dd>$90.00</dd>
          </div>
          {appliedCode ? (
            <div className="flex justify-between text-[var(--uai-success)]">
              <dt>Discount</dt>
              <dd>−$18.00</dd>
            </div>
          ) : null}
          <div className="flex justify-between pt-1 text-sm font-medium">
            <dt>Total</dt>
            <dd>{appliedCode ? "$72.00" : "$90.00"}</dd>
          </div>
        </dl>
      </div>
    </PreviewStage>
  );
}

const quantityPickerVariantCopy: Record<QuantityPickerVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Product detail" },
  pill: { label: "Pill", scene: "Cart line" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

function QuantityPickerPreview({ variant }: { variant: QuantityPickerVariant }) {
  const [quantity, setQuantity] = useState(2);
  const swapping = useSwapFlag(variant);
  const copy = quantityPickerVariantCopy[variant];
  const atLimit = quantity === 5;

  return (
    <PreviewStage contentClassName="uai-preview-medium" label={copy.scene} swapping={swapping}>
      <article className="w-full max-w-[380px]">
        <div className="border-b border-[var(--uai-border)] pb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 className="text-sm leading-5 font-medium">Everyday Tote</h2>
              <p className="mt-0.5 text-[12px] leading-4 text-[var(--uai-muted)]">
                Natural canvas · One size
              </p>
            </div>
            <p className="shrink-0 text-sm leading-5 font-medium tabular-nums">$48.00</p>
          </div>
          <p className="mt-3 text-[12px] leading-4 text-[var(--uai-muted)]">
            Ships in 1–2 business days
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-6">
          <QuantityPicker
            variant={variant}
            value={quantity}
            onValueChange={setQuantity}
            min={1}
            max={5}
          >
            <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
            <QuantityPickerControl>
              <QuantityPickerDecrease />
              <QuantityPickerInput />
              <QuantityPickerIncrease />
            </QuantityPickerControl>
            <QuantityPickerMessage tone={atLimit ? "warning" : "muted"} role="status">
              {atLimit ? "Limit reached · 5 available" : "5 available · max per order"}
            </QuantityPickerMessage>
          </QuantityPicker>

          <div className="shrink-0 pb-5 text-right tabular-nums">
            <span className="block text-[0.72rem] leading-4 text-[var(--uai-muted)]">
              Line total
            </span>
            <strong className="mt-0.5 block text-base leading-5 font-semibold tracking-[-0.02em]">
              ${(quantity * 48).toFixed(2)}
            </strong>
          </div>
        </div>
      </article>
    </PreviewStage>
  );
}

const cartItemVariantCopy: Record<CartItemVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Shopping cart" },
  plain: { label: "Plain", scene: "Checkout review" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

const cartItemQuantityVariant: Record<CartItemVariant, QuantityPickerVariant> = {
  card: "rounded",
  plain: "pill",
  compact: "compact",
};

function CartItemPreview({ variant }: { variant: CartItemVariant }) {
  const [quantity, setQuantity] = useState(2);
  const [removing, setRemoving] = useState(false);
  const removeTimerRef = useRef<number | null>(null);
  const swapping = useSwapFlag(variant);
  const copy = cartItemVariantCopy[variant];
  const atLimit = quantity === 5;

  useEffect(() => {
    return () => {
      if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    };
  }, []);

  function removeItem() {
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);
    setRemoving(true);
    removeTimerRef.current = window.setTimeout(() => setRemoving(false), 900);
  }

  return (
    <PreviewStage contentClassName="uai-preview-medium" label={copy.scene} swapping={swapping}>
      <div className={variant === "compact" ? "w-full max-w-[360px]" : "w-full max-w-[480px]"}>
        <CartItem variant={variant}>
          <CartItemMedia role="img" aria-label="Natural canvas Everyday Tote">
            <div className="flex size-full items-center justify-center text-[var(--uai-muted)]">
              <ShoppingBag className="size-8" strokeWidth={1.35} aria-hidden="true" />
            </div>
          </CartItemMedia>
          <CartItemContent>
            <CartItemHeader>
              <div className="min-w-0">
                <CartItemTitle>Everyday Tote</CartItemTitle>
                <CartItemDescription>Heavyweight natural canvas</CartItemDescription>
              </div>
              <CartItemPrice>${(quantity * 48).toFixed(2)}</CartItemPrice>
            </CartItemHeader>
            <CartItemOptions>
              <CartItemOption label="Color">Natural</CartItemOption>
              <CartItemOption label="Size">One size</CartItemOption>
            </CartItemOptions>
            <CartItemAvailability tone={atLimit ? "low" : "available"} role="status">
              {atLimit ? "Order limit reached · 5 available" : "In stock · ships in 1–2 days"}
            </CartItemAvailability>
            <CartItemActions>
              <QuantityPicker
                variant={cartItemQuantityVariant[variant]}
                value={quantity}
                onValueChange={setQuantity}
                min={1}
                max={5}
              >
                <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
                <QuantityPickerControl>
                  <QuantityPickerDecrease />
                  <QuantityPickerInput />
                  <QuantityPickerIncrease />
                </QuantityPickerControl>
                <QuantityPickerMessage className="sr-only">
                  Maximum 5 per order
                </QuantityPickerMessage>
              </QuantityPicker>
              <CartItemRemove removing={removing} onClick={removeItem} />
            </CartItemActions>
          </CartItemContent>
        </CartItem>
      </div>
    </PreviewStage>
  );
}

const priceSummaryVariantCopy: Record<PriceSummaryVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Checkout sidebar" },
  plain: { label: "Plain", scene: "Payment step" },
  compact: { label: "Compact", scene: "Cart drawer" },
};

function PriceSummaryPreview({ variant }: { variant: PriceSummaryVariant }) {
  const swapping = useSwapFlag(variant);
  const copy = priceSummaryVariantCopy[variant];

  return (
    <PreviewStage contentClassName="uai-preview-narrow" label={copy.scene} swapping={swapping}>
      <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
        <PriceSummary variant={variant}>
          <PriceSummaryHeader>
            <PriceSummaryTitle>Order summary</PriceSummaryTitle>
            <PriceSummaryDescription>3 items · Ready to check out</PriceSummaryDescription>
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
      </div>
    </PreviewStage>
  );
}

const orderStatusVariantCopy: Record<OrderStatusVariant, { label: string; scene: string }> = {
  card: { label: "Card", scene: "Account order" },
  plain: { label: "Plain", scene: "Confirmation page" },
  compact: { label: "Compact", scene: "Order drawer" },
};

function OrderStatusPreview({ variant }: { variant: OrderStatusVariant }) {
  const swapping = useSwapFlag(variant);
  const copy = orderStatusVariantCopy[variant];

  return (
    <PreviewStage contentClassName="uai-preview-narrow" label={copy.scene} swapping={swapping}>
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
    </PreviewStage>
  );
}

const appHeaderVariantCopy: Record<AppHeaderVariant, { label: string; scene: string }> = {
  bar: { label: "Bar", scene: "Application shell" },
  floating: { label: "Floating", scene: "Inset workspace" },
  compact: { label: "Compact", scene: "Operations console" },
};

function AppHeaderPreview({ variant }: { variant: AppHeaderVariant }) {
  const [open, setOpen] = useState(false);
  const swapping = useSwapFlag(variant);
  const copy = appHeaderVariantCopy[variant];

  return (
    <PreviewStage label={copy.scene} swapping={swapping}>
      <div
        className={
          variant === "floating"
            ? "w-full max-w-[920px] px-3"
            : variant === "compact"
              ? "w-full max-w-[780px]"
              : "w-full max-w-[920px]"
        }
      >
        <AppHeader variant={variant} open={open} onOpenChange={setOpen}>
          <AppHeaderBrand href="#workspace">
            <span
              className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-[var(--uai-text)] text-[var(--uai-surface)]"
              aria-hidden="true"
            >
              <Boxes className="size-3.5" strokeWidth={1.8} />
            </span>
            Atlas
          </AppHeaderBrand>

          <AppHeaderOverflow>
            <AppHeaderNav>
              <AppHeaderNavItem href="#overview" active>
                Overview
              </AppHeaderNavItem>
              <AppHeaderNavItem href="#projects">Projects</AppHeaderNavItem>
              <AppHeaderNavItem href="#reports">Reports</AppHeaderNavItem>
            </AppHeaderNav>
            <AppHeaderSearch placeholder="Search workspace" />
          </AppHeaderOverflow>

          <AppHeaderActions>
            <AppHeaderAction aria-label="Notifications">
              <Bell className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </AppHeaderAction>
            <AppHeaderAction aria-label="Open account menu" emphasis="primary">
              AC
            </AppHeaderAction>
          </AppHeaderActions>
          <AppHeaderMenuButton />
        </AppHeader>
      </div>
    </PreviewStage>
  );
}

type PreviewControl = {
  ariaLabel: string;
  defaultValue: string;
  options: readonly { id: string; label: string }[];
};

function getPreviewControl(itemId: RegistryItemId): PreviewControl | undefined {
  if (itemId === "prompt-composer") {
    return {
      ariaLabel: "Composer variant",
      defaultValue: "rounded",
      options: PROMPT_COMPOSER_VARIANTS.map((option) => ({
        id: option,
        label: variantCopy[option].label,
      })),
    };
  }

  if (itemId === "thinking") {
    return {
      ariaLabel: "Thinking status",
      defaultValue: "thinking",
      options: [
        { id: "thinking", label: "Live" },
        { id: "complete", label: "Complete" },
        { id: "error", label: "Error" },
      ],
    };
  }

  if (itemId === "approval-card") {
    return {
      ariaLabel: "Approval card variant",
      defaultValue: "compact",
      options: approvalScenarios.map((option) => ({
        id: option,
        label: approvalScenarioCopy[option].label,
      })),
    };
  }

  if (itemId === "empty-state") {
    return {
      ariaLabel: "Empty state variant",
      defaultValue: "page",
      options: EMPTY_STATE_VARIANTS.map((option) => ({
        id: option,
        label: emptyStateVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "task-list") {
    return {
      ariaLabel: "Task list variant",
      defaultValue: "card",
      options: TASK_LIST_VARIANTS.map((option) => ({
        id: option,
        label: taskListVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "coupon-field") {
    return {
      ariaLabel: "Coupon field variant",
      defaultValue: "rounded",
      options: COUPON_FIELD_VARIANTS.map((option) => ({
        id: option,
        label: couponVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "sign-in-card") {
    return {
      ariaLabel: "Sign-in card variant",
      defaultValue: "card",
      options: SIGN_IN_CARD_VARIANTS.map((option) => ({
        id: option,
        label: signInCardVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "sign-up-card") {
    return {
      ariaLabel: "Sign-up card variant",
      defaultValue: "card",
      options: SIGN_UP_CARD_VARIANTS.map((option) => ({
        id: option,
        label: signUpCardVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "password-recovery") {
    return {
      ariaLabel: "Password recovery variant",
      defaultValue: "card",
      options: PASSWORD_RECOVERY_VARIANTS.map((option) => ({
        id: option,
        label: passwordRecoveryVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "quantity-picker") {
    return {
      ariaLabel: "Quantity picker variant",
      defaultValue: "rounded",
      options: QUANTITY_PICKER_VARIANTS.map((option) => ({
        id: option,
        label: quantityPickerVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "cart-item") {
    return {
      ariaLabel: "Cart item variant",
      defaultValue: "card",
      options: CART_ITEM_VARIANTS.map((option) => ({
        id: option,
        label: cartItemVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "price-summary") {
    return {
      ariaLabel: "Price summary variant",
      defaultValue: "card",
      options: PRICE_SUMMARY_VARIANTS.map((option) => ({
        id: option,
        label: priceSummaryVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "order-status") {
    return {
      ariaLabel: "Order status variant",
      defaultValue: "card",
      options: ORDER_STATUS_VARIANTS.map((option) => ({
        id: option,
        label: orderStatusVariantCopy[option].label,
      })),
    };
  }

  if (itemId === "app-header") {
    return {
      ariaLabel: "App header variant",
      defaultValue: "bar",
      options: APP_HEADER_VARIANTS.map((option) => ({
        id: option,
        label: appHeaderVariantCopy[option].label,
      })),
    };
  }
}

function renderPreview(itemId: RegistryItemId, selection: string) {
  if (itemId === "prompt-composer") {
    return <PromptComposerPreview variant={selection as PromptComposerVariant} />;
  }
  if (itemId === "thinking") {
    return <ThinkingPreview status={selection as "thinking" | "complete" | "error"} />;
  }
  if (itemId === "approval-card") {
    return <ApprovalCardPreview scenario={selection as ApprovalScenario} />;
  }
  if (itemId === "empty-state") {
    return <EmptyStatePreview variant={selection as EmptyStateVariant} />;
  }
  if (itemId === "task-list") {
    return <TaskListPreview variant={selection as TaskListVariant} />;
  }
  if (itemId === "coupon-field") {
    return <CouponFieldPreview variant={selection as CouponFieldVariant} />;
  }
  if (itemId === "sign-in-card") {
    return <SignInCardPreview variant={selection as SignInCardVariant} />;
  }
  if (itemId === "sign-up-card") {
    return <SignUpCardPreview variant={selection as SignUpCardVariant} />;
  }
  if (itemId === "password-recovery") {
    return <PasswordRecoveryPreview variant={selection as PasswordRecoveryVariant} />;
  }
  if (itemId === "quantity-picker") {
    return <QuantityPickerPreview variant={selection as QuantityPickerVariant} />;
  }
  if (itemId === "cart-item") {
    return <CartItemPreview variant={selection as CartItemVariant} />;
  }
  if (itemId === "price-summary") {
    return <PriceSummaryPreview variant={selection as PriceSummaryVariant} />;
  }
  if (itemId === "order-status") {
    return <OrderStatusPreview variant={selection as OrderStatusVariant} />;
  }
  if (itemId === "app-header") {
    return <AppHeaderPreview variant={selection as AppHeaderVariant} />;
  }

  return null;
}

export function RegistryPreview({
  itemId,
  codeExample,
}: {
  itemId: RegistryItemId;
  codeExample: ReactNode;
}) {
  const control = getPreviewControl(itemId);
  const [selections, setSelections] = useState<Partial<Record<RegistryItemId, string>>>({});
  const selection = selections[itemId] ?? control?.defaultValue ?? "";

  return (
    <div className="uai-registry-showcase" data-has-variants={control ? "true" : undefined}>
      <div className="uai-registry-specimen">
        {renderPreview(itemId, selection)}
        {codeExample}
      </div>

      {control ? (
        <aside className="uai-registry-variant-rail" aria-label="Preview variants">
          <span>Variants</span>
          <SegmentedControl
            ariaLabel={control.ariaLabel}
            orientation="vertical"
            value={selection}
            onChange={(value) => setSelections((current) => ({ ...current, [itemId]: value }))}
            options={control.options}
          />
        </aside>
      ) : null}
    </div>
  );
}
