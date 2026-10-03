import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InlineFeedbackMessage, InlineFeedbackStatus } from "@/components/ui/uai/inline-feedback";
import {
  CODE_VERIFICATION_VARIANTS,
  CodeVerification,
  CodeVerificationAlternative,
  CodeVerificationAlternatives,
  CodeVerificationDescription,
  CodeVerificationForm,
  CodeVerificationInput,
  CodeVerificationMessage,
  type CodeVerificationProps,
  CodeVerificationResend,
  CodeVerificationResendButton,
  CodeVerificationSubmit,
  CodeVerificationTitle,
} from "@/registry/uai/blocks/code-verification";

function Fixture(props: Partial<CodeVerificationProps>) {
  return (
    <CodeVerification
      length={4}
      resendAfter={0}
      onVerify={async () => "success" as const}
      {...props}
    >
      <CodeVerificationTitle>Check your email</CodeVerificationTitle>
      <CodeVerificationDescription>We sent a code.</CodeVerificationDescription>
      <CodeVerificationForm>
        <CodeVerificationInput />
        <CodeVerificationMessage status="invalid">Wrong code</CodeVerificationMessage>
        <CodeVerificationMessage status="expired">Code expired</CodeVerificationMessage>
        <CodeVerificationMessage status="verified">Verified</CodeVerificationMessage>
        <CodeVerificationSubmit>Verify</CodeVerificationSubmit>
        <CodeVerificationResend>
          <CodeVerificationResendButton>Resend code</CodeVerificationResendButton>
          <InlineFeedbackStatus>
            <InlineFeedbackMessage status="success">New code sent</InlineFeedbackMessage>
          </InlineFeedbackStatus>
        </CodeVerificationResend>
        <CodeVerificationAlternatives>
          <CodeVerificationAlternative>Text me instead</CodeVerificationAlternative>
        </CodeVerificationAlternatives>
      </CodeVerificationForm>
    </CodeVerification>
  );
}
const boxes = () => screen.getAllByRole("textbox") as HTMLInputElement[];
const box = (index: number) => boxes()[index] as HTMLInputElement;

test("labels each box, autofills from the first, and auto-submits a typed code", async () => {
  const user = userEvent.setup();
  const onVerify = mock(async () => "success" as const);
  render(<Fixture onVerify={onVerify} />);
  expect(screen.getByRole("group", { name: "Verification code" })).toBeTruthy();
  expect(box(0).getAttribute("autocomplete")).toBe("one-time-code");
  expect(box(1).getAttribute("aria-label")).toBe("Character 2 of 4");
  await user.click(box(0));
  await user.keyboard("1a2");
  expect(boxes().map((box) => box.value)).toEqual(["1", "2", "", ""]);
  expect(document.activeElement).toBe(box(2));
  await user.keyboard("34");
  await waitFor(() => expect(onVerify).toHaveBeenCalledWith("1234"));
  await waitFor(() => expect(screen.getByText("Verified")).toBeTruthy());
});

test("pastes a whole code and supports arrows, Home, End, and Backspace", async () => {
  const user = userEvent.setup();
  render(<Fixture autoSubmit={false} />);
  await user.click(box(0));
  await user.paste("9 8-7");
  expect(boxes().map((box) => box.value)).toEqual(["9", "8", "7", ""]);
  expect(document.activeElement).toBe(box(3));
  await user.keyboard("{Backspace}");
  expect(box(2).value).toBe("");
  expect(document.activeElement).toBe(box(2));
  await user.keyboard("{Home}");
  expect(document.activeElement).toBe(box(0));
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(box(1));
  await user.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(box(0));
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(box(2));
});

test("shows invalid and expired errors, clears the code, and refocuses the first box", async () => {
  const user = userEvent.setup();
  let result: "invalid" | "expired" = "invalid";
  render(<Fixture onVerify={async () => result} />);
  await user.click(box(0));
  await user.paste("1111");
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Wrong code"));
  expect(box(0).getAttribute("aria-invalid")).toBe("true");
  expect(box(0).value).toBe("");
  expect(document.activeElement).toBe(box(0));
  result = "expired";
  await user.paste("2222");
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Code expired"));
});

test("submitting an incomplete code focuses the next empty box", async () => {
  const user = userEvent.setup();
  const onVerify = mock(async () => "success" as const);
  render(<Fixture onVerify={onVerify} />);
  await user.click(box(0));
  await user.keyboard("5");
  fireEvent.submit(screen.getByRole("button", { name: "Verify" }).closest("form") as HTMLElement);
  expect(onVerify).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(box(1));
});

test("waits for the countdown, then resends and announces it", async () => {
  const user = userEvent.setup();
  const onResend = mock(async () => {});
  render(<Fixture resendAfter={1} onResend={onResend} />);
  const resend = screen.getByRole("button", { name: /Resend code/ }) as HTMLButtonElement;
  expect(resend.disabled).toBe(true);
  expect(resend.textContent).toContain("in 0:01");
  await waitFor(() => expect(resend.disabled).toBe(false), { timeout: 2500 });
  await user.click(resend);
  expect(onResend).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.getByText("New code sent")).toBeTruthy());
  expect(resend.disabled).toBe(true);
});

test("renders every variant and guards its regions", () => {
  for (const variant of CODE_VERIFICATION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CodeVerificationInput />)).toThrow(
    "CodeVerificationInput must be used within CodeVerification",
  );
});
