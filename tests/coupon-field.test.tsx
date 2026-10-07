import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  COUPON_FIELD_VARIANTS,
  CouponField,
  CouponFieldApply,
  CouponFieldControl,
  CouponFieldFeedback,
  CouponFieldInput,
  CouponFieldLabel,
  CouponFieldMessage,
  CouponFieldRemove,
  type CouponFieldVariant,
} from "@/registry/uai/components/coupon-field";

function CouponFieldFixture({
  status = "idle",
  appliedCode,
  onApply,
  onRemove,
  variant = "rounded",
}: {
  status?: "idle" | "applying" | "applied" | "error";
  appliedCode?: string;
  onApply?: (code: string) => void;
  onRemove?: () => void;
  variant?: CouponFieldVariant;
}) {
  return (
    <CouponField variant={variant} status={status} appliedCode={appliedCode} onApply={onApply}>
      <CouponFieldLabel>Discount code</CouponFieldLabel>
      <CouponFieldControl>
        <CouponFieldInput />
        <CouponFieldApply />
      </CouponFieldControl>
      <CouponFieldFeedback>
        <CouponFieldMessage>
          {status === "error" ? "That code could not be applied." : "20% off this order."}
        </CouponFieldMessage>
        <CouponFieldRemove onClick={onRemove} />
      </CouponFieldFeedback>
    </CouponField>
  );
}

test("applies a trimmed code from the keyboard", async () => {
  const user = userEvent.setup();
  const onApply = mock(() => {});

  render(<CouponFieldFixture onApply={onApply} />);

  const input = screen.getByRole("textbox", { name: "Discount code" });
  await user.type(input, "  SAVE20  {Enter}");

  expect(onApply).toHaveBeenCalledWith("SAVE20");
});

test("labels replacement and clears the draft when removing an applied code", async () => {
  const user = userEvent.setup();
  const onApply = mock(() => {});
  const onRemove = mock(() => {});

  render(
    <CouponFieldFixture
      status="applied"
      appliedCode="WELCOME20"
      onApply={onApply}
      onRemove={onRemove}
    />,
  );

  const input = screen.getByRole("textbox", { name: "Discount code" });
  const applied = screen.getByRole("button", { name: "Applied" }) as HTMLButtonElement;
  expect(applied.disabled).toBe(true);
  expect(applied.className).toContain("bg-success/14");

  await user.clear(input);
  await user.type(input, "SAVE20");
  await user.click(screen.getByRole("button", { name: "Replace" }));

  expect(onApply).toHaveBeenCalledWith("SAVE20");

  await user.click(screen.getByRole("button", { name: "Remove" }));
  expect(onRemove).toHaveBeenCalledTimes(1);
  expect((input as HTMLInputElement).value).toBe("");
});

test("announces errors and disables duplicate work while applying", () => {
  const { rerender } = render(<CouponFieldFixture status="error" />);

  expect(screen.getByRole("alert").textContent).toContain("That code could not be applied.");
  expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");

  rerender(<CouponFieldFixture status="applying" />);

  expect(screen.getByRole("status").textContent).toContain("20% off this order.");
  expect((screen.getByRole("button", { name: "Applying…" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});

test("renders rounded, pill, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<CouponFieldFixture variant="rounded" />);
  const input = screen.getByRole("textbox");
  const apply = screen.getByRole("button", { name: "Apply" });

  expect(COUPON_FIELD_VARIANTS).toEqual(["rounded", "pill", "compact"]);
  expect(container.querySelector('[data-variant="rounded"]')).not.toBeNull();
  expect(input.parentElement?.className).toContain("rounded-[14px]");

  rerender(<CouponFieldFixture variant="pill" />);
  expect(container.querySelector('[data-variant="pill"]')).not.toBeNull();
  expect(input.parentElement?.className).toContain("rounded-full");
  expect(apply.className).toContain("rounded-full");

  rerender(<CouponFieldFixture variant="compact" />);
  expect(container.querySelector('[data-variant="compact"]')).not.toBeNull();
  expect(input.parentElement?.className).toContain("rounded-xl");
  expect(input.className).toContain("h-7");
  expect(apply.className).toContain("h-7");
});

test("compound coupon children require their root", () => {
  expect(() => render(<CouponFieldInput />)).toThrow(
    "CouponFieldInput must be used within CouponField",
  );
});
