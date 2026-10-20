import { afterEach, expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import {
  formatBrl,
  PIX_AUTOMATICO_DEFAULT_BANKS,
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
  pixAutomaticoBankMonogram,
  pixAutomaticoBankTone,
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

test("arrow keys only select the method; with no bank, Autorizar reads Escolher banco and opens the picker", async () => {
  const user = userEvent.setup();
  const authorize = mock((_payload: unknown) => {});
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
  expect(screen.queryByRole("group", { name: "Escolha seu banco" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Escolher banco" }));
  expect(authorize).not.toHaveBeenCalled();
  expect(screen.getByRole("group", { name: "Escolha seu banco" })).toBeTruthy();
  const send = screen.getByRole("button", { name: "Escolha um banco" });
  expect(send.getAttribute("aria-disabled")).toBe("true");
  await user.click(send);
  expect(authorize).not.toHaveBeenCalled();
});

test("QR Code authorizes without a bank", async () => {
  const user = userEvent.setup();
  const authorize = mock((_payload: unknown) => {});
  render(<Card onAuthorize={authorize} />);
  await user.click(screen.getByRole("button", { name: "Autorizar Pix Automático" }));
  expect(authorize).toHaveBeenCalledWith({ method: "qr" });
});

/** The visible bank names, in list order (the monogram tile is decorative). */
const optionNames = () =>
  screen.getAllByRole("option").map((option) => option.children[1]?.textContent ?? "");

const itau = PIX_AUTOMATICO_DEFAULT_BANKS.find((bank) => bank.id === "itau");

test("tapping No app do banco opens the picker with the recent bank pinned and preselected", async () => {
  const user = userEvent.setup();
  const authorize = mock((_payload: unknown) => {});
  const select = mock((_bank: unknown) => {});
  render(<Card onAuthorize={authorize} onBankSelect={select} recentBankId="nubank" />);
  await user.click(screen.getByRole("radio", { name: "No app do banco" }));
  const step = screen.getByRole("group", { name: "Escolha seu banco" });
  expect(step).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Buscar banco" }));
  const recent = screen.getByRole("group", { name: "Usado da última vez" });
  expect(recent.textContent).toContain("Nubank");
  expect(screen.getByRole("option", { name: "Nubank" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.getAllByRole("option").length).toBe(PIX_AUTOMATICO_DEFAULT_BANKS.length);
  expect(screen.getByRole("button", { name: "Enviar para o app Nubank" })).toBeTruthy();
  await user.click(screen.getByRole("option", { name: "Itaú" }));
  expect(select).toHaveBeenCalledWith(itau);
  expect(screen.getByRole("option", { name: "Itaú" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.getByRole("option", { name: "Nubank" }).getAttribute("aria-selected")).toBe(
    "false",
  );
  await user.click(screen.getByRole("button", { name: "Enviar para o app Itaú" }));
  expect(authorize).toHaveBeenCalledWith({ method: "app", bank: itau });
});

test("search ranks name, word, then substring matches, highlights them, and keeps the selection", async () => {
  const user = userEvent.setup();
  render(<Card recentBankId="nubank" />);
  await user.click(screen.getByRole("radio", { name: "No app do banco" }));
  await user.type(screen.getByRole("combobox", { name: "Buscar banco" }), "ban");
  expect(screen.queryByRole("group", { name: "Usado da última vez" })).toBeNull();
  const names = optionNames();
  // Name-start, word-start, substring, then keyword-only matches ("itau unibanco", "banco inter").
  expect(names).toEqual([
    "Banco do Brasil",
    "Banrisul",
    "C6 Bank",
    "Nubank",
    "PagBank",
    "Itaú",
    "Inter",
  ]);
  expect(document.querySelector("mark")?.textContent).toBe("Ban");
  // Folded: "itau" finds Itaú, and keywords count ("cef" finds Caixa).
  await user.clear(screen.getByRole("combobox", { name: "Buscar banco" }));
  await user.type(screen.getByRole("combobox", { name: "Buscar banco" }), "cef");
  expect(optionNames()).toEqual(["Caixa"]);
  await user.clear(screen.getByRole("combobox", { name: "Buscar banco" }));
  await user.type(screen.getByRole("combobox", { name: "Buscar banco" }), "Banco Azul");
  expect(screen.getByText("Nenhum banco encontrado para “Banco Azul”")).toBeTruthy();
  // Filtered out, Nubank is still the selection the footer names.
  expect(screen.getByRole("button", { name: "Enviar para o app Nubank" })).toBeTruthy();
  // The field's × and the empty state's pill both clear; the pill is the second.
  const clears = screen.getAllByRole("button", { name: "Limpar busca" });
  expect(clears.length).toBe(2);
  await user.click(clears[1] as HTMLElement);
  expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Buscar banco" }));
  expect(screen.getAllByRole("option").length).toBe(PIX_AUTOMATICO_DEFAULT_BANKS.length);
});

test("keyboard: arrows select from the field, Enter moves to send, Esc clears then goes back to the opener", async () => {
  const user = userEvent.setup();
  render(<Card />);
  const app = screen.getByRole("radio", { name: "No app do banco" });
  app.focus();
  await user.keyboard(" ");
  const field = screen.getByRole("combobox", { name: "Buscar banco" });
  expect(document.activeElement).toBe(field);
  await user.keyboard("{ArrowDown}{ArrowDown}");
  const second = screen.getByRole("option", { name: "Itaú" });
  expect(field.getAttribute("aria-activedescendant")).toBe(second.id);
  expect(second.getAttribute("aria-selected")).toBe("true");
  await user.keyboard("{Enter}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Enviar para o app Itaú" }),
  );
  field.focus();
  await user.type(field, "xyz");
  await user.keyboard("{Escape}");
  expect((field as HTMLInputElement).value).toBe("");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("group", { name: "Escolha seu banco" })).toBeNull();
  expect(document.activeElement).toBe(app);
  // The choice survives Back: the terms show it with Trocar, and Autorizar sends.
  expect(screen.getByRole("button", { name: "Trocar banco, Itaú escolhido" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Autorizar Pix Automático" })).toBeTruthy();
});

test("disabled banks are reachable but never selected", async () => {
  const user = userEvent.setup();
  const banks = [
    { id: "ipe", name: "Cooperativa Ipê", disabled: true, disabledReason: "Em manutenção" },
    ...PIX_AUTOMATICO_DEFAULT_BANKS,
  ];
  render(<Card banks={banks} defaultMethod="app" />);
  await user.click(screen.getByRole("button", { name: "Escolher banco" }));
  const ipe = screen.getByRole("option", { name: "Cooperativa Ipê" });
  expect(ipe.getAttribute("aria-disabled")).toBe("true");
  expect(screen.getByText("Em manutenção").id).toBe(ipe.getAttribute("aria-describedby") ?? "");
  await user.click(ipe);
  expect(ipe.getAttribute("aria-selected")).toBe("false");
  expect(screen.getByRole("button", { name: "Escolha um banco" })).toBeTruthy();
});

test("loading and error states", async () => {
  const user = userEvent.setup();
  const retry = mock(() => {});
  const view = render(<Card defaultMethod="app" banksStatus="loading" />);
  await user.click(screen.getByRole("button", { name: "Escolher banco" }));
  expect(screen.getByRole("listbox", { name: "Bancos" }).getAttribute("aria-busy")).toBe("true");
  expect((screen.getByRole("combobox") as HTMLInputElement).disabled).toBe(true);
  view.rerender(<Card defaultMethod="app" banksStatus="error" onBanksRetry={retry} />);
  expect(screen.getByText("Não deu para carregar a lista de bancos.")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Tentar de novo" }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test("sending moves focus to the waiting title, which names the bank", async () => {
  const user = userEvent.setup();
  const view = render(<Card recentBankId="itau" />);
  await user.click(screen.getByRole("radio", { name: "No app do banco" }));
  await user.click(screen.getByRole("button", { name: "Enviar para o app Itaú" }));
  view.rerender(<Card recentBankId="itau" status="awaiting" />);
  const title = screen.getByRole("heading", { name: "Aguardando confirmação no app Itaú" });
  expect(document.activeElement).toBe(title);
  expect(
    screen.getByText(
      "Abra o app Itaú e confirme o Pix Automático. O pedido pode levar alguns minutos para aparecer.",
    ),
  ).toBeTruthy();
  expect(screen.getByText("Pedido enviado para o app Itaú. Aguardando confirmação.")).toBeTruthy();
  expect(
    view.container.querySelector("[data-slot=pix-automatico-review]")?.hasAttribute("inert"),
  ).toBe(true);
});

test("Trocar banco shows only with onChangeBank, and reopens the picker", async () => {
  const user = userEvent.setup();
  const view = render(<Card status="awaiting" defaultMethod="app" recentBankId="bb" />);
  expect(screen.queryByRole("button", { name: "Trocar banco" })).toBeNull();
  expect(screen.getByRole("button", { name: "Usar QR Code" })).toBeTruthy();
  const change = mock(() => {});
  view.rerender(
    <Card status="awaiting" defaultMethod="app" recentBankId="bb" onChangeBank={change} />,
  );
  await user.click(screen.getByRole("button", { name: "Trocar banco" }));
  expect(change).toHaveBeenCalledTimes(1);
  view.rerender(
    <Card status="review" defaultMethod="app" recentBankId="bb" onChangeBank={change} />,
  );
  expect(screen.getByRole("group", { name: "Escolha seu banco" })).toBeTruthy();
});

test("monograms and tones are pure and stable", () => {
  expect(pixAutomaticoBankMonogram({ id: "x", name: "Banco do Nordeste" })).toBe("NO");
  expect(pixAutomaticoBankMonogram({ id: "x", name: "Caixa Econômica Federal" })).toBe("CE");
  expect(pixAutomaticoBankMonogram({ id: "x", name: "Itaú", monogram: "it" })).toBe("IT");
  const tones = Object.fromEntries(
    PIX_AUTOMATICO_DEFAULT_BANKS.map((bank) => [bank.id, pixAutomaticoBankTone(bank.id)]),
  );
  expect(tones).toEqual({
    nubank: "success",
    itau: "success",
    bb: "primary",
    caixa: "warning",
    bradesco: "success",
    santander: "warning",
    inter: "primary",
    c6: "neutral",
    mercadopago: "warning",
    picpay: "warning",
    btg: "neutral",
    sicoob: "success",
    sicredi: "neutral",
    pagbank: "primary",
    banrisul: "primary",
  });
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
