import {
  MetricCard,
  MetricCardComparison,
  MetricCardDescription,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  type MetricCardVariant,
} from "@/components/ui/uai/metric-card";

export function MetricCardPreview({ variant = "card" }: { variant?: MetricCardVariant }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
        <MetricCardDescription>
          Growth came mostly from 18 Team plan upgrades.
        </MetricCardDescription>
      </MetricCard>
      <MetricCard variant={variant}>
        <MetricCardHeader>
          <MetricCardLabel>Median first response</MetricCardLabel>
          <MetricCardTrend direction="down" sentiment="positive">
            3 min
          </MetricCardTrend>
        </MetricCardHeader>
        <MetricCardValue>14 min</MetricCardValue>
        <MetricCardComparison>vs. 17 min last week</MetricCardComparison>
        <MetricCardDescription>Measured across 1,204 support conversations.</MetricCardDescription>
      </MetricCard>
    </div>
  );
}
