import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormFieldError, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  WORKSPACE_SETUP_VARIANTS,
  WorkspaceSetup,
  WorkspaceSetupChoice,
  WorkspaceSetupCreated,
  WorkspaceSetupError,
  WorkspaceSetupInvite,
  WorkspaceSetupInviteAdd,
  WorkspaceSetupInviteError,
  WorkspaceSetupInviteInput,
  WorkspaceSetupInviteList,
  WorkspaceSetupMain,
  WorkspaceSetupName,
  type WorkspaceSetupProps,
  WorkspaceSetupSection,
  WorkspaceSetupSectionTitle,
  WorkspaceSetupSubmit,
  WorkspaceSetupSummary,
  WorkspaceSetupTitle,
  WorkspaceSetupUrl,
  WorkspaceSetupValue,
} from "@/registry/uai/blocks/workspace-setup";

function Fixture(props: Partial<WorkspaceSetupProps>) {
  return (
    <WorkspaceSetup onCreate={async () => {}} {...props}>
      <WorkspaceSetupTitle>Create a workspace</WorkspaceSetupTitle>
      <WorkspaceSetupMain>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Details</WorkspaceSetupSectionTitle>
          <WorkspaceSetupName>
            <FormFieldLabel>Workspace name</FormFieldLabel>
            <FormFieldInput />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </WorkspaceSetupName>
          <WorkspaceSetupUrl>
            <FormFieldLabel>Workspace URL</FormFieldLabel>
            <FormFieldInput />
          </WorkspaceSetupUrl>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Invite</WorkspaceSetupSectionTitle>
          <WorkspaceSetupInvite>
            <FormFieldLabel>Emails</FormFieldLabel>
            <WorkspaceSetupInviteInput />
            <WorkspaceSetupInviteAdd>Add</WorkspaceSetupInviteAdd>
            <WorkspaceSetupInviteError />
          </WorkspaceSetupInvite>
          <WorkspaceSetupInviteList>Nobody yet</WorkspaceSetupInviteList>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Access</WorkspaceSetupSectionTitle>
          <WorkspaceSetupChoice name="access" value="invite" defaultChecked>
            Invite only
          </WorkspaceSetupChoice>
          <WorkspaceSetupChoice name="access" value="domain">
            Anyone at the domain
          </WorkspaceSetupChoice>
        </WorkspaceSetupSection>
        <WorkspaceSetupError />
        <WorkspaceSetupCreated>Workspace created</WorkspaceSetupCreated>
        <WorkspaceSetupSubmit>Create</WorkspaceSetupSubmit>
      </WorkspaceSetupMain>
      <WorkspaceSetupSummary>
        <WorkspaceSetupValue field="invites" />
      </WorkspaceSetupSummary>
    </WorkspaceSetup>
  );
}

test("derives the URL from the name until the URL is edited", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.type(screen.getByLabelText(/Workspace name/), "Lárkspur Crews!");
  expect((screen.getByLabelText(/Workspace URL/) as HTMLInputElement).value).toBe("larkspur-crews");
  await user.clear(screen.getByLabelText(/Workspace URL/));
  await user.type(screen.getByLabelText(/Workspace URL/), "Lark HQ");
  await user.type(screen.getByLabelText(/Workspace name/), " East");
  expect((screen.getByLabelText(/Workspace URL/) as HTMLInputElement).value).toBe("lark-hq");
});

test("adds invitations with Enter and commas, rejects bad addresses, and removes them", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByText("Nobody yet")).toBeTruthy();
  await user.type(
    screen.getByLabelText("Emails"),
    "theo@larkspur.example, ana@larkspur.example{Enter}",
  );
  expect(screen.getByRole("list", { name: "Pending invitations" }).children.length).toBe(2);
  expect(screen.getByText("2 people")).toBeTruthy();
  await user.type(screen.getByLabelText("Emails"), "not-an-email");
  await user.click(screen.getByRole("button", { name: "Add" }));
  expect(screen.getByRole("alert").textContent).toContain("not-an-email is not a valid email");
  await user.click(screen.getByRole("button", { name: "Remove theo@larkspur.example" }));
  expect(screen.getByText("1 person")).toBeTruthy();
});

test("validates on submit, focuses the first invalid field, and sends values", async () => {
  const user = userEvent.setup();
  const onCreate = mock(async () => {});
  render(<Fixture onCreate={onCreate} />);
  await user.click(screen.getByRole("button", { name: "Create" }));
  expect(onCreate).not.toHaveBeenCalled();
  expect(screen.getByText("Enter a workspace name.")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByLabelText(/Workspace name/));
  await user.type(screen.getByLabelText(/Workspace name/), "Larkspur");
  await user.type(screen.getByLabelText("Emails"), "theo@larkspur.example");
  await user.click(screen.getByRole("radio", { name: "Anyone at the domain" }));
  await user.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
  const values = (
    onCreate.mock.calls[0] as unknown as [Parameters<WorkspaceSetupProps["onCreate"]>[0]]
  )[0];
  expect(values.name).toBe("Larkspur");
  expect(values.slug).toBe("larkspur");
  expect(values.invites).toEqual(["theo@larkspur.example"]);
  expect(values.formData.get("access")).toBe("domain");
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("Workspace created"),
  );
});

test("shows creation failures, renders every variant, and guards its regions", async () => {
  const user = userEvent.setup();
  render(
    <Fixture
      defaultName="Larkspur"
      onCreate={async () => {
        throw new Error("That URL is taken.");
      }}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("That URL is taken."),
  );
  document.body.innerHTML = "";
  for (const variant of WORKSPACE_SETUP_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("form")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<WorkspaceSetupName />)).toThrow(
    "WorkspaceSetupName must be used within WorkspaceSetup",
  );
});
