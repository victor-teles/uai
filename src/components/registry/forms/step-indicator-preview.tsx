"use client";

import { useState } from "react";
import {
  StepIndicator,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
  type StepIndicatorVariant,
} from "@/components/ui/uai/step-indicator";

export function StepIndicatorPreview({
  variant = "horizontal",
}: {
  variant?: StepIndicatorVariant;
}) {
  const [review, setReview] = useState(false);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <StepIndicator variant={variant} aria-label="Workspace setup">
        <StepIndicatorStep status="complete">
          <StepIndicatorTitle>Account</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>maya@northwind.studio</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "complete" : "current"}>
          <StepIndicatorTitle>Details</StepIndicatorTitle>
        </StepIndicatorStep>
        <StepIndicatorStep optional status="error">
          <StepIndicatorTitle>Import</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>contacts.csv · 3 rows failed</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status="blocked">
          <StepIndicatorTitle>Team</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>Waiting on admin invite</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "current" : "upcoming"}>
          <StepIndicatorTitle>Review</StepIndicatorTitle>
        </StepIndicatorStep>
      </StepIndicator>
      <button
        type="button"
        onClick={() => setReview(!review)}
        style={{
          justifySelf: "start",
          height: 30,
          padding: "0 14px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        {review ? "Back to details" : "Continue to review"}
      </button>
    </div>
  );
}
