import { describe, expect, test } from "bun:test";

type RegistryItem = {
  name: string;
  registryDependencies?: string[];
};

type Registry = {
  items: RegistryItem[];
};

const registry = (await Bun.file("registry.json").json()) as Registry;
const itemNames = registry.items.map((item) => item.name);

describe("Uai registry", () => {
  test("publishes the complete starter collection", () => {
    expect(itemNames).toEqual([
      "uai-theme",
      "uai-utils",
      "thinking",
      "approval-card",
      "empty-state",
      "task-list",
      "prompt-composer",
      "sign-in-card",
      "sign-up-card",
      "password-recovery",
      "coupon-field",
      "quantity-picker",
      "cart-item",
      "price-summary",
      "order-status",
      "app-header",
    ]);
  });

  test("builds a public JSON document for every item", async () => {
    for (const item of registry.items) {
      expect(await Bun.file(`public/r/${item.name}.json`).exists()).toBe(true);
    }
  });

  test("ships consumer imports instead of registry-source imports", async () => {
    const outputs = await Promise.all(
      itemNames.map((item) => Bun.file(`public/r/${item}.json`).text()),
    );

    expect(outputs.join("\n")).not.toContain("@/registry/");
    expect(outputs.join("\n")).toContain("@/lib/uai-utils");
  });

  test("keeps preview, example, variants, and manual installation in their own regions", async () => {
    const browser = await Bun.file("src/components/registry/registry-browser.tsx").text();
    const preview = await Bun.file("src/components/registry/registry-preview.tsx").text();
    const installCommand = await Bun.file("src/components/install-command.tsx").text();
    const sourceRequest = "fetch(`/r/$" + "{selectedId}.json`";

    expect(browser).toContain("<h2>Code example</h2>");
    expect(browser).toContain(sourceRequest);
    expect(browser).toContain("code={manualSource.code}");
    expect(browser).not.toContain("const [tab, setTab]");
    expect(preview).toContain('orientation="vertical"');
    expect(preview).toContain("{codeExample}");
    expect(installCommand).toContain('aria-label="Install command"');
    expect(installCommand).toContain("readOnly");
  });

  test("prompt composer ships chrome and density variants", async () => {
    const source = await Bun.file("src/registry/uai/components/prompt-composer.tsx").text();

    expect(source).toContain('["rounded", "pill", "ghost", "compact"]');
    expect(source).toContain("export function PromptComposerAdd");
    expect(source).toContain("export function PromptComposerInput");
    expect(source).toContain("export function PromptComposerActions");
    expect(source).toContain("export function PromptComposerSubmit");
    expect(source).not.toContain("PromptComposerSource");
    expect(source).not.toContain("style={{");
    expect(source).not.toContain(".style.");
    expect(source).not.toContain("0 8px 24px");
  });

  test("thinking ships explicit states and structured evidence", async () => {
    const source = await Bun.file("src/registry/uai/components/thinking.tsx").text();

    expect(source).toContain('["thinking", "complete", "error"]');
    expect(source).toContain("export function ThinkingTrigger");
    expect(source).toContain("export function ThinkingContent");
    expect(source).toContain("export function ThinkingActivity");
    expect(source).toContain('role="log"');
    expect(source).toContain('aria-busy={status === "thinking"}');
    expect(source).not.toContain("activities?:");
    expect(source).not.toContain("steps?:");
  });

  test("approval card separates risk, content, and controlled async states", async () => {
    const source = await Bun.file("src/registry/uai/components/approval-card.tsx").text();

    expect(source).toContain('["low", "medium", "high", "critical"]');
    expect(source).toContain('["compact", "detailed"]');
    expect(source).toContain('"submitting"');
    expect(source).toContain('"approved"');
    expect(source).toContain('"rejected"');
    expect(source).toContain('"error"');
    expect(source).toContain('risk: "critical"');
    expect(source).toContain("export function ApprovalCardHeader");
    expect(source).toContain("export function ApprovalCardDetails");
    expect(source).toContain("export function ApprovalCardConfirmation");
    expect(source).toContain("export function ApprovalCardActions");
    expect(source).toContain("export function ApprovalCardApprove");
    expect(source).toContain("aria-busy={isSubmitting}");
    expect(source).toContain('role="alert"');
    expect(source).toContain("export type ApprovalCardState");
    expect(source).toContain("export function ApprovalCardDetail");
    expect(source).not.toContain("errorMessage");
  });

  test("task list exposes composition instead of data props", async () => {
    const taskList = await Bun.file("src/registry/uai/components/task-list.tsx").text();

    expect(taskList).toStartWith('"use client";');
    expect(taskList).toContain('["card", "timeline", "compact"]');
    expect(taskList).toContain("export type TaskListVariant");
    expect(taskList).toContain("export function TaskListItem");
    expect(taskList).toContain("export function TaskListTitle");
    expect(taskList).toContain("statusLabel?: ReactNode");
    expect(taskList).toContain('aria-current={ariaCurrent ?? (status === "active" ? "step"');
    expect(taskList).not.toContain("ChevronRight");
    expect(taskList).not.toContain("truncate");
    expect(taskList).not.toContain("tasks:");
  });

  test("empty state composes blank-slate content across placement variants", async () => {
    const source = await Bun.file("src/registry/uai/components/empty-state.tsx").text();

    expect(source).toContain('["card", "plain", "compact", "page"]');
    expect(source).toContain("export type EmptyStateVariant");
    expect(source).toContain("export function EmptyStateMedia");
    expect(source).toContain("export function EmptyStateContent");
    expect(source).toContain("export function EmptyStateHeader");
    expect(source).toContain("export function EmptyStateTitle");
    expect(source).toContain("export function EmptyStateDescription");
    expect(source).toContain("export function EmptyStateActions");
    expect(source).toContain("export function EmptyStateAction");
    expect(source).toContain("export function EmptyStateNote");
    expect(source).toContain('type = "button"');
    expect(source).not.toContain("items:");
  });

  test("coupon field composes checkout-safe async behavior", async () => {
    const source = await Bun.file("src/registry/uai/components/coupon-field.tsx").text();

    expect(source).toContain('["idle", "applying", "applied", "error"]');
    expect(source).toContain('["rounded", "pill", "compact"]');
    expect(source).toContain("export type CouponFieldVariant");
    expect(source).toContain("export function CouponFieldLabel");
    expect(source).toContain("export function CouponFieldControl");
    expect(source).toContain("export function CouponFieldInput");
    expect(source).toContain("export function CouponFieldApply");
    expect(source).toContain("export function CouponFieldFeedback");
    expect(source).toContain("export function CouponFieldMessage");
    expect(source).toContain("export function CouponFieldRemove");
    expect(source).toContain('type="button"');
    expect(source).toContain('role={isError ? "alert" : isStatus ? "status"');
    expect(source).not.toContain("<form");
    expect(source).not.toContain("messages:");
  });

  test("sign-in card composes authentication paths and controlled async states", async () => {
    const source = await Bun.file("src/registry/uai/components/sign-in-card.tsx").text();

    expect(source).toContain('["card", "split", "compact"]');
    expect(source).toContain('["idle", "submitting", "error"]');
    expect(source).toContain("export type SignInCardVariant");
    expect(source).toContain("export function SignInCardHeader");
    expect(source).toContain("export function SignInCardBody");
    expect(source).toContain("export function SignInCardProviders");
    expect(source).toContain("export function SignInCardProvider");
    expect(source).toContain("export function SignInCardDivider");
    expect(source).toContain("export function SignInCardField");
    expect(source).toContain("export function SignInCardInput");
    expect(source).toContain("export function SignInCardError");
    expect(source).toContain("export function SignInCardSubmit");
    expect(source).toContain("aria-busy={submitting || undefined}");
    expect(source).toContain('type="button"');
    expect(source).toContain('role="alert"');
    expect(source).not.toContain("providers:");
    expect(source).not.toContain("fields:");
  });

  test("sign-up card composes account creation, guidance, consent, and verification", async () => {
    const source = await Bun.file("src/registry/uai/components/sign-up-card.tsx").text();

    expect(source).toContain('["card", "split", "compact"]');
    expect(source).toContain('["idle", "submitting", "error", "verification"]');
    expect(source).toContain("export type SignUpCardVariant");
    expect(source).toContain("export function SignUpCardProviders");
    expect(source).toContain("export function SignUpCardField");
    expect(source).toContain("export function SignUpCardInput");
    expect(source).toContain("export function SignUpCardPasswordGuide");
    expect(source).toContain("export function SignUpCardPasswordRequirement");
    expect(source).toContain("export function SignUpCardConsent");
    expect(source).toContain("export function SignUpCardCheckbox");
    expect(source).toContain("export function SignUpCardVerification");
    expect(source).toContain("aria-busy={submitting || undefined}");
    expect(source).toContain('type="button"');
    expect(source).toContain('role="alert"');
    expect(source).toContain('role="status"');
    expect(source).not.toContain("providers:");
    expect(source).not.toContain("fields:");
  });

  test("password recovery composes controlled workflow steps and visual variants", async () => {
    const source = await Bun.file("src/registry/uai/components/password-recovery.tsx").text();

    expect(source).toContain('["card", "split", "compact"]');
    expect(source).toContain('["request", "sent", "reset", "expired", "success"]');
    expect(source).toContain('["idle", "submitting", "error"]');
    expect(source).toContain("export type PasswordRecoveryVariant");
    expect(source).toContain("export function PasswordRecoveryAside");
    expect(source).toContain("export function PasswordRecoveryProgress");
    expect(source).toContain("export function PasswordRecoveryStage");
    expect(source).toContain("export function PasswordRecoveryField");
    expect(source).toContain("export function PasswordRecoveryInput");
    expect(source).toContain("export function PasswordRecoveryPasswordGuide");
    expect(source).toContain("export function PasswordRecoveryStatus");
    expect(source).toContain("aria-busy={submitting || undefined}");
    expect(source).toContain('type="button"');
    expect(source).toContain('role="alert"');
    expect(source).not.toContain("steps:");
    expect(source).not.toContain("fields:");
  });

  test("price summary composes semantic totals across visual variants", async () => {
    const source = await Bun.file("src/registry/uai/components/price-summary.tsx").text();

    expect(source).toContain('["card", "plain", "compact"]');
    expect(source).toContain("export type PriceSummaryVariant");
    expect(source).toContain("export function PriceSummaryHeader");
    expect(source).toContain("export function PriceSummaryTitle");
    expect(source).toContain("export function PriceSummaryDescription");
    expect(source).toContain("export function PriceSummaryList");
    expect(source).toContain("export function PriceSummaryItem");
    expect(source).toContain("export function PriceSummaryTotal");
    expect(source).toContain("export function PriceSummaryNote");
    expect(source).toContain("<dl");
    expect(source).toContain("<dt");
    expect(source).toContain("<dd");
    expect(source).not.toContain("items:");
  });

  test("quantity picker composes limits, direct input, and stock feedback", async () => {
    const source = await Bun.file("src/registry/uai/components/quantity-picker.tsx").text();

    expect(source).toContain('["rounded", "pill", "compact"]');
    expect(source).toContain("export type QuantityPickerVariant");
    expect(source).toContain("export function QuantityPickerLabel");
    expect(source).toContain("export function QuantityPickerControl");
    expect(source).toContain("export function QuantityPickerDecrease");
    expect(source).toContain("export function QuantityPickerInput");
    expect(source).toContain("export function QuantityPickerIncrease");
    expect(source).toContain("export function QuantityPickerMessage");
    expect(source).toContain('type="number"');
    expect(source).toContain('type="button"');
    expect(source).not.toContain("items:");
  });

  test("cart item composes cart-line content across visual variants", async () => {
    const source = await Bun.file("src/registry/uai/components/cart-item.tsx").text();

    expect(source).toContain('["card", "plain", "compact"]');
    expect(source).toContain('["available", "low", "unavailable"]');
    expect(source).toContain("export type CartItemVariant");
    expect(source).toContain("export function CartItemMedia");
    expect(source).toContain("export function CartItemContent");
    expect(source).toContain("export function CartItemHeader");
    expect(source).toContain("export function CartItemTitle");
    expect(source).toContain("export function CartItemPrice");
    expect(source).toContain("export function CartItemOptions");
    expect(source).toContain("export function CartItemOption");
    expect(source).toContain("export function CartItemAvailability");
    expect(source).toContain("export function CartItemActions");
    expect(source).toContain("export function CartItemRemove");
    expect(source).toContain('type = "button"');
    expect(source).toContain("aria-busy={removing || undefined}");
    expect(source).not.toContain("product:");
    expect(source).not.toContain("quantity:");
  });

  test("cart item usage derives the displayed price from its controlled quantity", async () => {
    const catalog = await Bun.file("src/components/registry/catalog.ts").text();
    const cartItemUsage = catalog.slice(
      catalog.indexOf('id: "cart-item"'),
      catalog.indexOf('id: "price-summary"'),
    );

    expect(cartItemUsage).toContain('usage: `import { useState } from "react"');
    expect(cartItemUsage).toContain("const [quantity, setQuantity] = useState(2)");
    expect(cartItemUsage).toContain("<CartItemPrice>{formatPrice(quantity * 48)}</CartItemPrice>");
    expect(cartItemUsage).toContain(
      "<QuantityPicker value={quantity} onValueChange={setQuantity} min={1} max={5}>",
    );
  });

  test("order status composes fulfillment evidence across visual variants", async () => {
    const source = await Bun.file("src/registry/uai/components/order-status.tsx").text();

    expect(source).toContain('["card", "plain", "compact"]');
    expect(source).toContain('["complete", "current", "upcoming", "issue"]');
    expect(source).toContain("export type OrderStatusVariant");
    expect(source).toContain("export function OrderStatusHeader");
    expect(source).toContain("export function OrderStatusTitle");
    expect(source).toContain("export function OrderStatusBadge");
    expect(source).toContain("export function OrderStatusProgress");
    expect(source).toContain("export function OrderStatusStep");
    expect(source).toContain("export function OrderStatusDetails");
    expect(source).toContain("export function OrderStatusActions");
    expect(source).toContain('aria-current={ariaCurrent ?? (status === "current" ? "step"');
    expect(source).toContain("<ol");
    expect(source).toContain("<dl");
    expect(source).not.toContain("steps:");
    expect(source).not.toContain("trackingUrl:");
  });

  test("app header composes navigation and responsive overflow across visual variants", async () => {
    const source = await Bun.file("src/registry/uai/components/app-header.tsx").text();

    expect(source).toContain('["bar", "floating", "compact"]');
    expect(source).toContain("export type AppHeaderVariant");
    expect(source).toContain("export function AppHeaderBrand");
    expect(source).toContain("export function AppHeaderOverflow");
    expect(source).toContain("export function AppHeaderNav");
    expect(source).toContain("export function AppHeaderNavItem");
    expect(source).toContain("export function AppHeaderSearch");
    expect(source).toContain("export function AppHeaderActions");
    expect(source).toContain("export function AppHeaderAction");
    expect(source).toContain("export function AppHeaderMenuButton");
    expect(source).toContain("aria-expanded={context.open}");
    expect(source).toContain('aria-current={ariaCurrent ?? (active ? "page"');
    expect(source).not.toContain("items:");
    expect(source).not.toContain("links:");
  });

  test("publishes tokens for light and dark themes", async () => {
    const theme = (await Bun.file("public/r/uai-theme.json").json()) as {
      cssVars?: { light?: Record<string, string>; dark?: Record<string, string> };
    };

    expect(theme.cssVars?.light?.["uai-accent"]).toBeDefined();
    expect(theme.cssVars?.dark?.["uai-accent"]).toBeDefined();
  });
});
