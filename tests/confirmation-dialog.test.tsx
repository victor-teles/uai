import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CONFIRMATION_DIALOG_VARIANTS,
  ConfirmationDialog,
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogInput,
  type ConfirmationDialogProps,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/registry/uai/components/confirmation-dialog";

function Fixture({
  typed = false,
  onConfirm,
  ...props
}: ConfirmationDialogProps & { typed?: boolean; onConfirm?: () => void }) {
  return (
    <ConfirmationDialog {...props}>
      <ConfirmationDialogTrigger>Delete project</ConfirmationDialogTrigger>
      <ConfirmationDialogContent>
        <ConfirmationDialogTitle>Delete acme-web?</ConfirmationDialogTitle>
        <ConfirmationDialogDescription>
          <ConfirmationDialogImpact>
            <li>142 deployments</li>
          </ConfirmationDialogImpact>
        </ConfirmationDialogDescription>
        {typed ? <ConfirmationDialogInput match="acme-web" /> : null}
        <ConfirmationDialogActions>
          <ConfirmationDialogCancel />
          <ConfirmationDialogConfirm onClick={onConfirm}>Delete</ConfirmationDialogConfirm>
        </ConfirmationDialogActions>
      </ConfirmationDialogContent>
    </ConfirmationDialog>
  );
}

function dialog() {
  return document.querySelector("dialog") as HTMLDialogElement;
}

test("opens a labelled modal, focuses Cancel, and restores focus on cancel", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: "Delete project" });
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  expect(dialog().open).toBe(false);
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(dialog().open).toBe(true);
  expect(dialog().getAttribute("role")).toBe("alertdialog");
  const title = screen.getByText("Delete acme-web?");
  expect(dialog().getAttribute("aria-labelledby")).toBe(title.id);
  expect(
    document.getElementById(dialog().getAttribute("aria-describedby") ?? "")?.textContent,
  ).toContain("142 deployments");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
  await user.keyboard("{Enter}");
  expect(dialog().open).toBe(false);
  expect(document.activeElement).toBe(trigger);
});

test("closes on Escape and the native cancel event", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  render(<Fixture onOpenChange={change} />);
  await user.click(screen.getByRole("button", { name: "Delete project" }));
  await user.keyboard("{Escape}");
  expect(dialog().open).toBe(false);
  await user.click(screen.getByRole("button", { name: "Delete project" }));
  dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(dialog().open).toBe(false);
  expect(change.mock.calls.map((call) => call[0])).toEqual([true, false, true, false]);
});

test("requires the typed phrase before confirming", async () => {
  const user = userEvent.setup();
  const confirm = mock(() => {});
  render(<Fixture typed onConfirm={confirm} />);
  await user.click(screen.getByRole("button", { name: "Delete project" }));
  const button = screen.getByRole("button", { name: "Delete" }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  const input = screen.getByLabelText(/Type acme-web to confirm/);
  await user.type(input, "acme-we");
  expect(button.disabled).toBe(true);
  await user.type(input, "b");
  expect(button.disabled).toBe(false);
  await user.click(button);
  expect(confirm).toHaveBeenCalledTimes(1);
  expect(dialog().open).toBe(false);
  await user.click(screen.getByRole("button", { name: "Delete project" }));
  expect((screen.getByLabelText(/Type acme-web/) as HTMLInputElement).value).toBe("");
});

test("supports controlled open state", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  const view = render(<Fixture open onOpenChange={change} />);
  expect(dialog().open).toBe(true);
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(dialog().open).toBe(true);
  view.rerender(<Fixture open={false} onOpenChange={change} />);
  expect(dialog().open).toBe(false);
});

test("renders every variant and guards compound children", () => {
  for (const variant of CONFIRMATION_DIALOG_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ConfirmationDialogConfirm />)).toThrow(
    "ConfirmationDialogConfirm must be used within ConfirmationDialog",
  );
});
