"use client";

import { useEffect, useRef, useState } from "react";

import { ApprovalCard } from "@/components/ui/uai/approval-card";
import {
  PROMPT_COMPOSER_VARIANTS,
  PromptComposer,
  type PromptComposerVariant,
} from "@/components/ui/uai/prompt-composer";
import { TaskList } from "@/components/ui/uai/task-list";
import { Thinking } from "@/components/ui/uai/thinking";
import { TaskFlow, type TaskFlowData } from "@/registry/uai/blocks/task-flow";

import type { RegistryItemId } from "./catalog";
import { PreviewStage, SegmentedControl } from "./preview-chrome";

const tasks = [
  {
    id: "interface",
    label: "Review the component interface",
    status: "complete" as const,
    detail: "Props and public behavior",
  },
  {
    id: "keyboard",
    label: "Check keyboard interaction",
    status: "active" as const,
    detail: "Focus and submit paths",
  },
  {
    id: "registry",
    label: "Build the registry item",
    status: "pending" as const,
    detail: "Files and dependencies",
  },
];

const taskFlowData: TaskFlowData = {
  thinking: {
    summary: "Reviewing the requested component and its interaction contract.",
    duration: "1.8s",
    steps: [
      "Read the public interface.",
      "Check the required states.",
      "Prepare a source-owned change.",
    ],
  },
  approval: {
    title: "Add this component to the registry?",
    description: "Review the source change before it becomes available to consumers.",
  },
  tasks,
  composer: {
    placeholder: "Describe an adaptation…",
    modelLabel: "Your model",
  },
};

const variantCopy: Record<PromptComposerVariant, { label: string; scene: string }> = {
  rounded: { label: "Rounded", scene: "Floating card" },
  pill: { label: "Pill", scene: "Capsule" },
  ghost: { label: "Ghost", scene: "Dock" },
  compact: { label: "Compact", scene: "Sidebar" },
};

function useSwapFlag(token: string) {
  const [swapping, setSwapping] = useState(false);
  const previousToken = useRef(token);

  useEffect(() => {
    if (previousToken.current === token) return;
    previousToken.current = token;
    setSwapping(true);
    const timer = window.setTimeout(() => setSwapping(false), 160);
    return () => window.clearTimeout(timer);
  }, [token]);

  return swapping;
}

function PromptComposerPreview() {
  const [variant, setVariant] = useState<PromptComposerVariant>("rounded");
  const [submitted, setSubmitted] = useState(false);
  const swapping = useSwapFlag(variant);
  const copy = variantCopy[variant];

  return (
    <PreviewStage
      label={copy.scene}
      status={submitted ? <span role="status">Submitted</span> : null}
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Composer variant"
          value={variant}
          onChange={(id) => setVariant(id as PromptComposerVariant)}
          options={PROMPT_COMPOSER_VARIANTS.map((option) => ({
            id: option,
            label: variantCopy[option].label,
          }))}
        />
      }
    >
      <div className="uai-prompt-frame" data-scene={variant}>
        <div className={variant === "ghost" ? "uai-prompt-dock" : undefined}>
          <PromptComposer
            placeholder="Write a message…"
            modelLabel="Your model"
            variant={variant}
            models={[
              { id: "your-model", label: "Your model" },
              { id: "fast", label: "Fast" },
              { id: "precise", label: "Precise" },
            ]}
            onSubmit={() => setSubmitted(true)}
          />
        </div>
      </div>
    </PreviewStage>
  );
}

function ThinkingPreview() {
  const [mode, setMode] = useState<"expanded" | "collapsed">("expanded");
  const swapping = useSwapFlag(mode);

  return (
    <PreviewStage
      contentClassName="uai-preview-narrow"
      swapping={swapping}
      switcher={
        <SegmentedControl
          ariaLabel="Thinking state"
          value={mode}
          onChange={(id) => setMode(id as "expanded" | "collapsed")}
          options={[
            { id: "expanded", label: "Expanded" },
            { id: "collapsed", label: "Collapsed" },
          ]}
        />
      }
    >
      {mode === "expanded" ? (
        <Thinking
          key="expanded"
          summary="Checking the component interface and useful states."
          duration="1.8s"
          steps={[
            "Read the public props.",
            "Check keyboard behavior.",
            "Prepare the registry files.",
          ]}
        />
      ) : (
        <Thinking
          key="collapsed"
          summary="The reasoning stays available without taking over the response."
          duration="1.8s"
          defaultOpen={false}
        />
      )}
    </PreviewStage>
  );
}

export function RegistryPreview({ itemId }: { itemId: RegistryItemId }) {
  if (itemId === "prompt-composer") return <PromptComposerPreview />;

  if (itemId === "thinking") return <ThinkingPreview />;

  if (itemId === "approval-card") {
    return (
      <PreviewStage contentClassName="uai-preview-medium" label="Pending decision">
        <ApprovalCard
          title="Publish the generated summary?"
          description="Review the draft before it becomes visible to your team."
        />
      </PreviewStage>
    );
  }

  if (itemId === "task-list") {
    return (
      <PreviewStage contentClassName="uai-preview-medium" label="Mixed progress">
        <TaskList tasks={tasks} />
      </PreviewStage>
    );
  }

  return (
    <PreviewStage contentClassName="uai-preview-flow" label="Complete workflow">
      <TaskFlow data={taskFlowData} />
    </PreviewStage>
  );
}
