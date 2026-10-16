"use client";

import { CircleAlert, Download, FilePlus2, FolderOpen, Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuFooter,
  CommandMenuGroup,
  CommandMenuGroupLabel,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuShortcut,
  type CommandMenuVariant,
} from "@/components/ui/uai/command-menu";

export type CommandMenuPreviewState = "ready" | "loading" | "error";

const shimmer =
  "animate-skeleton-shimmer bg-muted bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_100%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none motion-reduce:bg-none";

/** Async sources: skeleton groups and rows at the real geometry while results load. */
function SearchingRows() {
  return (
    <div aria-hidden="true">
      {[
        ["58%", "44%"],
        ["70%", "52%", "38%"],
      ].map((rows) => (
        <div key={rows.join()} className="grid gap-px pb-0.5">
          <div className="flex h-[30px] items-end px-2.5 pb-1.5">
            <Skeleton className={`h-2 w-14 rounded-full ${shimmer}`} />
          </div>
          {rows.map((width) => (
            <div key={width} className="flex h-9 items-center gap-2.5 px-2.5">
              <Skeleton className={`size-4 rounded-[5px] ${shimmer}`} />
              <Skeleton className={`h-2.5 rounded-full ${shimmer}`} style={{ width }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CommandMenuPreview({
  variant = "panel",
  state = "ready",
}: {
  variant?: CommandMenuVariant;
  state?: CommandMenuPreviewState;
}) {
  const [lastRun, setLastRun] = useState("Nothing yet");
  const [failed, setFailed] = useState(state === "error");
  return (
    <div className="grid gap-3">
      <CommandMenu
        variant={variant}
        label="Workspace commands"
        defaultValue={state === "ready" ? "" : "invoices"}
      >
        <CommandMenuInput placeholder="Type a command or search…" />
        <CommandMenuList>
          {state === "loading" ? (
            <>
              <SearchingRows />
              <p role="status" className="sr-only">
                Searching…
              </p>
            </>
          ) : state === "error" && failed ? (
            <div
              role="alert"
              className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px]/[18px] text-muted-foreground"
            >
              <CircleAlert size={16} className="flex-none text-destructive" aria-hidden="true" />
              Search is unavailable right now.
              <Button
                variant="ghost"
                className="ml-auto h-7 rounded-full px-3 text-[12.5px] font-medium transition-[background-color,color,scale] duration-120 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] active:duration-140 active:ease-out-quint motion-reduce:active:scale-100"
                onClick={() => setFailed(false)}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <CommandMenuGroup>
                <CommandMenuGroupLabel>Create</CommandMenuGroupLabel>
                <CommandMenuItem
                  value="New document"
                  keywords={["file", "page"]}
                  onSelect={() => setLastRun("New document")}
                >
                  <FilePlus2 size={16} aria-hidden="true" />
                  New document
                  <CommandMenuShortcut>⌘N</CommandMenuShortcut>
                </CommandMenuItem>
                <CommandMenuItem
                  value="Invite teammate"
                  keywords={["member", "user"]}
                  onSelect={() => setLastRun("Invite teammate")}
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Invite teammate
                </CommandMenuItem>
              </CommandMenuGroup>
              <CommandMenuGroup>
                <CommandMenuGroupLabel>Navigate</CommandMenuGroupLabel>
                <CommandMenuItem
                  value="Open recent project"
                  onSelect={() => setLastRun("Open recent project")}
                >
                  <FolderOpen size={16} aria-hidden="true" />
                  Open recent project
                  <CommandMenuShortcut>⌘O</CommandMenuShortcut>
                </CommandMenuItem>
                <CommandMenuItem
                  value="Workspace settings"
                  keywords={["preferences"]}
                  onSelect={() => setLastRun("Workspace settings")}
                >
                  <Settings size={16} aria-hidden="true" />
                  Workspace settings
                  <CommandMenuShortcut>⌘,</CommandMenuShortcut>
                </CommandMenuItem>
                <CommandMenuItem value="Export workspace" keywords={["download"]} disabled>
                  <Download size={16} aria-hidden="true" />
                  Export workspace
                  <span className="ml-auto text-[11.5px] font-normal">Owners only</span>
                </CommandMenuItem>
              </CommandMenuGroup>
              <CommandMenuEmpty>
                Try “settings” or “invite”, or press Esc to clear.
              </CommandMenuEmpty>
            </>
          )}
        </CommandMenuList>
        <CommandMenuFooter />
      </CommandMenu>
      <p className="m-0 text-xs text-muted-foreground">Last command: {lastRun}</p>
    </div>
  );
}
