import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DOCUMENT_FIELD_VARIANTS,
  DocumentField,
  type DocumentFieldAccept,
  DocumentFieldControl,
  DocumentFieldDescription,
  DocumentFieldError,
  DocumentFieldInput,
  DocumentFieldKind,
  DocumentFieldLabel,
  type DocumentFieldVariant,
  formatDocument,
  isValidCnpj,
  isValidCpf,
} from "@/registry/uai/components/document-field";

function Fixture({
  accept = "any",
  variant = "rounded",
  onValueChange,
  invalid,
}: {
  accept?: DocumentFieldAccept;
  variant?: DocumentFieldVariant;
  onValueChange?: (value: string, details: { kind: string; valid: boolean }) => void;
  invalid?: boolean;
}) {
  return (
    <DocumentField
      variant={variant}
      accept={accept}
      onValueChange={onValueChange}
      invalid={invalid}
    >
      <DocumentFieldLabel />
      <DocumentFieldControl>
        <DocumentFieldInput />
        <DocumentFieldKind />
      </DocumentFieldControl>
      <DocumentFieldDescription>Usado na nota fiscal.</DocumentFieldDescription>
      <DocumentFieldError />
    </DocumentField>
  );
}

test("validates CPF and numeric and alphanumeric CNPJ check digits", () => {
  expect(isValidCpf("529.982.247-25")).toBe(true);
  expect(isValidCpf("529.982.247-24")).toBe(false);
  expect(isValidCpf("111.111.111-11")).toBe(false);
  expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true);
  expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false);
  expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
  expect(formatDocument("52998224725", "cpf")).toBe("529.982.247-25");
  expect(formatDocument("12ABC34501DE35", "cnpj")).toBe("12.ABC.345/01DE-35");
});

test("masks as CPF and switches to CNPJ once the number grows", async () => {
  const user = userEvent.setup();
  const onValueChange = mock((_value: string, _details: { kind: string; valid: boolean }) => {});
  render(<Fixture onValueChange={onValueChange} />);

  const input = screen.getByRole("textbox", { name: "CPF ou CNPJ" });
  await user.type(input, "52998224725");
  expect(input).toHaveProperty("value", "529.982.247-25");
  expect(screen.getByText("CPF")).toBeDefined();
  expect(onValueChange).toHaveBeenLastCalledWith("52998224725", {
    kind: "cpf",
    complete: true,
    valid: true,
  });

  await user.clear(input);
  await user.type(input, "12abc34501de35");
  expect(input).toHaveProperty("value", "12.ABC.345/01DE-35");
  expect(screen.getByText("CNPJ")).toBeDefined();
});

test("reports wrong check digits as an alert linked to the input", async () => {
  const user = userEvent.setup();
  render(<Fixture accept="cpf" />);

  const input = screen.getByRole("textbox", { name: "CPF" });
  await user.type(input, "52998224724");
  const alert = screen.getByRole("alert");
  expect(alert.textContent).toBe("CPF inválido. Confira os números.");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toContain(alert.id);
  expect(screen.queryByText("Usado na nota fiscal.")).toBeNull();
});

test("only flags incomplete numbers after blur, and strips letters from CPF", async () => {
  const user = userEvent.setup();
  render(<Fixture accept="cpf" />);

  const input = screen.getByRole("textbox", { name: "CPF" });
  await user.type(input, "529a98");
  expect(input).toHaveProperty("value", "529.98");
  expect(screen.queryByRole("alert")).toBeNull();
  await user.tab();
  expect(screen.getByRole("alert").textContent).toBe("Digite o CPF completo.");
});

test("throws outside the root and ships every variant", () => {
  expect(() => render(<DocumentFieldInput />)).toThrow(
    "DocumentFieldInput must be used within DocumentField",
  );
  for (const variant of DOCUMENT_FIELD_VARIANTS) {
    const view = render(<Fixture variant={variant} invalid />);
    expect(
      view.container.querySelector("[data-slot=document-field]")?.getAttribute("data-variant"),
    ).toBe(variant);
    view.unmount();
  }
});
