import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FORM_FIELD_VARIANTS,
  FormField,
  FormFieldCount,
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
  FormFieldTextarea,
} from "@/registry/uai/components/form-field";

test("connects required field, guidance, validation and count", async () => {
  const user = userEvent.setup();
  render(
    <FormField inputId="summary" required invalid maxLength={10}>
      <FormFieldLabel>Summary</FormFieldLabel>
      <FormFieldInput name="summary" />
      <FormFieldDescription>Describe the project.</FormFieldDescription>
      <FormFieldError>Add a summary.</FormFieldError>
      <FormFieldCount />
    </FormField>,
  );
  const input = screen.getByRole("textbox", { name: "Summary (required)" }) as HTMLInputElement;
  expect(input.required).toBe(true);
  expect(input.id).toBe("summary");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(
    input
      .getAttribute("aria-describedby")
      ?.split(" ")
      .map((id) => document.getElementById(id)?.textContent),
  ).toEqual(["Describe the project.", "Add a summary.", "0 / 10 characters"]);
  await user.type(input, "Hello world!");
  expect(input.value).toBe("Hello worl");
  expect(screen.getByText("10 / 10 characters")).toBeDefined();
});
test("supports controlled textarea updates and disabled state", async () => {
  const change = mock(() => {});
  const user = userEvent.setup();
  const view = render(
    <FormField value="A" onValueChange={change}>
      <FormFieldLabel>Notes</FormFieldLabel>
      <FormFieldTextarea />
    </FormField>,
  );
  const input = screen.getByRole("textbox") as HTMLTextAreaElement;
  await user.type(input, "B");
  expect(change).toHaveBeenCalledWith("AB");
  expect(input.value).toBe("A");
  view.rerender(
    <FormField value="Saved" disabled>
      <FormFieldLabel>Notes</FormFieldLabel>
      <FormFieldTextarea />
    </FormField>,
  );
  expect(input.value).toBe("Saved");
  expect(input.disabled).toBe(true);
});
test("ships all field variants and fails clearly outside its root", () => {
  for (const variant of FORM_FIELD_VARIANTS) {
    const view = render(
      <FormField variant={variant}>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldInput />
      </FormField>,
    );
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<FormFieldInput />)).toThrow("within FormField");
});
