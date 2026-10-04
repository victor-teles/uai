import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MAP_MARKER_VARIANTS,
  MapMarker,
  MapMarkerCluster,
  MapMarkerIcon,
  MapMarkerLabel,
} from "@/registry/uai/components/map-marker";

test("exposes each marker as a named toggle and speaks the place once", async () => {
  const user = userEvent.setup();
  const select = mock(() => {});
  render(
    <>
      <MapMarker label="Lume Bakery" variant="label" tone="warning" selected onClick={select}>
        <MapMarkerIcon>★</MapMarkerIcon>
        <MapMarkerLabel>$6</MapMarkerLabel>
      </MapMarker>
      <MapMarker label="Pier Park" variant="dot" />
    </>,
  );
  const bakery = screen.getByRole("button", { name: "Lume Bakery" });
  expect(bakery.getAttribute("aria-pressed")).toBe("true");
  expect(bakery.getAttribute("data-tone")).toBe("warning");
  expect(bakery.getAttribute("data-variant")).toBe("label");
  expect(screen.getByRole("button", { name: "Pier Park" }).getAttribute("aria-pressed")).toBe(
    "false",
  );
  expect(screen.getByText("$6").getAttribute("aria-hidden")).toBe("true");
  await user.click(bakery);
  expect(select).toHaveBeenCalledTimes(1);
});

test("clusters speak their count and abbreviate large totals", () => {
  render(
    <>
      <MapMarkerCluster count={24} />
      <MapMarkerCluster count={1520} label="1,520 stores" />
    </>,
  );
  expect(screen.getByRole("button", { name: "24 places, zoom in to expand" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "1,520 stores" }).textContent).toBe("1k");
});

test("ships three variants and rejects parts outside the marker", () => {
  expect(MAP_MARKER_VARIANTS).toEqual(["pin", "dot", "label"]);
  expect(() => render(<MapMarkerLabel />)).toThrow("MapMarkerLabel must be used within MapMarker");
});
