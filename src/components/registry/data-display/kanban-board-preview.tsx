"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCardMeta,
  KanbanBoardCards,
  KanbanBoardCardTitle,
  KanbanBoardColumn,
  KanbanBoardColumnCount,
  KanbanBoardColumnEmpty,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  type KanbanBoardValue,
  type KanbanBoardVariant,
} from "@/components/ui/uai/kanban-board";

const columns = { backlog: "Backlog", progress: "In progress", review: "In review" };
const tags = {
  Security: "bg-destructive/14 text-destructive",
  Support: "bg-primary/14 text-primary",
  Billing: "bg-success/14 text-success",
  Data: "bg-warning/14 text-warning",
};
const cards: Record<string, { title: string; tag: keyof typeof tags; due: string }> = {
  "OPS-112": { title: "Rotate staging API keys", tag: "Security", due: "Due Oct 3" },
  "OPS-118": { title: "Document the on-call handoff", tag: "Support", due: "No due date" },
  "OPS-121": { title: "Migrate invoices to the new ledger", tag: "Billing", due: "Due Oct 9" },
  "OPS-124": { title: "Fix CSV export for archived rows", tag: "Data", due: "Due Oct 1" },
};

const shimmer =
  "animate-skeleton-shimmer bg-muted bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_100%)] bg-size-[200%_100%] bg-no-repeat motion-reduce:animate-none motion-reduce:bg-none";

/** While the board loads, keep its geometry: real columns, 62px cards, an 80px title. */
function KanbanBoardLoading({ variant }: { variant: KanbanBoardVariant }) {
  return (
    <KanbanBoard
      variant={variant}
      defaultValue={{ backlog: [], progress: [], review: [] }}
      aria-busy="true"
    >
      {Object.entries(columns).map(([column, label], index) => (
        <KanbanBoardColumn key={column} value={column} label={label}>
          <KanbanBoardColumnHeader>
            <Skeleton className={`h-3 w-20 rounded-full ${shimmer}`} />
          </KanbanBoardColumnHeader>
          <div className={variant === "compact" ? "grid gap-1.5" : "grid gap-2"}>
            {Array.from({ length: index === 2 ? 1 : 2 }, (_, card) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders are positional.
                key={card}
                className={`h-[62px] ${variant === "compact" ? "rounded-lg" : "rounded-[10px]"} ${shimmer}`}
              />
            ))}
          </div>
        </KanbanBoardColumn>
      ))}
      <span className="sr-only" role="status">
        Loading the board…
      </span>
    </KanbanBoard>
  );
}

export function KanbanBoardPreview({
  variant = "board",
  loading = false,
}: {
  variant?: KanbanBoardVariant;
  loading?: boolean;
}) {
  const [value, setValue] = useState<KanbanBoardValue>({
    backlog: ["OPS-112", "OPS-118"],
    progress: ["OPS-121", "OPS-124"],
    review: [],
  });
  if (loading) return <KanbanBoardLoading variant={variant} />;
  return (
    <KanbanBoard variant={variant} value={value} onValueChange={setValue}>
      {Object.entries(value).map(([column, ids]) => {
        const label = columns[column as keyof typeof columns];
        return (
          <KanbanBoardColumn key={column} value={column} label={label}>
            <KanbanBoardColumnHeader>
              <KanbanBoardColumnTitle>{label}</KanbanBoardColumnTitle>
              <KanbanBoardColumnCount />
            </KanbanBoardColumnHeader>
            <KanbanBoardCards>
              {ids.map((id) => {
                const card = cards[id];
                if (!card) return null;
                return (
                  <KanbanBoardCard key={id} value={id} label={card.title}>
                    <KanbanBoardCardTitle>{card.title}</KanbanBoardCardTitle>
                    <KanbanBoardCardMeta>
                      <span
                        className={`rounded-[6px] px-1.5 text-[11px]/[18px] font-medium ${tags[card.tag]}`}
                      >
                        {card.tag}
                      </span>
                      <span>{id}</span>
                      <span>{card.due}</span>
                    </KanbanBoardCardMeta>
                  </KanbanBoardCard>
                );
              })}
            </KanbanBoardCards>
            <KanbanBoardColumnEmpty>Nothing waiting for review.</KanbanBoardColumnEmpty>
          </KanbanBoardColumn>
        );
      })}
    </KanbanBoard>
  );
}
