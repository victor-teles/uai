import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusBannerTitle } from "@/components/ui/uai/status-banner";
import {
  CHECKOUT_VARIANTS,
  Checkout,
  CheckoutConfirmation,
  CheckoutConfirmationTitle,
  CheckoutError,
  CheckoutMain,
  CheckoutPayment,
  CheckoutPlaceOrder,
  CheckoutProgress,
  CheckoutProgressStep,
  type CheckoutProps,
  CheckoutSection,
  CheckoutSectionContinue,
  CheckoutSectionEdit,
  CheckoutSectionForm,
  CheckoutSectionHeader,
  CheckoutSectionSummary,
  CheckoutSectionTitle,
  CheckoutTitle,
} from "@/registry/uai/blocks/checkout";

const steps = ["contact", "payment", "review"];

function Fixture(props: Omit<CheckoutProps, "steps">) {
  return (
    <Checkout steps={steps} {...props}>
      <CheckoutTitle>Checkout</CheckoutTitle>
      <CheckoutProgress>
        <CheckoutProgressStep value="contact">Contact</CheckoutProgressStep>
        <CheckoutProgressStep value="payment">Payment</CheckoutProgressStep>
        <CheckoutProgressStep value="review">Review</CheckoutProgressStep>
      </CheckoutProgress>
      <CheckoutMain>
        <CheckoutSection value="contact">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Contact</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionSummary>Contact saved</CheckoutSectionSummary>
          <CheckoutSectionForm>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
            <CheckoutSectionContinue />
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="payment">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Payment</CheckoutSectionTitle>
            <CheckoutSectionEdit />
          </CheckoutSectionHeader>
          <CheckoutSectionForm>
            <CheckoutPayment>Provider fields</CheckoutPayment>
            <CheckoutSectionContinue />
          </CheckoutSectionForm>
        </CheckoutSection>
        <CheckoutSection value="review">
          <CheckoutSectionHeader>
            <CheckoutSectionTitle>Review</CheckoutSectionTitle>
          </CheckoutSectionHeader>
          <CheckoutSectionForm>
            <CheckoutError>
              <StatusBannerTitle>Card declined</StatusBannerTitle>
            </CheckoutError>
            <CheckoutPlaceOrder />
          </CheckoutSectionForm>
        </CheckoutSection>
      </CheckoutMain>
      <CheckoutConfirmation>
        <CheckoutConfirmationTitle>Order confirmed</CheckoutConfirmationTitle>
      </CheckoutConfirmation>
    </Checkout>
  );
}

test("validates each step, advances with focus, and lets completed steps be edited", async () => {
  const user = userEvent.setup();
  const onStepComplete = mock();
  const onStepChange = mock();
  render(<Fixture onStepComplete={onStepComplete} onStepChange={onStepChange} />);
  expect(screen.getByRole("region", { name: "Checkout" })).toBeTruthy();
  const progress = screen.getByRole("list", { name: "Checkout progress" });
  expect(progress.querySelector("[aria-current=step]")?.textContent).toContain("Contact");
  expect(screen.queryByRole("group", { name: "Payment details" })).toBeNull();
  await user.type(screen.getByLabelText("Email"), "rosa@example.com");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(onStepComplete).toHaveBeenCalledTimes(1);
  expect(onStepComplete.mock.calls[0]?.[0]).toBe("contact");
  expect((onStepComplete.mock.calls[0]?.[1] as FormData | undefined)?.get("email")).toBe(
    "rosa@example.com",
  );
  expect(onStepChange).toHaveBeenCalledWith("payment");
  expect(document.activeElement?.textContent).toBe("Payment");
  expect(screen.getByRole("group", { name: "Payment details" })).toBeTruthy();
  expect(screen.getByText("Contact saved")).toBeTruthy();
  expect(screen.getByRole("heading", { name: /^Contact/ }).textContent).toBe("Contact, complete");
  await user.click(screen.getByRole("button", { name: "Edit" }));
  expect(document.activeElement?.textContent).toBe("Contact");
  expect(screen.getByLabelText("Email")).toBeTruthy();
});

test("shows an error when placing fails, then confirms and focuses the confirmation", async () => {
  const user = userEvent.setup();
  let attempts = 0;
  const onPlaceOrder = mock(async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("declined");
  });
  render(<Fixture defaultStep="review" onPlaceOrder={onPlaceOrder} />);
  await user.click(screen.getByRole("button", { name: "Place order" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Card declined"));
  await user.click(screen.getByRole("button", { name: "Place order" }));
  await waitFor(() => expect(screen.getByText("Order confirmed")).toBeTruthy());
  expect(document.activeElement?.textContent).toBe("Order confirmed");
  expect(screen.queryByRole("button", { name: "Place order" })).toBeNull();
  expect(onPlaceOrder).toHaveBeenCalledTimes(2);
});

test("renders every variant and guards regions", () => {
  for (const variant of CHECKOUT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CheckoutMain />)).toThrow("CheckoutMain must be used within Checkout");
  expect(() =>
    render(
      <Checkout steps={steps}>
        <CheckoutSectionForm />
      </Checkout>,
    ),
  ).toThrow("CheckoutSectionForm must be used within CheckoutSection");
});
