"use client";

import { useState } from "react";
import {
  StatusBanner,
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerDismiss,
  StatusBannerIcon,
  StatusBannerTitle,
  type StatusBannerVariant,
} from "@/components/ui/uai/status-banner";

export function StatusBannerPreview({ variant = "card" }: { variant?: StatusBannerVariant }) {
  const [maintenanceOpen, setMaintenanceOpen] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <StatusBanner variant={variant} tone="error">
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Payment failed</StatusBannerTitle>
          <StatusBannerDescription>
            We couldn’t charge the card ending in 4242. Update it by June 12 to keep your seats.
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction>Update card</StatusBannerAction>
        </StatusBannerActions>
      </StatusBanner>
      <StatusBanner variant={variant} tone="success">
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>Export ready</StatusBannerTitle>
          <StatusBannerDescription>Q2 invoices.csv · 1,284 rows</StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction>Download</StatusBannerAction>
        </StatusBannerActions>
      </StatusBanner>
      {maintenanceOpen ? (
        <StatusBanner
          variant={variant}
          tone="info"
          open={maintenanceOpen}
          onOpenChange={setMaintenanceOpen}
        >
          <StatusBannerIcon />
          <StatusBannerContent>
            <StatusBannerTitle>Scheduled maintenance</StatusBannerTitle>
            <StatusBannerDescription>
              Sync pauses Saturday from 02:00 to 02:30 UTC. Edits made offline upload afterward.
            </StatusBannerDescription>
          </StatusBannerContent>
          <StatusBannerDismiss />
        </StatusBanner>
      ) : (
        <button
          type="button"
          onClick={() => setMaintenanceOpen(true)}
          style={{
            justifySelf: "start",
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
          Show maintenance notice
        </button>
      )}
    </div>
  );
}
