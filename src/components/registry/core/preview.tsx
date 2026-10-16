"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { APP_HEADER_VARIANTS, type AppHeaderVariant } from "@/components/ui/uai/app-header";
import { CART_ITEM_VARIANTS, type CartItemVariant } from "@/components/ui/uai/cart-item";
import { COUPON_FIELD_VARIANTS, type CouponFieldVariant } from "@/components/ui/uai/coupon-field";
import { EMPTY_STATE_VARIANTS, type EmptyStateVariant } from "@/components/ui/uai/empty-state";
import { ORDER_STATUS_VARIANTS, type OrderStatusVariant } from "@/components/ui/uai/order-status";
import {
  PASSWORD_RECOVERY_VARIANTS,
  type PasswordRecoveryVariant,
} from "@/components/ui/uai/password-recovery";
import {
  PRICE_SUMMARY_VARIANTS,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";
import {
  PROMPT_COMPOSER_VARIANTS,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import {
  QUANTITY_PICKER_VARIANTS,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";
import { SIGN_IN_CARD_VARIANTS, type SignInCardVariant } from "@/components/ui/uai/sign-in-card";
import { SIGN_UP_CARD_VARIANTS, type SignUpCardVariant } from "@/components/ui/uai/sign-up-card";
import { TASK_LIST_VARIANTS, type TaskListVariant } from "@/components/ui/uai/task-list";
import { THINKING_VARIANTS, type ThinkingVariant } from "@/components/ui/uai/thinking";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AppHeaderPreview } from "./app-header-preview";
import {
  ApprovalCardPreview,
  type ApprovalScenario,
  approvalScenarios,
} from "./approval-card-preview";
import { CartItemPreview } from "./cart-item-preview";
import { CouponFieldPreview } from "./coupon-field-preview";
import { EmptyStatePreview } from "./empty-state-preview";
import { OrderStatusPreview } from "./order-status-preview";
import { PasswordRecoveryPreview } from "./password-recovery-preview";
import { PriceSummaryPreview } from "./price-summary-preview";
import { PromptComposerPreview } from "./prompt-composer-preview";
import { QuantityPickerPreview } from "./quantity-picker-preview";
import { SignInCardPreview } from "./sign-in-card-preview";
import { SignUpCardPreview } from "./sign-up-card-preview";
import { TaskListPreview } from "./task-list-preview";
import { ThinkingPreview } from "./thinking-preview";

type Option = { label: string; scene: string };

/**
 * Site chrome for the original registry items: the variant control on the canvas,
 * the scene label, and the stage size. The specimen itself lives in `<id>-preview.tsx`,
 * which is also the item's catalog usage.
 */
type CoreItem = {
  ariaLabel: string;
  options: Record<string, Option>;
  defaultValue: string;
  stageClassName?: string | ((selection: string) => string | undefined);
  contentClassName?: string | ((selection: string) => string | undefined);
  render: (selection: string) => ReactNode;
};

function options<T extends string>(
  ids: readonly T[],
  copy: Record<T, Option>,
): Record<string, Option> {
  return Object.fromEntries(ids.map((id) => [id, copy[id]]));
}

const coreItems: Record<string, CoreItem> = {
  "prompt-composer": {
    ariaLabel: "Composer variant",
    defaultValue: "rounded",
    options: options(PROMPT_COMPOSER_VARIANTS, {
      rounded: { label: "Rounded", scene: "Floating card" },
      pill: { label: "Pill", scene: "Capsule" },
      ghost: { label: "Ghost", scene: "Dock" },
      compact: { label: "Compact", scene: "Sidebar" },
    }),
    render: (selection) => (
      <div className="uai-prompt-frame" data-scene={selection}>
        <div className={selection === "ghost" ? "uai-prompt-dock" : undefined}>
          <PromptComposerPreview variant={selection as PromptComposerVariant} />
        </div>
      </div>
    ),
  },
  thinking: {
    ariaLabel: "Thinking variant",
    defaultValue: "card",
    options: options(THINKING_VARIANTS, {
      card: { label: "Card", scene: "Response panel" },
      inline: { label: "Inline", scene: "Chat transcript" },
      compact: { label: "Compact", scene: "Sidebar run" },
    }),
    contentClassName: "uai-preview-narrow",
    render: (selection) => <ThinkingPreview variant={selection as ThinkingVariant} />,
  },
  "approval-card": {
    ariaLabel: "Approval card variant",
    defaultValue: "compact",
    options: options(approvalScenarios, {
      compact: { label: "Compact", scene: "Routine action" },
      detailed: { label: "Detailed", scene: "Impact review" },
      critical: { label: "Critical", scene: "Protected action" },
      error: { label: "Error", scene: "Recovery state" },
    }),
    stageClassName: (selection) =>
      selection === "critical"
        ? "uai-preview-stage--approval-critical"
        : selection === "compact"
          ? undefined
          : "uai-preview-stage--approval-detailed",
    contentClassName: "uai-preview-medium",
    render: (selection) => <ApprovalCardPreview scenario={selection as ApprovalScenario} />,
  },
  "empty-state": {
    ariaLabel: "Empty state variant",
    defaultValue: "page",
    options: options(EMPTY_STATE_VARIANTS, {
      card: { label: "Card", scene: "Project page" },
      plain: { label: "Plain", scene: "Existing panel" },
      compact: { label: "Compact", scene: "Sidebar section" },
      page: { label: "404 Page", scene: "Not-found route" },
    }),
    stageClassName: (selection) =>
      selection === "page" ? "uai-preview-stage--empty-page" : undefined,
    contentClassName: (selection) => (selection === "page" ? undefined : "uai-preview-narrow"),
    render: (selection) => <EmptyStatePreview variant={selection as EmptyStateVariant} />,
  },
  "task-list": {
    ariaLabel: "Task list variant",
    defaultValue: "card",
    options: options(TASK_LIST_VARIANTS, {
      card: { label: "Card", scene: "Project checklist" },
      timeline: { label: "Timeline", scene: "Workflow progress" },
      compact: { label: "Compact", scene: "Sidebar queue" },
    }),
    contentClassName: "uai-preview-medium",
    render: (selection) => <TaskListPreview variant={selection as TaskListVariant} />,
  },
  "coupon-field": {
    ariaLabel: "Coupon field variant",
    defaultValue: "rounded",
    options: options(COUPON_FIELD_VARIANTS, {
      rounded: { label: "Rounded", scene: "Checkout summary" },
      pill: { label: "Pill", scene: "Promotion panel" },
      compact: { label: "Compact", scene: "Cart drawer" },
    }),
    contentClassName: "uai-preview-medium",
    render: (selection) => <CouponFieldPreview variant={selection as CouponFieldVariant} />,
  },
  "sign-in-card": {
    ariaLabel: "Sign-in card variant",
    defaultValue: "card",
    options: options(SIGN_IN_CARD_VARIANTS, {
      card: { label: "Card", scene: "Workspace sign-in" },
      split: { label: "Split", scene: "Authentication page" },
      compact: { label: "Compact", scene: "Account prompt" },
    }),
    stageClassName: "uai-preview-stage--sign-in",
    contentClassName: "uai-preview-medium",
    render: (selection) => <SignInCardPreview variant={selection as SignInCardVariant} />,
  },
  "sign-up-card": {
    ariaLabel: "Sign-up card variant",
    defaultValue: "card",
    options: options(SIGN_UP_CARD_VARIANTS, {
      card: { label: "Card", scene: "Account creation" },
      split: { label: "Split", scene: "Sign-up page" },
      compact: { label: "Compact", scene: "Team invitation" },
    }),
    stageClassName: "uai-preview-stage--sign-in",
    contentClassName: "uai-preview-medium",
    render: (selection) => <SignUpCardPreview variant={selection as SignUpCardVariant} />,
  },
  "password-recovery": {
    ariaLabel: "Password recovery variant",
    defaultValue: "card",
    options: options(PASSWORD_RECOVERY_VARIANTS, {
      card: { label: "Card", scene: "Recovery dialog" },
      split: { label: "Split", scene: "Recovery page" },
      compact: { label: "Compact", scene: "Account support" },
    }),
    stageClassName: "uai-preview-stage--sign-in",
    contentClassName: "uai-preview-medium",
    render: (selection) => (
      <PasswordRecoveryPreview variant={selection as PasswordRecoveryVariant} />
    ),
  },
  "quantity-picker": {
    ariaLabel: "Quantity picker variant",
    defaultValue: "rounded",
    options: options(QUANTITY_PICKER_VARIANTS, {
      rounded: { label: "Rounded", scene: "Product detail" },
      pill: { label: "Pill", scene: "Cart line" },
      compact: { label: "Compact", scene: "Cart drawer" },
    }),
    contentClassName: "uai-preview-medium",
    render: (selection) => <QuantityPickerPreview variant={selection as QuantityPickerVariant} />,
  },
  "cart-item": {
    ariaLabel: "Cart item variant",
    defaultValue: "card",
    options: options(CART_ITEM_VARIANTS, {
      card: { label: "Card", scene: "Shopping cart" },
      plain: { label: "Plain", scene: "Checkout review" },
      compact: { label: "Compact", scene: "Cart drawer" },
    }),
    contentClassName: "uai-preview-medium",
    render: (selection) => <CartItemPreview variant={selection as CartItemVariant} />,
  },
  "price-summary": {
    ariaLabel: "Price summary variant",
    defaultValue: "card",
    options: options(PRICE_SUMMARY_VARIANTS, {
      card: { label: "Card", scene: "Checkout sidebar" },
      plain: { label: "Plain", scene: "Payment step" },
      compact: { label: "Compact", scene: "Cart drawer" },
    }),
    contentClassName: "uai-preview-narrow",
    render: (selection) => <PriceSummaryPreview variant={selection as PriceSummaryVariant} />,
  },
  "order-status": {
    ariaLabel: "Order status variant",
    defaultValue: "card",
    options: options(ORDER_STATUS_VARIANTS, {
      card: { label: "Card", scene: "Account order" },
      plain: { label: "Plain", scene: "Confirmation page" },
      compact: { label: "Compact", scene: "Order drawer" },
    }),
    contentClassName: "uai-preview-narrow",
    render: (selection) => <OrderStatusPreview variant={selection as OrderStatusVariant} />,
  },
  "app-header": {
    ariaLabel: "App header variant",
    defaultValue: "bar",
    options: options(APP_HEADER_VARIANTS, {
      bar: { label: "Bar", scene: "Application shell" },
      floating: { label: "Floating", scene: "Inset workspace" },
      compact: { label: "Compact", scene: "Operations console" },
    }),
    render: (selection) => <AppHeaderPreview variant={selection as AppHeaderVariant} />,
  },
};

function resolve(value: CoreItem["stageClassName"], selection: string) {
  return typeof value === "function" ? value(selection) : value;
}

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

export function getCorePreviewControl(itemId: string): PreviewControl | undefined {
  const item = coreItems[itemId];
  if (!item) return undefined;
  return {
    ariaLabel: item.ariaLabel,
    defaultValue: item.defaultValue,
    options: Object.entries(item.options).map(([id, option]) => ({ id, label: option.label })),
  };
}

export function CorePreview({ itemId, selection }: { itemId: string; selection: string }) {
  const swapping = useSwapFlag(selection);
  const item = coreItems[itemId];
  if (!item) return null;

  return (
    <PreviewStage
      className={resolve(item.stageClassName, selection)}
      contentClassName={resolve(item.contentClassName, selection)}
      label={item.options[selection]?.scene}
      swapping={swapping}
    >
      {item.render(selection)}
    </PreviewStage>
  );
}
