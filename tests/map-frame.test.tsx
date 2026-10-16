import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  MAP_FRAME_PLACEHOLDER_STATUSES,
  MAP_FRAME_VARIANTS,
  MapFrame,
  MapFrameAttribution,
  MapFrameOverlay,
  MapFramePlaceholder,
  MapFrameSurface,
} from "@/registry/uai/components/map-frame";

test("labels the map region, hides the placeholder, and anchors overlays", () => {
  const { container } = render(
    <MapFrame aria-label="Store locations" busy>
      <MapFramePlaceholder />
      <MapFrameSurface>
        <div data-testid="canvas" />
      </MapFrameSurface>
      <MapFrameOverlay position="bottom-left">
        <button type="button">Filters</button>
      </MapFrameOverlay>
      <MapFrameAttribution>© Sample tiles</MapFrameAttribution>
    </MapFrame>,
  );
  const region = screen.getByRole("region", { name: "Store locations" });
  expect(region.getAttribute("aria-busy")).toBe("true");
  expect(region.getAttribute("data-variant")).toBe("card");
  expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByTestId("canvas")).toBeTruthy();
  const overlay = container.querySelector('[data-slot="map-frame-overlay"]');
  expect(overlay?.getAttribute("data-position")).toBe("bottom-left");
  expect(screen.getByText("© Sample tiles")).toBeTruthy();
});

test("ships three variants and rejects parts outside the frame", () => {
  expect(MAP_FRAME_VARIANTS).toEqual(["card", "inset", "compact"]);
  expect(() => render(<MapFrameOverlay />)).toThrow("MapFrameOverlay must be used within MapFrame");
});

test("shows a loading state that stays out of the way of overlays", () => {
  const { container } = render(
    <MapFrame busy>
      <MapFramePlaceholder status="loading" />
      <MapFrameOverlay>
        <button type="button">Zoom in</button>
      </MapFrameOverlay>
    </MapFrame>,
  );
  const placeholder = container.querySelector('[data-slot="map-frame-placeholder"]');
  expect(placeholder?.getAttribute("data-status")).toBe("loading");
  expect(placeholder?.className).toContain("pointer-events-none");
  expect(screen.getByText("Loading map tiles…")).toBeTruthy();
  expect(container.querySelector("svg")).toBeNull();
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
});

test("announces a failed map and retries on request", () => {
  let retries = 0;
  const { rerender } = render(
    <MapFrame>
      <MapFramePlaceholder status="error" onRetry={() => retries++} />
    </MapFrame>,
  );
  const alert = screen.getByRole("alert");
  expect(alert.textContent).toContain("The map didn’t load");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retries).toBe(1);
  rerender(
    <MapFrame>
      <MapFramePlaceholder status="error" />
    </MapFrame>,
  );
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  expect(MAP_FRAME_PLACEHOLDER_STATUSES).toEqual(["loading", "error"]);
});

test("keeps the attribution readable and reachable", () => {
  render(
    <MapFrame variant="compact">
      <MapFrameAttribution>
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
      </MapFrameAttribution>
    </MapFrame>,
  );
  const link = screen.getByRole("link", { name: "OpenStreetMap" });
  const attribution = link.closest('[data-slot="map-frame-attribution"]');
  expect(attribution?.getAttribute("aria-hidden")).toBeNull();
  expect(attribution?.className).toContain("text-muted-foreground");
  expect(attribution?.className).toContain("bottom-1.5");
});
