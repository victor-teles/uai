"use client";

import { useEffect, useState } from "react";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  UnsavedChangesBar,
  UnsavedChangesBarActions,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  UnsavedChangesBarSave,
  type UnsavedChangesBarVariant,
} from "@/components/ui/uai/unsaved-changes-bar";

export function UnsavedChangesBarPreview({
  variant = "bar",
}: {
  variant?: UnsavedChangesBarVariant;
}) {
  const [saved, setSaved] = useState("Product workspace");
  const [draft, setDraft] = useState("Product studio");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [fail, setFail] = useState(false);
  const dirty = draft !== saved;
  useEffect(() => {
    if (status !== "saving") return;
    const timer = setTimeout(() => {
      if (fail) setStatus("error");
      else {
        setSaved(draft);
        setStatus("idle");
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [status, fail, draft]);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <FormField value={draft} onValueChange={setDraft} disabled={status === "saving"}>
        <FormFieldLabel>Workspace name</FormFieldLabel>
        <FormFieldInput name="workspace" />
      </FormField>
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        <input
          type="checkbox"
          checked={fail}
          disabled={status === "saving"}
          onChange={(event) => setFail(event.target.checked)}
        />
        Simulate a save error
      </label>
      <UnsavedChangesBar
        variant={variant}
        dirty={dirty}
        status={status}
        warnBeforeUnload={false}
        onSave={() => setStatus("saving")}
        onDiscard={() => {
          setDraft(saved);
          setStatus("idle");
        }}
      >
        <UnsavedChangesBarMessage />
        <UnsavedChangesBarActions>
          <UnsavedChangesBarDiscard />
          <UnsavedChangesBarSave />
        </UnsavedChangesBarActions>
      </UnsavedChangesBar>
      {!dirty && (
        <p role="status" style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
          All changes saved. Edit the name to try again.
        </p>
      )}
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
        Local demo. Page-exit warnings are disabled in this preview.
      </p>
    </div>
  );
}
