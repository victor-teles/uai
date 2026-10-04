import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  INSTALLMENT_PICKER_VARIANTS,
  InstallmentPicker,
  InstallmentPickerAmount,
  InstallmentPickerCount,
  InstallmentPickerLegend,
  InstallmentPickerOption,
  InstallmentPickerOptions,
  InstallmentPickerTerms,
  type InstallmentPickerVariant,
} from "@/registry/uai/components/installment-picker";

function Fixture({
  variant = "list",
  onValueChange,
}: {
  variant?: InstallmentPickerVariant;
  onValueChange?: (value: string) => void;
}) {
  return (
    <form aria-label="Pagamento">
      <InstallmentPicker
        variant={variant}
        name="parcelas"
        defaultValue="1"
        onValueChange={onValueChange}
      >
        <InstallmentPickerLegend />
        <InstallmentPickerOptions>
          <InstallmentPickerOption value="1">
            <InstallmentPickerCount>1x</InstallmentPickerCount>
            <InstallmentPickerAmount>R$ 1.299,00</InstallmentPickerAmount>
            <InstallmentPickerTerms interestFree>sem juros</InstallmentPickerTerms>
          </InstallmentPickerOption>
          <InstallmentPickerOption value="3">
            <InstallmentPickerCount>3x</InstallmentPickerCount>
            <InstallmentPickerAmount>R$ 433,00</InstallmentPickerAmount>
            <InstallmentPickerTerms interestFree>sem juros</InstallmentPickerTerms>
          </InstallmentPickerOption>
          <InstallmentPickerOption value="12" disabled>
            <InstallmentPickerCount>12x</InstallmentPickerCount>
            <InstallmentPickerAmount>R$ 122,75</InstallmentPickerAmount>
            <InstallmentPickerTerms>total R$ 1.473,00</InstallmentPickerTerms>
          </InstallmentPickerOption>
        </InstallmentPickerOptions>
      </InstallmentPicker>
    </form>
  );
}

test("groups radios under a legend and reports the selection", async () => {
  const user = userEvent.setup();
  const onValueChange = mock((_value: string) => {});
  render(<Fixture onValueChange={onValueChange} />);

  expect(screen.getByRole("group", { name: "Parcelamento" })).toBeDefined();
  const radios = screen.getAllByRole("radio");
  expect(radios).toHaveLength(3);
  expect(radios[0]?.getAttribute("aria-checked")).toBe("true");
  expect(radios[2]).toHaveProperty("disabled", true);

  await user.click(screen.getByText("R$ 433,00"));
  expect(onValueChange).toHaveBeenCalledWith("3");
  expect(radios[1]?.getAttribute("aria-checked")).toBe("true");
  expect(radios[1]?.closest("label")?.getAttribute("data-state")).toBe("checked");
  const form = screen.getByRole("form", { name: "Pagamento" }) as HTMLFormElement;
  expect(new FormData(form).get("parcelas")).toBe("3");

  radios[1]?.focus();
  // Radix moves focus on a timer and selects only while the key is still down.
  await user.keyboard("{ArrowUp>}");
  await new Promise((resolve) => setTimeout(resolve, 0));
  await user.keyboard("{/ArrowUp}");
  expect(onValueChange).toHaveBeenLastCalledWith("1");
});

test("names each option with its visible text", () => {
  render(<Fixture />);
  expect(screen.getByRole("radio", { name: "3x R$ 433,00 sem juros" })).toBeDefined();
});

test("throws outside the root and ships every variant", () => {
  expect(() => render(<InstallmentPickerOption value="1" />)).toThrow(
    "InstallmentPickerOption must be used within InstallmentPicker",
  );
  for (const variant of INSTALLMENT_PICKER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(
      view.container.querySelector("[data-slot=installment-picker]")?.getAttribute("data-variant"),
    ).toBe(variant);
    view.unmount();
  }
});
