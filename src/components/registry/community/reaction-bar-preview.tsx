"use client";

import { useState } from "react";
import {
  ReactionBar,
  ReactionBarItem,
  ReactionBarPicker,
  ReactionBarPickerOption,
  type ReactionBarVariant,
} from "@/components/ui/uai/reaction-bar";

const reactions = [
  { value: "thumbs-up", emoji: "👍", label: "Thumbs up", count: 12 },
  { value: "heart", emoji: "❤️", label: "Heart", count: 5 },
  { value: "rocket", emoji: "🚀", label: "Rocket", count: 3 },
  { value: "eyes", emoji: "👀", label: "Eyes", count: 0 },
  { value: "party", emoji: "🎉", label: "Party", count: 0 },
];

export function ReactionBarPreview({ variant = "pill" }: { variant?: ReactionBarVariant }) {
  const [selected, setSelected] = useState<string[]>(["heart"]);
  return (
    <ReactionBar
      variant={variant}
      aria-label="Reactions to this release note"
      value={selected}
      onValueChange={setSelected}
    >
      {reactions.map((reaction) => {
        const count = reaction.count + (selected.includes(reaction.value) ? 1 : 0);
        if (count === 0) return null;
        return (
          <ReactionBarItem
            key={reaction.value}
            value={reaction.value}
            emoji={reaction.emoji}
            label={reaction.label}
            count={count}
          />
        );
      })}
      <ReactionBarPicker>
        {reactions.map((reaction) => (
          <ReactionBarPickerOption
            key={reaction.value}
            value={reaction.value}
            emoji={reaction.emoji}
            label={reaction.label}
          />
        ))}
      </ReactionBarPicker>
    </ReactionBar>
  );
}
