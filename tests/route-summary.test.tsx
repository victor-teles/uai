import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ROUTE_SUMMARY_VARIANTS,
  RouteSummary,
  RouteSummaryAction,
  RouteSummaryDuration,
  RouteSummaryMode,
  RouteSummaryModes,
  RouteSummaryStep,
  RouteSummarySteps,
  RouteSummaryStop,
  RouteSummaryStops,
} from "@/registry/uai/components/route-summary";

function Fixture(props: { onValueChange?: (value: string) => void }) {
  return (
    <RouteSummary aria-label="Route to Pier Park" variant="compact">
      <RouteSummaryModes defaultValue="drive" {...props}>
        <RouteSummaryMode value="drive" label="Drive, 18 min">
          18
        </RouteSummaryMode>
        <RouteSummaryMode value="walk" label="Walk, 1 h 36 min">
          1h
        </RouteSummaryMode>
      </RouteSummaryModes>
      <RouteSummaryStops>
        <RouteSummaryStop kind="origin">Your location</RouteSummaryStop>
        <RouteSummaryStop kind="destination">Pier Park</RouteSummaryStop>
      </RouteSummaryStops>
      <RouteSummaryDuration>18 min</RouteSummaryDuration>
      <RouteSummarySteps>
        <RouteSummaryStep distance="0.3 mi">Head north on Harbor Street</RouteSummaryStep>
        <RouteSummaryStep>Arrive at Pier Park</RouteSummaryStep>
      </RouteSummarySteps>
      <RouteSummaryAction emphasis="primary">Start</RouteSummaryAction>
    </RouteSummary>
  );
}

test("keeps one travel mode selected and names each with its duration", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture onValueChange={change} />);
  expect(screen.getByRole("region", { name: "Route to Pier Park" })).toBeTruthy();
  const drive = screen.getByRole("radio", { name: "Drive, 18 min" });
  const walk = screen.getByRole("radio", { name: "Walk, 1 h 36 min" });
  expect(drive.getAttribute("aria-checked")).toBe("true");
  await user.click(walk);
  expect(change).toHaveBeenLastCalledWith("walk");
  expect(walk.getAttribute("aria-checked")).toBe("true");
  await user.click(walk);
  expect(walk.getAttribute("aria-checked")).toBe("true");
  expect(change).toHaveBeenCalledTimes(1);
});

test("orders stops and steps and describes steps by their distance", () => {
  render(<Fixture />);
  expect(screen.getByRole("list", { name: "Stops" }).children).toHaveLength(2);
  const step = screen.getByText("Head north on Harbor Street", { exact: false });
  const distance = document.getElementById(step.getAttribute("aria-describedby") ?? "");
  expect(distance?.textContent).toBe("0.3 mi");
  expect(screen.getByRole("list", { name: "Directions" }).children).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
});

test("ships three variants and rejects parts outside the summary", () => {
  expect(ROUTE_SUMMARY_VARIANTS).toEqual(["card", "plain", "compact"]);
  expect(() => render(<RouteSummaryDuration />)).toThrow(
    "RouteSummaryDuration must be used within RouteSummary",
  );
});
