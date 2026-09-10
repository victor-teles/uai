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
          <StepIndicatorTitle>1. Account</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>Contact verified</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "complete" : "current"}>
          <StepIndicatorTitle>2. Details</StepIndicatorTitle>
        </StepIndicatorStep>
        <StepIndicatorStep optional status="error">
          <StepIndicatorTitle>3. Import</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>File needs review</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status="blocked">
          <StepIndicatorTitle>4. Team</StepIndicatorTitle>
          {variant !== "compact" && (
            <StepIndicatorDescription>Requires an invitation</StepIndicatorDescription>
          )}
        </StepIndicatorStep>
        <StepIndicatorStep status={review ? "current" : "upcoming"}>
          <StepIndicatorTitle>5. Review</StepIndicatorTitle>
        </StepIndicatorStep>
      </StepIndicator>
      <button
        type="button"
        onClick={() => setReview(!review)}
        style={{
          justifySelf: "start",
          padding: "8px 12px",
          border: "1px solid var(--uai-border-strong)",
          borderRadius: 8,
          background: "transparent",
          color: "var(--uai-text)",
        }}
      >
        {review ? "Back to details" : "Continue to review"}
      </button>
    </div>
  );
}
