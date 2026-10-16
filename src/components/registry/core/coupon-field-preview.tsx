"use client";

import { useEffect, useRef, useState } from "react";
import {
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

export function CouponFieldPreview({ variant = "rounded" }: { variant?: CouponFieldVariant }) {
  const [status, setStatus] = useState<CouponFieldStatus>("applied");
  const [appliedCode, setAppliedCode] = useState<string | undefined>("WELCOME20");
  const [draft, setDraft] = useState("WELCOME20");
  const timerRef = useRef<number | null>(null);

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
    <div className={variant === "compact" ? "w-full max-w-[320px]" : "w-full max-w-[380px]"}>
      <div className="mb-5 flex items-baseline justify-between border-b border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] pb-3">
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

      <dl className="mt-5 space-y-2 border-t border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] pt-4 text-[12px] leading-4 tabular-nums">
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
  );
}
