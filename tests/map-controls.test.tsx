import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MAP_CONTROLS_VARIANTS,
  MapControls,
  MapControlsCompass,
  MapControlsGroup,
  MapControlsLocate,
  MapControlsZoomIn,
  MapControlsZoomOut,
} from "@/registry/uai/components/map-controls";

test("names every control and respects zoom limits", async () => {
  const user = userEvent.setup();
  const zoomIn = mock(() => {});
  const reset = mock(() => {});
  render(
    <MapControls variant="bar">
      <MapControlsGroup>
        <MapControlsZoomIn onClick={zoomIn} />
        <MapControlsZoomOut disabled />
      </MapControlsGroup>
      <MapControlsCompass bearing={40} onClick={reset} />
    </MapControls>,
  );
  expect(screen.getByRole("group", { name: "Map controls" }).getAttribute("data-variant")).toBe(
    "bar",
  );
  await user.click(screen.getByRole("button", { name: "Zoom in" }));
  expect(zoomIn).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Zoom out" }).hasAttribute("disabled")).toBe(true);
  const compass = screen.getByRole("button", { name: "Reset bearing to north" });
  expect(compass.getAttribute("data-bearing")).toBe("40");
  await user.click(compass);
  expect(reset).toHaveBeenCalledTimes(1);
});

test("speaks the locate state in its name", () => {
  const { rerender } = render(
    <MapControls>
      <MapControlsLocate status="locating" />
    </MapControls>,
  );
  const locating = screen.getByRole("button", { name: "Finding your location" });
  expect(locating.getAttribute("aria-busy")).toBe("true");
  rerender(
    <MapControls>
      <MapControlsLocate status="active" />
    </MapControls>,
  );
  const active = screen.getByRole("button", { name: "Following your location" });
  expect(active.getAttribute("aria-pressed")).toBe("true");
  rerender(
    <MapControls>
      <MapControlsLocate status="error" />
    </MapControls>,
  );
  expect(screen.getByRole("button", { name: "Location unavailable, try again" })).toBeTruthy();
});

test("ships three variants and rejects parts outside the root", () => {
  expect(MAP_CONTROLS_VARIANTS).toEqual(["stacked", "bar", "compact"]);
  expect(() => render(<MapControlsZoomIn />)).toThrow(
    "MapControlsButton must be used within MapControls",
  );
});
