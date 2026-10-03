import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import { StatusBannerTitle } from "@/components/ui/uai/status-banner";
import {
  CONTACT_SECTION_VARIANTS,
  ContactSection,
  ContactSectionAvailability,
  ContactSectionError,
  ContactSectionFields,
  ContactSectionForm,
  type ContactSectionFormProps,
  ContactSectionOption,
  ContactSectionOptions,
  ContactSectionOptionTitle,
  ContactSectionReset,
  ContactSectionSubmit,
  ContactSectionSuccess,
  ContactSectionTitle,
  type ContactSectionVariant,
} from "@/registry/uai/blocks/contact-section";

function Fixture({
  variant,
  onSend = async () => "success" as const,
}: {
  variant?: ContactSectionVariant;
  onSend?: ContactSectionFormProps["onSend"];
}) {
  return (
    <ContactSection variant={variant}>
      <ContactSectionTitle>Talk to us</ContactSectionTitle>
      <ContactSectionAvailability available>Support is online now</ContactSectionAvailability>
      <ContactSectionOptions>
        <ContactSectionOption>
          <ContactSectionOptionTitle>Email</ContactSectionOptionTitle>
        </ContactSectionOption>
      </ContactSectionOptions>
      <ContactSectionForm onSend={onSend} aria-label="Message">
        <ContactSectionFields>
          <FormField required>
            <FormFieldLabel>Email</FormFieldLabel>
            <FormFieldInput name="email" type="email" />
          </FormField>
          <ContactSectionSubmit />
        </ContactSectionFields>
        <ContactSectionError>
          <StatusBannerTitle>Not sent</StatusBannerTitle>
        </ContactSectionError>
        <ContactSectionSuccess>
          <StatusBannerTitle>Message sent</StatusBannerTitle>
        </ContactSectionSuccess>
        <ContactSectionReset>Send another message</ContactSectionReset>
      </ContactSectionForm>
    </ContactSection>
  );
}

test("states availability in text and lists contact options", () => {
  render(<Fixture />);
  const section = screen.getByRole("region", { name: "Talk to us" });
  expect(section.textContent).toContain("Support is online now");
  expect(screen.getByRole("heading", { level: 3, name: "Email" })).toBeTruthy();
});

test("validates required fields, then sends and shows success with a reset", async () => {
  const user = userEvent.setup();
  let finish: (value: "success") => void = () => {};
  const onSend = mock((_data: FormData) => new Promise<"success">((resolve) => (finish = resolve)));
  render(<Fixture onSend={onSend} />);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(onSend).not.toHaveBeenCalled();
  await user.type(screen.getByRole("textbox", { name: /Email/ }), "kwame@northfield.example");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(onSend).toHaveBeenCalledTimes(1);
  expect(onSend.mock.calls[0]?.[0]?.get("email")).toBe("kwame@northfield.example");
  const pending = screen.getByRole("button", { name: "Sending…" });
  expect(pending.getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByRole("form", { name: "Message" }).getAttribute("aria-busy")).toBe("true");
  finish("success");
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Message sent"));
  expect(screen.queryByRole("textbox")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Send another message" }));
  expect(screen.getByRole("textbox", { name: /Email/ })).toBeTruthy();
});

test("shows an alert and keeps the fields when sending fails", async () => {
  const user = userEvent.setup();
  render(
    <Fixture
      onSend={async () => {
        throw new Error("offline");
      }}
    />,
  );
  await user.type(screen.getByRole("textbox", { name: /Email/ }), "kwame@northfield.example");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Not sent"));
  expect((screen.getByRole("textbox", { name: /Email/ }) as HTMLInputElement).value).toBe(
    "kwame@northfield.example",
  );
});

test("renders every variant and guards regions", () => {
  for (const variant of CONTACT_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ContactSectionSubmit />)).toThrow(
    "ContactSectionSubmit must be used within ContactSection",
  );
});
