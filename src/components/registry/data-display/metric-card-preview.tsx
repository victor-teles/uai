"use client";

import { useState } from "react";
import {
  MetricCard,
  MetricCardChart,
  MetricCardComparison,
  MetricCardDescription,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";

const mrr = [31.2, 32.8, 32.1, 35.4, 34.9, 38.2, 37.6, 41.0, 42.1, 44.6, 48.29];
const weeks = [
  "Jul 27",
  "Aug 3",
  "Aug 10",
  "Aug 17",
  "Aug 24",
  "Aug 31",
  "Sep 7",
  "Sep 14",
  "Sep 21",
  "Sep 28",
  "Oct 5",
];
const response = [21, 20, 20.5, 19, 19.5, 17, 18, 16, 16.5, 15, 14];
const days = [
  "Sat, Oct 3",
  "Sun, Oct 4",
  "Mon, Oct 5",
  "Tue, Oct 6",
  "Wed, Oct 7",
  "Thu, Oct 8",
  "Fri, Oct 9",
  "Sat, Oct 10",
  "Sun, Oct 11",
  "Mon, Oct 12",
  "Tue, Oct 13",
];

export function MetricCardPreview({ variant = "card" }: { variant?: MetricCardVariant }) {
  const [trials, setTrials] = useState<"error" | "loading" | "ready">("error");

  function retry() {
    setTrials("loading");
    window.setTimeout(() => setTrials("ready"), 900);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Monthly recurring revenue</MetricCardLabel>
          <MetricCardTrend direction="up">12.4%</MetricCardTrend>
        </MetricCardHeader>
        <MetricCardValue>$48,290</MetricCardValue>
        <MetricCardComparison>vs. $42,960 in August</MetricCardComparison>
        <MetricCardChart
          data={mrr}
          label="MRR rose from $31.2k to $48.3k over 11 weeks"
          pointLabels={mrr.map((value, index) => `Week of ${weeks[index]} · $${value.toFixed(1)}k`)}
        />
      </MetricCard>
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Median first response</MetricCardLabel>
          <MetricCardTrend direction="down" sentiment="positive">
            3 min
          </MetricCardTrend>
        </MetricCardHeader>
        <MetricCardValue>
          14<span data-unit>min</span>
        </MetricCardValue>
        <MetricCardComparison>vs. 17 min last week</MetricCardComparison>
        <MetricCardChart
          data={response}
          label="Median first response fell from 21 to 14 minutes over 11 days"
          pointLabels={response.map((value, index) => `${days[index]} · ${value} min`)}
        />
      </MetricCard>
      <MetricCard variant={variant} aria-busy={trials === "loading"}>
        <MetricCardHeader>
          <MetricCardLabel>Trial conversions</MetricCardLabel>
          {trials === "ready" && <MetricCardTrend direction="up">2.1 pts</MetricCardTrend>}
        </MetricCardHeader>
        <MetricCardValue className={trials === "error" ? "text-subtle-foreground" : undefined}>
          {trials === "error" ? "—" : "18.6%"}
        </MetricCardValue>
        <MetricCardComparison>
          {trials === "error" ? (
            <>
              Couldn’t load trial conversions ·{" "}
              <button
                type="button"
                onClick={retry}
                className="cursor-pointer rounded-sm border-0 bg-transparent p-0 font-medium text-[color-mix(in_oklab,var(--primary)_80%,var(--foreground))] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Retry
              </button>
            </>
          ) : (
            "vs. 16.5% in August"
          )}
        </MetricCardComparison>
        <MetricCardChart
          data={trials === "ready" ? [14.2, 15.1, 15.8, 16.5, 17.2, 18.6] : []}
          label="Trial conversions by month"
        />
      </MetricCard>
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Expansion revenue</MetricCardLabel>
        </MetricCardHeader>
        <MetricCardValue className="text-subtle-foreground">—</MetricCardValue>
        <MetricCardComparison>No data for September yet</MetricCardComparison>
        <MetricCardDescription>
          Upgrades start counting after the first renewal.
        </MetricCardDescription>
        <MetricCardChart data={[]} label="No expansion revenue yet" />
      </MetricCard>
    </div>
  );
}
