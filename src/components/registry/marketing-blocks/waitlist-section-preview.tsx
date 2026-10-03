"use client";

import {
  WaitlistSection,
  WaitlistSectionConfirmation,
  WaitlistSectionConfirmationTitle,
  WaitlistSectionContent,
  WaitlistSectionDescription,
  WaitlistSectionEmail,
  WaitlistSectionForm,
  WaitlistSectionHighlight,
  WaitlistSectionHighlights,
  WaitlistSectionQualification,
  WaitlistSectionQualificationLegend,
  WaitlistSectionRestart,
  WaitlistSectionTitle,
  type WaitlistSectionVariant,
} from "@/components/uai/waitlist-section";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  NewsletterFormSubmit,
  type NewsletterSubmission,
} from "@/components/ui/uai/newsletter-form";

const waitlist = new Set(["ana@example.com"]);

async function join({ email }: NewsletterSubmission) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email.endsWith("@fail.test")) return "error" as const;
  if (waitlist.has(email.toLowerCase())) return "duplicate" as const;
  waitlist.add(email.toLowerCase());
  return "success" as const;
}

export function WaitlistSectionPreview({
  variant = "split",
}: {
  variant?: WaitlistSectionVariant;
}) {
  return (
    <WaitlistSection variant={variant}>
      <WaitlistSectionContent>
        <WaitlistSectionTitle>Join the Ferrow Routes beta</WaitlistSectionTitle>
        <WaitlistSectionDescription>
          Route planning for crews with more than ten stops a day. We are inviting teams in small
          groups through November.
        </WaitlistSectionDescription>
        <WaitlistSectionHighlights>
          <WaitlistSectionHighlight>Invites go out every Tuesday</WaitlistSectionHighlight>
          <WaitlistSectionHighlight>Free during the beta, no card needed</WaitlistSectionHighlight>
        </WaitlistSectionHighlights>
      </WaitlistSectionContent>
      <WaitlistSectionForm onSubscribe={join}>
        <WaitlistSectionQualification>
          <WaitlistSectionQualificationLegend>About your team</WaitlistSectionQualificationLegend>
          <FormField variant="compact">
            <FormFieldLabel>Company</FormFieldLabel>
            <FormFieldInput
              name="company"
              autoComplete="organization"
              placeholder="Larkspur Landscaping"
            />
          </FormField>
          <FormField variant="compact">
            <FormFieldLabel>Crews on the road each day</FormFieldLabel>
            <FormFieldInput name="crews" inputMode="numeric" placeholder="6" />
          </FormField>
        </WaitlistSectionQualification>
        <NewsletterFormLabel>Work email</NewsletterFormLabel>
        <NewsletterFormField>
          <NewsletterFormInput placeholder="you@company.com" />
          <NewsletterFormSubmit pendingLabel="Joining…">Join the waitlist</NewsletterFormSubmit>
        </NewsletterFormField>
        <NewsletterFormConsent>
          Email me about my invite and beta updates. Unsubscribe from any message.
        </NewsletterFormConsent>
        <NewsletterFormMessage
          messages={{ duplicate: "This email is already on the waitlist. Watch for your invite." }}
        >
          Try ana@example.com to see the already-joined state.
        </NewsletterFormMessage>
      </WaitlistSectionForm>
      <WaitlistSectionConfirmation>
        <WaitlistSectionConfirmationTitle>You’re on the list</WaitlistSectionConfirmationTitle>
        <p style={{ margin: 0, color: "var(--uai-muted)" }}>
          We sent a confirmation to <WaitlistSectionEmail />. Expect your invite within three weeks.
        </p>
        <WaitlistSectionRestart>Add another email</WaitlistSectionRestart>
      </WaitlistSectionConfirmation>
    </WaitlistSection>
  );
}
