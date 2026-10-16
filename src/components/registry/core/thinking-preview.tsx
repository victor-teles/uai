"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  type ThinkingStatus,
  ThinkingTrigger,
  type ThinkingVariant,
} from "@/components/ui/uai/thinking";

const copy: Record<ThinkingStatus, { summary: string; duration: string }> = {
  thinking: { summary: "Checking the component interface and useful states.", duration: "1.8s" },
  complete: { summary: "The component contract is ready to review.", duration: "3.4s" },
  error: { summary: "The registry build stopped before validation.", duration: "2.6s" },
};

export function ThinkingPreview({ variant = "card" }: { variant?: ThinkingVariant }) {
  const [status, setStatus] = useState<ThinkingStatus>("thinking");

  return (
    <div className="grid w-full gap-3">
      <ToggleGroup
        type="single"
        aria-label="Thinking status"
        value={status}
        onValueChange={(next) => next && setStatus(next as ThinkingStatus)}
        className="justify-self-center"
      >
        <ToggleGroupItem value="thinking">Live</ToggleGroupItem>
        <ToggleGroupItem value="complete">Complete</ToggleGroupItem>
        <ToggleGroupItem value="error">Error</ToggleGroupItem>
      </ToggleGroup>
      <Thinking variant={variant} status={status}>
        <ThinkingTrigger summary={copy[status].summary} duration={copy[status].duration} />
        <ThinkingContent>
          <ThinkingActivity type="search" query="Thinking component accessibility" elapsed="0.3s">
            Found the component contract
          </ThinkingActivity>
          <ThinkingActivity
            type="file"
            path="src/registry/uai/components/thinking.tsx"
            elapsed="0.8s"
          >
            Read the public interface
          </ThinkingActivity>
          <ThinkingActivity
            type="tool"
            tool="bun run registry:build"
            elapsed={status === "thinking" ? undefined : status === "complete" ? "3.4s" : "2.6s"}
          >
            {status === "error" ? "Registry build failed" : "Checked the registry output"}
          </ThinkingActivity>
        </ThinkingContent>
      </Thinking>
    </div>
  );
}
