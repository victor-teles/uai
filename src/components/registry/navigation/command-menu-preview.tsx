"use client";

import { FilePlus2, FolderOpen, Moon, Settings, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuGroupLabel,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuShortcut,
  type CommandMenuVariant,
} from "@/components/ui/uai/command-menu";

export function CommandMenuPreview({ variant = "panel" }: { variant?: CommandMenuVariant }) {
  const [lastRun, setLastRun] = useState("Nothing yet");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CommandMenu variant={variant} label="Workspace commands">
        <CommandMenuInput placeholder="Type a command or search…" />
        <CommandMenuList>
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
            <CommandMenuItem value="Switch to dark theme" disabled>
              <Moon size={16} aria-hidden="true" />
              Switch to dark theme
            </CommandMenuItem>
          </CommandMenuGroup>
          <CommandMenuEmpty />
        </CommandMenuList>
      </CommandMenu>
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>Last command: {lastRun}</p>
    </div>
  );
}
