"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import {
  TeamManagement,
  TeamManagementButton,
  TeamManagementDescription,
  TeamManagementEmpty,
  TeamManagementHeader,
  TeamManagementHeading,
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
} from "@/components/uai/team-management";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import { DataTableToolbarSearch } from "@/components/ui/uai/data-table-toolbar";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FormField,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";

type Member = { email: string; name: string; role: string; pending?: boolean; owner?: boolean };

const roles = ["Admin", "Editor", "Viewer"];

export function TeamManagementPreview({ variant = "table" }: { variant?: TeamManagementVariant }) {
  const [members, setMembers] = useState<Member[]>([
    { email: "amara@northwind.example", name: "Amara Okafor", role: "Admin", owner: true },
    { email: "tomas@northwind.example", name: "Tomás Rivera", role: "Editor" },
    { email: "mei@northwind.example", name: "Mei Tanaka", role: "Viewer" },
    { email: "jonas@harbor.example", name: "jonas@harbor.example", role: "Editor", pending: true },
  ]);
  const [search, setSearch] = useState("");
  const [invite, setInvite] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [inviteError, setInviteError] = useState(false);
  const query = search.trim().toLowerCase();
  const visible = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query),
  );

  function update(email: string, change: Partial<Member>) {
    setMembers((current) =>
      current.map((member) => (member.email === email ? { ...member, ...change } : member)),
    );
  }

  return (
    <TeamManagement variant={variant}>
      <TeamManagementHeader>
        <TeamManagementHeading>
          <TeamManagementTitle>Team</TeamManagementTitle>
          <TeamManagementDescription>
            {members.length} people can access Northwind Goods. Admins manage billing and roles.
          </TeamManagementDescription>
        </TeamManagementHeading>
      </TeamManagementHeader>
      <TeamManagementInvite
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const email = invite.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setInviteError(true);
            return;
          }
          setMembers((current) => [
            ...current,
            { email, name: email, role: inviteRole, pending: true },
          ]);
          setInvite("");
          setInviteError(false);
        }}
      >
        <FormField
          variant="compact"
          invalid={inviteError}
          value={invite}
          onValueChange={setInvite}
          style={{ flex: "1 1 220px" }}
        >
          <FormFieldLabel>Email address</FormFieldLabel>
          <FormFieldInput type="email" placeholder="name@company.com" />
          <FormFieldError>Enter a valid email address.</FormFieldError>
        </FormField>
        <TeamManagementRoleSelect
          aria-label="Role for new member"
          value={inviteRole}
          onValueChange={setInviteRole}
          style={{ height: 32 }}
        >
          {roles.map((role) => (
            <TeamManagementRoleOption key={role} value={role}>
              {role}
            </TeamManagementRoleOption>
          ))}
        </TeamManagementRoleSelect>
        <TeamManagementButton type="submit" emphasis="primary" style={{ height: 32 }}>
          Send invite
        </TeamManagementButton>
      </TeamManagementInvite>
      <TeamManagementToolbar search={search} onSearchChange={setSearch}>
        <DataTableToolbarSearch label="Search members" placeholder="Search by name or email" />
      </TeamManagementToolbar>
      {visible.length === 0 ? (
        <TeamManagementEmpty>
          <EmptyStateMedia>
            <SearchX aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>No members match “{search}”</EmptyStateTitle>
              <EmptyStateDescription>
                Check the spelling or invite them above.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyStateContent>
        </TeamManagementEmpty>
      ) : (
        <TeamManagementMembers>
          {visible.map((member) => (
            <TeamManagementMember key={member.email}>
              <TeamManagementMemberIdentity>
                <TeamManagementMemberAvatar name={member.name} />
                <TeamManagementMemberName>{member.name}</TeamManagementMemberName>
                <TeamManagementMemberEmail>
                  {member.pending ? "Invitation sent" : member.email}
                </TeamManagementMemberEmail>
              </TeamManagementMemberIdentity>
              {member.pending ? (
                <TeamManagementMemberStatus tone="warning">Pending</TeamManagementMemberStatus>
              ) : null}
              {member.owner ? (
                <TeamManagementMemberStatus tone="accent">Owner</TeamManagementMemberStatus>
              ) : null}
              <TeamManagementMemberActions>
                <TeamManagementRoleSelect
                  value={member.role}
                  disabled={member.owner}
                  onValueChange={(role) => update(member.email, { role })}
                >
                  {roles.map((role) => (
                    <TeamManagementRoleOption key={role} value={role}>
                      {role}
                    </TeamManagementRoleOption>
                  ))}
                </TeamManagementRoleSelect>
                {member.owner ? null : (
                  <TeamManagementRemove>
                    <ConfirmationDialogTrigger
                      aria-label={`${member.pending ? "Revoke invitation for" : "Remove"} ${member.name}`}
                    >
                      {member.pending ? "Revoke" : "Remove"}
                    </ConfirmationDialogTrigger>
                    <ConfirmationDialogContent>
                      <ConfirmationDialogTitle>
                        {member.pending ? "Revoke invitation?" : `Remove ${member.name}?`}
                      </ConfirmationDialogTitle>
                      <ConfirmationDialogDescription>
                        <p style={{ margin: 0 }}>
                          {member.pending
                            ? "The invitation link stops working immediately."
                            : "They lose access to orders, products, and reports right away. Their past activity stays in the audit log."}
                        </p>
                      </ConfirmationDialogDescription>
                      <ConfirmationDialogActions>
                        <ConfirmationDialogCancel />
                        <ConfirmationDialogConfirm
                          onClick={() =>
                            setMembers((current) =>
                              current.filter((item) => item.email !== member.email),
                            )
                          }
                        >
                          {member.pending ? "Revoke invitation" : "Remove member"}
                        </ConfirmationDialogConfirm>
                      </ConfirmationDialogActions>
                    </ConfirmationDialogContent>
                  </TeamManagementRemove>
                )}
              </TeamManagementMemberActions>
            </TeamManagementMember>
          ))}
        </TeamManagementMembers>
      )}
    </TeamManagement>
  );
}
