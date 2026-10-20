"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ContextMeter,
  ContextMeterActions,
  ContextMeterBar,
  ContextMeterCompactAction,
  ContextMeterCompacting,
  ContextMeterContent,
  ContextMeterFreed,
  ContextMeterHeader,
  ContextMeterHint,
  ContextMeterLegend,
  ContextMeterStatus,
  type ContextMeterStatus as ContextMeterStatusValue,
  ContextMeterSummary,
  ContextMeterTitle,
  ContextMeterTrigger,
  ContextMeterUndoAction,
  type ContextMeterVariant,
} from "@/components/ui/uai/context-meter";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerModelSelect,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";

type Scenario = "normal" | "warning" | "full" | "empty";

const conversation: Record<Scenario, number> = {
  normal: 44_700,
  warning: 113_600,
  full: 138_000,
  empty: 0,
};

function segmentsFor(scenario: Scenario, conversationTokens: number) {
  if (scenario === "empty") return [];
  const files = scenario === "normal" ? 18_700 : 41_600;
  return [
    { id: "system", label: "System prompt", tokens: 3_200 },
    { id: "tools", label: "Tools", tokens: 9_800 },
    { id: "files", label: "Files", tokens: files },
    { id: "conversation", label: "Conversation", tokens: conversationTokens },
  ];
}

const models = [
  { id: "your-model", label: "Your model" },
  { id: "fast", label: "Fast" },
] as const;

export function ContextMeterPreview({ variant = "bar" }: { variant?: ContextMeterVariant }) {
  const [scenario, setScenario] = useState<Scenario>("warning");
  const [status, setStatus] = useState<ContextMeterStatusValue>("idle");
  const freed = 61_800;
  const conversationTokens = conversation[scenario] - (status === "compacted" ? freed : 0);
  const segments = segmentsFor(scenario, conversationTokens);
  const used = segments.reduce((sum, segment) => sum + segment.tokens, 0);

  // Your agent summarizes; the meter only shows it happening.
  useEffect(() => {
    if (status !== "compacting") return;
    const timer = window.setTimeout(() => setStatus("compacted"), 1600);
    return () => window.clearTimeout(timer);
  }, [status]);

  const meter = (
    <ContextMeter
      variant={variant}
      used={used}
      limit={200_000}
      segments={segments}
      autoCompactAt={0.9}
      status={status}
      freed={freed}
      onCompact={
        scenario === "normal" || scenario === "empty" ? undefined : () => setStatus("compacting")
      }
      onUndoCompact={() => setStatus("idle")}
    >
      <ContextMeterTrigger />
      <ContextMeterContent>
        <ContextMeterHeader>
          <ContextMeterTitle />
          <ContextMeterStatus />
        </ContextMeterHeader>
        <ContextMeterSummary />
        <ContextMeterBar />
        <ContextMeterLegend />
        <ContextMeterActions>
          <ContextMeterHint />
          <ContextMeterCompacting>Summarizing 38 earlier turns…</ContextMeterCompacting>
          <ContextMeterFreed>38 turns → 1 summary</ContextMeterFreed>
          <ContextMeterCompactAction />
          <ContextMeterUndoAction />
        </ContextMeterActions>
      </ContextMeterContent>
    </ContextMeter>
  );

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <ToggleGroup
        type="single"
        aria-label="Context state"
        value={scenario}
        onValueChange={(next) => {
          if (!next) return;
          setScenario(next as Scenario);
          setStatus("idle");
        }}
        className="flex-wrap justify-self-center"
      >
        <ToggleGroupItem value="normal">38%</ToggleGroupItem>
        <ToggleGroupItem value="warning">84%</ToggleGroupItem>
        <ToggleGroupItem value="full">96%</ToggleGroupItem>
        <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
      </ToggleGroup>
      {variant === "bar" ? (
        <div style={{ width: "100%", maxWidth: 340 }}>{meter}</div>
      ) : (
        <div style={{ width: "100%", minHeight: 400, display: "grid", alignContent: "end" }}>
          <PromptComposer variant={variant === "compact" ? "compact" : "rounded"}>
            <PromptComposerInput
              placeholder="Ask about the Kiln 4.2 build cache…"
              aria-label="Message"
            />
            <PromptComposerActions>
              {meter}
              <PromptComposerModelSelect models={models} />
              <PromptComposerSubmit />
            </PromptComposerActions>
          </PromptComposer>
        </div>
      )}
    </div>
  );
}
