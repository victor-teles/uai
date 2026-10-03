"use client";

import { useState } from "react";
import {
  ReportBuilder,
  ReportBuilderAction,
  ReportBuilderActions,
  ReportBuilderBar,
  ReportBuilderBarLabel,
  ReportBuilderBarValue,
  ReportBuilderBody,
  ReportBuilderCanvas,
  ReportBuilderCanvasTitle,
  ReportBuilderChart,
  ReportBuilderConfig,
  ReportBuilderDescription,
  ReportBuilderFilters,
  ReportBuilderHeader,
  ReportBuilderHeading,
  ReportBuilderMetric,
  ReportBuilderOption,
  ReportBuilderOptions,
  ReportBuilderSection,
  ReportBuilderSectionTitle,
  ReportBuilderStatus,
  ReportBuilderTitle,
  type ReportBuilderVariant,
} from "@/components/uai/report-builder";
import {
  FilterBarChip,
  FilterBarChips,
  FilterBarControls,
  FilterBarReset,
} from "@/components/ui/uai/filter-bar";
import {
  MetricCardComparison,
  MetricCardLabel,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";

const metrics = {
  revenue: { label: "Net revenue", format: (value: number) => `$${value}k` },
  orders: { label: "Orders", format: (value: number) => value.toLocaleString("en-US") },
};
const data = {
  region: [
    { label: "North America", revenue: 412, orders: 3810 },
    { label: "Europe", revenue: 296, orders: 2955 },
    { label: "Asia Pacific", revenue: 158, orders: 1640 },
    { label: "Latin America", revenue: 74, orders: 902 },
  ],
  channel: [
    { label: "Self-serve", revenue: 388, orders: 6120 },
    { label: "Sales-led", revenue: 471, orders: 2210 },
    { label: "Partners", revenue: 81, orders: 977 },
  ],
};
type Metric = keyof typeof metrics;
type Dimension = keyof typeof data;

export function ReportBuilderPreview({ variant = "sidebar" }: { variant?: ReportBuilderVariant }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [dimension, setDimension] = useState<Dimension>("region");
  const [chart, setChart] = useState("bars");
  const [format, setFormat] = useState("csv");
  const [refunds, setRefunds] = useState(true);
  const [exported, setExported] = useState("");
  const rows = data[dimension].map((row) => ({
    label: row.label,
    value: refunds ? Math.round(row[metric] * 0.96) : row[metric],
  }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value));
  const { label, format: display } = metrics[metric];

  return (
    <ReportBuilder variant={variant}>
      <ReportBuilderHeader>
        <ReportBuilderHeading>
          <ReportBuilderTitle>Quarterly business review</ReportBuilderTitle>
          <ReportBuilderDescription>Q3 2026 · Refreshed 12 minutes ago</ReportBuilderDescription>
        </ReportBuilderHeading>
        <ReportBuilderActions>
          <ReportBuilderAction>Save report</ReportBuilderAction>
          <ReportBuilderAction
            emphasis="primary"
            onClick={() => setExported(`Exported qbr-q3-2026.${format}`)}
          >
            Export
          </ReportBuilderAction>
        </ReportBuilderActions>
      </ReportBuilderHeader>
      <ReportBuilderBody>
        <ReportBuilderConfig onSubmit={(event) => event.preventDefault()}>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Metric</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {(Object.keys(metrics) as Metric[]).map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="metric"
                  checked={metric === id}
                  onChange={() => setMetric(id)}
                >
                  {metrics[id].label}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Break down by</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              <ReportBuilderOption
                type="radio"
                name="dimension"
                checked={dimension === "region"}
                onChange={() => setDimension("region")}
              >
                Region
              </ReportBuilderOption>
              <ReportBuilderOption
                type="radio"
                name="dimension"
                checked={dimension === "channel"}
                onChange={() => setDimension("channel")}
              >
                Channel
              </ReportBuilderOption>
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Visualization</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {["bars", "columns", "number"].map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="chart"
                  checked={chart === id}
                  onChange={() => setChart(id)}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Export format</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {["csv", "xlsx", "pdf"].map((id) => (
                <ReportBuilderOption
                  key={id}
                  type="radio"
                  name="format"
                  checked={format === id}
                  onChange={() => setFormat(id)}
                >
                  {id.toUpperCase()}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
        </ReportBuilderConfig>
        <ReportBuilderCanvas>
          <ReportBuilderFilters activeCount={refunds ? 1 : 0} onReset={() => setRefunds(false)}>
            <FilterBarControls>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={refunds}
                  onChange={(event) => setRefunds(event.target.checked)}
                />
                Exclude refunds
              </label>
            </FilterBarControls>
            <FilterBarChips>
              {refunds ? (
                <FilterBarChip onRemove={() => setRefunds(false)}>Refunds excluded</FilterBarChip>
              ) : null}
            </FilterBarChips>
            <FilterBarReset />
          </ReportBuilderFilters>
          <ReportBuilderCanvasTitle>
            {label} by {dimension}
          </ReportBuilderCanvasTitle>
          {chart === "number" ? (
            <ReportBuilderMetric>
              <MetricCardLabel>Total {label.toLowerCase()}</MetricCardLabel>
              <MetricCardValue>{display(total)}</MetricCardValue>
              <MetricCardComparison>Across {rows.length} segments</MetricCardComparison>
            </ReportBuilderMetric>
          ) : (
            <ReportBuilderChart
              aria-label={`${label} by ${dimension}`}
              max={max}
              orientation={chart === "columns" ? "vertical" : "horizontal"}
            >
              {rows.map((row) => (
                <ReportBuilderBar key={row.label} value={row.value}>
                  <ReportBuilderBarLabel>{row.label}</ReportBuilderBarLabel>
                  <ReportBuilderBarValue>{display(row.value)}</ReportBuilderBarValue>
                </ReportBuilderBar>
              ))}
            </ReportBuilderChart>
          )}
          <ReportBuilderStatus>
            {exported || `${rows.length} rows · ${format.toUpperCase()} export ready`}
          </ReportBuilderStatus>
        </ReportBuilderCanvas>
      </ReportBuilderBody>
    </ReportBuilder>
  );
}
