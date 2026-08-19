import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PASSWORD_RECOVERY_STEPS,
  PASSWORD_RECOVERY_VARIANTS,
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
} from "@/registry/uai/components/password-recovery";

function PasswordRecoveryFixture({
  variant = "card",
  step = "request",
  status = "idle",
  invalidPassword = false,
}: {
  variant?: PasswordRecoveryVariant;
  step?: PasswordRecoveryStep;
  status?: PasswordRecoveryStatus;
  invalidPassword?: boolean;
}) {
  return (
    <PasswordRecovery
      variant={variant}
      step={step}
      status={status}
      onSubmit={(event) => event.preventDefault()}
    >
      <PasswordRecoveryAside>
        <strong>Reset securely</strong>
        <PasswordRecoveryProgress aria-label="Recovery progress">
          <PasswordRecoveryProgressItem state={step === "request" ? "current" : "complete"}>
            Find account
          </PasswordRecoveryProgressItem>
          <PasswordRecoveryProgressItem
            state={
              step === "sent" || step === "expired"
                ? "current"
                : step === "request"
                  ? "upcoming"
                  : "complete"
            }
          >
            Check email
          </PasswordRecoveryProgressItem>
          <PasswordRecoveryProgressItem
            state={step === "reset" ? "current" : step === "success" ? "complete" : "upcoming"}
          >
            New password
          </PasswordRecoveryProgressItem>
        </PasswordRecoveryProgress>
      </PasswordRecoveryAside>
      <PasswordRecoveryMain>
        <PasswordRecoveryHeader>
          <PasswordRecoveryTitle>Recover your account</PasswordRecoveryTitle>
          <PasswordRecoveryDescription>
            Use a verified email to continue.
          </PasswordRecoveryDescription>
        </PasswordRecoveryHeader>

        <PasswordRecoveryStage when="request">
          <PasswordRecoveryFields>
            <PasswordRecoveryField>
              <PasswordRecoveryLabel>Work email</PasswordRecoveryLabel>
              <PasswordRecoveryInput name="email" type="email" autoComplete="email" required />
            </PasswordRecoveryField>
            <PasswordRecoveryError>
              We could not send the reset link. Try again.
            </PasswordRecoveryError>
            <PasswordRecoverySubmit />
          </PasswordRecoveryFields>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="sent">
          <PasswordRecoveryStatusMessage tone="sent">
            Check your inbox for the next step.
          </PasswordRecoveryStatusMessage>
          <PasswordRecoveryActions>
            <PasswordRecoveryAction>Use another email</PasswordRecoveryAction>
          </PasswordRecoveryActions>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="reset">
          <PasswordRecoveryFields>
            <PasswordRecoveryField invalid={invalidPassword}>
              <PasswordRecoveryLabel>New password</PasswordRecoveryLabel>
              <PasswordRecoveryInput
                name="password"
                revealable
                autoComplete="new-password"
                aria-describedby="reset-password-requirements"
              />
              <PasswordRecoveryPasswordGuide id="reset-password-requirements">
                <PasswordRecoveryPasswordRequirement met>
                  At least 8 characters
                </PasswordRecoveryPasswordRequirement>
                <PasswordRecoveryPasswordRequirement>
                  One number or symbol
                </PasswordRecoveryPasswordRequirement>
              </PasswordRecoveryPasswordGuide>
              <PasswordRecoveryFieldMessage>
                {invalidPassword ? "Passwords must match." : "Use a new password."}
              </PasswordRecoveryFieldMessage>
            </PasswordRecoveryField>
            <PasswordRecoveryError>We could not update your password.</PasswordRecoveryError>
            <PasswordRecoverySubmit />
          </PasswordRecoveryFields>
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="expired">
          <PasswordRecoveryStatusMessage tone="expired">
            This reset link has expired.
          </PasswordRecoveryStatusMessage>
          <PasswordRecoverySubmit />
        </PasswordRecoveryStage>

        <PasswordRecoveryStage when="success">
          <PasswordRecoveryStatusMessage tone="success">
            Your password has been updated.
          </PasswordRecoveryStatusMessage>
        </PasswordRecoveryStage>

        <PasswordRecoveryFooter>
          Remembered it? <a href="/sign-in">Back to sign in</a>
        </PasswordRecoveryFooter>
      </PasswordRecoveryMain>
    </PasswordRecovery>
  );
}

test("labels the active recovery form and keeps inactive stages out of the DOM", () => {
  const { container } = render(<PasswordRecoveryFixture />);
  const heading = screen.getByRole("heading", { name: "Recover your account" });

  expect(container.querySelector("form")?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(screen.getByRole("textbox", { name: "Work email" }).getAttribute("type")).toBe("email");
  expect(screen.getByRole("button", { name: "Send reset link" }).getAttribute("type")).toBe(
    "submit",
  );
  expect(screen.queryByText("Check your inbox for the next step.")).toBeNull();
});

test("exposes request, sent, reset, expired, and success as controlled workflow steps", () => {
  const { container, rerender } = render(<PasswordRecoveryFixture step="sent" />);

  expect(PASSWORD_RECOVERY_STEPS).toEqual(["request", "sent", "reset", "expired", "success"]);
  expect(container.querySelector("form")?.dataset.step).toBe("sent");
  expect(screen.getByRole("status").textContent).toContain("Check your inbox");

  rerender(<PasswordRecoveryFixture step="expired" />);
  expect(screen.getByRole("alert").textContent).toContain("expired");
  expect(screen.getByRole("button", { name: "Send a new link" })).toBeTruthy();

  rerender(<PasswordRecoveryFixture step="success" />);
  expect(screen.getByRole("status").textContent).toContain("updated");
});

test("disables duplicate recovery work and names the submitting action", () => {
  const { container } = render(<PasswordRecoveryFixture status="submitting" />);

  expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
  expect((screen.getByLabelText("Work email") as HTMLInputElement).disabled).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Sending link…" }) as HTMLButtonElement).disabled,
  ).toBe(true);
});

test("reveals new passwords and preserves requirement plus error descriptions", async () => {
  const user = userEvent.setup();
  render(<PasswordRecoveryFixture step="reset" status="error" invalidPassword />);
  const password = screen.getByLabelText("New password");
  const alerts = screen.getAllByRole("alert");

  expect(password.getAttribute("aria-invalid")).toBe("true");
  expect(password.getAttribute("aria-describedby")).toBe(
    `reset-password-requirements ${alerts[0]?.id}`,
  );
  expect(screen.getByRole("list", { name: "Password requirements" }).textContent).toContain(
    "Met: At least 8 characters",
  );

  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(password.getAttribute("type")).toBe("text");
  expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
});

test("marks recovery progress with text and current-step semantics", () => {
  render(<PasswordRecoveryFixture step="reset" />);
  const progress = screen.getByRole("list", { name: "Recovery progress" });

  expect(progress.textContent).toContain("Complete: Find account");
  expect(progress.textContent).toContain("Current: New password");
  expect(
    screen
      .getByText("New password", { selector: "li span:last-child" })
      .closest("li")
      ?.getAttribute("aria-current"),
  ).toBe("step");
});

test("renders card, split, and compact as distinct root layouts", () => {
  const { container, rerender } = render(<PasswordRecoveryFixture variant="card" />);
  const form = container.querySelector("form");

  expect(PASSWORD_RECOVERY_VARIANTS).toEqual(["card", "split", "compact"]);
  expect(form?.dataset.variant).toBe("card");
  expect(form?.style.padding).toBe("20px");

  rerender(<PasswordRecoveryFixture variant="split" />);
  expect(form?.dataset.variant).toBe("split");
  expect(form?.style.padding).toBe("0px");
  expect(form?.className).toContain("sm:grid-cols");

  rerender(<PasswordRecoveryFixture variant="compact" />);
  expect(form?.dataset.variant).toBe("compact");
  expect(form?.style.borderRadius).toBe("12px");
  expect(screen.getByRole("button", { name: "Send reset link" }).className).toContain("h-[34px]");
});

test("compound recovery children require their matching root and field", () => {
  expect(() => render(<PasswordRecoverySubmit />)).toThrow(
    "PasswordRecoverySubmit must be used within PasswordRecovery",
  );
  expect(() =>
    render(
      <PasswordRecovery>
        <PasswordRecoveryInput />
      </PasswordRecovery>,
    ),
  ).toThrow("PasswordRecoveryInput must be used within PasswordRecoveryField");
});
