import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AUDIT_LOG_VARIANTS,
  AuditLog,
  AuditLogAction,
  AuditLogActor,
  AuditLogDetailLabel,
  AuditLogDetailValue,
  AuditLogEvent,
  AuditLogEventDetails,
  type AuditLogEventProps,
  AuditLogEventSummary,
  AuditLogList,
  AuditLogResource,
  AuditLogTimestamp,
  AuditLogTitle,
  type AuditLogVariant,
} from "@/registry/uai/components/audit-log";

function Fixture({
  variant,
  ...event
}: { variant?: AuditLogVariant } & Omit<AuditLogEventProps, "children">) {
  return (
    <AuditLog variant={variant}>
      <AuditLogTitle>Audit log</AuditLogTitle>
      <AuditLogList>
        <AuditLogEvent {...event}>
          <AuditLogEventSummary>
            <AuditLogActor>Ana Souza</AuditLogActor>
            <AuditLogAction>deleted</AuditLogAction>
            <AuditLogResource>api-key-prod</AuditLogResource>
            <AuditLogTimestamp dateTime="2026-09-30T14:12:00">2:12 PM</AuditLogTimestamp>
          </AuditLogEventSummary>
          <AuditLogEventDetails>
            <AuditLogDetailLabel>IP address</AuditLogDetailLabel>
            <AuditLogDetailValue>189.40.12.7</AuditLogDetailValue>
          </AuditLogEventDetails>
        </AuditLogEvent>
      </AuditLogList>
    </AuditLog>
  );
}

test("expands event details with the keyboard", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Audit log" })).toBeTruthy();
  const summary = screen.getByRole("button", { name: /Ana Souza deleted api-key-prod/ });
  const details = document.getElementById(summary.getAttribute("aria-controls") ?? "");
  expect(summary.getAttribute("aria-expanded")).toBe("false");
  expect(details?.hasAttribute("inert")).toBe(true);
  await user.tab();
  await user.keyboard("{Enter}");
  expect(summary.getAttribute("aria-expanded")).toBe("true");
  expect(details?.hasAttribute("inert")).toBe(false);
  expect(screen.getByRole("definition").textContent).toBe("189.40.12.7");
  await user.keyboard(" ");
  expect(details?.hasAttribute("inert")).toBe(true);
});

test("exposes machine-readable timestamps and controlled expansion", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  render(<Fixture open onOpenChange={change} />);
  expect(document.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-30T14:12:00");
  await user.click(screen.getByRole("button", { name: /Ana Souza/ }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("button", { name: /Ana Souza/ }).getAttribute("aria-expanded")).toBe(
    "true",
  );
});

test("renders every variant and guards compound children", () => {
  for (const variant of AUDIT_LOG_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<AuditLogList />)).toThrow("AuditLogList must be used within AuditLog");
  expect(() =>
    render(
      <AuditLog>
        <AuditLogEventSummary>Event</AuditLogEventSummary>
      </AuditLog>,
    ),
  ).toThrow("AuditLogEventSummary must be used within AuditLogEvent");
});
