import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import { DataTableToolbarSearch } from "@/components/ui/uai/data-table-toolbar";
import { EmptyStateTitle } from "@/components/ui/uai/empty-state";
import {
  TEAM_MANAGEMENT_VARIANTS,
  TeamManagement,
  TeamManagementButton,
  TeamManagementEmpty,
  TeamManagementInvite,
  TeamManagementMember,
  TeamManagementMemberActions,
  TeamManagementMemberAvatar,
  TeamManagementMemberEmail,
  TeamManagementMemberIdentity,
  TeamManagementMemberName,
  TeamManagementMemberStatus,
  TeamManagementMembers,
  TeamManagementRemove,
  TeamManagementRoleOption,
  TeamManagementRoleSelect,
  TeamManagementTitle,
  TeamManagementToolbar,
  type TeamManagementVariant,
} from "@/registry/uai/blocks/team-management";

function Fixture({ variant }: { variant?: TeamManagementVariant }) {
  const [members, setMembers] = useState([
    { name: "Amara Okafor", role: "Admin" },
    { name: "Tomás Rivera", role: "Editor" },
  ]);
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const visible = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <TeamManagement variant={variant}>
      <TeamManagementTitle>Team</TeamManagementTitle>
      <TeamManagementInvite
        onSubmit={(event) => {
          event.preventDefault();
          setInvited((current) => [...current, "new"]);
        }}
      >
        <TeamManagementRoleSelect aria-label="Role for new member" defaultValue="Viewer">
          <TeamManagementRoleOption value="Editor">Editor</TeamManagementRoleOption>
          <TeamManagementRoleOption value="Viewer">Viewer</TeamManagementRoleOption>
        </TeamManagementRoleSelect>
        <TeamManagementButton type="submit" emphasis="primary">
          Send invite
        </TeamManagementButton>
      </TeamManagementInvite>
      <p>{invited.length} invited</p>
      <TeamManagementToolbar search={search} onSearchChange={setSearch}>
        <DataTableToolbarSearch label="Search members" />
      </TeamManagementToolbar>
      {visible.length === 0 ? (
        <TeamManagementEmpty>
          <EmptyStateTitle>No members match</EmptyStateTitle>
        </TeamManagementEmpty>
      ) : (
        <TeamManagementMembers>
          {visible.map((member) => (
            <TeamManagementMember key={member.name}>
              <TeamManagementMemberIdentity>
                <TeamManagementMemberAvatar name={member.name} />
                <TeamManagementMemberName>{member.name}</TeamManagementMemberName>
                <TeamManagementMemberEmail>member@northwind.example</TeamManagementMemberEmail>
              </TeamManagementMemberIdentity>
              {member.role === "Admin" ? (
                <TeamManagementMemberStatus>Owner</TeamManagementMemberStatus>
              ) : null}
              <TeamManagementMemberActions>
                <TeamManagementRoleSelect
                  value={member.role}
                  onValueChange={(role) =>
                    setMembers((current) =>
                      current.map((item) => (item.name === member.name ? { ...item, role } : item)),
                    )
                  }
                >
                  <TeamManagementRoleOption value="Admin">Admin</TeamManagementRoleOption>
                  <TeamManagementRoleOption value="Editor">Editor</TeamManagementRoleOption>
                </TeamManagementRoleSelect>
                <TeamManagementRemove>
                  <ConfirmationDialogTrigger aria-label={`Remove ${member.name}`}>
                    Remove
                  </ConfirmationDialogTrigger>
                  <ConfirmationDialogContent>
                    <ConfirmationDialogTitle>Remove {member.name}?</ConfirmationDialogTitle>
                    <ConfirmationDialogActions>
                      <ConfirmationDialogCancel />
                      <ConfirmationDialogConfirm
                        onClick={() =>
                          setMembers((current) =>
                            current.filter((item) => item.name !== member.name),
                          )
                        }
                      >
                        Remove member
                      </ConfirmationDialogConfirm>
                    </ConfirmationDialogActions>
                  </ConfirmationDialogContent>
                </TeamManagementRemove>
              </TeamManagementMemberActions>
            </TeamManagementMember>
          ))}
        </TeamManagementMembers>
      )}
    </TeamManagement>
  );
}

test("names each role select after its member and lists members", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Team" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "Members" }).children).toHaveLength(2);
  expect(screen.getByRole("combobox", { name: "Role for Tomás Rivera" })).toBeTruthy();
  expect(screen.getByRole("combobox", { name: "Role for new member" })).toBeTruthy();
  expect(screen.getByText("AO").getAttribute("aria-hidden")).toBe("true");
});

test("changes roles, submits invitations, and filters with an empty state", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const role = screen.getByRole("combobox", { name: "Role for Tomás Rivera" });
  await user.click(role);
  await user.click(screen.getByRole("option", { name: "Admin" }));
  expect(role.textContent).toBe("Admin");
  await user.click(screen.getByRole("button", { name: "Send invite" }));
  expect(screen.getByText("1 invited")).toBeTruthy();
  const search = screen.getByRole("searchbox", { name: "Search members" });
  await user.type(search, "zz");
  expect(screen.getByRole("region", { name: "No members match" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("list", { name: "Members" })).toBeTruthy();
});

test("confirms removal in a modal before removing the member", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Remove Tomás Rivera" }));
  await user.click(screen.getByRole("button", { name: "Remove member" }));
  expect(screen.queryByText("Tomás Rivera")).toBeNull();
  expect(screen.getByRole("list", { name: "Members" }).children).toHaveLength(1);
});

test("maps variants and guards regions outside their roots", () => {
  const toolbar = { table: "toolbar", cards: "stacked", compact: "compact" };
  for (const variant of TEAM_MANAGEMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(
      screen.getByRole("group", { name: "Member controls" }).getAttribute("data-variant"),
    ).toBe(toolbar[variant]);
    view.unmount();
  }
  expect(() => render(<TeamManagementMembers />)).toThrow(
    "TeamManagementMembers must be used within TeamManagement",
  );
  expect(() =>
    render(
      <TeamManagement>
        <TeamManagementMemberName>Amara</TeamManagementMemberName>
      </TeamManagement>,
    ),
  ).toThrow("TeamManagementMemberName must be used within TeamManagementMember");
});
