"use client";

import { useState } from "react";
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
  Security: "var(--uai-danger)",
  Support: "var(--uai-accent)",
  Billing: "var(--uai-success)",
  Data: "var(--uai-warning)",
};
const cards: Record<string, { title: string; tag: keyof typeof tags; due: string }> = {
  "OPS-112": { title: "Rotate staging API keys", tag: "Security", due: "Due Oct 3" },
  "OPS-118": { title: "Document the on-call handoff", tag: "Support", due: "No due date" },
  "OPS-121": { title: "Migrate invoices to the new ledger", tag: "Billing", due: "Due Oct 9" },
  "OPS-124": { title: "Fix CSV export for archived rows", tag: "Data", due: "Due Oct 1" },
};

export function KanbanBoardPreview({ variant = "board" }: { variant?: KanbanBoardVariant }) {
  const [value, setValue] = useState<KanbanBoardValue>({
    backlog: ["OPS-112", "OPS-118"],
    progress: ["OPS-121", "OPS-124"],
    review: [],
  });
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
                        style={{
                          padding: "0 6px",
                          borderRadius: 6,
                          background: `color-mix(in oklab, ${tags[card.tag]} 14%, transparent)`,
                          color: tags[card.tag],
                          fontWeight: 500,
                        }}
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
