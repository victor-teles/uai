"use client";

import { CircleAlert } from "lucide-react";
import { useState } from "react";
import {
  SettingsPage,
  SettingsPageConfirm,
  SettingsPageDescription,
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

type Settings = { name: string; email: string; url: string };
const saved0: Settings = {
  name: "Northwind Goods",
  email: "support@northwind.example",
  url: "northwind-goods-co",
};
// Opens dirty and invalid, as in the design mockup.
const draft0: Settings = { ...saved0, name: "Northwind Goods Co.", url: "northwind" };
const taken = ["northwind", "northwind-co"];

export function SettingsPagePreview({ variant = "stacked" }: { variant?: SettingsPageVariant }) {
  const [saved, setSaved] = useState(saved0);
  const [draft, setDraft] = useState(draft0);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const edited = {
    name: draft.name !== saved.name,
    email: draft.email !== saved.email,
    url: draft.url !== saved.url,
  };
  const changes = Object.values(edited).filter(Boolean).length;
  const invalid = {
    name: draft.name.trim().length === 0,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email),
    url: !/^[a-z0-9-]+$/.test(draft.url) || (edited.url && taken.includes(draft.url)),
  };
  const invalidCount = Object.values(invalid).filter(Boolean).length;

  function save() {
    setStatus("saving");
    // The first save fails so the preview shows recovery; Retry then succeeds.
    window.setTimeout(() => {
      if (attempts === 0) return setStatus("error");
      setSaved(draft);
      setStatus("idle");
    }, 900);
    setAttempts(attempts + 1);
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
            edited={edited.name}
            invalid={invalid.name}
            value={draft.name}
            onValueChange={(name) => setDraft({ ...draft, name })}
          >
            <FormFieldLabel>
              Workspace name <SettingsPageFieldEdited />
            </FormFieldLabel>
            <FormFieldInput autoComplete="organization" />
            <FormFieldError>
              <CircleAlert aria-hidden="true" />
              Enter a workspace name.
            </FormFieldError>
          </SettingsPageField>
          <SettingsPageField
            required
            edited={edited.email}
            invalid={invalid.email}
            value={draft.email}
            onValueChange={(email) => setDraft({ ...draft, email })}
          >
            <FormFieldLabel>
              Support email <SettingsPageFieldEdited />
            </FormFieldLabel>
            <FormFieldInput type="email" autoComplete="email" />
            <FormFieldDescription>Replies to order emails go here.</FormFieldDescription>
            <FormFieldError>
              <CircleAlert aria-hidden="true" />
              Enter an email address such as help@northwind.example.
            </FormFieldError>
          </SettingsPageField>
          <SettingsPageField
            required
            edited={edited.url}
            invalid={invalid.url}
            value={draft.url}
            onValueChange={(url) => setDraft({ ...draft, url })}
          >
            <FormFieldLabel>
              Workspace URL <SettingsPageFieldEdited />
            </FormFieldLabel>
            <FormFieldInput autoComplete="off" spellCheck={false} />
            <FormFieldDescription>uai.app/{draft.url || "your-workspace"}</FormFieldDescription>
            <FormFieldError>
              <CircleAlert aria-hidden="true" />
              {taken.includes(draft.url)
                ? "That URL is taken. Try northwind-goods."
                : "Use lowercase letters, numbers, and dashes."}
            </FormFieldError>
          </SettingsPageField>
        </SettingsPageSectionContent>
      </SettingsPageSection>
      <SettingsPageSection tone="danger">
        <SettingsPageSectionHeader>
          <SettingsPageSectionTitle>Danger zone</SettingsPageSectionTitle>
          <SettingsPageSectionDescription>
            Permanent actions. We ask you to confirm first.
          </SettingsPageSectionDescription>
        </SettingsPageSectionHeader>
        <SettingsPageSectionContent>
          <div>
            <strong>Delete workspace</strong>
            <p>
              {deleted
                ? "Workspace scheduled for deletion. Contact support within 30 days to restore it."
                : "Removes every order, product, and team member. This can’t be undone."}
            </p>
          </div>
          <SettingsPageConfirm>
            <ConfirmationDialogTrigger disabled={deleted}>
              Delete workspace…
            </ConfirmationDialogTrigger>
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
        dirty={changes > 0}
        status={status}
        warnBeforeUnload={false}
        onSave={save}
        onDiscard={() => {
          setDraft(saved);
          setStatus("idle");
          setBlocked(false);
        }}
      >
        <UnsavedChangesBarMessage>
          {status === "error" ? (
            "Couldn’t save. Your changes are still here."
          ) : blocked && invalidCount > 0 ? (
            `Fix ${invalidCount} ${invalidCount === 1 ? "field" : "fields"} to save`
          ) : changes === 0 ? (
            // The bar stays up briefly after a save to confirm it; there is nothing to count.
            "All changes saved"
          ) : (
            <span
              key={changes}
              className="tabular-nums motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-[3px] motion-safe:duration-200 motion-safe:ease-out-quint"
            >
              {changes} unsaved {changes === 1 ? "change" : "changes"}
            </span>
          )}
        </UnsavedChangesBarMessage>
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave onClick={() => setBlocked(invalidCount > 0)}>
            {status === "error" ? "Retry" : "Save changes"}
          </UnsavedChangesBarSave>
        </UnsavedChangesBarActions>
      </SettingsPageSaveBar>
    </SettingsPage>
  );
}
