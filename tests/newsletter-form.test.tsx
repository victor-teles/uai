import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NEWSLETTER_FORM_VARIANTS,
  NewsletterForm,
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  type NewsletterFormProps,
  NewsletterFormSubmit,
} from "@/registry/uai/components/newsletter-form";

function Fixture({ consent = true, ...props }: NewsletterFormProps & { consent?: boolean }) {
  return (
    <NewsletterForm {...props}>
      <NewsletterFormLabel>Email</NewsletterFormLabel>
      <NewsletterFormField>
        <NewsletterFormInput />
        <NewsletterFormSubmit />
      </NewsletterFormField>
      {consent ? <NewsletterFormConsent>Send me the monthly letter.</NewsletterFormConsent> : null}
      <NewsletterFormMessage>One email a month.</NewsletterFormMessage>
    </NewsletterForm>
  );
}

test("validates the email, then consent, moving focus to the field to fix", async () => {
  const user = userEvent.setup();
  const subscribe = mock(async () => "success" as const);
  render(<Fixture onSubscribe={subscribe} />);
  const input = screen.getByLabelText("Email") as HTMLInputElement;
  expect(input.getAttribute("type")).toBe("email");
  expect(screen.getByRole("status").textContent).toBe("One email a month.");
  await user.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(screen.getByRole("status").textContent).toBe("Enter your email address.");
  expect(document.activeElement).toBe(input);
  await user.type(input, "nope{Enter}");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByRole("status").textContent).toContain("name@example.com");
  await user.clear(input);
  await user.type(input, "ana@example.com{Enter}");
  const checkbox = screen.getByRole("checkbox");
  expect(document.activeElement).toBe(checkbox);
  expect(checkbox.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByRole("status").textContent).toContain("Confirm");
  expect(subscribe).not.toHaveBeenCalled();
});

test("submits, shows pending, then success", async () => {
  const user = userEvent.setup();
  let resolve: (value: "success") => void = () => {};
  const subscribe = mock(
    () =>
      new Promise<"success">((done) => {
        resolve = done;
      }),
  );
  render(<Fixture onSubscribe={subscribe} />);
  await user.type(screen.getByLabelText("Email"), " Ana@Example.com ");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(subscribe).toHaveBeenCalledWith({ email: "Ana@Example.com", consent: true });
  const pending = screen.getByRole("button", { name: "Subscribing…" });
  expect(pending.getAttribute("aria-disabled")).toBe("true");
  await user.click(pending);
  expect(subscribe).toHaveBeenCalledTimes(1);
  resolve("success");
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("subscribed"));
});

test("reports duplicate and failed subscriptions", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture consent={false} onSubscribe={async () => "duplicate" as const} />);
  await user.type(screen.getByLabelText("Email"), "ana@example.com{Enter}");
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("already subscribed"),
  );
  view.unmount();
  render(
    <Fixture
      consent={false}
      onSubscribe={async () => {
        throw new Error("network");
      }}
    />,
  );
  await user.type(screen.getByLabelText("Email"), "ana@example.com{Enter}");
  await waitFor(() => expect(screen.getByRole("status").textContent).toContain("try again"));
});

test("renders every variant and guards compound children", () => {
  for (const variant of NEWSLETTER_FORM_VARIANTS) {
    const view = render(<Fixture variant={variant} onSubscribe={() => undefined} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<NewsletterFormInput />)).toThrow(
    "NewsletterFormInput must be used within NewsletterForm",
  );
});
