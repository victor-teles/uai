"use client";

import { useState } from "react";
import {
  SettingsPage,
  SettingsPageConfirm,
  SettingsPageDescription,
  SettingsPageField,
  SettingsPageHeader,
  SettingsPageSaveBar,
  SettingsPageSection,
  SettingsPageSectionContent,
  SettingsPageSectionDescription,
  SettingsPageSectionHeader,
  SettingsPageSectionTitle,
  SettingsPageTitle,
  type SettingsPageVariant,
} from "@/components/uai/settings-page";
import {
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogInput,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
} from "@/components/ui/uai/confirmation-dialog";
import {
  FormFieldDescription,
  FormFieldError,
  FormFieldInput,
  FormFieldLabel,
} from "@/components/ui/uai/form-field";
import {
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  UnsavedChangesBarSave,
} from "@/components/ui/uai/unsaved-changes-bar";

const initial = { name: "Northwind Goods", email: "support@northwind.example" };

export function SettingsPagePreview({ variant = "stacked" }: { variant?: SettingsPageVariant }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deleted, setDeleted] = useState(false);
  const dirty = draft.name !== saved.name || draft.email !== saved.email;
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);
  const nameInvalid = draft.name.trim().length === 0;

  function save() {
    setStatus("saving");
    window.setTimeout(() => {
      setSaved(draft);
      setStatus("idle");
    }, 900);
  }

  return (
    <SettingsPage variant={variant}>
      <SettingsPageHeader>
        <SettingsPageTitle>Workspace settings</SettingsPageTitle>
        <SettingsPageDescription>
          These details appear on invoices, receipts, and customer emails.
        </SettingsPageDescription>
      </SettingsPageHeader>
      <SettingsPageSection>
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>General</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>
            The name and contact address customers see.
          </SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <SettingsPageField
            required
            invalid={nameInvalid}
            value={draft.name}
            onValueChange={(name) => setDraft({ ...draft, name })}
          >
            <FormFieldLabel>Workspace name</FormFieldLabel>
            <FormFieldInput autoComplete="organization" />
            <FormFieldError>Enter a workspace name.</FormFieldError>
          </SettingsPageField>
          <SettingsPageField
            required
            invalid={emailInvalid}
            value={draft.email}
            onValueChange={(email) => setDraft({ ...draft, email })}
          >
            <FormFieldLabel>Support email</FormFieldLabel>
            <FormFieldInput type="email" autoComplete="email" />
            <FormFieldDescription>Replies to order emails go here.</FormFieldDescription>
            <FormFieldError>Enter an email address such as help@northwind.example.</FormFieldError>
          </SettingsPageField>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSection tone="danger">
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>Delete workspace</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>
            {deleted
              ? "Workspace scheduled for deletion. Contact support within 30 days to restore it."
              : "Removes every order, product, and team member. This cannot be undone."}
          </SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <SettingsPageConfirm>
            <div>
              <ConfirmationDialogTrigger disabled={deleted}>
                Delete workspace
              </ConfirmationDialogTrigger>
            </div>
            <ConfirmationDialogContent>
              <ConfirmationDialogTitle>Delete Northwind Goods?</ConfirmationDialogTitle>
              <ConfirmationDialogDescription>
                <p style={{ margin: 0 }}>This permanently removes:</p>
                <ConfirmationDialogImpact>
                  <li>4,812 orders and their invoices</li>
                  <li>312 products and 1,240 images</li>
                  <li>Access for 9 team members</li>
                </ConfirmationDialogImpact>
              </ConfirmationDialogDescription>
              <ConfirmationDialogInput match="northwind-goods" />
              <ConfirmationDialogActions>
                <ConfirmationDialogCancel />
                <ConfirmationDialogConfirm onClick={() => setDeleted(true)}>
                  Delete workspace
                </ConfirmationDialogConfirm>
              </ConfirmationDialogActions>
            </ConfirmationDialogContent>
          </SettingsPageConfirm>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSaveBar
        dirty={dirty}
        status={status}
        warnBeforeUnload={false}
        onSave={save}
        onDiscard={() => setDraft(saved)}
      >
        <UnsavedChangesBarMessage>
          {status === "saving"
            ? "Saving workspace settings…"
            : nameInvalid || emailInvalid
              ? "Fix the highlighted fields before saving."
              : "You have unsaved changes."}
        </UnsavedChangesBarMessage>
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave disabled={nameInvalid || emailInvalid} />
        </UnsavedChangesBarActions>
      </SettingsPageSaveBar>
    </SettingsPage>
  );
}
