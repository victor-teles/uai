"use client";

import { Check, Copy } from "lucide-react";
import { type ComponentProps, useMemo, useState } from "react";

import { cn } from "@/lib/uai-utils";

export type InstallCommandProps = ComponentProps<"div"> & {
  item: string;
  baseUrl?: string;
  compact?: boolean;
};

export function InstallCommand({
  item,
  baseUrl = process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000/r",
  compact = false,
  className,
  ...props
}: InstallCommandProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const command = useMemo(() => `bunx shadcn@latest add ${baseUrl}/${item}.json`, [baseUrl, item]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div
      className={cn("uai-install-command", compact && "uai-install-command--compact", className)}
      {...props}
    >
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label="Copy install command">
        {copyState === "copied" ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied"
          ? "Install command copied."
          : copyState === "failed"
            ? "Copy failed. Select the command and copy it manually."
            : ""}
      </span>
    </div>
  );
}
