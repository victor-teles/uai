"use client";

import { Building2, Code2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
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
  type SignInCardStatus,
  SignInCardSubmit,
  SignInCardTitle,
  type SignInCardVariant,
} from "@/components/ui/uai/sign-in-card";

export function SignInCardPreview({ variant = "card" }: { variant?: SignInCardVariant }) {
  const [status, setStatus] = useState<SignInCardStatus>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function finishAuthentication(success: boolean) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("submitting");
    timerRef.current = window.setTimeout(() => {
      setStatus(success ? "idle" : "error");
    }, 800);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    finishAuthentication(password === "preview");
  }

  return (
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
  );
}
