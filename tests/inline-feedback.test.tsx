import { expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  INLINE_FEEDBACK_VARIANTS,
  InlineFeedback,
  InlineFeedbackAction,
  InlineFeedbackMessage,
  type InlineFeedbackProps,
  InlineFeedbackStatus,
} from "@/registry/uai/components/inline-feedback";

function Fixture({ action, ...props }: InlineFeedbackProps & { action?: () => unknown }) {
  return (
    <InlineFeedback {...props}>
      <InlineFeedbackAction onAction={action}>Copy link</InlineFeedbackAction>
      <InlineFeedbackStatus>
        <InlineFeedbackMessage status="pending">Copying…</InlineFeedbackMessage>
        <InlineFeedbackMessage status="success">Link copied</InlineFeedbackMessage>
        <InlineFeedbackMessage status="error">Couldn’t copy</InlineFeedbackMessage>
      </InlineFeedbackStatus>
    </InlineFeedback>
  );
}

test("runs the action from the keyboard and announces pending then success", async () => {
  const user = userEvent.setup();
  let finish: () => void = () => {};
  const action = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  render(<Fixture action={action} />);
  const status = screen.getByRole("status");
  expect(status.getAttribute("aria-live")).toBe("polite");
  expect(status.textContent).toBe("");
  await user.tab();
  await user.keyboard("{Enter}");
  const button = screen.getByRole("button", { name: "Copy link" });
  expect(status.textContent).toBe("Copying…");
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(document.activeElement).toBe(button);
  await act(async () => finish());
  expect(screen.getByRole("status").textContent).toBe("Link copied");
  expect(button.hasAttribute("aria-busy")).toBe(false);
});

test("reports rejected actions as errors in the same live region", async () => {
  const user = userEvent.setup();
  const change = mock((_status: string) => {});
  render(
    <Fixture
      onStatusChange={change}
      action={() => {
        throw new Error("denied");
      }}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Copy link" }));
  expect(screen.getByRole("status").textContent).toBe("Couldn’t copy");
  expect(change.mock.calls.map((call) => call[0])).toEqual(["pending", "error"]);
});

test("returns to idle after the duration and respects controlled status", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture duration={20} action={() => undefined} />);
  await user.click(screen.getByRole("button", { name: "Copy link" }));
  expect(screen.getByRole("status").textContent).toBe("Link copied");
  await act(() => new Promise((resolve) => setTimeout(resolve, 40)));
  expect(screen.getByRole("status").textContent).toBe("");
  view.rerender(<Fixture status="error" />);
  expect(screen.getByRole("status").textContent).toBe("Couldn’t copy");
});

test("renders every variant and guards compound children", () => {
  for (const variant of INLINE_FEEDBACK_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<InlineFeedbackStatus />)).toThrow(
    "InlineFeedbackStatus must be used within InlineFeedback",
  );
});
