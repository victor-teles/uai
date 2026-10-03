"use client";

import { useState } from "react";
import {
  ApprovalQueue,
  ApprovalQueueDescription,
  ApprovalQueueEmpty,
  ApprovalQueueFilters,
  ApprovalQueueGroup,
  ApprovalQueueGroupBy,
  ApprovalQueueGroupByOption,
  ApprovalQueueGroupCount,
  ApprovalQueueGroupHeader,
  ApprovalQueueGroups,
  ApprovalQueueGroupTitle,
  ApprovalQueueHeader,
  ApprovalQueueHeading,
  ApprovalQueueItem,
  ApprovalQueueItems,
  ApprovalQueueMetric,
  ApprovalQueueSummary,
  ApprovalQueueTitle,
  type ApprovalQueueVariant,
} from "@/components/uai/approval-queue";
import {
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardDetail,
  ApprovalCardDetails,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/components/ui/uai/approval-card";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarCount,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  MetricCardComparison,
  MetricCardLabel,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";

type Request = {
  id: string;
  title: string;
  description: string;
  risk: "low" | "medium" | "high";
  owner: string;
  age: string;
  ageGroup: string;
  impact: string;
  team: string;
};

const requests: Request[] = [
  {
    id: "REQ-311",
    title: "Refund $1,240 to Pallet & Co",
    description: "Duplicate annual charge after a plan migration.",
    risk: "high",
    owner: "Finance",
    age: "4 days",
    ageGroup: "Over 3 days",
    impact: "Customer-facing",
    team: "Finance",
  },
  {
    id: "REQ-318",
    title: "Raise API rate limit for Orbit Dental",
    description: "From 600 to 1,200 requests per minute for 30 days.",
    risk: "medium",
    owner: "Platform",
    age: "2 days",
    ageGroup: "1–3 days",
    impact: "Customer-facing",
    team: "Platform",
  },
  {
    id: "REQ-322",
    title: "Grant Mei Tanaka billing admin",
    description: "Temporary access while the finance lead is on leave.",
    risk: "high",
    owner: "Security",
    age: "5 hours",
    ageGroup: "Under a day",
    impact: "Internal",
    team: "Finance",
  },
  {
    id: "REQ-325",
    title: "Extend Fieldnote Labs trial by 14 days",
    description: "Procurement review is still in progress.",
    risk: "low",
    owner: "Sales",
    age: "1 hour",
    ageGroup: "Under a day",
    impact: "Customer-facing",
    team: "Sales",
  },
];

const groupings = {
  risk: (request: Request) =>
    `${request.risk.charAt(0).toUpperCase()}${request.risk.slice(1)} risk`,
  age: (request: Request) => request.ageGroup,
  owner: (request: Request) => request.owner,
  impact: (request: Request) => request.impact,
};
type Grouping = keyof typeof groupings;

export function ApprovalQueuePreview({ variant = "grouped" }: { variant?: ApprovalQueueVariant }) {
  const [groupBy, setGroupBy] = useState<Grouping>("risk");
  const [team, setTeam] = useState<string | null>("Finance");
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const visible = requests.filter((request) => !team || request.team === team);
  const pending = requests.filter((request) => !decisions[request.id]);
  const groups = new Map<string, Request[]>();
  for (const request of visible) {
    const key = groupings[groupBy](request);
    groups.set(key, [...(groups.get(key) ?? []), request]);
  }
  const decide = (id: string, decision: "approved" | "rejected") =>
    setDecisions((current) => ({ ...current, [id]: decision }));

  return (
    <ApprovalQueue variant={variant}>
      <ApprovalQueueHeader>
        <ApprovalQueueHeading>
          <ApprovalQueueTitle>Approvals</ApprovalQueueTitle>
          <ApprovalQueueDescription>
            Requests that need a second reviewer before they run.
          </ApprovalQueueDescription>
        </ApprovalQueueHeading>
        <ApprovalQueueGroupBy
          value={groupBy}
          onValueChange={(value) => setGroupBy(value as Grouping)}
        >
          <ApprovalQueueGroupByOption value="risk">Risk</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="age">Age</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="owner">Owner</ApprovalQueueGroupByOption>
          <ApprovalQueueGroupByOption value="impact">Impact</ApprovalQueueGroupByOption>
        </ApprovalQueueGroupBy>
      </ApprovalQueueHeader>
      <ApprovalQueueSummary>
        <ApprovalQueueMetric>
          <MetricCardLabel>Waiting</MetricCardLabel>
          <MetricCardValue>{pending.length}</MetricCardValue>
          <MetricCardComparison>across 3 teams</MetricCardComparison>
        </ApprovalQueueMetric>
        <ApprovalQueueMetric>
          <MetricCardLabel>High risk</MetricCardLabel>
          <MetricCardValue>
            {pending.filter((request) => request.risk === "high").length}
          </MetricCardValue>
          <MetricCardComparison>need two reviewers</MetricCardComparison>
        </ApprovalQueueMetric>
        <ApprovalQueueMetric>
          <MetricCardLabel>Oldest request</MetricCardLabel>
          <MetricCardValue>4 days</MetricCardValue>
          <MetricCardComparison>target is 2 days</MetricCardComparison>
        </ApprovalQueueMetric>
      </ApprovalQueueSummary>
      <ApprovalQueueFilters activeCount={team ? 1 : 0} onReset={() => setTeam(null)}>
        <FilterBarControls>
          {(["Finance", "Platform", "Sales"] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={team === name}
              onClick={() => setTeam(team === name ? null : name)}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid var(--uai-border)",
                borderRadius: 999,
                background: team === name ? "var(--uai-surface-raised)" : "var(--uai-surface)",
                color: "inherit",
                fontSize: 12,
              }}
            >
              {name}
            </button>
          ))}
        </FilterBarControls>
        <FilterBarChips>
          {team ? <FilterBarChip onRemove={() => setTeam(null)}>Team: {team}</FilterBarChip> : null}
        </FilterBarChips>
        <FilterBarCount>{visible.length} requests</FilterBarCount>
        <FilterBarReset />
      </ApprovalQueueFilters>
      {groups.size ? (
        <ApprovalQueueGroups>
          {Array.from(groups, ([label, items]) => (
            <ApprovalQueueGroup key={label}>
              <ApprovalQueueGroupHeader>
                <ApprovalQueueGroupTitle>{label}</ApprovalQueueGroupTitle>
                <ApprovalQueueGroupCount>{items.length}</ApprovalQueueGroupCount>
              </ApprovalQueueGroupHeader>
              <ApprovalQueueItems>
                {items.map((request) => (
                  <ApprovalQueueItem
                    key={request.id}
                    risk={request.risk}
                    status={decisions[request.id] ?? "ready"}
                  >
                    <ApprovalCardHeader title={request.title} description={request.description} />
                    {variant === "grouped" ? (
                      <ApprovalCardDetails>
                        <ApprovalCardDetail label="Owner">{request.owner}</ApprovalCardDetail>
                        <ApprovalCardDetail label="Waiting">{request.age}</ApprovalCardDetail>
                        <ApprovalCardDetail label="Impact">{request.impact}</ApprovalCardDetail>
                      </ApprovalCardDetails>
                    ) : null}
                    <ApprovalCardActions>
                      <ApprovalCardReject onClick={() => decide(request.id, "rejected")} />
                      <ApprovalCardApprove onClick={() => decide(request.id, "approved")} />
                    </ApprovalCardActions>
                  </ApprovalQueueItem>
                ))}
              </ApprovalQueueItems>
            </ApprovalQueueGroup>
          ))}
        </ApprovalQueueGroups>
      ) : (
        <ApprovalQueueEmpty>
          <EmptyStateContent>
            <EmptyStateHeader>
              <EmptyStateTitle>Nothing is waiting on you</EmptyStateTitle>
              <EmptyStateDescription>
                New requests appear here as soon as they are filed.
              </EmptyStateDescription>
            </EmptyStateHeader>
          </EmptyStateContent>
        </ApprovalQueueEmpty>
      )}
    </ApprovalQueue>
  );
}
