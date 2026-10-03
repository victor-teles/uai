import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  type NewsletterFormResult,
  NewsletterFormSubmit,
} from "@/components/ui/uai/newsletter-form";
import {
  WAITLIST_SECTION_VARIANTS,
  WaitlistSection,
  WaitlistSectionConfirmation,
  WaitlistSectionEmail,
  WaitlistSectionForm,
  WaitlistSectionQualification,
  WaitlistSectionQualificationLegend,
  WaitlistSectionRestart,
  WaitlistSectionTitle,
  type WaitlistSectionVariant,
} from "@/registry/uai/blocks/waitlist-section";

function Fixture({
  variant,
  onSubscribe = async () => "success",
}: {
  variant?: WaitlistSectionVariant;
  onSubscribe?: () => Promise<NewsletterFormResult>;
}) {
  return (
    <WaitlistSection variant={variant}>
      <WaitlistSectionTitle>Join the beta</WaitlistSectionTitle>
      <WaitlistSectionForm onSubscribe={onSubscribe}>
        <WaitlistSectionQualification>
          <WaitlistSectionQualificationLegend>About your team</WaitlistSectionQualificationLegend>
          <FormField>
            <FormFieldLabel>Company</FormFieldLabel>
            <FormFieldInput name="company" />
          </FormField>
        </WaitlistSectionQualification>
        <NewsletterFormLabel>Work email</NewsletterFormLabel>
        <NewsletterFormField>
          <NewsletterFormInput />
          <NewsletterFormSubmit>Join</NewsletterFormSubmit>
        </NewsletterFormField>
        <NewsletterFormConsent>Email me about my invite.</NewsletterFormConsent>
        <NewsletterFormMessage />
      </WaitlistSectionForm>
      <WaitlistSectionConfirmation>
        <p>
          Confirmation sent to <WaitlistSectionEmail />.
        </p>
        <WaitlistSectionRestart>Add another email</WaitlistSectionRestart>
      </WaitlistSectionConfirmation>
    </WaitlistSection>
  );
}

test("groups qualification fields and requires consent before joining", async () => {
  const user = userEvent.setup();
  const onSubscribe = mock(async () => "success" as const);
  render(<Fixture onSubscribe={onSubscribe} />);
  expect(screen.getByRole("group", { name: "About your team" })).toBeTruthy();
  await user.type(screen.getByLabelText("Work email"), "ines@larkspur.example");
  await user.click(screen.getByRole("button", { name: "Join" }));
  expect(onSubscribe).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByRole("checkbox"));
});

test("swaps the form for a focused confirmation and can restart", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.type(screen.getByLabelText("Company"), "Larkspur");
  await user.type(screen.getByLabelText("Work email"), "ines@larkspur.example");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Join" }));
  await waitFor(() => expect(screen.getByText("ines@larkspur.example")).toBeTruthy());
  const confirmation = screen.getByText(/Confirmation sent to/).parentElement as HTMLElement;
  expect(confirmation.getAttribute("role")).toBe("status");
  expect(document.activeElement).toBe(confirmation);
  expect(screen.queryByLabelText("Work email")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Add another email" }));
  expect(screen.getByLabelText("Work email")).toBeTruthy();
});

test("keeps the form for duplicates, renders every variant, and guards regions", async () => {
  const user = userEvent.setup();
  render(<Fixture onSubscribe={async () => "duplicate"} />);
  await user.type(screen.getByLabelText("Work email"), "ana@example.com");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Join" }));
  await waitFor(() => expect(screen.getByText(/already subscribed/)).toBeTruthy());
  expect(screen.queryByText(/Confirmation sent/)).toBeNull();
  document.body.innerHTML = "";
  for (const variant of WAITLIST_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<WaitlistSectionEmail />)).toThrow(
    "WaitlistSectionEmail must be used within WaitlistSection",
  );
});
