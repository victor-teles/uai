"use client";

import { useId, useState } from "react";
import {
  FormErrorSummary,
  FormErrorSummaryLink,
  FormErrorSummaryList,
  FormErrorSummaryTitle,
  type FormErrorSummaryVariant,
} from "@/components/ui/uai/form-error-summary";
import {
  FormField,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";

export function FormErrorSummaryPreview({
  variant = "card",
}: {
  variant?: FormErrorSummaryVariant;
}) {
  const emailId = useId();
  const nameId = useId();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(true);
  const invalidEmail = submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const invalidName = submitted && !name.trim();
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      style={{ display: "grid", gap: 16 }}
    >
      {(invalidEmail || invalidName) && (
        <FormErrorSummary variant={variant}>
          <FormErrorSummaryTitle>Review your contact details</FormErrorSummaryTitle>
          <FormErrorSummaryList>
            {invalidEmail && (
              <FormErrorSummaryLink fieldId={emailId}>
                Enter a valid email address.
              </FormErrorSummaryLink>
            )}
            {invalidName && (
              <FormErrorSummaryLink fieldId={nameId}>Enter your full name.</FormErrorSummaryLink>
            )}
          </FormErrorSummaryList>
        </FormErrorSummary>
      )}
      <FormField
        inputId={emailId}
        value={email}
        onValueChange={setEmail}
        invalid={invalidEmail}
        required
      >
        <FormFieldLabel>Email</FormFieldLabel>
        <FormFieldInput
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@northwind.studio"
        />
        <FormFieldError>Enter a valid email address.</FormFieldError>
      </FormField>
      <FormField
        inputId={nameId}
        value={name}
        onValueChange={setName}
        invalid={invalidName}
        required
      >
        <FormFieldLabel>Full name</FormFieldLabel>
        <FormFieldInput name="name" autoComplete="name" placeholder="Maya Chen" />
        <FormFieldError>Enter your full name.</FormFieldError>
      </FormField>
      {!invalidEmail && !invalidName && (
        <p role="status" style={{ margin: 0, fontSize: 12, color: "var(--uai-success)" }}>
          Contact details are ready.
        </p>
      )}
      <button
        type="submit"
        style={{
          justifySelf: "start",
          height: 30,
          padding: "0 14px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-accent)",
          color: "var(--uai-accent-foreground)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        Validate details
      </button>
    </form>
  );
}
