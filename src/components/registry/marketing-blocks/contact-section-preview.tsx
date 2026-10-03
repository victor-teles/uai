"use client";

import { Headset, Mail, MessagesSquare } from "lucide-react";
import {
  ContactSection,
  ContactSectionAvailability,
  ContactSectionDescription,
  ContactSectionDetails,
  ContactSectionError,
  ContactSectionExpectation,
  ContactSectionExpectations,
  ContactSectionFields,
  ContactSectionForm,
  ContactSectionHeader,
  ContactSectionOption,
  ContactSectionOptionDetail,
  ContactSectionOptionIcon,
  ContactSectionOptionLink,
  ContactSectionOptions,
  ContactSectionOptionTitle,
  ContactSectionReset,
  ContactSectionSubmit,
  ContactSectionSuccess,
  ContactSectionTitle,
  type ContactSectionVariant,
} from "@/components/uai/contact-section";
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
  FormFieldTextarea,
} from "@/components/ui/uai/form-field";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

async function send(data: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return String(data.get("email")).endsWith("@fail.test")
    ? ("error" as const)
    : ("success" as const);
}

export function ContactSectionPreview({ variant = "split" }: { variant?: ContactSectionVariant }) {
  return (
    <ContactSection variant={variant}>
      <ContactSectionDetails>
        <ContactSectionHeader>
          <ContactSectionTitle>Talk to the Ferrow team</ContactSectionTitle>
          <ContactSectionDescription>
            Questions about plans, migrations, or a tricky dispatch setup. A person reads every
            message.
          </ContactSectionDescription>
        </ContactSectionHeader>
        <ContactSectionAvailability available>
          Support is online now · Monday to Friday, 7:00–19:00 CET
        </ContactSectionAvailability>
        <ContactSectionOptions>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <Mail size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Email</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>Replies within one business day</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="mailto:hello@ferrow.example">
              hello@ferrow.example
            </ContactSectionOptionLink>
          </ContactSectionOption>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <Headset size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Phone</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>For urgent outages</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="tel:+15550134200">
              +1 555 013 4200
            </ContactSectionOptionLink>
          </ContactSectionOption>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <MessagesSquare size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Community</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>Ask other dispatchers</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="#community">Open the forum</ContactSectionOptionLink>
          </ContactSectionOption>
        </ContactSectionOptions>
      </ContactSectionDetails>
      <ContactSectionForm onSend={send} aria-label="Send the team a message">
        <ContactSectionFields>
          <FormField required>
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldInput name="name" autoComplete="name" />
          </FormField>
          <FormField required>
            <FormFieldLabel>Work email</FormFieldLabel>
            <FormFieldInput name="email" type="email" autoComplete="email" />
          </FormField>
          <FormField required>
            <FormFieldLabel>How can we help?</FormFieldLabel>
            <FormFieldTextarea name="message" rows={4} />
          </FormField>
          <ContactSectionExpectations aria-label="What happens next">
            <ContactSectionExpectation>
              A support specialist replies by email.
            </ContactSectionExpectation>
            <ContactSectionExpectation>
              Use an address ending in @fail.test to preview the error state.
            </ContactSectionExpectation>
          </ContactSectionExpectations>
          <ContactSectionSubmit>Send message</ContactSectionSubmit>
        </ContactSectionFields>
        <ContactSectionError>
          <StatusBannerTitle>Your message wasn’t sent</StatusBannerTitle>
          <StatusBannerDescription>
            Check your connection and try again. Your text is still in the form.
          </StatusBannerDescription>
        </ContactSectionError>
        <ContactSectionSuccess>
          <StatusBannerTitle>Message sent</StatusBannerTitle>
          <StatusBannerDescription>
            We’ll reply within one business day. A copy is on its way to your inbox.
          </StatusBannerDescription>
        </ContactSectionSuccess>
        <ContactSectionReset>Send another message</ContactSectionReset>
      </ContactSectionForm>
    </ContactSection>
  );
}
