import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerAddItem,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/registry/uai/components/prompt-composer";

test("composes a prompt and submits through the root form", async () => {
  const user = userEvent.setup();
  const onSubmit = mock(() => {});

  render(
    <PromptComposer onSubmit={onSubmit}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput placeholder="Ask Uai" />
      <PromptComposerActions>
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>,
  );

  const input = screen.getByPlaceholderText("Ask Uai");
  const submit = screen.getByRole("button", { name: "Send" }) as HTMLButtonElement;

  expect(submit.disabled).toBe(true);
  await user.type(input, "Review the interface");
  expect(submit.disabled).toBe(false);
  await user.keyboard("{Enter}");

  expect(onSubmit).toHaveBeenCalledWith("Review the interface", []);
  expect((input as HTMLTextAreaElement).value).toBe("");
});

test("compound prompt children require their root", () => {
  expect(() => render(<PromptComposerInput />)).toThrow(
    "PromptComposerInput must be used within PromptComposer",
  );
});

test("keeps file attachment and composed add actions behind the root", async () => {
  const user = userEvent.setup();
  const onSelect = mock(() => {});
  const onSubmit = mock(() => {});

  render(
    <PromptComposer onSubmit={onSubmit}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
        <PromptComposerAddItem onSelect={onSelect}>Workspace notes</PromptComposerAddItem>
      </PromptComposerAdd>
      <PromptComposerInput />
      <PromptComposerActions>
        <PromptComposerSubmit disabled={false} />
      </PromptComposerActions>
    </PromptComposer>,
  );

  await user.click(screen.getByRole("button", { name: "Add attachments and sources" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Workspace notes" }));
  expect(onSelect).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole("button", { name: "Add attachments and sources" }));
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["registry"], "registry.txt", { type: "text/plain" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  expect(screen.getByText("registry.txt")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Send" }));
  expect(onSubmit).toHaveBeenCalledWith("", [file]);
});

test("Shift+Enter inserts a line break while busy state blocks submission", async () => {
  const user = userEvent.setup();
  const onSubmit = mock(() => {});

  const { rerender } = render(
    <PromptComposer onSubmit={onSubmit}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput />
      <PromptComposerActions>
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>,
  );

  const input = screen.getByRole("textbox") as HTMLTextAreaElement;
  await user.type(input, "First line{Shift>}{Enter}{/Shift}Second line");
  expect(input.value).toBe("First line\nSecond line");
  expect(onSubmit).not.toHaveBeenCalled();

  rerender(
    <PromptComposer busy onSubmit={onSubmit}>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput />
      <PromptComposerActions>
        <PromptComposerSubmit disabled={false} />
      </PromptComposerActions>
    </PromptComposer>,
  );

  expect(
    (screen.getByRole("button", { name: "Sending prompt" }) as HTMLButtonElement).disabled,
  ).toBe(true);
});

test("model select opens a radio menu and reports the chosen model", async () => {
  const user = userEvent.setup();
  const onValueChange = mock(() => {});

  render(
    <PromptComposer>
      <PromptComposerAdd>
        <PromptComposerFileItem />
      </PromptComposerAdd>
      <PromptComposerInput />
      <PromptComposerActions>
        <PromptComposerModelSelect
          models={[
            { id: "fast", label: "Fast" },
            { id: "deep", label: "Deep" },
          ]}
          onValueChange={onValueChange}
        />
        <PromptComposerSubmit />
      </PromptComposerActions>
    </PromptComposer>,
  );

  await user.click(screen.getByRole("button", { name: "Choose model" }));
  expect(screen.getByRole("menuitemradio", { name: "Fast" }).getAttribute("aria-checked")).toBe(
    "true",
  );
  await user.click(screen.getByRole("menuitemradio", { name: "Deep" }));

  expect(onValueChange).toHaveBeenCalledWith("deep");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(screen.getByRole("button", { name: "Choose model" }).textContent).toContain("Deep");
});
