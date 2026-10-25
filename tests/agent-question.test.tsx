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
  AgentQuestionItemSummary,
  AgentQuestionItems,
  AgentQuestionOption,
  AgentQuestionOptions,
  AgentQuestionOther,
  type AgentQuestionProps,
  AgentQuestionStack,
  type AgentQuestionSubmitMeta,
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
  expect(submit).toHaveBeenCalledWith(
    { database: "postgres", seed: ["users", "orders"] },
    { untouched: [] },
  );

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
  expect(submit).toHaveBeenCalledWith(
    {
      database: "other",
      "database:other": "MySQL",
      seed: ["other"],
      "seed:other": "Two stores",
      auth: "later",
    },
    { untouched: [] },
  );
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

// Stacked layout

function Stacked(props: Partial<AgentQuestionProps>) {
  return (
    <AgentQuestion layout="stacked" {...props}>
      <AgentQuestionHeader />
      <AgentQuestionStack>
        <AgentQuestionItem id="database" label="Database" required>
          <AgentQuestionTitle>Which database should I set up?</AgentQuestionTitle>
          <AgentQuestionDescription>Migrations will use the one you pick.</AgentQuestionDescription>
          <AgentQuestionOptions>
            <AgentQuestionOption value="postgres" label="Postgres" recommended />
            <AgentQuestionOption value="sqlite" label="SQLite" />
            <AgentQuestionOther />
          </AgentQuestionOptions>
        </AgentQuestionItem>
        <AgentQuestionItem id="seed" label="Seed data" type="multiple" required>
          <AgentQuestionTitle>What should the seed data include?</AgentQuestionTitle>
          <AgentQuestionOptions>
            <AgentQuestionOption value="users" label="Demo users" recommended />
            <AgentQuestionOption value="orders" label="Sample orders" />
            <AgentQuestionOther />
          </AgentQuestionOptions>
        </AgentQuestionItem>
        <AgentQuestionItem id="auth" label="Auth">
          <AgentQuestionTitle>Add auth now?</AgentQuestionTitle>
          <AgentQuestionOptions>
            <AgentQuestionOption value="password" label="Email and password" />
            <AgentQuestionOption value="later" label="Not yet" />
          </AgentQuestionOptions>
        </AgentQuestionItem>
      </AgentQuestionStack>
      <AgentQuestionFooter />
      <AgentQuestionSummary time="14:02" />
    </AgentQuestion>
  );
}

const items = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-slot=agent-question-item]"));

test("stacked shows every item in a list inside a form, one active", () => {
  render(<Stacked />);
  expect(screen.getByRole("form")).toBeTruthy();
  expect(screen.getByRole("list")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.getByRole("group", { name: "Which database should I set up?" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Add auth now?" })).toBeTruthy();
  expect(screen.getByText("0 of 3 answered")).toBeTruthy();
  const [first, second] = items();
  expect(first?.getAttribute("aria-current")).toBe("step");
  expect(first?.hasAttribute("data-active")).toBe(true);
  expect(second?.hasAttribute("data-active")).toBe(false);
  expect(screen.getByText("Seed data · choose any")).toBeTruthy();
  expect(screen.getByText("Auth · optional")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Send answers" })).toHaveProperty("disabled", true);
  expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
});

test("stacked number keys answer the active item, advance, then focus Send", async () => {
  const user = userEvent.setup();
  const submit = mock((_a: AgentQuestionAnswers, _m: AgentQuestionSubmitMeta) => {});
  render(<Stacked onSubmit={submit} />);
  screen.getByRole("radio", { name: "Postgres, recommended" }).focus();
  await user.keyboard("1");
  expect(items()[1]?.getAttribute("aria-current")).toBe("step");
  expect(document.activeElement?.textContent).toBe("What should the seed data include?");
  await user.keyboard("1");
  await user.keyboard("2");
  expect(items()[1]?.getAttribute("aria-current")).toBe("step");
  expect(screen.getByText("2 of 3 answered")).toBeTruthy();
  await user.keyboard("{ArrowDown}");
  await user.keyboard("2");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Send answers" }));
  await user.keyboard("{Enter}");
  expect(submit).toHaveBeenCalledWith(
    { database: "postgres", seed: ["users", "orders"], auth: "later" },
    { untouched: [] },
  );
});

test("stacked arrows, J/K, Home and End move between items", async () => {
  const user = userEvent.setup();
  render(<Stacked />);
  screen.getByRole("radio", { name: "Postgres, recommended" }).focus();
  await user.keyboard("{ArrowDown}");
  expect(items()[1]?.getAttribute("aria-current")).toBe("step");
  await user.keyboard("j");
  expect(items()[2]?.getAttribute("aria-current")).toBe("step");
  await user.keyboard("k");
  expect(items()[1]?.getAttribute("aria-current")).toBe("step");
  await user.keyboard("{End}");
  expect(items()[2]?.getAttribute("aria-current")).toBe("step");
  await user.keyboard("{Home}");
  expect(items()[0]?.getAttribute("aria-current")).toBe("step");
  expect(document.activeElement?.textContent).toBe("Which database should I set up?");
});

test("stacked Enter with a required item missing jumps there and announces it", async () => {
  const user = userEvent.setup();
  render(<Stacked defaultActiveItem="auth" />);
  expect(items()[2]?.getAttribute("aria-current")).toBe("step");
  items()[2]?.querySelector<HTMLElement>("[data-slot=agent-question-title]")?.focus();
  await user.keyboard("{Enter}");
  expect(items()[0]?.getAttribute("aria-current")).toBe("step");
  expect(screen.getByText("Which database should I set up?: needs an answer")).toBeTruthy();
});

test("stacked Something else: the number opens the field, Enter saves and moves on, Esc closes", async () => {
  const user = userEvent.setup();
  render(<Stacked />);
  screen.getByRole("radio", { name: "Postgres, recommended" }).focus();
  await user.keyboard("3");
  const first = within(items()[0] as HTMLElement);
  const field = first.getByRole("textbox", { name: "Something else" });
  expect(document.activeElement).toBe(field);
  await user.keyboard("{Escape}");
  expect(screen.getByRole("radio", { name: "Something else" }).getAttribute("aria-checked")).toBe(
    "false",
  );
  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Something else" }));
  await user.keyboard("3");
  await user.type(first.getByRole("textbox", { name: "Something else" }), "MySQL{Enter}");
  expect(items()[1]?.getAttribute("aria-current")).toBe("step");
});

test("pointer and Tab focus make an item active", async () => {
  const user = userEvent.setup();
  const change = mock((_id: string) => {});
  render(<Stacked onActiveItemChange={change} />);
  await user.click(screen.getByRole("radio", { name: "Not yet" }));
  expect(items()[2]?.getAttribute("aria-current")).toBe("step");
  expect(change).toHaveBeenCalledWith("auth");
  expect(items()[2]?.hasAttribute("data-answered")).toBe(true);
});

test("preselectRecommended fills recommendations as untouched until touched", async () => {
  const user = userEvent.setup();
  const submit = mock((_a: AgentQuestionAnswers, _m: AgentQuestionSubmitMeta) => {});
  render(<Stacked preselectRecommended recommendedLabel="Suggested" onSubmit={submit} />);
  const postgres = screen.getByRole("radio", { name: "Postgres, Suggested, preselected" });
  expect(postgres.getAttribute("aria-checked")).toBe("true");
  expect(
    postgres.closest("[data-slot=agent-question-option]")?.hasAttribute("data-untouched"),
  ).toBe(true);
  expect(screen.getAllByText("Suggested").length).toBeGreaterThan(0);
  expect(screen.getByText("2 of 3 ready · 2 untouched")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Send answers" })).toHaveProperty("disabled", false);

  await user.click(screen.getByRole("checkbox", { name: "Sample orders" }));
  expect(screen.getByText("2 of 3 ready · 1 untouched")).toBeTruthy();
  expect(
    screen
      .getByRole("checkbox", { name: "Demo users, suggested" })
      .closest("[data-slot=agent-question-option]")
      ?.hasAttribute("data-untouched"),
  ).toBe(false);

  await user.click(screen.getByRole("button", { name: "Send answers" }));
  expect(submit).toHaveBeenCalledWith(
    { database: "postgres", seed: ["users", "orders"] },
    { untouched: ["database"] },
  );
  await user.click(screen.getByRole("button", { name: "Show answers" }));
  expect(document.querySelector("[data-slot=agent-question-summary]")?.textContent).toContain(
    "Postgres · suggested",
  );
});

test("stacked compact folds inactive items to a summary row that expands on click", async () => {
  const user = userEvent.setup();
  render(<Stacked variant="compact" />);
  expect(screen.getByText("0 of 3")).toBeTruthy();
  expect(screen.getAllByText("Not answered")).toHaveLength(2);
  expect(items()[1]?.hasAttribute("data-folded")).toBe(true);
  expect(screen.getByText("↵")).toBeTruthy();
  const rows = document.querySelectorAll<HTMLElement>("[data-slot=agent-question-item-summary]");
  await user.click(rows[1] as HTMLElement);
  expect(items()[2]?.getAttribute("aria-current")).toBe("step");
  expect(items()[0]?.hasAttribute("data-folded")).toBe(true);
});

test("a custom AgentQuestionItemSummary replaces the built-in row", () => {
  render(
    <AgentQuestion layout="stacked" variant="compact">
      <AgentQuestionItems>
        <AgentQuestionItem id="a">
          <AgentQuestionTitle>First</AgentQuestionTitle>
        </AgentQuestionItem>
        <AgentQuestionItem id="b">
          <AgentQuestionTitle>Second</AgentQuestionTitle>
          <AgentQuestionItemSummary className="custom-row" />
        </AgentQuestionItem>
      </AgentQuestionItems>
    </AgentQuestion>,
  );
  const rows = document.querySelectorAll("[data-slot=agent-question-item-summary]");
  expect(rows).toHaveLength(1);
  expect(rows[0]?.className).toContain("custom-row");
});

test("stacked rejection shows the default error with the answers kept", async () => {
  const user = userEvent.setup();
  let reject: (reason: unknown) => void = () => {};
  const submit = () =>
    new Promise((_, fail) => {
      reject = fail;
    });
  render(<Stacked onSubmit={submit} preselectRecommended />);
  await user.click(screen.getByRole("button", { name: "Send answers" }));
  expect(screen.getByRole("button", { name: "Sending…" })).toHaveProperty("disabled", true);
  await act(async () => reject("nope"));
  expect(screen.getByRole("alert").textContent).toBe(
    "The agent didn’t get your answers. They’re still here.",
  );
  expect(screen.getByRole("button", { name: "Send answers" })).toHaveProperty("disabled", false);
});

test("stepper is the default layout and keeps its markup", () => {
  render(<Questions />);
  expect(document.querySelector("[data-layout=stepper]")).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.getByRole("button", { name: "Continue" })).toBeTruthy();
});

test("stacked root is a real form named by the header; Enter in a field never submits natively", async () => {
  const user = userEvent.setup();
  const submit = mock((_a: AgentQuestionAnswers, _m: AgentQuestionSubmitMeta) => {});
  const { container } = render(<Stacked onSubmit={submit} />);
  const form = screen.getByRole("form", { name: "0 of 3 answered" });
  expect(form.tagName).toBe("FORM");
  expect(form.hasAttribute("role")).toBe(false);
  expect(container.querySelector("section")).toBeNull();
  const first = within(items()[0] as HTMLElement);
  await user.click(first.getByRole("radio", { name: "Something else" }));
  await user.type(first.getByRole("textbox", { name: "Something else" }), "MySQL{Enter}");
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByRole("form")).toBeTruthy();
});

test("the stepper root stays a section with no role", () => {
  const { container } = render(<Questions />);
  const root = container.querySelector("[data-slot=agent-question]");
  expect(root?.tagName).toBe("SECTION");
  expect(root?.hasAttribute("role")).toBe(false);
  expect(screen.queryByRole("form")).toBeNull();
});

test("submitLabel sets the stacked submit text and accessible name", async () => {
  const user = userEvent.setup();
  const submit = mock((_a: AgentQuestionAnswers, _m: AgentQuestionSubmitMeta) => {});
  render(<Stacked preselectRecommended submitLabel="Send to Grillado" onSubmit={submit} />);
  expect(screen.queryByRole("button", { name: "Send answers" })).toBeNull();
  const button = screen.getByRole("button", { name: "Send to Grillado" });
  expect(button.textContent).toBe("Send to Grillado");
  await user.click(button);
  expect(submit).toHaveBeenCalledTimes(1);
});

test("submitLabel defaults to Send answers", () => {
  render(<Stacked />);
  expect(screen.getByRole("button", { name: "Send answers" })).toBeTruthy();
});
