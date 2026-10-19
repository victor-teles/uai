import { afterEach, expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import {
  formatBrl,
  PIX_AUTOMATICO_STATUSES,
  PixAutomatico,
  PixAutomaticoActive,
  PixAutomaticoAmount,
  PixAutomaticoAppPending,
  PixAutomaticoAuthorize,
  PixAutomaticoHeader,
  PixAutomaticoMethod,
  PixAutomaticoNotice,
  PixAutomaticoOutcome,
  type PixAutomaticoProps,
  PixAutomaticoQrCode,
  PixAutomaticoReview,
  PixAutomaticoSchedule,
  PixAutomaticoStatusBadge,
  PixAutomaticoTerm,
  PixAutomaticoTerms,
  PixAutomaticoTitle,
} from "@/registry/uai/components/pix-automatico";

const charges = [
  { date: "2026-11-05", amount: 89.9 },
  { date: "2026-12-05", amount: 89.9 },
];

function Card(props: Partial<PixAutomaticoProps> & { children?: ReactNode }) {
  return (
    <PixAutomatico code="000201PIX" {...props}>
      <PixAutomaticoHeader>
        <PixAutomaticoTitle product="Clube do Café" recipient="Casa Aroeira" />
        <PixAutomaticoStatusBadge />
      </PixAutomaticoHeader>
      <PixAutomaticoReview>
        <PixAutomaticoAmount value={89.9} period="month" />
        <PixAutomaticoTerms>
          <PixAutomaticoTerm label="Recebedor" detail="CNPJ 12.345.678/0001-95">
            Casa Aroeira Ltda
          </PixAutomaticoTerm>
        </PixAutomaticoTerms>
        <PixAutomaticoNotice />
        <PixAutomaticoMethod />
        <PixAutomaticoAuthorize />
      </PixAutomaticoReview>
      <PixAutomaticoQrCode src="/qr.svg" />
      <PixAutomaticoAppPending />
      <PixAutomaticoActive>R$ 89,90 por mês, a partir de 05/11.</PixAutomaticoActive>
      <PixAutomaticoSchedule charges={charges} />
      <PixAutomaticoOutcome />
    </PixAutomatico>
  );
}

afterEach(() => {
  mock.restore();
});

test("formats amounts with formatBrl", () => {
  expect(formatBrl(89.9).replace(/\s/g, " ")).toBe("R$ 89,90");
});

test("review shows terms, the notice, and no input for the maximum amount", () => {
  const { container } = render(<Card />);
  expect(screen.getByRole("region", { name: "Clube do Café" })).toBeTruthy();
  expect(container.querySelector("dl")).toBeTruthy();
  expect(screen.getByText("CNPJ 12.345.678/0001-95")).toBeTruthy();
  expect(screen.getByText(/pode definir um valor máximo por cobrança/)).toBeTruthy();
  expect(container.querySelector("input")).toBeNull();
  expect(screen.getByText("por mês")).toBeTruthy();
});

test("method switches with the keyboard and onAuthorize receives it", async () => {
  const user = userEvent.setup();
  const authorize = mock((_payload: { method: string }) => {});
  render(<Card onAuthorize={authorize} />);
  const group = screen.getByRole("radiogroup", { name: "Como você quer autorizar?" });
  const qr = screen.getByRole("radio", { name: "QR Code" });
  expect(qr.getAttribute("aria-checked")).toBe("true");
  qr.focus();
  await user.keyboard("{ArrowRight}");
  const app = screen.getByRole("radio", { name: "No app do banco" });
  expect(app.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(app);
  expect(group).toBeTruthy();
  expect(screen.getByRole("button", { name: "Autorizar Pix Automático" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Autorizar Pix Automático" }));
  expect(authorize).toHaveBeenCalledWith({ method: "app" });
});

test("all seven states render with their badge and body", () => {
  const expected: Record<string, string> = {
    review: "Autorizar Pix Automático",
    awaiting: "Abra o app do seu banco e escolha ler QR Code.",
    active: "Pix Automático autorizado",
    declined: "A autorização foi recusada no app do banco. Nenhuma cobrança foi feita.",
    expired: "O pedido expirou antes da confirmação.",
    cancelled: "Você cancelou o Pix Automático no seu banco. Nenhuma nova cobrança será feita.",
  };
  for (const status of PIX_AUTOMATICO_STATUSES) {
    const view = render(<Card status={status} onRetry={() => {}} onOtherMethod={() => {}} />);
    const badge = view.container.querySelector("[data-slot=pix-automatico-status-badge]");
    expect(badge?.getAttribute("role")).toBe("status");
    expect(screen.getAllByText(expected[status] as string).length).toBeGreaterThan(0);
    view.unmount();
  }
  const app = render(<Card status="awaiting" defaultMethod="app" />);
  expect(screen.getAllByText("Aguardando confirmação no banco").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "Usar QR Code" })).toBeTruthy();
  app.unmount();
});

test("declined offers Tentar de novo and Outra forma de pagamento; expired offers Gerar novo pedido", async () => {
  const user = userEvent.setup();
  const retry = mock(() => {});
  const other = mock(() => {});
  const view = render(<Card status="declined" onRetry={retry} onOtherMethod={other} />);
  await user.click(screen.getByRole("button", { name: "Tentar de novo" }));
  await user.click(screen.getByRole("button", { name: "Outra forma de pagamento" }));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(other).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Autorização recusada")).toBeTruthy();
  view.rerender(<Card status="expired" onRetry={retry} />);
  expect(screen.getByRole("button", { name: "Gerar novo pedido" })).toBeTruthy();
});

test("the schedule is an ordered list read with full dates", () => {
  render(<Card status="active" />);
  const list = screen.getByRole("list", { name: "Próximas cobranças" });
  expect(list.tagName).toBe("OL");
  expect(screen.getByText(/5 de novembro, R\$\s89,90, próxima/)).toBeTruthy();
  expect(screen.getByText("Próxima")).toBeTruthy();
  expect(screen.getByText("05 nov")).toBeTruthy();
});

test("countdown follows now, warns once in the last minute, and onExpire fires once", () => {
  const realNow = Date.now;
  let clock = new Date("2026-10-19T14:00:00-03:00").getTime();
  Date.now = () => clock;
  const intervals: Array<() => void> = [];
  const realSetInterval = window.setInterval;
  window.setInterval = ((fn: () => void) => {
    intervals.push(fn);
    return intervals.length;
  }) as typeof window.setInterval;
  const expire = mock(() => {});
  try {
    const { container } = render(
      <Card
        status="awaiting"
        now="2026-10-19T14:00:00-03:00"
        expiresAt="2026-10-19T14:01:05-03:00"
        onExpire={expire}
      />,
    );
    const time = () => container.querySelector("time");
    expect(time()?.getAttribute("datetime")).toBe("PT65S");
    const tick = (ms: number) =>
      act(() => {
        clock += ms;
        for (const fn of intervals) fn();
      });
    tick(10_000);
    expect(time()?.getAttribute("datetime")).toBe("PT55S");
    expect(container.textContent).toContain("Falta 1 minuto para o pedido expirar");
    tick(60_000);
    tick(1_000);
    expect(expire).toHaveBeenCalledTimes(1);
  } finally {
    Date.now = realNow;
    window.setInterval = realSetInterval;
  }
});

test("reduced motion: every entrance and pulse has a motion-reduce pair", () => {
  const { container } = render(<Card status="awaiting" defaultMethod="app" />);
  const html = container.innerHTML;
  expect(html).toContain("motion-safe:animate-ring-pulse");
  expect(html).toContain("motion-safe:shimmer-text");
  expect(html).toContain("motion-reduce:animate-none");
  expect(html).not.toMatch(/(?<!motion-safe:)animate-ring-pulse/);
});

test("parts throw outside the root", () => {
  const spy = console.error;
  console.error = () => {};
  expect(() => render(<PixAutomaticoMethod />)).toThrow(
    "PixAutomaticoMethod must be used within PixAutomatico",
  );
  console.error = spy;
});
