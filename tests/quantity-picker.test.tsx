import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  QUANTITY_PICKER_VARIANTS,
  QuantityPicker,
  QuantityPickerControl,
  QuantityPickerDecrease,
  QuantityPickerIncrease,
  QuantityPickerInput,
  QuantityPickerLabel,
  QuantityPickerMessage,
  type QuantityPickerVariant,
} from "@/registry/uai/components/quantity-picker";

function QuantityPickerFixture({
  defaultValue = 2,
  min = 1,
  max = 5,
  onValueChange,
  variant = "rounded",
  disabled = false,
}: {
  defaultValue?: number;
  min?: number;
  max?: number;
  onValueChange?: (value: number) => void;
  variant?: QuantityPickerVariant;
  disabled?: boolean;
}) {
  return (
    <QuantityPicker
      defaultValue={defaultValue}
      min={min}
      max={max}
      onValueChange={onValueChange}
      variant={variant}
      disabled={disabled}
    >
      <QuantityPickerLabel>Quantity for Everyday Tote</QuantityPickerLabel>
      <QuantityPickerControl>
        <QuantityPickerDecrease />
        <QuantityPickerInput />
        <QuantityPickerIncrease />
      </QuantityPickerControl>
      <QuantityPickerMessage>5 available</QuantityPickerMessage>
    </QuantityPicker>
  );
}

test("changes quantity with buttons and stops at the configured limits", async () => {
  const user = userEvent.setup();
  const onValueChange = mock(() => {});

  render(<QuantityPickerFixture defaultValue={2} max={3} onValueChange={onValueChange} />);

  const input = screen.getByRole("spinbutton", { name: "Quantity for Everyday Tote" });
  await user.click(screen.getByRole("button", { name: "Increase quantity" }));

  expect((input as HTMLInputElement).value).toBe("3");
  expect(onValueChange).toHaveBeenLastCalledWith(3);
  expect(
    (screen.getByRole("button", { name: "Increase quantity" }) as HTMLButtonElement).disabled,
  ).toBe(true);

  await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
  expect((input as HTMLInputElement).value).toBe("2");
  expect(onValueChange).toHaveBeenLastCalledWith(2);
});

test("commits direct input on Enter and clamps it to the available range", async () => {
  const user = userEvent.setup();
  const onValueChange = mock(() => {});

  render(<QuantityPickerFixture onValueChange={onValueChange} />);

  const input = screen.getByRole("spinbutton");
  await user.clear(input);
  await user.type(input, "9{Enter}");

  expect(onValueChange).toHaveBeenCalledWith(5);
  expect((input as HTMLInputElement).value).toBe("5");
});

test("restores the current quantity when direct editing is cancelled", async () => {
  const user = userEvent.setup();
  render(<QuantityPickerFixture defaultValue={2} />);

  const input = screen.getByRole("spinbutton");
  await user.clear(input);
  await user.type(input, "4{Escape}");

  expect((input as HTMLInputElement).value).toBe("2");
});

test("associates stock feedback and disables every quantity action", () => {
  render(<QuantityPickerFixture disabled />);

  const input = screen.getByRole("spinbutton");
  const message = screen.getByText("5 available");

  expect(input.getAttribute("aria-describedby")).toBe(message.id);
  expect((input as HTMLInputElement).disabled).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Decrease quantity" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Increase quantity" }) as HTMLButtonElement).disabled,
  ).toBe(true);
});

test("renders rounded, pill, and compact chrome from the root variant", () => {
  const { container, rerender } = render(<QuantityPickerFixture variant="rounded" />);
  const input = screen.getByRole("spinbutton");
  const decrease = screen.getByRole("button", { name: "Decrease quantity" });

  expect(QUANTITY_PICKER_VARIANTS).toEqual(["rounded", "pill", "compact"]);
  expect(container.querySelector('[data-variant="rounded"]')).not.toBeNull();
  expect(input.parentElement?.style.borderRadius).toBe("14px");

  rerender(<QuantityPickerFixture variant="pill" />);
  expect(container.querySelector('[data-variant="pill"]')).not.toBeNull();
  expect(input.parentElement?.style.borderRadius).toBe("999px");
  expect(decrease.style.borderRadius).toBe("999px");

  rerender(<QuantityPickerFixture variant="compact" />);
  expect(container.querySelector('[data-variant="compact"]')).not.toBeNull();
  expect(input.parentElement?.style.borderRadius).toBe("12px");
  expect(input.className).toContain("h-7");
  expect(decrease.className).toContain("size-7");
});

test("compound quantity children require their root", () => {
  expect(() => render(<QuantityPickerInput />)).toThrow(
    "QuantityPickerInput must be used within QuantityPicker",
  );
});
