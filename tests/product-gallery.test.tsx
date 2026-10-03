import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PRODUCT_GALLERY_VARIANTS,
  ProductGallery,
  ProductGalleryFullscreen,
  ProductGalleryItem,
  type ProductGalleryProps,
  ProductGalleryThumbnails,
  ProductGalleryViewport,
  ProductGalleryZoom,
} from "@/registry/uai/components/product-gallery";

function Fixture(props: Omit<ProductGalleryProps, "children">) {
  return (
    <ProductGallery {...props}>
      <ProductGalleryViewport>
        <ProductGalleryZoom />
        <ProductGalleryFullscreen />
      </ProductGalleryViewport>
      <ProductGalleryThumbnails aria-label="Set images">
        <ProductGalleryItem value="front" src="/front.svg" alt="Front view" />
        <ProductGalleryItem value="side" src="/side.svg" alt="Side view" />
        <ProductGalleryItem value="top" src="/top.svg" alt="Top view" />
      </ProductGalleryThumbnails>
    </ProductGallery>
  );
}

function mainImage() {
  return screen.getAllByRole("img").find((image) => image.getAttribute("alt")) as HTMLImageElement;
}

test("shows the first image with its alt text and selects thumbnails", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(mainImage().getAttribute("alt")).toBe("Front view");
  const side = screen.getByRole("button", { name: "Side view" });
  await user.click(side);
  expect(side.getAttribute("aria-current")).toBe("true");
  expect(mainImage().getAttribute("alt")).toBe("Side view");
  expect(document.body.textContent).toContain("Image 2 of 3: Side view");
});

test("uses one tab stop and arrow keys across thumbnails", async () => {
  const user = userEvent.setup();
  render(<Fixture defaultValue="front" />);
  const group = screen.getByRole("group", { name: "Set images" });
  const thumbs = Array.from(group.querySelectorAll("button"));
  expect(thumbs.map((thumb) => thumb.tabIndex)).toEqual([0, -1, -1]);
  thumbs[0]?.focus();
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(thumbs[1] as HTMLButtonElement);
  expect(mainImage().getAttribute("alt")).toBe("Side view");
  await user.keyboard("{End}");
  expect(mainImage().getAttribute("alt")).toBe("Top view");
  await user.keyboard("{ArrowRight}");
  expect(mainImage().getAttribute("alt")).toBe("Front view");
});

test("toggles zoom with a pressed button and resets it on selection", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const zoom = screen.getByRole("button", { name: "Zoom image" });
  await user.click(zoom);
  expect(zoom.getAttribute("aria-pressed")).toBe("true");
  expect(mainImage().className).toContain("scale-200");
  expect(mainImage().className).toContain("cursor-zoom-out");
  await user.click(screen.getByRole("button", { name: "Top view" }));
  expect(zoom.getAttribute("aria-pressed")).toBe("false");
});

test("opens fullscreen in a dialog, steps with arrows, and restores focus", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: "View fullscreen" });
  await user.click(trigger);
  const dialog = document.querySelector("dialog") as HTMLDialogElement;
  expect(dialog.open).toBe(true);
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Close fullscreen");
  await user.keyboard("{ArrowRight}");
  expect(dialog.querySelector("img")?.getAttribute("alt")).toBe("Side view");
  await user.click(screen.getByRole("button", { name: "Previous image" }));
  expect(dialog.querySelector("img")?.getAttribute("alt")).toBe("Front view");
  await user.keyboard("{Escape}");
  expect(dialog.open).toBe(false);
  expect(document.activeElement).toBe(trigger);
});

test("respects a controlled value", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture value="top" onValueChange={change} />);
  await user.click(screen.getByRole("button", { name: "Front view" }));
  expect(change).toHaveBeenCalledWith("front");
  expect(mainImage().getAttribute("alt")).toBe("Top view");
});

test("renders every variant and guards compound children", () => {
  for (const variant of PRODUCT_GALLERY_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ProductGalleryZoom />)).toThrow(
    "ProductGalleryZoom must be used within ProductGallery",
  );
});
