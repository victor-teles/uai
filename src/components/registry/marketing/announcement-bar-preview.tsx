"use client";

import { useState } from "react";
import {
  AnnouncementBar,
  AnnouncementBarAction,
  AnnouncementBarActions,
  AnnouncementBarDismiss,
  AnnouncementBarLabel,
  AnnouncementBarMessage,
  type AnnouncementBarVariant,
} from "@/components/ui/uai/announcement-bar";

const STORAGE_KEY = "uai-preview-announcement-4-2";

export function AnnouncementBarPreview({ variant = "bar" }: { variant?: AnnouncementBarVariant }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AnnouncementBar
        variant={variant}
        open={open}
        onOpenChange={setOpen}
        storageKey={STORAGE_KEY}
      >
        <AnnouncementBarLabel>New</AnnouncementBarLabel>
        <AnnouncementBarMessage>
          Shared workspaces are now included on every plan.
        </AnnouncementBarMessage>
        <AnnouncementBarActions>
          <AnnouncementBarAction href="#release-notes" onClick={(event) => event.preventDefault()}>
            Read release notes
          </AnnouncementBarAction>
          <AnnouncementBarDismiss />
        </AnnouncementBarActions>
      </AnnouncementBar>
      {open ? null : (
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setOpen(true);
          }}
          style={{
            justifySelf: "center",
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
          Show the announcement again
        </button>
      )}
    </div>
  );
}
