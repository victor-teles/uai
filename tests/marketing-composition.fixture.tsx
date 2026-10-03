import { AnnouncementBarPreview } from "@/components/registry/marketing/announcement-bar-preview";
import { NewsletterFormPreview } from "@/components/registry/marketing/newsletter-form-preview";
import { PricingTogglePreview } from "@/components/registry/marketing/pricing-toggle-preview";
import { ProductGalleryPreview } from "@/components/registry/marketing/product-gallery-preview";
import { TestimonialCardPreview } from "@/components/registry/marketing/testimonial-card-preview";
import { TrustPanelPreview } from "@/components/registry/marketing/trust-panel-preview";

export function MarketingCompositionFixture() {
  return (
    <>
      <AnnouncementBarPreview />
      <PricingTogglePreview />
      <TestimonialCardPreview />
      <ProductGalleryPreview />
      <TrustPanelPreview />
      <NewsletterFormPreview />
    </>
  );
}
