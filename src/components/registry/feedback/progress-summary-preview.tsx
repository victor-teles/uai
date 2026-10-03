"use client";

import { useEffect, useState } from "react";
import {
  ProgressSummary,
  ProgressSummaryActions,
  ProgressSummaryBar,
  ProgressSummaryCancel,
  ProgressSummaryHeader,
  ProgressSummaryStat,
  ProgressSummaryStatLabel,
  ProgressSummaryStats,
  type ProgressSummaryStatus,
  ProgressSummaryStatusText,
  ProgressSummaryStatValue,
  ProgressSummaryTitle,
  ProgressSummaryValue,
  type ProgressSummaryVariant,
} from "@/components/ui/uai/progress-summary";

const TOTAL = 240;

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
}

export function ProgressSummaryPreview({ variant = "card" }: { variant?: ProgressSummaryVariant }) {
  const [done, setDone] = useState(96);
  const [elapsed, setElapsed] = useState(84);
  const [cancelled, setCancelled] = useState(false);
  const status: ProgressSummaryStatus = cancelled
    ? "cancelled"
    : done === TOTAL
      ? "complete"
      : "running";

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setElapsed((seconds) => seconds + 1);
      setDone((count) => Math.min(count + 2, TOTAL));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const remaining = TOTAL - done;
  return (
    <ProgressSummary variant={variant} value={done} max={TOTAL} status={status}>
      <ProgressSummaryHeader>
        <ProgressSummaryTitle>Importing contacts from HubSpot</ProgressSummaryTitle>
        <ProgressSummaryStatusText>
          {status === "running" ? `${done} of ${TOTAL} records` : undefined}
        </ProgressSummaryStatusText>
      </ProgressSummaryHeader>
      <ProgressSummaryValue />
      <ProgressSummaryBar />
      <ProgressSummaryStats>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Elapsed</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>{formatSeconds(elapsed)}</ProgressSummaryStatValue>
        </ProgressSummaryStat>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Remaining</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>{remaining} records</ProgressSummaryStatValue>
        </ProgressSummaryStat>
        <ProgressSummaryStat>
          <ProgressSummaryStatLabel>Skipped</ProgressSummaryStatLabel>
          <ProgressSummaryStatValue>3 duplicates</ProgressSummaryStatValue>
        </ProgressSummaryStat>
      </ProgressSummaryStats>
      <ProgressSummaryActions>
        {status === "running" ? (
          <ProgressSummaryCancel onClick={() => setCancelled(true)}>
            Cancel import
          </ProgressSummaryCancel>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDone(0);
              setElapsed(0);
              setCancelled(false);
            }}
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
            Run again
          </button>
        )}
      </ProgressSummaryActions>
    </ProgressSummary>
  );
}
