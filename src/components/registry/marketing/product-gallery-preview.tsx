"use client";

import {
  ProductGallery,
  ProductGalleryFullscreen,
  ProductGalleryItem,
  ProductGalleryThumbnails,
  type ProductGalleryVariant,
  ProductGalleryViewport,
  ProductGalleryZoom,
} from "@/components/ui/uai/product-gallery";

function placeholder(shapes: string) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#ecebe8"/>' +
    shapes +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const views = [
  {
    value: "front",
    alt: "Stoneware pour-over set from the front: a matte grey dripper resting on a squat carafe.",
    src: placeholder(
      '<ellipse cx="200" cy="250" rx="110" ry="14" fill="#d8d6d1"/>' +
        '<rect x="130" y="150" width="140" height="100" rx="28" fill="#8f8c86"/>' +
        '<path d="M140 70h120l-30 80h-60z" fill="#b5b2ab"/>',
    ),
  },
  {
    value: "side",
    alt: "Side view of the set showing the carafe handle and the dripper's flat base ring.",
    src: placeholder(
      '<ellipse cx="200" cy="250" rx="110" ry="14" fill="#d8d6d1"/>' +
        '<rect x="150" y="150" width="110" height="100" rx="28" fill="#8f8c86"/>' +
        '<path d="M260 170a28 28 0 0 1 0 56" stroke="#8f8c86" stroke-width="12" fill="none"/>' +
        '<path d="M160 80h90l-20 70h-50z" fill="#b5b2ab"/>',
    ),
  },
  {
    value: "top",
    alt: "Top-down view into the dripper showing three drainage holes and spiral ridges.",
    src: placeholder(
      '<circle cx="200" cy="150" r="110" fill="#b5b2ab"/>' +
        '<circle cx="200" cy="150" r="70" fill="#a19e97"/>' +
        '<circle cx="186" cy="142" r="6" fill="#5f5c57"/>' +
        '<circle cx="214" cy="142" r="6" fill="#5f5c57"/>' +
        '<circle cx="200" cy="166" r="6" fill="#5f5c57"/>',
    ),
  },
  {
    value: "detail",
    alt: "Close-up of the unglazed foot ring where the speckled clay body is visible.",
    src: placeholder(
      '<rect x="40" y="110" width="320" height="80" rx="40" fill="#8f8c86"/>' +
        '<rect x="40" y="150" width="320" height="40" rx="20" fill="#c9c5bd"/>' +
        '<circle cx="110" cy="170" r="3" fill="#6d6a64"/>' +
        '<circle cx="190" cy="164" r="2" fill="#6d6a64"/>' +
        '<circle cx="270" cy="174" r="3" fill="#6d6a64"/>',
    ),
  },
];

export function ProductGalleryPreview({
  variant = "stacked",
}: {
  variant?: ProductGalleryVariant;
}) {
  return (
    <ProductGallery variant={variant} defaultValue="front">
      <ProductGalleryViewport>
        <ProductGalleryZoom />
        <ProductGalleryFullscreen />
      </ProductGalleryViewport>
      <ProductGalleryThumbnails aria-label="Pour-over set images">
        {views.map((view) => (
          <ProductGalleryItem key={view.value} value={view.value} src={view.src} alt={view.alt} />
        ))}
      </ProductGalleryThumbnails>
    </ProductGallery>
  );
}
