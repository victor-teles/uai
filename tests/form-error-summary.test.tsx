import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FORM_ERROR_SUMMARY_VARIANTS,
  FormErrorSummary,
  FormErrorSummaryLink,
  FormErrorSummaryList,
  FormErrorSummaryTitle,
} from "@/registry/uai/components/form-error-summary";

test("focuses matching fields and preserves fragment links", async () => {
  const user = userEvent.setup();
  render(
    <>
      <FormErrorSummary>
        <FormErrorSummaryTitle>Fix errors</FormErrorSummaryTitle>
        <FormErrorSummaryList>
          <FormErrorSummaryLink fieldId="contact:email">Email is required</FormErrorSummaryLink>
        </FormErrorSummaryList>
      </FormErrorSummary>
      <input id="contact:email" aria-label="Email" />
    </>,
  );
  const link = screen.getByRole("link");
  expect(link.getAttribute("href")).toBe("#contact%3Aemail");
  await user.click(link);
  expect(document.activeElement).toBe(screen.getByRole("textbox"));
  expect(screen.getByRole("alert").getAttribute("aria-labelledby")).toBe(
    screen.getByRole("heading").id,
  );
});
test("optionally focuses the summary and honors cancelled link actions", async () => {
  const user = userEvent.setup();
  const click = mock((event: React.MouseEvent) => event.preventDefault());
  render(
    <>
      <FormErrorSummary focusOnMount>
        <FormErrorSummaryTitle />
        <FormErrorSummaryList>
          <FormErrorSummaryLink fieldId="name" onClick={click}>
            Name required
          </FormErrorSummaryLink>
        </FormErrorSummaryList>
      </FormErrorSummary>
      <input id="name" />
    </>,
  );
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  await user.click(screen.getByRole("link"));
  expect(click).toHaveBeenCalled();
  expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
});
test("renders all summary variants and guards the title", () => {
  for (const variant of FORM_ERROR_SUMMARY_VARIANTS) {
    const view = render(
      <FormErrorSummary variant={variant}>
        <FormErrorSummaryTitle />
      </FormErrorSummary>,
    );
    expect(screen.getByRole("alert").getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<FormErrorSummaryTitle />)).toThrow("within FormErrorSummary");
});

test("preserves the leading error rule when switching between plain and card", () => {
  const view = render(
    <FormErrorSummary>
      <FormErrorSummaryTitle />
    </FormErrorSummary>,
  );
  const summary = screen.getByRole("alert");
  view.rerender(
    <FormErrorSummary variant="plain">
      <FormErrorSummaryTitle />
    </FormErrorSummary>,
  );
  expect(summary.getAttribute("data-variant")).toBe("plain");
  expect(summary.className).toContain("border-l-3");
  expect(summary.className).toContain("border-0");
  view.rerender(
    <FormErrorSummary variant="card">
      <FormErrorSummaryTitle />
    </FormErrorSummary>,
  );
  expect(summary.className).toContain("border-l-3");
  expect(summary.className).not.toContain("border-0");
  expect(summary.className.split(" ")).toContain("border");
});
