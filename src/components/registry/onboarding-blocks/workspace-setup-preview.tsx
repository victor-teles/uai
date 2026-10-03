"use client";

import {
  WorkspaceSetup,
  WorkspaceSetupActions,
  WorkspaceSetupChoice,
  WorkspaceSetupChoiceDescription,
  WorkspaceSetupChoiceLabel,
  WorkspaceSetupCreated,
  WorkspaceSetupDescription,
  WorkspaceSetupError,
  WorkspaceSetupHeader,
  WorkspaceSetupInvite,
  WorkspaceSetupInviteAdd,
  WorkspaceSetupInviteError,
  WorkspaceSetupInviteInput,
  WorkspaceSetupInviteList,
  WorkspaceSetupInviteRow,
  WorkspaceSetupMain,
  WorkspaceSetupName,
  WorkspaceSetupSection,
  WorkspaceSetupSectionDescription,
  WorkspaceSetupSectionTitle,
  WorkspaceSetupSubmit,
  WorkspaceSetupSummary,
  WorkspaceSetupSummaryTitle,
  WorkspaceSetupTitle,
  WorkspaceSetupUrl,
  WorkspaceSetupValue,
  type WorkspaceSetupValues,
  type WorkspaceSetupVariant,
} from "@/components/uai/workspace-setup";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

const takenUrls = new Set(["larkspur"]);

async function createWorkspace({ slug }: WorkspaceSetupValues) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (takenUrls.has(slug)) throw new Error("ferrow.app/larkspur is taken. Choose another URL.");
}

export function WorkspaceSetupPreview({ variant = "card" }: { variant?: WorkspaceSetupVariant }) {
  return (
    <WorkspaceSetup variant={variant} onCreate={createWorkspace}>
      <WorkspaceSetupHeader>
        <WorkspaceSetupTitle>Create your workspace</WorkspaceSetupTitle>
        <WorkspaceSetupDescription>
          A workspace holds your crews, routes, and customers. Try the name Larkspur to see a taken
          URL.
        </WorkspaceSetupDescription>
      </WorkspaceSetupHeader>
      <WorkspaceSetupMain>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Details</WorkspaceSetupSectionTitle>
          <WorkspaceSetupName>
            <FormFieldLabel>Workspace name</FormFieldLabel>
            <FormFieldInput name="name" autoComplete="organization" placeholder="Larkspur Crews" />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </WorkspaceSetupName>
          <WorkspaceSetupUrl>
            <FormFieldLabel>Workspace URL</FormFieldLabel>
            <FormFieldInput name="slug" spellCheck={false} placeholder="larkspur-crews" />
            <FormFieldDescription>
              ferrow.app/<WorkspaceSetupValue field="slug">your-team</WorkspaceSetupValue>
            </FormFieldDescription>
            <FormFieldError>Use 3–40 lowercase letters, numbers, or hyphens.</FormFieldError>
          </WorkspaceSetupUrl>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Invite teammates</WorkspaceSetupSectionTitle>
          <WorkspaceSetupSectionDescription>
            Invitations are sent when the workspace is created.
          </WorkspaceSetupSectionDescription>
          <WorkspaceSetupInvite>
            <FormFieldLabel>Email addresses</FormFieldLabel>
            <WorkspaceSetupInviteRow>
              <WorkspaceSetupInviteInput placeholder="theo@larkspur.example" />
              <WorkspaceSetupInviteAdd>Add</WorkspaceSetupInviteAdd>
            </WorkspaceSetupInviteRow>
            <FormFieldDescription>Separate several addresses with commas.</FormFieldDescription>
            <WorkspaceSetupInviteError />
          </WorkspaceSetupInvite>
          <WorkspaceSetupInviteList>
            No one invited yet. You can do this later.
          </WorkspaceSetupInviteList>
        </WorkspaceSetupSection>
        <WorkspaceSetupSection>
          <WorkspaceSetupSectionTitle>Who can join</WorkspaceSetupSectionTitle>
          <WorkspaceSetupChoice name="access" value="invite" defaultChecked>
            <WorkspaceSetupChoiceLabel>Invite only</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              People join when an admin invites them.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
          <WorkspaceSetupChoice name="access" value="domain">
            <WorkspaceSetupChoiceLabel>Anyone at larkspur.example</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              Colleagues with a verified work email can join without an invite.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
          <WorkspaceSetupChoice type="checkbox" name="sample" value="yes" defaultChecked>
            <WorkspaceSetupChoiceLabel>Add sample routes</WorkspaceSetupChoiceLabel>
            <WorkspaceSetupChoiceDescription>
              Three example routes you can delete at any time.
            </WorkspaceSetupChoiceDescription>
          </WorkspaceSetupChoice>
        </WorkspaceSetupSection>
        <WorkspaceSetupError>
          <StatusBannerTitle>Workspace not created</StatusBannerTitle>
        </WorkspaceSetupError>
        <WorkspaceSetupCreated>
          <StatusBannerTitle>Workspace created</StatusBannerTitle>
          <StatusBannerDescription>Invitations are on their way.</StatusBannerDescription>
        </WorkspaceSetupCreated>
        <WorkspaceSetupActions>
          <WorkspaceSetupSubmit>Create workspace</WorkspaceSetupSubmit>
        </WorkspaceSetupActions>
      </WorkspaceSetupMain>
      <WorkspaceSetupSummary>
        <WorkspaceSetupSummaryTitle>Summary</WorkspaceSetupSummaryTitle>
        <DescriptionList variant="stacked">
          <DescriptionListItem>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="name">Not set</WorkspaceSetupValue>
            </DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>URL</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="slug">Not set</WorkspaceSetupValue>
            </DescriptionListDetails>
          </DescriptionListItem>
          <DescriptionListItem style={{ borderBottom: 0 }}>
            <DescriptionListTerm>Invitations</DescriptionListTerm>
            <DescriptionListDetails>
              <WorkspaceSetupValue field="invites" />
            </DescriptionListDetails>
          </DescriptionListItem>
        </DescriptionList>
      </WorkspaceSetupSummary>
    </WorkspaceSetup>
  );
}
