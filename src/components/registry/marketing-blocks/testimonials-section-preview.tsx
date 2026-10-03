import {
  TestimonialsSection,
  TestimonialsSectionDescription,
  TestimonialsSectionHeader,
  TestimonialsSectionItem,
  TestimonialsSectionList,
  TestimonialsSectionSummary,
  TestimonialsSectionTitle,
  type TestimonialsSectionVariant,
} from "@/components/uai/testimonials-section";
import {
  TestimonialCardAuthor,
  TestimonialCardAvatar,
  TestimonialCardName,
  TestimonialCardOrganization,
  TestimonialCardProof,
  TestimonialCardQuote,
  TestimonialCardRole,
} from "@/components/ui/uai/testimonial-card";
import { TrustPanelRating } from "@/components/ui/uai/trust-panel";

const stories = [
  {
    quote:
      "We used to lose a morning a week to phone tag. Now the crew lead sees the job, the address, and the photos before leaving the yard.",
    name: "Odile Marchetti",
    initials: "OM",
    role: "Operations Director",
    organization: "Harrowgate Plumbing Co.",
    proof: "#harrowgate-story",
    featured: true,
  },
  {
    quote: "Arrival texts cut our inbound calls by a third in the first month.",
    name: "Kwame Asante",
    initials: "KA",
    role: "Dispatch Lead",
    organization: "Northfield Electric",
  },
  {
    quote:
      "Setup took an afternoon. The routing rules were the first thing our coordinators trusted.",
    name: "Ines Varga",
    initials: "IV",
    role: "Office Manager",
    organization: "Larkspur Landscaping",
  },
  {
    quote: "Our technicians finally stopped driving across town twice in one day.",
    name: "Tomas Reyes",
    initials: "TR",
    role: "Field Supervisor",
    organization: "Calder HVAC Services",
  },
];

export function TestimonialsSectionPreview({
  variant = "grid",
}: {
  variant?: TestimonialsSectionVariant;
}) {
  return (
    <TestimonialsSection variant={variant}>
      <TestimonialsSectionHeader>
        <TestimonialsSectionTitle>
          Service teams that stopped chasing requests
        </TestimonialsSectionTitle>
        <TestimonialsSectionDescription>
          Stories from coordinators and crew leads who moved their day into Ferrow.
        </TestimonialsSectionDescription>
      </TestimonialsSectionHeader>
      <TestimonialsSectionList>
        {stories.map((story) => (
          <TestimonialsSectionItem key={story.name} featured={story.featured}>
            <TestimonialCardQuote>
              <p style={{ margin: 0 }}>“{story.quote}”</p>
            </TestimonialCardQuote>
            <TestimonialCardAuthor>
              <TestimonialCardAvatar>{story.initials}</TestimonialCardAvatar>
              <TestimonialCardName>{story.name}</TestimonialCardName>
              <TestimonialCardRole>{story.role}</TestimonialCardRole>
              <TestimonialCardOrganization>{story.organization}</TestimonialCardOrganization>
            </TestimonialCardAuthor>
            {story.proof ? (
              <TestimonialCardProof href={story.proof}>Read the full story</TestimonialCardProof>
            ) : null}
          </TestimonialsSectionItem>
        ))}
      </TestimonialsSectionList>
      <TestimonialsSectionSummary>
        <TrustPanelRating value={4.7}>from 860 reviews by service teams</TrustPanelRating>
      </TestimonialsSectionSummary>
    </TestimonialsSection>
  );
}
