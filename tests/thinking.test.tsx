import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/registry/uai/components/thinking";

test("composes a user-controlled activity disclosure", async () => {
  const user = userEvent.setup();

  render(
    <Thinking status="complete" defaultOpen={false}>
      <ThinkingTrigger title="Work complete" summary="The interface is ready." duration="1.8s" />
      <ThinkingContent>
        <ThinkingActivity type="file" path="src/prompt.tsx" elapsed="0.8s">
          Read the public interface
        </ThinkingActivity>
      </ThinkingContent>
    </Thinking>,
  );

  const trigger = screen.getByRole("button", { name: /Work complete/ });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByText("Read the public interface")).toBeNull();

  await user.click(trigger);

  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("log").textContent).toContain("Read the public interface");
  expect(screen.getByText("src/prompt.tsx")).toBeTruthy();
});

test("compound thinking children require their root", () => {
  expect(() => render(<ThinkingTrigger />)).toThrow("ThinkingTrigger must be used within Thinking");
});

test("announces status and renders the status-specific empty state", () => {
  render(
    <Thinking status="error">
      <ThinkingTrigger />
      <ThinkingContent />
    </Thinking>,
  );

  expect(screen.getByRole("status").textContent).toBe("Something interrupted this run.");
  expect(screen.getByText("No activity details are available.")).toBeTruthy();
  expect(document.querySelector("section")?.getAttribute("aria-busy")).toBe("false");
});
