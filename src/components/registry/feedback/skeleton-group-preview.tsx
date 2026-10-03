"use client";

import { useState } from "react";
import {
  SkeletonGroup,
  SkeletonGroupBlock,
  SkeletonGroupCard,
  SkeletonGroupCircle,
  SkeletonGroupLine,
  SkeletonGroupRow,
  SkeletonGroupStack,
  type SkeletonGroupVariant,
} from "@/components/ui/uai/skeleton-group";

const members = [
  { name: "Maya Chen", role: "Design lead", initials: "MC" },
  { name: "Jonas Weber", role: "Engineering", initials: "JW" },
  { name: "Priya Natarajan", role: "Product", initials: "PN" },
];

export function SkeletonGroupPreview({ variant = "shimmer" }: { variant?: SkeletonGroupVariant }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {loading ? (
        <SkeletonGroup variant={variant} label="Loading team members">
          <SkeletonGroupCard>
            <SkeletonGroupBlock height={72} />
            {members.map((member) => (
              <SkeletonGroupRow key={member.name}>
                <SkeletonGroupCircle size={32} />
                <SkeletonGroupStack style={{ gap: 7 }}>
                  <SkeletonGroupLine width="45%" height={11} />
                  <SkeletonGroupLine width="28%" height={9} />
                </SkeletonGroupStack>
              </SkeletonGroupRow>
            ))}
          </SkeletonGroupCard>
        </SkeletonGroup>
      ) : (
        <section
          aria-label="Team members"
          style={{
            display: "grid",
            gap: 14,
            padding: 16,
            border: "1px solid var(--uai-border)",
            borderRadius: 14,
            background: "var(--uai-surface)",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "grid",
              alignContent: "center",
              height: 72,
              padding: "0 14px",
              gap: 2,
              borderRadius: 10,
              background: "var(--uai-surface-raised)",
            }}
          >
            <strong style={{ fontWeight: 500 }}>Growth team</strong>
            <span style={{ color: "var(--uai-subtle)", fontSize: 12 }}>
              3 members · 12 projects
            </span>
          </div>
          {members.map((member) => (
            <div key={member.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "var(--uai-surface-raised)",
                  boxShadow: "0 0 0 1px color-mix(in oklab, var(--uai-text) 6%, transparent)",
                  color: "var(--uai-muted)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {member.initials}
              </span>
              <span style={{ display: "grid", gap: 2, lineHeight: "18px" }}>
                <span style={{ fontWeight: 500 }}>{member.name}</span>
                <span style={{ color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px" }}>
                  {member.role}
                </span>
              </span>
            </div>
          ))}
        </section>
      )}
      <button
        type="button"
        onClick={() => setLoading((value) => !value)}
        style={{
          justifySelf: "start",
          height: 28,
          padding: "0 12px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {loading ? "Show loaded content" : "Show skeleton"}
      </button>
    </div>
  );
}
