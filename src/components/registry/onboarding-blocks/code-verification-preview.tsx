"use client";

import {
  CodeVerification,
  CodeVerificationAlternative,
  CodeVerificationAlternatives,
  CodeVerificationDescription,
  CodeVerificationDestination,
  CodeVerificationForm,
  CodeVerificationHeader,
  CodeVerificationInput,
  CodeVerificationMessage,
  CodeVerificationResend,
  CodeVerificationResendButton,
  CodeVerificationSubmit,
  CodeVerificationTitle,
  type CodeVerificationVariant,
} from "@/components/uai/code-verification";
import { InlineFeedbackMessage, InlineFeedbackStatus } from "@/components/ui/uai/inline-feedback";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

async function checkCode(code: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (code === "000000") return "expired" as const;
  return code === "482913" ? ("success" as const) : ("invalid" as const);
}

async function sendNewCode() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export function CodeVerificationPreview({
  variant = "card",
}: {
  variant?: CodeVerificationVariant;
}) {
  return (
    <CodeVerification
      variant={variant}
      onVerify={checkCode}
      onResend={sendNewCode}
      resendAfter={30}
    >
      <CodeVerificationHeader>
        <CodeVerificationTitle>Check your email</CodeVerificationTitle>
        <CodeVerificationDescription>
          We sent a 6-digit code to{" "}
          <CodeVerificationDestination>marta@larkspur.example</CodeVerificationDestination>. It
          expires in 10 minutes. Try 482913, or 000000 for an expired code.
        </CodeVerificationDescription>
      </CodeVerificationHeader>
      <CodeVerificationForm>
        <CodeVerificationInput label="6-digit code" />
        <CodeVerificationMessage status="invalid">
          <StatusBannerTitle>That code doesn’t match</StatusBannerTitle>
          <StatusBannerDescription>Check the latest email and try again.</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationMessage status="expired">
          <StatusBannerTitle>This code has expired</StatusBannerTitle>
          <StatusBannerDescription>Request a new code to continue.</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationMessage status="verified">
          <StatusBannerTitle>Email verified</StatusBannerTitle>
          <StatusBannerDescription>Taking you to your workspace…</StatusBannerDescription>
        </CodeVerificationMessage>
        <CodeVerificationSubmit>Verify email</CodeVerificationSubmit>
        <CodeVerificationResend>
          <CodeVerificationResendButton>Resend code</CodeVerificationResendButton>
          <InlineFeedbackStatus>
            <InlineFeedbackMessage status="success">New code sent</InlineFeedbackMessage>
            <InlineFeedbackMessage status="error">Couldn’t send. Try again.</InlineFeedbackMessage>
          </InlineFeedbackStatus>
        </CodeVerificationResend>
        <CodeVerificationAlternatives>
          <span>Can’t get the email?</span>
          <CodeVerificationAlternative>Text me instead</CodeVerificationAlternative>
          <CodeVerificationAlternative>Use a backup code</CodeVerificationAlternative>
        </CodeVerificationAlternatives>
      </CodeVerificationForm>
    </CodeVerification>
  );
}
