"use client";

import {
  NewsletterForm,
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  NewsletterFormSubmit,
  type NewsletterFormVariant,
  type NewsletterSubmission,
} from "@/components/ui/uai/newsletter-form";

const subscribers = new Set(["ana@example.com"]);

async function subscribe({ email }: NewsletterSubmission) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email.endsWith("@fail.test")) return "error" as const;
  if (subscribers.has(email.toLowerCase())) return "duplicate" as const;
  subscribers.add(email.toLowerCase());
  return "success" as const;
}

export function NewsletterFormPreview({ variant = "inline" }: { variant?: NewsletterFormVariant }) {
  return (
    <NewsletterForm variant={variant} onSubscribe={subscribe}>
      <NewsletterFormLabel>Get the monthly product letter</NewsletterFormLabel>
      <NewsletterFormField>
        <NewsletterFormInput placeholder="you@company.com" />
        <NewsletterFormSubmit>Subscribe</NewsletterFormSubmit>
      </NewsletterFormField>
      <NewsletterFormConsent>
        Send me one email a month about releases. Unsubscribe from any issue.
      </NewsletterFormConsent>
      <NewsletterFormMessage>
        Try ana@example.com to see the already-subscribed state.
      </NewsletterFormMessage>
    </NewsletterForm>
  );
}
