"use client";

import { type CSSProperties, useEffect, useState } from "react";
import {
  ResponseStatus,
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
  type ResponseStatusVariant,
} from "@/components/ui/uai/response-status";

const demoButton: CSSProperties = {
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
};

export function ResponseStatusPreview({ variant = "inline" }: { variant?: ResponseStatusVariant }) {
  const [status, setStatus] = useState<ResponseStatusValue>("queued");
  const [tokens, setTokens] = useState(0);
  useEffect(() => {
    if (status === "queued") {
      const timer = window.setTimeout(() => setStatus("streaming"), 1200);
      return () => window.clearTimeout(timer);
    }
    if (status !== "streaming") return;
    if (tokens >= 420) {
      setStatus("complete");
      return;
    }
    const timer = window.setTimeout(() => setTokens((count) => count + 12), 80);
    return () => window.clearTimeout(timer);
  }, [status, tokens]);
  const restart = () => {
    setTokens(0);
    setStatus("queued");
  };
  return (
    <div
      style={{ display: "grid", gap: 20, justifyItems: variant === "bar" ? "stretch" : "start" }}
    >
      <ResponseStatus variant={variant} status={status}>
        <ResponseStatusIndicator />
        <ResponseStatusLabel />
        <ResponseStatusDetail>
          {status === "queued" ? "2nd in queue" : `${tokens} tokens`}
        </ResponseStatusDetail>
        <ResponseStatusActions>
          <ResponseStatusStop onClick={() => setStatus("stopped")} />
          <ResponseStatusRetry onClick={restart} />
        </ResponseStatusActions>
      </ResponseStatus>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={restart} style={demoButton}>
          Restart
        </button>
        <button type="button" onClick={() => setStatus("failed")} style={demoButton}>
          Simulate failure
        </button>
      </div>
    </div>
  );
}
