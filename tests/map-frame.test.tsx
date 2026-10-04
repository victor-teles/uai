import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
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
