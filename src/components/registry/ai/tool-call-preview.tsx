"use client";

import { useState } from "react";
import {
  ToolCall,
  ToolCallContent,
  ToolCallError,
  ToolCallHeader,
  ToolCallInput,
  ToolCallName,
  ToolCallOutput,
  ToolCallStatus,
  type ToolCallStatus as ToolCallStatusValue,
  ToolCallSummary,
  ToolCallTrigger,
  type ToolCallVariant,
} from "@/components/ui/uai/tool-call";

export function ToolCallPreview({ variant = "card" }: { variant?: ToolCallVariant }) {
  const [status, setStatus] = useState<ToolCallStatusValue>("running");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ToolCall variant={variant} status="success" defaultOpen>
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>search_docs</ToolCallName>
            <ToolCallSummary>“refund window for annual plans”</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus>0.8s</ToolCallStatus>
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{`{ "query": "refund window for annual plans", "limit": 3 }`}</ToolCallInput>
          <ToolCallOutput>{`3 results
1. Billing › Refunds — "Annual plans are refundable within 30 days."
2. Billing › Downgrades
3. Legal › Terms of service §7`}</ToolCallOutput>
        </ToolCallContent>
      </ToolCall>
      <ToolCall variant={variant} status={status}>
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>create_refund</ToolCallName>
            <ToolCallSummary>INV-20931 · $1,188.00</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus />
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{`{ "invoice": "INV-20931", "amount": 118800, "currency": "usd" }`}</ToolCallInput>
          <ToolCallOutput>
            {status === "success"
              ? `{ "refund": "re_3PqL", "status": "pending" }`
              : "Waiting for Stripe…"}
          </ToolCallOutput>
          <ToolCallError>
            Stripe rejected the request: the charge was already refunded.
          </ToolCallError>
        </ToolCallContent>
      </ToolCall>
      <ToolCall variant={variant} status="queued">
        <ToolCallHeader>
          <ToolCallTrigger>
            <ToolCallName>send_email</ToolCallName>
            <ToolCallSummary>Refund confirmation to maya@northwind.co</ToolCallSummary>
          </ToolCallTrigger>
          <ToolCallStatus />
        </ToolCallHeader>
        <ToolCallContent>
          <ToolCallInput>{`{ "template": "refund_confirmation", "to": "maya@northwind.co" }`}</ToolCallInput>
        </ToolCallContent>
      </ToolCall>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 8,
          fontSize: 12,
          color: "var(--uai-muted)",
        }}
      >
        Refund result
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ToolCallStatusValue)}
        >
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="success">Succeeded</option>
          <option value="error">Failed</option>
        </select>
      </label>
    </div>
  );
}
