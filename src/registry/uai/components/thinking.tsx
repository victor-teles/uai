"use client";

import { ChevronDown, LoaderCircle, Sparkles } from "lucide-react";
import { type ComponentProps, useId, useState } from "react";

import { cn } from "@/lib/uai-utils";

export type ThinkingProps = Omit<ComponentProps<"section">, "title"> & {
  title?: string;
  summary?: string;
  duration?: string;
  steps?: readonly string[];
  defaultOpen?: boolean;
};

export function Thinking({
  title = "Thinking",
  summary = "Review the steps behind this response.",
  duration,
  steps = [],
  defaultOpen = true,
  className,
  ...props
}: ThinkingProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)]",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left outline-none transition-colors hover:bg-[var(--uai-surface-raised)] focus-visible:ring-2 focus-visible:ring-[var(--uai-accent)] focus-visible:ring-inset"
        aria-controls={contentId}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
          {open ? (
            <LoaderCircle
              className="size-4 text-[var(--uai-accent)] motion-safe:animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Sparkles className="size-4 text-[var(--uai-muted)]" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{title}</span>
          <span className="block truncate text-xs text-[var(--uai-muted)]">{summary}</span>
        </span>
        {duration ? (
          <span className="rounded-full border border-[var(--uai-border)] px-2 py-0.5 font-mono text-[11px] tabular-nums text-[var(--uai-muted)]">
            {duration}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-4 text-[var(--uai-muted)] transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div id={contentId} className="border-t border-[var(--uai-border)] px-4 py-3">
          {steps.length > 0 ? (
            <ol className="space-y-2 text-sm text-[var(--uai-muted)]">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--uai-border-strong)]" />
                  <span>
                    <span className="sr-only">Step {index + 1}: </span>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[var(--uai-muted)]">No reasoning steps are available.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
