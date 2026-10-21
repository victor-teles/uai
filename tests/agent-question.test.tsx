import { expect, mock, test } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  AGENT_QUESTION_VARIANTS,
  AgentQuestion,
  type AgentQuestionAnswers,
  AgentQuestionDescription,
  AgentQuestionFooter,
  AgentQuestionHeader,
  AgentQuestionItem,
  AgentQuestionItems,
  AgentQuestionOption,
  AgentQuestionOptions,
  AgentQuestionOther,
  type AgentQuestionProps,
  AgentQuestionSummary,
  AgentQuestionTitle,
} from "@/registry/uai/components/agent-question";

function Questions(props: Partial<AgentQuestionProps>) {
  return (
    <AgentQuestion {...props}>
      <AgentQuestionHeader />
      <AgentQuestionItems>
        <AgentQuestionItem id="database" required>
          <AgentQuestionTitle>Which database should I set up?</AgentQuestionTitle>
          <AgentQuestionDescription>Migrations will use the one you pick.</AgentQuestionDescription>
          <AgentQuestionOptions>
            <AgentQuestionOption
              value="postgres"
              label="Postgres"
              recommended
              description="Matches DATABASE_URL"
            />
            <AgentQuestionOption value="sqlite" label="SQLite" />
            <AgentQuestionOther />
          </AgentQuestionOptions>
        </AgentQuestionItem>
        <AgentQuestionItem id="seed" type="multiple" required>
          <AgentQuestionTitle>What should the seed data include?</AgentQuestionTitle>
          <AgentQuestionOptions>
            <AgentQuestionOption value="users" label="Demo users" />
            <AgentQuestionOption value="orders" label="Sample orders" />
            <AgentQuestionOther />
          </AgentQuestionOptions>
        </AgentQuestionItem>
        <AgentQuestionItem id="auth">
          <AgentQuestionTitle>Add auth now?</AgentQuestionTitle>
          <AgentQuestionOptions>
            <AgentQuestionOption value="password" label="Email and password" />
            <AgentQuestionOption value="later" label="Not yet" />
          </AgentQuestionOptions>
        </AgentQuestionItem>
      </AgentQuestionItems>
      <AgentQuestionFooter />
      <AgentQuestionSummary time="14:02" />
    </AgentQuestion>
  );
}

test("shows one question at a time inside a fieldset with its legend", () => {
  render(<Questions />);
  expect(screen.getByText("Question 1 of 3")).toBeTruthy();
  expect(screen.getByRole("group", { name: "Which database should I set up?" })).toBeTruthy();
  expect(screen.getByRole("radiogroup", { name: "Which database should I set up?" })).toBeTruthy();
  expect(screen.queryByRole("group", { name: "Add auth now?" })).toBeNull();
  expect(screen.getByRole("radio", { name: "Postgres, recommended" })).toBeTruthy();
  expect(screen.getByText("Waiting for you")).toBeTruthy();
});

test("required blocks Continue, optional shows Skip and records Skipped", async () => {
  const user = userEvent.setup();
  const submit = mock((_answers: AgentQuestionAnswers) => {});
  render(<Questions onSubmit={submit} />);
  const continueButton = () => screen.getByRole("button", { name: /Continue|Send answers/ });
  expect(continueButton()).toHaveProperty("disabled", true);
  expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
  await user.click(screen.getByRole("radio", { name: "Postgres, recommended" }));
  expect(continueButton()).toHaveProperty("disabled", false);
  await user.click(continueButton());

  expect(screen.getByText("Question 2 of 3")).toBeTruthy();
  await user.click(screen.getByRole("checkbox", { name: "Demo users" }));
  await user.click(screen.getByRole("checkbox", { name: "Sample orders" }));
  expect(screen.getByText("2 selected")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.getByText("Question 3 of 3")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Send answers" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Skip" }));
  expect(submit).toHaveBeenCalledWith({ database: "postgres", seed: ["users", "orders"] });

  expect(screen.getByRole("heading", { name: "Answered 3 questions" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("Answers sent");
  await user.click(screen.getByRole("button", { name: "Show answers" }));
  const record = within(
    document.querySelector("[data-slot=agent-question-summary]") as HTMLElement,
  );
  expect(record.getByText("Postgres")).toBeTruthy();
  expect(record.getByText("Demo users · Sample orders")).toBeTruthy();
  expect(record.getByText("Skipped")).toBeTruthy();
});

test("number keys pick within the component and never hijack typing", async () => {
  const user = userEvent.setup();
  render(
    <>
      <input aria-label="Outside" />
      <Questions />
    </>,
  );
  screen.getByRole("textbox", { name: "Outside" }).focus();
  await user.keyboard("2");
  expect(screen.getByRole("radio", { name: "SQLite" }).getAttribute("aria-checked")).toBe("false");

  screen.getByRole("radio", { name: "Postgres, recommended" }).focus();
  await user.keyboard("2");
  expect(screen.getByRole("radio", { name: "SQLite" }).getAttribute("aria-checked")).toBe("true");

  await user.keyboard("3");
  const other = screen.getByRole("textbox", { name: "Something else" });
  expect(document.activeElement).toBe(other);
  await user.type(other, "MySQL 1");
  expect((other as HTMLInputElement).value).toBe("MySQL 1");
  expect(screen.getByRole("radio", { name: "Something else" }).getAttribute("aria-checked")).toBe(
    "true",
  );
});

test("moves focus to the new legend on each step and to the summary when answered", async () => {
  const user = userEvent.setup();
  render(<Questions />);
  await user.click(screen.getByRole("radio", { name: "SQLite" }));
  await user.keyboard("{Enter}");
  expect(document.activeElement?.textContent).toBe("What should the seed data include?");
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(document.activeElement?.textContent).toBe("Which database should I set up?");
  await user.keyboard("{Enter}");
  await user.keyboard("1");
  await user.keyboard("{Enter}");
  await user.keyboard("2");
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Answered 3 questions" }),
  );
});

test("onSubmit receives the free text from Something else", async () => {
  const user = userEvent.setup();
  const submit = mock((_answers: AgentQuestionAnswers) => {});
  render(<Questions onSubmit={submit} />);
  await user.click(screen.getByRole("radio", { name: "Something else" }));
  expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", true);
  await user.type(screen.getByRole("textbox", { name: "Something else" }), "MySQL");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("checkbox", { name: "Something else" }));
  await user.type(screen.getByRole("textbox", { name: "Something else" }), "Two stores");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "Not yet" }));
  await user.click(screen.getByRole("button", { name: "Send answers" }));
  expect(submit).toHaveBeenCalledWith({
    database: "other",
    "database:other": "MySQL",
    seed: ["other"],
    "seed:other": "Two stores",
    auth: "later",
  });
  await user.click(screen.getByRole("button", { name: "Show answers" }));
  const record = within(
    document.querySelector("[data-slot=agent-question-summary]") as HTMLElement,
  );
  expect(record.getByText("MySQL")).toBeTruthy();
  expect(record.getByText("Two stores")).toBeTruthy();
});

test("a promise shows Sending… until it settles, and a rejection keeps the answers", async () => {
  const user = userEvent.setup();
  let reject: (reason: Error) => void = () => {};
  const submit = () =>
    new Promise((_, fail) => {
      reject = fail;
    });
  const { container } = render(
    <AgentQuestion onSubmit={submit}>
      <AgentQuestionItems>
        <AgentQuestionItem id="auth" required>
          <AgentQuestionTitle>Add auth now?</AgentQuestionTitle>
          <AgentQuestionOptions>
            <AgentQuestionOption value="password" label="Email and password" />
          </AgentQuestionOptions>
        </AgentQuestionItem>
      </AgentQuestionItems>
      <AgentQuestionFooter />
    </AgentQuestion>,
  );
  await user.click(screen.getByRole("radio", { name: "Email and password" }));
  await user.click(screen.getByRole("button", { name: "Send answers" }));
  expect(screen.getByText("Sending…")).toBeTruthy();
  expect(container.querySelector("section")?.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("radio", { name: "Email and password" })).toHaveProperty(
    "disabled",
    true,
  );
  await act(async () => reject(new Error("The agent stopped. Try again.")));
  expect(screen.getByRole("alert").textContent).toBe("The agent stopped. Try again.");
  expect(
    screen.getByRole("radio", { name: "Email and password" }).getAttribute("aria-checked"),
  ).toBe("true");
  expect(screen.getByRole("button", { name: "Send answers" })).toHaveProperty("disabled", false);
});

test("dismiss leaves a muted record with no answers", async () => {
  const user = userEvent.setup();
  const dismiss = mock(() => {});
  render(<Questions onDismiss={dismiss} />);
  await user.click(screen.getByRole("button", { name: "Dismiss question" }));
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("heading", { name: "Question dismissed" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Show answers" })).toBeNull();
});

test("unselected rings use subtle-foreground and reduced motion drops slides and zooms", () => {
  const { container } = render(<Questions />);
  const radio = screen.getByRole("radio", { name: "SQLite" });
  expect(radio.className).toContain("shadow-[inset_0_0_0_1.5px_var(--subtle-foreground)]");
  expect(radio.className).not.toContain("border-strong");
  const html = container.innerHTML;
  expect(html).toContain("motion-reduce:animate-none");
  expect(html).toContain("motion-reduce:[&amp;_svg]:animate-none");
  expect(html).toContain("motion-reduce:transition-none");
});

test("every variant renders; compact drops descriptions and the long step label", () => {
  for (const variant of AGENT_QUESTION_VARIANTS) {
    const view = render(<Questions variant={variant} />);
    expect(view.container.querySelector(`[data-variant=${variant}]`)).toBeTruthy();
    if (variant === "compact") {
      expect(screen.getByText("1 of 3")).toBeTruthy();
      expect(screen.queryByText("Migrations will use the one you pick.")).toBeNull();
    }
    view.unmount();
  }
});

test("parts throw outside the root", () => {
  const spy = console.error;
  console.error = () => {};
  expect(() => render(<AgentQuestionFooter />)).toThrow(
    "AgentQuestionFooter must be used within AgentQuestion",
  );
  console.error = spy;
});
