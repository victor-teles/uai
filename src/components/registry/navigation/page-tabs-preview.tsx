"use client";

import { Plus, Settings2 } from "lucide-react";
import {
  PageTabs,
  PageTabsActions,
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
  type PageTabsVariant,
} from "@/components/ui/uai/page-tabs";

const actionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 28,
  padding: "0 12px",
  border: 0,
  borderRadius: 999,
  background: "var(--uai-surface-raised)",
  color: "var(--uai-text)",
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 500,
  cursor: "pointer",
} as const;

export function PageTabsPreview({ variant = "underline" }: { variant?: PageTabsVariant }) {
  return (
    <PageTabs variant={variant} defaultValue="open">
      <PageTabsBar>
        <PageTabsList aria-label="Issues">
          <PageTabsTab value="open">
            Open <PageTabsCount>24</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="review">
            In review <PageTabsCount>6</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="blocked">
            Blocked <PageTabsCount>2</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="closed">Closed</PageTabsTab>
          <PageTabsTab value="archived" disabled>
            Archived
          </PageTabsTab>
        </PageTabsList>
        <PageTabsActions>
          <button
            type="button"
            aria-label="View options"
            style={{
              ...actionStyle,
              padding: 0,
              width: 28,
              justifyContent: "center",
              borderRadius: 8,
              background: "transparent",
              color: "var(--uai-muted)",
            }}
          >
            <Settings2 size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            style={{
              ...actionStyle,
              background: "var(--uai-accent)",
              color: "var(--uai-accent-foreground)",
            }}
          >
            <Plus size={14} aria-hidden="true" />
            New issue
          </button>
        </PageTabsActions>
      </PageTabsBar>
      <PageTabsPanel value="open">24 open issues across checkout and onboarding.</PageTabsPanel>
      <PageTabsPanel value="review">6 issues are waiting for design review.</PageTabsPanel>
      <PageTabsPanel value="blocked">2 issues are blocked by the payments migration.</PageTabsPanel>
      <PageTabsPanel value="closed">Closed issues from the last 30 days.</PageTabsPanel>
    </PageTabs>
  );
}
