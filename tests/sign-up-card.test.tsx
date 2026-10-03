import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SIGN_UP_CARD_VARIANTS,
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
} from "@/registry/uai/components/sign-up-card";

function SignUpCardFixture({
  variant = "card",
  status = "idle",
  invalidPassword = false,
}: {
  variant?: SignUpCardVariant;
  status?: SignUpCardStatus;
  invalidPassword?: boolean;
}) {
  return (
    <SignUpCard variant={variant} status={status} onSubmit={(event) => event.preventDefault()}>
      <SignUpCardHeader>
        <SignUpCardTitle>Create your account</SignUpCardTitle>
        <SignUpCardDescription>Start with SSO or use your work email.</SignUpCardDescription>
      </SignUpCardHeader>
      <SignUpCardBody>
        <SignUpCardProviders>
          <SignUpCardProvider>Continue with SSO</SignUpCardProvider>
        </SignUpCardProviders>
        <SignUpCardDivider />
        <SignUpCardFields>
          <SignUpCardField>
            <SignUpCardLabel>Work email</SignUpCardLabel>
            <SignUpCardInput name="email" type="email" autoComplete="email" />
          </SignUpCardField>
          <SignUpCardField invalid={invalidPassword}>
            <SignUpCardLabel>Password</SignUpCardLabel>
            <SignUpCardInput
              name="password"
              revealable
              autoComplete="new-password"
              aria-describedby="password-requirements"
            />
            <SignUpCardPasswordGuide id="password-requirements">
              <SignUpCardPasswordRequirement met>
                At least 8 characters
              </SignUpCardPasswordRequirement>
              <SignUpCardPasswordRequirement>One number or symbol</SignUpCardPasswordRequirement>
            </SignUpCardPasswordGuide>
            <SignUpCardFieldMessage>
              {invalidPassword ? "Choose a stronger password." : "Use a memorable password."}
            </SignUpCardFieldMessage>
          </SignUpCardField>
          <SignUpCardConsent>
            <SignUpCardCheckbox name="terms" required />
            <span>I agree to the Terms.</span>
          </SignUpCardConsent>
          <SignUpCardError>We could not create your account. Review the fields.</SignUpCardError>
          <SignUpCardSubmit />
        </SignUpCardFields>
      </SignUpCardBody>
      <SignUpCardVerification>
        Open the link to finish creating your account.
      </SignUpCardVerification>
      <SignUpCardFooter>
        Already have an account? <a href="/sign-in">Sign in</a>
      </SignUpCardFooter>
    </SignUpCard>
  );
}

test("labels native account fields, consent, and provider actions", () => {
  const { container } = render(<SignUpCardFixture />);
  const heading = screen.getByRole("heading", { name: "Create your account" });

  expect(container.querySelector("form")?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(screen.getByRole("textbox", { name: "Work email" }).getAttribute("type")).toBe("email");
  expect(screen.getByLabelText("Password").getAttribute("autocomplete")).toBe("new-password");
  expect(screen.getByRole("group", { name: "Sign-up providers" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Continue with SSO" }).getAttribute("type")).toBe(
    "button",
  );
  expect((screen.getByRole("checkbox") as HTMLInputElement).required).toBe(true);
  expect(screen.getByRole("button", { name: "Create account" }).getAttribute("type")).toBe(
    "submit",
  );
});

test("reveals a new password without submitting the form", async () => {
  const user = userEvent.setup();
  render(<SignUpCardFixture />);
  const password = screen.getByLabelText("Password");

  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(password.getAttribute("type")).toBe("text");
  expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
});

test("exposes password guidance with explicit met and not-met text", () => {
  render(<SignUpCardFixture />);
  const guide = screen.getByRole("list", { name: "Password requirements" });

  expect(guide.textContent).toContain("Met: At least 8 characters");
  expect(guide.textContent).toContain("Not met: One number or symbol");
  expect(screen.getByLabelText("Password").getAttribute("aria-describedby")).toBe(
    "password-requirements",
  );
});

test("announces account creation errors and associates invalid password feedback", () => {
  const { container } = render(<SignUpCardFixture status="error" invalidPassword />);
  const password = screen.getByLabelText("Password");
  const alerts = screen.getAllByRole("alert");

  expect(alerts).toHaveLength(2);
  expect(password.getAttribute("aria-invalid")).toBe("true");
  expect(password.getAttribute("aria-describedby")).toBe(`password-requirements ${alerts[0]?.id}`);
  expect(container.querySelector("form")?.getAttribute("aria-describedby")).toBe(
    alerts[1]?.id ?? null,
  );
});

test("disables duplicate account creation work while submitting", () => {
  const { container } = render(<SignUpCardFixture status="submitting" />);

  expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
  expect(
    (screen.getByRole("button", { name: "Creating account…" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Continue with SSO" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect((screen.getByLabelText("Work email") as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
});

test("shows verification feedback only in the verification state", () => {
  const { rerender } = render(<SignUpCardFixture />);
  expect(screen.queryByRole("status")).toBeNull();

  rerender(<SignUpCardFixture status="verification" />);
  expect(screen.getByRole("status").textContent).toContain("Open the link");
});

test("renders card, split, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<SignUpCardFixture variant="card" />);
  const form = container.querySelector("form");

  expect(SIGN_UP_CARD_VARIANTS).toEqual(["card", "split", "compact"]);
  expect(form?.dataset.variant).toBe("card");
  expect(form?.className).toContain("p-5");

  rerender(<SignUpCardFixture variant="split" />);
  expect(form?.dataset.variant).toBe("split");
  expect(form?.className).toContain("p-6");
  expect(screen.getByText("or").parentElement?.className).toContain("sm:flex-col");

  rerender(<SignUpCardFixture variant="compact" />);
  expect(form?.dataset.variant).toBe("compact");
  expect(form?.className).toContain("rounded-xl");
  expect(screen.getByRole("button", { name: "Create account" }).className).toContain("h-[34px]");
});

test("compound sign-up children require their matching root", () => {
  expect(() => render(<SignUpCardSubmit />)).toThrow(
    "SignUpCardSubmit must be used within SignUpCard",
  );
  expect(() =>
    render(
      <SignUpCard>
        <SignUpCardInput />
      </SignUpCard>,
    ),
  ).toThrow("SignUpCardInput must be used within SignUpCardField");
  expect(() =>
    render(
      <SignUpCard>
        <SignUpCardCheckbox />
      </SignUpCard>,
    ),
  ).toThrow("SignUpCardCheckbox must be used within SignUpCardConsent");
});
