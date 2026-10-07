import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  REPORT_BUILDER_VARIANTS,
  ReportBuilder,
  ReportBuilderBar,
  ReportBuilderBarLabel,
  ReportBuilderBarValue,
  ReportBuilderBody,
  ReportBuilderCanvas,
  ReportBuilderCanvasTitle,
  ReportBuilderChart,
  type ReportBuilderChartOrientation,
  ReportBuilderConfig,
  ReportBuilderOption,
  ReportBuilderOptions,
  ReportBuilderSection,
  ReportBuilderSectionTitle,
  ReportBuilderTitle,
  type ReportBuilderVariant,
} from "@/registry/uai/blocks/report-builder";

function Fixture({
  variant,
  onChart,
}: {
  variant?: ReportBuilderVariant;
  onChart?: (value: string) => void;
}) {
  const [orientation, setOrientation] = useState<ReportBuilderChartOrientation>("horizontal");
  return (
    <ReportBuilder variant={variant}>
      <ReportBuilderTitle>Quarterly business review</ReportBuilderTitle>
      <ReportBuilderBody>
        <ReportBuilderConfig>
          <ReportBuilderSection>
            <ReportBuilderSectionTitle>Visualization</ReportBuilderSectionTitle>
            <ReportBuilderOptions>
              {(["horizontal", "vertical"] as const).map((value) => (
                <ReportBuilderOption
                  key={value}
                  type="radio"
                  name="chart"
                  checked={orientation === value}
                  onChange={() => {
                    setOrientation(value);
                    onChart?.(value);
                  }}
                >
                  {value === "horizontal" ? "Bars" : "Columns"}
                </ReportBuilderOption>
              ))}
            </ReportBuilderOptions>
          </ReportBuilderSection>
        </ReportBuilderConfig>
        <ReportBuilderCanvas>
          <ReportBuilderCanvasTitle>Net revenue by region</ReportBuilderCanvasTitle>
          <ReportBuilderChart
            aria-label="Net revenue by region"
            max={400}
            orientation={orientation}
          >
            <ReportBuilderBar value={400}>
              <ReportBuilderBarLabel>North America</ReportBuilderBarLabel>
              <ReportBuilderBarValue>$400k</ReportBuilderBarValue>
            </ReportBuilderBar>
            <ReportBuilderBar value={100}>
              <ReportBuilderBarLabel>Europe</ReportBuilderBarLabel>
              <ReportBuilderBarValue />
            </ReportBuilderBar>
          </ReportBuilderChart>
        </ReportBuilderCanvas>
      </ReportBuilderBody>
    </ReportBuilder>
  );
}

test("chooses settings with native radios inside a labelled fieldset", async () => {
  const user = userEvent.setup();
  const chart = mock((_value: string) => {});
  render(<Fixture onChart={chart} />);
  expect(screen.getByRole("form", { name: "Report settings" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Visualization" })).toBeTruthy();
  const columns = screen.getByRole("radio", { name: "Columns" }) as HTMLInputElement;
  await user.click(columns);
  expect(chart).toHaveBeenCalledWith("vertical");
  expect(columns.checked).toBe(true);
  expect(columns.closest("label")?.hasAttribute("data-checked")).toBe(true);
  expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("vertical");
  await user.click(screen.getByRole("radio", { name: "Bars" }));
  expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("horizontal");
});

test("renders the chart as a labelled list with text values", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Net revenue by region" })).toBeTruthy();
  const chart = screen.getByRole("list", { name: "Net revenue by region" });
  const bars = screen.getAllByRole("listitem");
  expect(chart).toBeTruthy();
  expect(bars[0]?.textContent).toBe("North America$400k");
  expect(bars[1]?.textContent).toBe("Europe100");
  const fill = bars[1]?.querySelector("[aria-hidden] > span") as HTMLElement;
  expect(fill.style.getPropertyValue("--fill-offset")).toBe("-75%");
});

test("styles uncontrolled options from the live input state", async () => {
  const user = userEvent.setup();
  render(
    <ReportBuilder>
      <ReportBuilderOptions>
        <ReportBuilderOption name="metric">Revenue</ReportBuilderOption>
      </ReportBuilderOptions>
    </ReportBuilder>,
  );
  const revenue = screen.getByRole("checkbox", { name: "Revenue" }) as HTMLInputElement;
  const label = revenue.closest("label");
  expect(label?.className).toContain("has-checked:bg-");
  expect(label?.className).not.toContain(" bg-[color-mix");
  await user.click(revenue);
  expect(revenue.checked).toBe(true);
  expect(label?.matches(":has(:checked)")).toBe(true);
});

test("renders every layout variant and guards its parts", () => {
  for (const variant of REPORT_BUILDER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() =>
    render(
      <ReportBuilder>
        <ReportBuilderBar value={1} />
      </ReportBuilder>,
    ),
  ).toThrow("ReportBuilderBar must be used within ReportBuilderChart");
  expect(() => render(<ReportBuilderCanvas />)).toThrow(
    "ReportBuilderCanvas must be used within ReportBuilder",
  );
});
