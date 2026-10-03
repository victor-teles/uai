import { CallToActionPreview } from "@/components/registry/marketing-blocks/call-to-action-preview";
import { ContactSectionPreview } from "@/components/registry/marketing-blocks/contact-section-preview";
import { FaqSectionPreview } from "@/components/registry/marketing-blocks/faq-section-preview";
import { FeatureShowcasePreview } from "@/components/registry/marketing-blocks/feature-showcase-preview";
import { HeroSectionPreview } from "@/components/registry/marketing-blocks/hero-section-preview";
import { PricingSectionPreview } from "@/components/registry/marketing-blocks/pricing-section-preview";
import { TestimonialsSectionPreview } from "@/components/registry/marketing-blocks/testimonials-section-preview";
import { WaitlistSectionPreview } from "@/components/registry/marketing-blocks/waitlist-section-preview";

export function MarketingBlocksCompositionFixture() {
  return (
    <>
      <HeroSectionPreview />
      <FeatureShowcasePreview />
      <PricingSectionPreview />
      <TestimonialsSectionPreview />
      <FaqSectionPreview />
      <CallToActionPreview />
      <WaitlistSectionPreview />
      <ContactSectionPreview />
    </>
  );
}
