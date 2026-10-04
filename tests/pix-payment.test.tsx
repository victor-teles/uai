import { expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  formatBrl,
  PIX_PAYMENT_VARIANTS,
  PixPayment,
  PixPaymentAmount,
  PixPaymentCode,
  PixPaymentCountdown,
  PixPaymentQrCode,
  type PixPaymentStatus,
  PixPaymentStatusBadge,
  type PixPaymentVariant,
} from "@/registry/uai/components/pix-payment";

const code = "00020126580014br.gov.bcb.pix0136example5204000053039865406289.905802BR6304ABCD";

function Fixture({
  status = "pending",
  variant = "card",
  expiresAt = "2026-10-03T14:15:00-03:00",
  onExpire,
  onCodeCopy,
}: {
  status?: PixPaymentStatus;
  variant?: PixPaymentVariant;
  expiresAt?: string;
  onExpire?: () => void;
  onCodeCopy?: (code: string) => void;
}) {
  return (
    <PixPayment
      variant={variant}
      status={status}
      code={code}
      now="2026-10-03T14:00:00-03:00"
      expiresAt={expiresAt}
      onExpire={onExpire}
      onCodeCopy={onCodeCopy}
      aria-label="Pagamento"
    >
      <PixPaymentAmount value={289.9} />
      <PixPaymentStatusBadge />
      <PixPaymentQrCode>
        {/* biome-ignore lint/performance/noImgElement: test fixture */}
        <img src="/qr.svg" alt="QR Code Pix" />
      </PixPaymentQrCode>
      <PixPaymentCode />
      <PixPaymentCountdown />
    </PixPayment>
  );
}

test("formats the amount and countdown from a fixed clock", () => {
  render(<Fixture />);
  expect(formatBrl(289.9).replace(/\s/g, " ")).toBe("R$ 289,90");
  expect(screen.getByText(/289,90/)).toBeDefined();
  expect(screen.getByText("15:00").tagName).toBe("TIME");
  const badge = screen.getByText("Aguardando pagamento");
  expect(badge.getAttribute("role")).toBe("status");
  expect(badge.getAttribute("aria-live")).toBe("polite");
});

test("copies the code and announces it", async () => {
  const user = userEvent.setup();
  const onCodeCopy = mock((_code: string) => {});
  const writeText = mock(async (_text: string) => {});
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(<Fixture onCodeCopy={onCodeCopy} />);

  expect(screen.getByRole("group", { name: "Pix copia e cola" })).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Copiar código" }));
  expect(writeText).toHaveBeenCalledWith(code);
  expect(onCodeCopy).toHaveBeenCalledWith(code);
  expect(screen.getByRole("button", { name: "Copiado" })).toBeDefined();
  expect(screen.getByText("Código Pix copiado")).toBeDefined();
});

test("calls onExpire when the countdown reaches zero", () => {
  const onExpire = mock(() => {});
  render(<Fixture expiresAt="2026-10-03T13:59:00-03:00" onExpire={onExpire} />);
  expect(onExpire).toHaveBeenCalledTimes(1);
  expect(screen.getByText("O prazo para pagar terminou.")).toBeDefined();
});

test("hides the QR from assistive technology once paid or expired", async () => {
  const view = render(<Fixture status="paid" />);
  expect(screen.queryByRole("img", { name: "QR Code Pix" })).toBeNull();
  expect(screen.getByText("Pago")).toBeDefined();
  expect(screen.getByText("Pagamento confirmado")).toBeDefined();
  expect(screen.queryByText(/Expira em/)).toBeNull();
  expect(screen.getByRole("button", { name: "Copiar código" })).toHaveProperty("disabled", true);
  await act(async () => view.rerender(<Fixture status="expired" />));
  expect(screen.getByText("QR Code expirado")).toBeDefined();
  view.unmount();
});

test("throws outside the root and ships every variant", () => {
  expect(() => render(<PixPaymentCode />)).toThrow("PixPaymentCode must be used within PixPayment");
  for (const variant of PIX_PAYMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(
      view.container.querySelector("[data-slot=pix-payment]")?.getAttribute("data-variant"),
    ).toBe(variant);
    view.unmount();
  }
});
