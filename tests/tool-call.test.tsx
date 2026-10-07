import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TOOL_CALL_VARIANTS,
  ToolCall,
  ToolCallContent,
  ToolCallError,
  ToolCallHeader,
  ToolCallInput,
  ToolCallName,
  ToolCallOutput,
  type ToolCallProps,
  ToolCallStatus,
  ToolCallSummary,
  ToolCallTrigger,
} from "@/registry/uai/components/tool-call";

function Fixture(props: ToolCallProps) {
  return (
    <ToolCall {...props}>
      <ToolCallHeader>
        <ToolCallTrigger>
          <ToolCallName>create_refund</ToolCallName>
          <ToolCallSummary>INV-20931</ToolCallSummary>
        </ToolCallTrigger>
        <ToolCallStatus />
      </ToolCallHeader>
      <ToolCallContent>
        <ToolCallInput>{`{ "invoice": "INV-20931" }`}</ToolCallInput>
        <ToolCallOutput>{`{ "refund": "re_3PqL" }`}</ToolCallOutput>
        <ToolCallError>Charge already refunded.</ToolCallError>
      </ToolCallContent>
    </ToolCall>
  );
}

test("toggles the input and output disclosure with the keyboard", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  render(<Fixture status="success" onOpenChange={change} />);
  const trigger = screen.getByRole("button", { name: /create_refund/ });
  const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(panel?.closest("[inert]")).not.toBeNull();
  await user.tab();
  await user.keyboard("{Enter}");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(panel?.closest("[inert]")).toBeNull();
  expect(screen.getByRole("group", { name: "Input" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Output" }).textContent).toContain("re_3PqL");
  await user.keyboard(" ");
  expect(change.mock.calls).toEqual([[true], [false]]);
});

test("announces each status as text and shows the matching payloads", () => {
  const view = render(<Fixture status="queued" defaultOpen />);
  expect(screen.getByRole("status").textContent).toBe("Queued");
  expect(screen.queryByRole("group", { name: "Output" })).toBeNull();
  view.rerender(<Fixture status="running" defaultOpen />);
  expect(screen.getByRole("status").textContent).toBe("Running");
  expect(view.container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
  view.rerender(<Fixture status="error" defaultOpen />);
  expect(screen.getByRole("status").textContent).toBe("Failed");
  expect(screen.getByText("Charge already refunded.")).toBeTruthy();
  expect(screen.queryByRole("group", { name: "Output" })).toBeNull();
});

test("respects a controlled open state", async () => {
  const user = userEvent.setup();
  render(<Fixture status="success" open />);
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
});

test("renders every variant and guards compound children", () => {
  for (const variant of TOOL_CALL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ToolCallTrigger />)).toThrow("ToolCallTrigger must be used within ToolCall");
});
