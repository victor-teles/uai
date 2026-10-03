import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
  METRIC_CARD_VARIANTS,
  MetricCard,
  MetricCardComparison,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  type MetricCardVariant,
} from "@/registry/uai/components/metric-card";

function Fixture({ variant }: { variant?: MetricCardVariant }) {
  return (
    <MetricCard variant={variant}>
      <MetricCardLabel>Active workspaces</MetricCardLabel>
      <MetricCardValue>1,284</MetricCardValue>
      <MetricCardTrend direction="down" sentiment="negative">
        4.1%
      </MetricCardTrend>
      <MetricCardComparison>vs. 1,339 last month</MetricCardComparison>
    </MetricCard>
  );
}

test("labels the card and states the trend in text", () => {
  render(<Fixture />);
  const group = screen.getByRole("group", { name: "Active workspaces" });
  expect(group.textContent).toContain("1,284");
  expect(group.textContent).toContain("Decreased 4.1%");
  expect(group.querySelector("[data-sentiment]")?.getAttribute("data-sentiment")).toBe("negative");
});

test("derives sentiment from direction by default", () => {
  render(
    <MetricCard>
      <MetricCardLabel>Signups</MetricCardLabel>
      <MetricCardTrend direction="up">8%</MetricCardTrend>
      <MetricCardTrend direction="flat">0%</MetricCardTrend>
    </MetricCard>,
  );
  const trends = document.querySelectorAll("[data-direction]");
  expect(trends[0]?.getAttribute("data-sentiment")).toBe("positive");
  expect(trends[1]?.getAttribute("data-sentiment")).toBe("neutral");
  expect(trends[1]?.textContent).toContain("Unchanged");
});

test("renders every variant and guards compound children", () => {
  for (const variant of METRIC_CARD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<MetricCardValue>1</MetricCardValue>)).toThrow(
    "MetricCardValue must be used within MetricCard",
  );
});
