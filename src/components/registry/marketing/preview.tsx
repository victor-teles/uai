"use client";

import {
  ANNOUNCEMENT_BAR_VARIANTS,
  type AnnouncementBarVariant,
} from "@/components/ui/uai/announcement-bar";
import {
  NEWSLETTER_FORM_VARIANTS,
  type NewsletterFormVariant,
} from "@/components/ui/uai/newsletter-form";
import {
  PRICING_TOGGLE_VARIANTS,
  type PricingToggleVariant,
} from "@/components/ui/uai/pricing-toggle";
import {
  PRODUCT_GALLERY_VARIANTS,
  type ProductGalleryVariant,
} from "@/components/ui/uai/product-gallery";
import {
  TESTIMONIAL_CARD_VARIANTS,
  type TestimonialCardVariant,
} from "@/components/ui/uai/testimonial-card";
import { TRUST_PANEL_VARIANTS, type TrustPanelVariant } from "@/components/ui/uai/trust-panel";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { AnnouncementBarPreview } from "./announcement-bar-preview";
import { NewsletterFormPreview } from "./newsletter-form-preview";
import { PricingTogglePreview } from "./pricing-toggle-preview";
import { ProductGalleryPreview } from "./product-gallery-preview";
import { TestimonialCardPreview } from "./testimonial-card-preview";
import { TrustPanelPreview } from "./trust-panel-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "announcement-bar": { label: "announcement bar variant", variants: ANNOUNCEMENT_BAR_VARIANTS },
  "pricing-toggle": { label: "pricing toggle variant", variants: PRICING_TOGGLE_VARIANTS },
  "testimonial-card": { label: "testimonial card variant", variants: TESTIMONIAL_CARD_VARIANTS },
  "product-gallery": { label: "product gallery variant", variants: PRODUCT_GALLERY_VARIANTS },
  "trust-panel": { label: "trust panel variant", variants: TRUST_PANEL_VARIANTS },
  "newsletter-form": { label: "newsletter form variant", variants: NEWSLETTER_FORM_VARIANTS },
};

const widths: Record<string, number> = {
  "announcement-bar": 640,
  "pricing-toggle": 560,
  "testimonial-card": 480,
  "product-gallery": 520,
  "trust-panel": 600,
  "newsletter-form": 440,
};

export function getMarketingPreviewControl(itemId: string): PreviewControl | undefined {
  const control = controls[itemId];
  if (!control) return undefined;
  return {
    ariaLabel: control.label,
    defaultValue: control.variants[0] ?? "",
    options: control.variants.map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  };
}

export function MarketingPreview({ itemId, selection }: { itemId: string; selection: string }) {
  return (
    <PreviewStage label="Marketing and conversion">
      <div
        style={{
          width: "100%",
          maxWidth: widths[itemId] ?? 520,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "announcement-bar" && (
          <AnnouncementBarPreview variant={selection as AnnouncementBarVariant} />
        )}
        {itemId === "pricing-toggle" && (
          <PricingTogglePreview variant={selection as PricingToggleVariant} />
        )}
        {itemId === "testimonial-card" && (
          <TestimonialCardPreview variant={selection as TestimonialCardVariant} />
        )}
        {itemId === "product-gallery" && (
          <ProductGalleryPreview variant={selection as ProductGalleryVariant} />
        )}
        {itemId === "trust-panel" && <TrustPanelPreview variant={selection as TrustPanelVariant} />}
        {itemId === "newsletter-form" && (
          <NewsletterFormPreview variant={selection as NewsletterFormVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
