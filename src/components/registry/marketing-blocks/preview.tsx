"use client";

import { CALL_TO_ACTION_VARIANTS, type CallToActionVariant } from "@/components/uai/call-to-action";
import {
  CONTACT_SECTION_VARIANTS,
  type ContactSectionVariant,
} from "@/components/uai/contact-section";
import { FAQ_SECTION_VARIANTS, type FaqSectionVariant } from "@/components/uai/faq-section";
import {
  FEATURE_SHOWCASE_VARIANTS,
  type FeatureShowcaseVariant,
} from "@/components/uai/feature-showcase";
import { HERO_SECTION_VARIANTS, type HeroSectionVariant } from "@/components/uai/hero-section";
import {
  PRICING_SECTION_VARIANTS,
  type PricingSectionVariant,
} from "@/components/uai/pricing-section";
import {
  TESTIMONIALS_SECTION_VARIANTS,
  type TestimonialsSectionVariant,
} from "@/components/uai/testimonials-section";
import {
  WAITLIST_SECTION_VARIANTS,
  type WaitlistSectionVariant,
} from "@/components/uai/waitlist-section";
import { type PreviewControl, PreviewStage } from "../preview-chrome";
import { CallToActionPreview } from "./call-to-action-preview";
import { ContactSectionPreview } from "./contact-section-preview";
import { FaqSectionPreview } from "./faq-section-preview";
import { FeatureShowcasePreview } from "./feature-showcase-preview";
import { HeroSectionPreview } from "./hero-section-preview";
import { PricingSectionPreview } from "./pricing-section-preview";
import { TestimonialsSectionPreview } from "./testimonials-section-preview";
import { WaitlistSectionPreview } from "./waitlist-section-preview";

const controls: Record<string, { label: string; variants: readonly string[] }> = {
  "hero-section": { label: "hero section variant", variants: HERO_SECTION_VARIANTS },
  "feature-showcase": { label: "feature showcase variant", variants: FEATURE_SHOWCASE_VARIANTS },
  "pricing-section": { label: "pricing section variant", variants: PRICING_SECTION_VARIANTS },
  "testimonials-section": {
    label: "testimonials section variant",
    variants: TESTIMONIALS_SECTION_VARIANTS,
  },
  "faq-section": { label: "FAQ section variant", variants: FAQ_SECTION_VARIANTS },
  "call-to-action": { label: "call to action variant", variants: CALL_TO_ACTION_VARIANTS },
  "waitlist-section": { label: "waitlist section variant", variants: WAITLIST_SECTION_VARIANTS },
  "contact-section": { label: "contact section variant", variants: CONTACT_SECTION_VARIANTS },
};

const widths: Record<string, number> = {
  "faq-section": 840,
  "call-to-action": 760,
  "waitlist-section": 840,
};

export function getMarketingBlocksPreviewControl(itemId: string): PreviewControl | undefined {
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

export function MarketingBlocksPreview({
  itemId,
  selection,
}: {
  itemId: string;
  selection: string;
}) {
  return (
    <PreviewStage label="Marketing sites">
      <div
        style={{
          width: "100%",
          maxWidth: widths[itemId] ?? 960,
          minWidth: 0,
          padding: "24px 0",
        }}
      >
        {itemId === "hero-section" && (
          <HeroSectionPreview variant={selection as HeroSectionVariant} />
        )}
        {itemId === "feature-showcase" && (
          <FeatureShowcasePreview variant={selection as FeatureShowcaseVariant} />
        )}
        {itemId === "pricing-section" && (
          <PricingSectionPreview variant={selection as PricingSectionVariant} />
        )}
        {itemId === "testimonials-section" && (
          <TestimonialsSectionPreview variant={selection as TestimonialsSectionVariant} />
        )}
        {itemId === "faq-section" && <FaqSectionPreview variant={selection as FaqSectionVariant} />}
        {itemId === "call-to-action" && (
          <CallToActionPreview variant={selection as CallToActionVariant} />
        )}
        {itemId === "waitlist-section" && (
          <WaitlistSectionPreview variant={selection as WaitlistSectionVariant} />
        )}
        {itemId === "contact-section" && (
          <ContactSectionPreview variant={selection as ContactSectionVariant} />
        )}
      </div>
    </PreviewStage>
  );
}
