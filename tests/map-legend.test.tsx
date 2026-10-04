import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MAP_LEGEND_VARIANTS,
  MapLegend,
  MapLegendHeader,
  MapLegendItem,
  MapLegendItems,
  MapLegendLabel,
  MapLegendScale,
  MapLegendSwatch,
  MapLegendTitle,
} from "@/registry/uai/components/map-legend";

function Fixture(props: { onValueChange?: (value: string[]) => void }) {
  return (
    <MapLegend defaultValue={["stations"]} {...props}>
      <MapLegendHeader>
        <MapLegendTitle>Transit</MapLegendTitle>
      </MapLegendHeader>
      <MapLegendItems>
        <MapLegendItem value="stations">
          <MapLegendSwatch color="red" shape="dot" />
          <MapLegendLabel>Stations</MapLegendLabel>
        </MapLegendItem>
        <MapLegendItem value="closures">
          <MapLegendSwatch color="blue" shape="line" />
          <MapLegendLabel>Closures</MapLegendLabel>
        </MapLegendItem>
        <MapLegendItem>
          <MapLegendSwatch color="green" />
          <MapLegendLabel>Parks</MapLegendLabel>
        </MapLegendItem>
      </MapLegendItems>
      <MapLegendScale label="Rent from $1,200 to $3,400" colors={["white", "orange"]}>
        <span>$1.2k</span>
        <span>$3.4k</span>
      </MapLegendScale>
    </MapLegend>
  );
}

test("labels the legend and toggles layers by their row label", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string[]) => {});
  render(<Fixture onValueChange={change} />);
  expect(screen.getByRole("region", { name: "Transit" })).toBeTruthy();
  const stations = screen.getByRole("checkbox", { name: "Stations" });
  const closures = screen.getByRole("checkbox", { name: "Closures" });
  expect(stations.getAttribute("aria-checked")).toBe("true");
  expect(closures.getAttribute("aria-checked")).toBe("false");
  await user.click(screen.getByText("Closures"));
  expect(change).toHaveBeenLastCalledWith(["stations", "closures"]);
  await user.click(stations);
  expect(change).toHaveBeenLastCalledWith(["closures"]);
  expect(stations.closest("li")?.hasAttribute("data-hidden")).toBe(true);
});

test("keeps static rows out of the toggles and describes the color ramp", () => {
  render(<Fixture />);
  expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  expect(screen.getByText("Parks")).toBeTruthy();
  expect(screen.getByRole("img", { name: "Rent from $1,200 to $3,400" })).toBeTruthy();
});

test("ships three variants and rejects parts outside the legend", () => {
  expect(MAP_LEGEND_VARIANTS).toEqual(["card", "floating", "compact"]);
  expect(() => render(<MapLegendLabel />)).toThrow("MapLegendLabel must be used within MapLegend");
});
