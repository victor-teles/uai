import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  CEP_FIELD_VARIANTS,
  CepField,
  CepFieldAddress,
  CepFieldControl,
  CepFieldInput,
  CepFieldLabel,
  CepFieldLookup,
  CepFieldMessage,
  type CepFieldStatus,
  type CepFieldVariant,
  formatCep,
} from "@/registry/uai/components/cep-field";

function Fixture({
  status = "idle",
  variant = "rounded",
  onLookup,
}: {
  status?: CepFieldStatus;
  variant?: CepFieldVariant;
  onLookup?: (cep: string) => void;
}) {
  return (
    <CepField variant={variant} status={status} onLookup={onLookup}>
      <CepFieldLabel />
      <CepFieldControl>
        <CepFieldInput />
        <CepFieldLookup />
      </CepFieldControl>
      <CepFieldMessage />
      <CepFieldAddress>
        <span>Avenida Paulista</span>
        <span>Bela Vista, São Paulo – SP</span>
      </CepFieldAddress>
    </CepField>
  );
}

test("masks the CEP and looks it up once when complete", async () => {
  const user = userEvent.setup();
  const onLookup = mock((_cep: string) => {});
  render(<Fixture onLookup={onLookup} />);

  const input = screen.getByRole("textbox", { name: "CEP" });
  const button = screen.getByRole("button", { name: "Buscar" });
  expect(button).toHaveProperty("disabled", true);
  await user.type(input, "01310a1009");
  expect(input).toHaveProperty("value", "01310-100");
  expect(onLookup).toHaveBeenCalledTimes(1);
  expect(onLookup).toHaveBeenCalledWith("01310100");

  await user.type(input, "{Enter}");
  await user.click(button);
  expect(onLookup).toHaveBeenCalledTimes(3);
  expect(formatCep("2004000")).toBe("20040-00");
});

test("speaks lookup states and shows the address only when found", () => {
  const view = render(<Fixture status="loading" />);
  expect(screen.getByRole("status").textContent).toBe("Buscando endereço…");
  expect(screen.queryByText("Avenida Paulista")).toBeNull();
  view.rerender(<Fixture status="not-found" />);
  expect(screen.getByRole("status").textContent).toContain("Não encontramos esse CEP");
  expect(screen.getByRole("textbox", { name: "CEP" }).getAttribute("aria-invalid")).toBe("true");
  view.rerender(<Fixture status="found" />);
  expect(screen.getByText("Avenida Paulista").closest("address")).not.toBeNull();
  view.unmount();
});

test("throws outside the root and ships every variant", () => {
  expect(() => render(<CepFieldInput />)).toThrow("CepFieldInput must be used within CepField");
  for (const variant of CEP_FIELD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(
      view.container.querySelector("[data-slot=cep-field]")?.getAttribute("data-variant"),
    ).toBe(variant);
    view.unmount();
  }
});
