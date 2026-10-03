"use client";

import { useState } from "react";
import {
  ConfirmationDialog,
  ConfirmationDialogActions,
  ConfirmationDialogCancel,
  ConfirmationDialogConfirm,
  ConfirmationDialogContent,
  ConfirmationDialogDescription,
  ConfirmationDialogImpact,
  ConfirmationDialogInput,
  ConfirmationDialogTitle,
  ConfirmationDialogTrigger,
  type ConfirmationDialogVariant,
} from "@/components/ui/uai/confirmation-dialog";

export function ConfirmationDialogPreview({
  variant = "centered",
}: {
  variant?: ConfirmationDialogVariant;
}) {
  const [deleted, setDeleted] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <ConfirmationDialog variant={variant}>
        <ConfirmationDialogTrigger disabled={deleted}>Delete project</ConfirmationDialogTrigger>
        <ConfirmationDialogContent>
          <ConfirmationDialogTitle>Delete “acme-web”?</ConfirmationDialogTitle>
          <ConfirmationDialogDescription>
            <p style={{ margin: 0 }}>This permanently removes the project for everyone.</p>
            <ConfirmationDialogImpact>
              <li>142 deployments and their preview URLs</li>
              <li>18 environment variables</li>
              <li>The acme.dev domain assignment</li>
            </ConfirmationDialogImpact>
          </ConfirmationDialogDescription>
          <ConfirmationDialogInput match="acme-web" />
          <ConfirmationDialogActions>
            <ConfirmationDialogCancel>Keep project</ConfirmationDialogCancel>
            <ConfirmationDialogConfirm onClick={() => setDeleted(true)}>
              Delete project
            </ConfirmationDialogConfirm>
          </ConfirmationDialogActions>
        </ConfirmationDialogContent>
      </ConfirmationDialog>
      <p role="status" style={{ margin: 0, fontSize: 12, color: "var(--uai-subtle)" }}>
        {deleted ? "acme-web was deleted." : "acme-web · 142 deployments"}
      </p>
      {deleted ? (
        <button
          type="button"
          onClick={() => setDeleted(false)}
          style={{
            height: 28,
            padding: "0 12px",
            border: 0,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Restore preview
        </button>
      ) : null}
    </div>
  );
}
