import { expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SettingsPagePreview } from "@/components/registry/app-blocks/settings-page-preview";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogInput,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import { FormFieldError, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  SETTINGS_PAGE_VARIANTS,
  SettingsPage,
  SettingsPageConfirm,
  SettingsPageField,
  SettingsPageFieldEdited,
  SettingsPageHeader,
  SettingsPageSaveBar,
  SettingsPageSection,
  SettingsPageSectionContent,
  SettingsPageSectionDescription,
  SettingsPageSectionHeader,
  SettingsPageSectionTitle,
  SettingsPageTitle,
  type SettingsPageVariant,
} from "@/registry/uai/blocks/settings-page";

function Fixture({
  variant,
  onSave,
  onDelete,
}: {
  variant?: SettingsPageVariant;
  onSave?: (name: string) => void;
  onDelete?: () => void;
}) {
  const [saved, setSaved] = useState("Northwind");
  const [name, setName] = useState(saved);
  return (
    <SettingsPage variant={variant}>
      <SettingsPageHeader>
        <SettingsPageTitle>Workspace settings</SettingsPageTitle>
      </SettingsPageHeader>
      <SettingsPageSection>
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>General</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>Shown on invoices.</SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <SettingsPageField
            required
            edited={name !== saved}
            invalid={!name.trim()}
            value={name}
            onValueChange={setName}
          >
            <FormFieldLabel>
              Workspace name <SettingsPageFieldEdited />
            </FormFieldLabel>
            <FormFieldInput />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </SettingsPageField>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSection tone="danger">
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>Delete workspace</SettingsPageSectionTitle>
        </SettingsPageSectionHeader>
        <SettingsPageConfirm>
          <ConfirmationDialogTrigger>Delete workspace</ConfirmationDialogTrigger>
          <ConfirmationDialogContent>
            <ConfirmationDialogTitle>Delete Northwind?</ConfirmationDialogTitle>
            <ConfirmationDialogDescription>Removes every order.</ConfirmationDialogDescription>
            <ConfirmationDialogInput match="northwind" />
            <ConfirmationDialogActions>
              <ConfirmationDialogCancel />
              <ConfirmationDialogConfirm onClick={onDelete}>Delete</ConfirmationDialogConfirm>
            </ConfirmationDialogActions>
          </ConfirmationDialogContent>
        </SettingsPageConfirm>
      </SettingsPageSection>
      <SettingsPageSaveBar
        dirty={name !== saved}
        warnBeforeUnload={false}
        onSave={() => {
          setSaved(name);
          onSave?.(name);
        }}
        onDiscard={() => setName(saved)}
      />
    </SettingsPage>
  );
}

test("names the page and each settings group", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Workspace settings" })).toBeTruthy();
  const general = screen.getByRole("region", { name: "General" });
  expect(general.getAttribute("aria-describedby")).toBe(screen.getByText("Shown on invoices.").id);
  expect(screen.getByRole("region", { name: "Delete workspace" }).dataset.tone).toBe("danger");
});

test("shows the default save bar only while dirty and saves or discards", async () => {
  const user = userEvent.setup();
  const saves: string[] = [];
  render(<Fixture onSave={(name) => saves.push(name)} />);
  expect(screen.queryByRole("region", { name: "Unsaved changes" })).toBeNull();
  const input = screen.getByLabelText(/Workspace name/);
  await user.type(input, " Goods");
  expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Discard" }));
  expect((input as HTMLInputElement).value).toBe("Northwind");
  await user.type(input, " Co");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(saves).toEqual(["Northwind Co"]);
  expect(screen.queryByRole("region", { name: "Unsaved changes" })).toBeNull();
});

test("flags invalid fields and requires the typed phrase before deleting", async () => {
  const user = userEvent.setup();
  let deleted = 0;
  render(<Fixture onDelete={() => deleted++} />);
  await user.clear(screen.getByLabelText(/Workspace name/));
  expect(screen.getByRole("alert").textContent).toBe("Enter a workspace name.");
  await user.click(screen.getByRole("button", { name: "Delete workspace" }));
  const confirm = screen.getByRole("button", { name: "Delete" }) as HTMLButtonElement;
  expect(confirm.disabled).toBe(true);
  await user.type(screen.getByLabelText(/to confirm/), "northwind");
  await user.click(confirm);
  expect(deleted).toBe(1);
});

test("maps every variant and guards regions outside the page", () => {
  const field = { stacked: "outlined", split: "outlined", compact: "compact" };
  for (const variant of SETTINGS_PAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    const input = screen.getByLabelText(/Workspace name/);
    expect(input.closest("[data-variant]")?.getAttribute("data-variant")).toBe(field[variant]);
    view.unmount();
  }
  expect(() => render(<SettingsPageTitle>Settings</SettingsPageTitle>)).toThrow(
    "SettingsPageTitle must be used within SettingsPage",
  );
  expect(() =>
    render(
      <SettingsPage>
        <SettingsPageSectionTitle>General</SettingsPageSectionTitle>
      </SettingsPage>,
    ),
  ).toThrow("SettingsPageSectionTitle must be used within SettingsPageSection");
});

test("marks edited fields and only labels optional ones", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const marker = screen.getByText("Edited").closest("[data-slot=settings-page-field-edited]");
  expect(marker?.getAttribute("data-state")).toBe("off");
  expect(marker?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.queryByText("(required)")?.closest("[data-slot=form-field-label]")).toBeTruthy();
  await user.type(screen.getByLabelText(/Workspace name/), "!");
  expect(marker?.getAttribute("data-state")).toBe("on");
  expect(marker?.hasAttribute("aria-hidden")).toBe(false);
  expect(() => render(<SettingsPageFieldEdited />)).toThrow(
    "SettingsPageFieldEdited must be used within SettingsPageField",
  );
});

test("keeps Save enabled with an invalid field and sends focus to it instead of saving", async () => {
  const user = userEvent.setup();
  const saves: string[] = [];
  render(<Fixture onSave={(name) => saves.push(name)} />);
  const input = screen.getByLabelText(/Workspace name/);
  await user.clear(input);
  const save = screen.getByRole("button", { name: "Save changes" }) as HTMLButtonElement;
  expect(save.disabled).toBe(false);
  await user.click(save);
  expect(saves).toEqual([]);
  expect(document.activeElement).toBe(input);
  expect(input.hasAttribute("data-shake")).toBe(true);
  expect(screen.getByText("Fix 1 field to save")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Unsaved changes" }).hasAttribute("data-invalid")).toBe(
    true,
  );
  await user.type(input, "Northwind Co");
  expect(screen.queryByText("Fix 1 field to save")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(saves).toEqual(["Northwind Co"]);
});

test("keeps danger on the button only", () => {
  render(<Fixture />);
  const title = screen.getByRole("heading", { name: "Delete workspace" });
  expect(title.className).not.toContain("destructive");
  const danger = screen.getByRole("region", { name: "Delete workspace" });
  expect(danger.className).not.toContain("destructive");
});

test("preview confirms a save without counting zero changes", async () => {
  const user = userEvent.setup();
  render(<SettingsPagePreview />);
  const url = screen.getByLabelText(/Workspace URL/);
  await user.clear(url);
  await user.type(url, "northwind-goods");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  // The preview's first save fails on purpose so it can show recovery.
  const retry = await screen.findByRole("button", { name: "Retry" }, { timeout: 3000 });
  await user.click(retry);
  await waitFor(() => expect(screen.getByText("All changes saved")).toBeTruthy(), {
    timeout: 3000,
  });
  expect(screen.queryByText(/0 unsaved/)).toBeNull();
});
