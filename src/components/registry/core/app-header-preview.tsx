"use client";

import { Bell, Boxes } from "lucide-react";
import { useState } from "react";
import {
  AppHeader,
  AppHeaderAction,
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderMenuButton,
  AppHeaderNav,
  AppHeaderNavItem,
  AppHeaderOverflow,
  AppHeaderSearch,
  type AppHeaderVariant,
} from "@/components/ui/uai/app-header";

export function AppHeaderPreview({ variant = "bar" }: { variant?: AppHeaderVariant }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        variant === "floating"
          ? "w-full max-w-[920px] px-3"
          : variant === "compact"
            ? "w-full max-w-[780px]"
            : "w-full max-w-[920px]"
      }
    >
      <AppHeader variant={variant} open={open} onOpenChange={setOpen}>
        <AppHeaderBrand href="#workspace">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-[var(--uai-text)] text-[var(--uai-surface)]"
            aria-hidden="true"
          >
            <Boxes className="size-3.5" strokeWidth={1.8} />
          </span>
          Atlas
        </AppHeaderBrand>

        <AppHeaderOverflow>
          <AppHeaderNav>
            <AppHeaderNavItem href="#overview" active>
              Overview
            </AppHeaderNavItem>
            <AppHeaderNavItem href="#projects">Projects</AppHeaderNavItem>
            <AppHeaderNavItem href="#reports">Reports</AppHeaderNavItem>
          </AppHeaderNav>
          <AppHeaderSearch placeholder="Search workspace" />
        </AppHeaderOverflow>

        <AppHeaderActions>
          <AppHeaderAction aria-label="Notifications">
            <Bell className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </AppHeaderAction>
          <AppHeaderAction aria-label="AC, open account menu" emphasis="primary">
            AC
          </AppHeaderAction>
        </AppHeaderActions>
        <AppHeaderMenuButton />
      </AppHeader>
    </div>
  );
}
