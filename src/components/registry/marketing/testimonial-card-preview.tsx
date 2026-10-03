import {
  TestimonialCard,
  TestimonialCardAuthor,
  TestimonialCardAvatar,
  TestimonialCardName,
  TestimonialCardOrganization,
  TestimonialCardProof,
  TestimonialCardQuote,
  TestimonialCardRole,
  type TestimonialCardVariant,
} from "@/components/ui/uai/testimonial-card";

export function TestimonialCardPreview({ variant = "card" }: { variant?: TestimonialCardVariant }) {
  return (
    <TestimonialCard variant={variant}>
      <TestimonialCardQuote>
        <p style={{ margin: 0 }}>
          “We moved forty support agents over in a week. First-reply time dropped from six hours to
          under two, and nobody had to retrain.”
        </p>
      </TestimonialCardQuote>
      <TestimonialCardAuthor>
        <TestimonialCardAvatar>ML</TestimonialCardAvatar>
        <TestimonialCardName>Mara Lindqvist</TestimonialCardName>
        <TestimonialCardRole>Head of Support</TestimonialCardRole>
        <TestimonialCardOrganization>Brightmoor Outdoor Supply</TestimonialCardOrganization>
      </TestimonialCardAuthor>
      <TestimonialCardProof href="#case-study">Read the Brightmoor case study</TestimonialCardProof>
    </TestimonialCard>
  );
}
