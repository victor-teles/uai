import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  RESPONSE_STATUS_VARIANTS,
  ResponseStatus,
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  type ResponseStatusProps,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
} from "@/registry/uai/components/response-status";

function Fixture({
  onStop,
  onRetry,
  ...props
}: ResponseStatusProps & { onStop?: () => void; onRetry?: () => void }) {
  return (
    <ResponseStatus {...props}>
      <ResponseStatusIndicator />
      <ResponseStatusLabel />
      <ResponseStatusDetail>120 tokens</ResponseStatusDetail>
      <ResponseStatusActions>
        <ResponseStatusStop onClick={onStop} />
        <ResponseStatusRetry onClick={onRetry} />
      </ResponseStatusActions>
    </ResponseStatus>
  );
}

function Controlled() {
  const [status, setStatus] = useState<ResponseStatusValue>("streaming");
  return (
    <Fixture
      status={status}
      onStop={() => setStatus("stopped")}
      onRetry={() => setStatus("streaming")}
    />
  );
}

test("announces each status politely with matching actions", () => {
  const stop = mock(() => {});
  const view = render(<Fixture status="queued" onStop={stop} />);
  const label = screen.getByRole("status");
  expect(label.getAttribute("aria-live")).toBe("polite");
  expect(label.textContent).toBe("Waiting to start…");
  expect(view.container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("button", { name: "Stop" })).toBeTruthy();
  view.rerender(<Fixture status="streaming" />);
  expect(label.textContent).toBe("Generating response…");
  view.rerender(<Fixture status="complete" />);
  expect(label.textContent).toBe("Response complete");
  expect(screen.queryByRole("button")).toBeNull();
  expect(view.container.firstElementChild?.getAttribute("aria-busy")).toBeNull();
  view.rerender(<Fixture status="failed" />);
  expect(label.textContent).toBe("Response failed");
  expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  view.rerender(<Fixture status="stopped" />);
  expect(screen.getByRole("button", { name: "Regenerate" })).toBeTruthy();
});

test("keeps keyboard focus on the replacement action after stop and retry", async () => {
  const user = userEvent.setup();
  render(<Controlled />);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Stop" }));
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status").textContent).toBe("Response stopped");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Regenerate" }));
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Stop" }));
});

test("moves focus to the status when no replacement action exists", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture status="streaming" />);
  await user.tab();
  view.rerender(<Fixture status="complete" />);
  expect(document.activeElement).toBe(view.container.firstElementChild);
});

test("renders every variant and guards compound children", () => {
  for (const variant of RESPONSE_STATUS_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ResponseStatusLabel />)).toThrow(
    "ResponseStatusLabel must be used within ResponseStatus",
  );
});
