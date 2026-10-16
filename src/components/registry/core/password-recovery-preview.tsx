"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
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

export function PasswordRecoveryPreview({
  variant = "card",
}: {
  variant?: PasswordRecoveryVariant;
}) {
  const [step, setStep] = useState<PasswordRecoveryStep>("request");
  const [status, setStatus] = useState<PasswordRecoveryStatus>("idle");
  const [password, setPassword] = useState("Preview123!");
  const [confirmation, setConfirmation] = useState("Preview123!");
  const timerRef = useRef<number | null>(null);
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
                If an account matches <strong>hello@acme.co</strong>, its reset link is on the way.
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
              <PasswordRecoveryError>Review the new password and try again.</PasswordRecoveryError>
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
  );
}
