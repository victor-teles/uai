"use client";

import { Building2, Code2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
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
  type SignUpCardVariant,
  SignUpCardVerification,
} from "@/components/ui/uai/sign-up-card";

export function SignUpCardPreview({ variant = "card" }: { variant?: SignUpCardVariant }) {
  const [status, setStatus] = useState<SignUpCardStatus>("idle");
  const [password, setPassword] = useState("Preview123!");
  const timerRef = useRef<number | null>(null);
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
              className="inline-flex h-7 items-center rounded-full px-3 text-[12.5px] font-medium text-[var(--uai-muted)] transition-colors hover:bg-[var(--uai-surface-raised)] hover:text-[var(--uai-text)]"
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
  );
}
