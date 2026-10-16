"use client";

import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateNote,
  EmptyStateTitle,
  type EmptyStateVariant,
} from "@/components/ui/uai/empty-state";

export function EmptyStatePreview({ variant = "page" }: { variant?: EmptyStateVariant }) {
  const [started, setStarted] = useState(false);
  const page = variant === "page";

  return (
    <div
      className={
        page
          ? "w-full max-w-[760px]"
          : variant === "compact"
            ? "w-full max-w-[360px]"
            : "w-full max-w-[420px]"
      }
    >
      <EmptyState variant={variant}>
        <EmptyStateMedia aria-hidden="true">
          {page ? "404" : <FolderOpen strokeWidth={1.7} />}
        </EmptyStateMedia>
        <EmptyStateContent>
          <EmptyStateHeader>
            <EmptyStateTitle>{page ? "Page not found" : "No projects yet"}</EmptyStateTitle>
            <EmptyStateDescription>
              {page
                ? "The page you’re looking for may have moved or no longer exists."
                : "Create a project to organize files, feedback, and release notes."}
            </EmptyStateDescription>
          </EmptyStateHeader>
          <EmptyStateActions>
            {page ? (
              <>
                <EmptyStateAction href="/">
                  <ArrowLeft className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                  Back to home
                </EmptyStateAction>
                <EmptyStateAction emphasis="secondary" href="#components">
                  Browse components
                </EmptyStateAction>
              </>
            ) : (
              <EmptyStateAction disabled={started} onClick={() => setStarted(true)}>
                <Plus className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
                {started ? "Creation started" : "Create project"}
              </EmptyStateAction>
            )}
          </EmptyStateActions>
          <EmptyStateNote role={!page && started ? "status" : undefined}>
            {page
              ? "Error code 404 · Check the address and try again."
              : started
                ? "Project setup is ready for the consuming application."
                : "You can invite collaborators after setup."}
          </EmptyStateNote>
        </EmptyStateContent>
      </EmptyState>
    </div>
  );
}
