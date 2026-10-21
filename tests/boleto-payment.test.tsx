import { expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  BOLETO_PAYMENT_VARIANTS,
  BoletoPayment,
  BoletoPaymentAmount,
  BoletoPaymentBarcode,
  BoletoPaymentDetails,
  BoletoPaymentDigitableLine,
  BoletoPaymentMethods,
  BoletoPaymentPanel,
  BoletoPaymentPanels,
  BoletoPaymentPix,
  type BoletoPaymentStatus,
  BoletoPaymentStatusBadge,
  BoletoPaymentTitle,
  type BoletoPaymentVariant,
  boletoBarcodeBars,
  boletoBarcodeFromLine,
  boletoLineFromBarcode,
  boletoLineGroups,
  formatBrl,
  isValidBoletoLine,
} from "@/registry/uai/components/boleto-payment";

const barcode = "99993160900000459900000901234567890123456781";
const line = "99990.00095 01234.567897 01234.567814 3 16090000045990";
const digits = line.replace(/\D/g, "");

function Fixture({
  status = "pending",
  variant = "card",
  now = "2026-10-18T10:00:00-03:00",
  pixCode,
  payableAfterDue,
  onCopy,
}: {
  status?: BoletoPaymentStatus;
  variant?: BoletoPaymentVariant;
  now?: string;
  pixCode?: string;
  payableAfterDue?: boolean;
  onCopy?: (text: string, kind: string) => void;
}) {
  return (
    <BoletoPayment
      variant={variant}
      status={status}
      digitableLine={line}
      dueDate="2026-10-24"
      now={now}
      paidAt="2026-10-22"
      pixCode={pixCode}
      payableAfterDue={payableAfterDue}
      onCopy={onCopy}
    >
      <BoletoPaymentTitle>Pedido #4821</BoletoPaymentTitle>
      <BoletoPaymentAmount value={459.9} />
      <BoletoPaymentStatusBadge />
      <BoletoPaymentMethods />
      <BoletoPaymentPanels>
        <BoletoPaymentPanel value="boleto">
          <BoletoPaymentBarcode />
          <BoletoPaymentDigitableLine />
        </BoletoPaymentPanel>
        <BoletoPaymentPanel value="pix">
          <BoletoPaymentPix>
            {/* biome-ignore lint/performance/noImgElement: test fixture */}
            <img src="/qr.svg" alt="QR Code Pix" />
          </BoletoPaymentPix>
        </BoletoPaymentPanel>
      </BoletoPaymentPanels>
      <BoletoPaymentDetails beneficiary="Casa Aroeira Ltda" />
    </BoletoPayment>
  );
}

/** Bar widths from the Designer's reference encoder (mockups/itf.js) for the sample barcode. */
const REFERENCE_BARS =
  "111313113131331111331113131113311133111313131311133111331113311133113113113131331131131113311311311313133113113131";

test("round-trips the sample line and barcode and validates the check digits", () => {
  expect(boletoBarcodeFromLine(line)).toBe(barcode);
  expect(boletoLineFromBarcode(barcode)).toBe(digits);
  expect(isValidBoletoLine(line)).toBe(true);
  expect(isValidBoletoLine(line.replace("567897", "567898"))).toBe(false);
  expect(boletoLineGroups(digits)).toEqual([
    "99990.00095",
    "01234.567897",
    "01234.567814",
    "3",
    "16090000045990",
  ]);
  expect(formatBrl(459.9).replace(/\s/g, " ")).toBe("R$ 459,90");
});

test("draws the same ITF-25 bars as the reference encoder", () => {
  const { bars, width } = boletoBarcodeBars(barcode);
  expect(bars.map((bar) => bar.width).join("")).toBe(REFERENCE_BARS);
  expect(width).toBe(405);
  const view = render(<Fixture />);
  const rects = view.container.querySelectorAll("[data-slot=boleto-payment-barcode] rect");
  expect(Array.from(rects, (rect) => rect.getAttribute("width")).join("")).toBe(REFERENCE_BARS);
  expect(
    view.container
      .querySelector("[data-slot=boleto-payment-barcode] > div")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  view.unmount();
});

test("names the section, speaks the digits in blocks of five, and breaks after group three", () => {
  const view = render(<Fixture />);
  expect(screen.getByRole("region", { name: /Pedido #4821.*459,90/ })).toBeDefined();
  const group = screen.getByRole("group", { name: "Linha digitável" });
  expect(group.textContent).toContain(digits.match(/.{1,5}/g)?.join(" ") ?? "");
  const code = group.querySelector("code");
  expect(code?.getAttribute("aria-hidden")).toBe("true");
  const children = Array.from(code?.children ?? []).flatMap((child) => Array.from(child.children));
  expect(children.map((child) => child.textContent)).toEqual([
    "99990.00095",
    "01234.567897",
    "01234.567814",
    "",
    "3",
    "16090000045990",
  ]);
  expect(children[3]?.className).toContain("basis-full");
  for (const variant of BOLETO_PAYMENT_VARIANTS) {
    view.rerender(<Fixture variant={variant} />);
    expect(view.container.querySelector("code .basis-full")).not.toBeNull();
  }
  view.unmount();
});

test("copies the digits without punctuation, flashes, announces, and restores after 2s", async () => {
  const user = userEvent.setup();
  const writeText = mock(async (_text: string) => {});
  const onCopy = mock((_text: string, _kind: string) => {});
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  const view = render(<Fixture onCopy={onCopy} />);

  await user.click(screen.getByRole("button", { name: "Copiar código" }));
  expect(writeText).toHaveBeenCalledWith(digits);
  expect(onCopy).toHaveBeenCalledWith(digits, "boleto");
  expect(screen.getByRole("button", { name: "Copiado" })).toBeDefined();
  expect(screen.getByText("Linha digitável copiada")).toBeDefined();
  const groups = view.container.querySelectorAll("code > span > span:not(.basis-full)");
  expect(groups).toHaveLength(5);
  for (const span of groups) expect(span.className).toContain("motion-safe:bg-success/14");

  await act(async () => new Promise((resolve) => setTimeout(resolve, 2100)));
  expect(screen.getByRole("button", { name: "Copiar código" })).toBeDefined();
  expect(view.container.querySelector("code .motion-safe\\:bg-success\\/14")).toBeNull();
  view.unmount();
});

test("shows the hint when the clipboard rejects", async () => {
  const user = userEvent.setup();
  const writeText = mock(async (_text: string) => {
    throw new Error("denied");
  });
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Copiar código" }));
  expect(screen.getByText("Selecione e copie o código")).toBeDefined();
  expect(screen.getByText("Não foi possível copiar a linha digitável")).toBeDefined();
});

test("derives due today and overdue from the due date and now", () => {
  const view = render(<Fixture />);
  expect(screen.getByText("Aguardando pagamento")).toBeDefined();
  expect(screen.getByText(/em 6 dias/)).toBeDefined();

  view.rerender(<Fixture now="2026-10-23T23:30:00-03:00" />);
  expect(screen.getByText(/amanhã/)).toBeDefined();

  view.rerender(<Fixture now="2026-10-24T08:00:00-03:00" />);
  expect(screen.getByText("Vence hoje")).toBeDefined();
  expect(screen.getByText("Hoje, 24/10/2026").className).toContain("text-warning-ink");

  view.rerender(<Fixture now="2026-10-25T08:00:00-03:00" />);
  expect(screen.getByText("Vencido")).toBeDefined();
  expect(screen.getByRole("button", { name: "Copiar código" })).toHaveProperty("disabled", false);

  view.rerender(<Fixture now="2026-10-25T08:00:00-03:00" payableAfterDue={false} />);
  expect(screen.getByRole("button", { name: "Copiar código" })).toHaveProperty("disabled", true);
  view.unmount();
});

test("blurs the barcode, strikes the digits, and disables copy once paid or cancelled", () => {
  const view = render(<Fixture status="paid" />);
  expect(screen.getByText("Pago em 22/10/2026")).toBeDefined();
  expect(screen.getByRole("button", { name: "Copiar código" })).toHaveProperty("disabled", true);
  expect(view.container.querySelector("code")?.className).toContain("line-through");
  expect(view.container.querySelector(".blur-\\[2px\\]")).not.toBeNull();
  view.rerender(<Fixture status="cancelled" />);
  expect(screen.getByText("Boleto cancelado")).toBeDefined();
  expect(screen.getByText("Cancelado").closest("[role=status]")).not.toBeNull();
  view.unmount();
});

test("renders the Pix tab only with pixCode and switches with arrow keys", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture />);
  expect(screen.queryByRole("radiogroup")).toBeNull();
  expect(view.container.querySelector("[data-slot=boleto-payment-pix]")).toBeNull();

  view.rerender(<Fixture pixCode="000201PIXCODE" />);
  const group = screen.getByRole("radiogroup", { name: "Forma de pagamento" });
  const boleto = screen.getByRole("radio", { name: "Boleto" });
  expect(boleto.getAttribute("aria-checked")).toBe("true");
  expect(group).toBeDefined();
  const pixPanel = view.container.querySelector("[data-slot=boleto-payment-panel][data-value=pix]");
  expect(pixPanel?.getAttribute("aria-hidden")).toBe("true");
  expect(pixPanel?.className).toContain("grid-rows-[0fr]");

  boleto.focus();
  await user.keyboard("{ArrowRight}");
  const pix = screen.getByRole("radio", { name: "Pix" });
  expect(pix.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(pix);
  expect(pixPanel?.className).toContain("grid-rows-[1fr]");
  expect(screen.getByRole("button", { name: "Copiar Pix" })).toBeDefined();
  view.unmount();
});

test("keeps reduced motion free of the flash and transforms", () => {
  const view = render(<Fixture pixCode="000201PIXCODE" />);
  const html = view.container.innerHTML;
  expect(html).toContain("motion-reduce:transition-none");
  expect(html).not.toMatch(/(?<!motion-safe:)bg-success\/14/);
  view.unmount();
});

test("throws outside the root and ships every variant", () => {
  expect(() => render(<BoletoPaymentDigitableLine />)).toThrow(
    "BoletoPaymentDigitableLine must be used within BoletoPayment",
  );
  for (const variant of BOLETO_PAYMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    const root = view.container.querySelector("[data-slot=boleto-payment]");
    expect(root?.getAttribute("data-variant")).toBe(variant);
    expect(Boolean(view.container.querySelector("[data-slot=boleto-payment-barcode]"))).toBe(
      variant !== "compact",
    );
    view.unmount();
  }
});
