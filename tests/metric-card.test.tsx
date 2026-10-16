import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  METRIC_CARD_VARIANTS,
  MetricCard,
  MetricCardChart,
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

test("renders skeletons while busy and keeps the label for assistive tech", () => {
  render(
    <MetricCard aria-busy>
      <MetricCardLabel>MRR</MetricCardLabel>
      <MetricCardTrend direction="up">12%</MetricCardTrend>
      <MetricCardValue>$48,290</MetricCardValue>
      <MetricCardComparison>vs. $42,960</MetricCardComparison>
      <MetricCardChart data={[1, 2, 3]} label="MRR trend" />
    </MetricCard>,
  );
  const group = screen.getByRole("group", { name: "MRR" });
  expect(group.getAttribute("aria-busy")).toBe("true");
  expect(group.textContent).not.toContain("$48,290");
  expect(screen.queryByRole("img")).toBeNull();
});

test("the chart takes the trend's sentiment and is scrubbable with the keyboard", () => {
  render(
    <MetricCard>
      <MetricCardLabel>Median first response</MetricCardLabel>
      <MetricCardTrend direction="down" sentiment="positive">
        3 min
      </MetricCardTrend>
      <MetricCardValue>
        14<span data-unit>min</span>
      </MetricCardValue>
      <MetricCardComparison>vs. 17 min last week</MetricCardComparison>
      <MetricCardChart
        data={[17, 15, 14]}
        label="Fell from 17 to 14 minutes"
        pointLabels={["Sun · 17 min", "Mon · 15 min", "Tue · 14 min"]}
      />
    </MetricCard>,
  );
  const chart = screen.getByRole("img", { name: "Fell from 17 to 14 minutes" });
  expect(chart.getAttribute("data-sentiment")).toBe("positive");
  expect(chart.tabIndex).toBe(0);
  fireEvent.keyDown(chart, { key: "ArrowLeft" });
  expect(screen.getAllByText("Mon · 15 min").length).toBeGreaterThan(0);
  expect(document.querySelector("[data-slot=metric-card-comparison]")?.textContent).toBe(
    "Mon · 15 min",
  );
  fireEvent.blur(chart);
  expect(screen.getByText("vs. 17 min last week")).toBeTruthy();
});

test("an empty chart draws a baseline and is not focusable", () => {
  render(
    <MetricCard>
      <MetricCardLabel>Expansion</MetricCardLabel>
      <MetricCardChart data={[]} label="No data yet" />
    </MetricCard>,
  );
  const chart = screen.getByRole("img", { name: "No data yet" });
  expect(chart.hasAttribute("tabindex")).toBe(false);
  expect(chart.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("2 3");
});
