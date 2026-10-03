import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SIGN_IN_CARD_VARIANTS,
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
} from "@/registry/uai/components/sign-in-card";

function SignInCardFixture({
  variant = "card",
  status = "idle",
  invalidPassword = false,
}: {
  variant?: SignInCardVariant;
  status?: SignInCardStatus;
  invalidPassword?: boolean;
}) {
  return (
    <SignInCard variant={variant} status={status} onSubmit={(event) => event.preventDefault()}>
      <SignInCardHeader>
        <SignInCardTitle>Welcome back</SignInCardTitle>
        <SignInCardDescription>Sign in to continue to your workspace.</SignInCardDescription>
      </SignInCardHeader>
      <SignInCardBody>
        <SignInCardProviders>
          <SignInCardProvider>Continue with SSO</SignInCardProvider>
          <SignInCardProvider>Continue with GitHub</SignInCardProvider>
        </SignInCardProviders>
        <SignInCardDivider />
        <SignInCardFields>
          <SignInCardField>
            <SignInCardLabel>Email</SignInCardLabel>
            <SignInCardInput name="email" type="email" autoComplete="email" />
          </SignInCardField>
          <SignInCardField invalid={invalidPassword}>
            <SignInCardLabel>Password</SignInCardLabel>
            <SignInCardInput name="password" revealable autoComplete="current-password" />
            <SignInCardFieldMessage>
              {invalidPassword
                ? "Check your password and try again."
                : "Use your account password."}
            </SignInCardFieldMessage>
          </SignInCardField>
          <SignInCardOptions>
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot password?</a>
          </SignInCardOptions>
          <SignInCardError>
            We could not sign you in. Check your details and try again.
          </SignInCardError>
          <SignInCardSubmit />
        </SignInCardFields>
      </SignInCardBody>
      <SignInCardFooter>
        New here? <a href="/sign-up">Create an account</a>
      </SignInCardFooter>
    </SignInCard>
  );
}

test("labels the form and composes native sign-in controls", () => {
  const { container } = render(<SignInCardFixture />);
  const form = container.querySelector("form");
  const heading = screen.getByRole("heading", { name: "Welcome back" });

  expect(form?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(screen.getByRole("textbox", { name: "Email" }).getAttribute("type")).toBe("email");
  expect(screen.getByLabelText("Password").getAttribute("type")).toBe("password");
  expect(screen.getByRole("group", { name: "Sign-in providers" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Continue with SSO" }).getAttribute("type")).toBe(
    "button",
  );
  expect(screen.getByRole("button", { name: "Sign in" }).getAttribute("type")).toBe("submit");
  expect(screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href")).toBe(
    "/forgot-password",
  );
});

test("reveals and hides the password without submitting the form", async () => {
  const user = userEvent.setup();
  render(<SignInCardFixture />);

  const password = screen.getByLabelText("Password");
  const reveal = screen.getByRole("button", { name: "Show password" });

  await user.click(reveal);
  expect(password.getAttribute("type")).toBe("text");
  expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe(
    "true",
  );

  await user.click(screen.getByRole("button", { name: "Hide password" }));
  expect(password.getAttribute("type")).toBe("password");
});

test("announces authentication errors and associates invalid field feedback", () => {
  const { container } = render(<SignInCardFixture status="error" invalidPassword />);
  const password = screen.getByLabelText("Password");
  const alerts = screen.getAllByRole("alert");

  expect(alerts).toHaveLength(2);
  expect(password.getAttribute("aria-invalid")).toBe("true");
  expect(password.getAttribute("aria-describedby")).toBe(alerts[0]?.id ?? null);
  expect(container.querySelector("form")?.getAttribute("aria-describedby")).toBe(
    alerts[1]?.id ?? null,
  );
});

test("disables duplicate authentication work while submitting", () => {
  const { container } = render(<SignInCardFixture status="submitting" />);

  expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
  expect((screen.getByRole("button", { name: "Signing in…" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(
    (screen.getByRole("button", { name: "Continue with GitHub" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect((screen.getByLabelText("Email") as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByLabelText("Password") as HTMLInputElement).disabled).toBe(true);
});

test("renders card, split, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<SignInCardFixture variant="card" />);
  const form = container.querySelector("form");

  expect(SIGN_IN_CARD_VARIANTS).toEqual(["card", "split", "compact"]);
  expect(form?.dataset.variant).toBe("card");
  expect(form?.style.borderRadius).toBe("14px");
  expect(form?.style.padding).toBe("20px");

  rerender(<SignInCardFixture variant="split" />);
  expect(form?.dataset.variant).toBe("split");
  expect(form?.style.padding).toBe("24px");
  expect(screen.getByText("or").parentElement?.className).toContain("sm:flex-col");
  expect(screen.queryByText("or continue with email")).toBeNull();

  rerender(<SignInCardFixture variant="compact" />);
  expect(form?.dataset.variant).toBe("compact");
  expect(form?.style.borderRadius).toBe("12px");
  expect(form?.style.padding).toBe("14px");
  expect(screen.getByText("or continue with email")).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign in" }).className).toContain("h-[34px]");
});

test("compound sign-in children require their matching root", () => {
  expect(() => render(<SignInCardSubmit />)).toThrow(
    "SignInCardSubmit must be used within SignInCard",
  );
  expect(() =>
    render(
      <SignInCard>
        <SignInCardInput />
      </SignInCard>,
    ),
  ).toThrow("SignInCardInput must be used within SignInCardField");
});
