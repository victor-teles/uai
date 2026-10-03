import {
  BadgeDollarSign,
  CircleHelp,
  Contact,
  LayoutList,
  ListPlus,
  MessagesSquare,
  MousePointerClick,
  PanelsTopLeft,
} from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type MarketingBlocksItemId =
  | "hero-section"
  | "feature-showcase"
  | "pricing-section"
  | "testimonials-section"
  | "faq-section"
  | "call-to-action"
  | "waitlist-section"
  | "contact-section";

export const marketingBlocksCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "hero-section",
    name: "Hero Section",
    category: "Marketing",
    icon: PanelsTopLeft,
    description: "Positioning, a primary action, supporting proof, and product media.",
    usage: `import {
  HeroSection,
  HeroSectionAction,
  HeroSectionActions,
  HeroSectionContent,
  HeroSectionDescription,
  HeroSectionEyebrow,
  HeroSectionMedia,
  HeroSectionProof,
  HeroSectionTitle,
  type HeroSectionVariant,
} from "@/components/uai/hero-section";
import { TrustPanelRating, TrustPanelTitle } from "@/components/ui/uai/trust-panel";

export function HeroSectionPreview({ variant = "split" }: { variant?: HeroSectionVariant }) {
  return (
    <HeroSection variant={variant}>
      <HeroSectionContent>
        <HeroSectionEyebrow>New · Shared inbox for field teams</HeroSectionEyebrow>
        <HeroSectionTitle>Every customer request, routed before the first coffee</HeroSectionTitle>
        <HeroSectionDescription>
          Ferrow sorts email, forms, and voicemail into one queue, assigns the right crew, and tells
          customers when someone is on the way.
        </HeroSectionDescription>
        <HeroSectionActions>
          <HeroSectionAction href="#start-trial">Start a 14-day trial</HeroSectionAction>
          <HeroSectionAction href="#tour" priority="secondary">
            Take the product tour
          </HeroSectionAction>
        </HeroSectionActions>
        <HeroSectionProof>
          <TrustPanelTitle>Used by 1,900 service teams</TrustPanelTitle>
          <TrustPanelRating value={4.7}>from 860 reviews</TrustPanelRating>
        </HeroSectionProof>
      </HeroSectionContent>
      <HeroSectionMedia>
        <svg
          role="img"
          aria-label="Queue view with three assigned requests"
          viewBox="0 0 320 240"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block" }}
        >
          <rect x="20" y="20" width="280" height="200" rx="12" fill="var(--uai-surface-raised)" />
          {[0, 1, 2, 3].map((row) => (
            <rect
              key={row}
              x="32"
              y={40 + row * 20}
              width={row === 0 ? 52 : 44 - row * 4}
              height="6"
              rx="3"
              fill={row === 0 ? "var(--uai-text)" : "var(--uai-border-strong)"}
            />
          ))}
          {["var(--uai-accent)", "var(--uai-success)", "var(--uai-warning)"].map((tone, row) => (
            <g key={tone} transform={\`translate(100 \${36 + row * 58})\`}>
              <rect width="188" height="48" rx="9" fill="var(--uai-surface)" />
              <circle cx="22" cy="24" r="9" fill={tone} opacity="0.85" />
              <rect x="40" y="16" width={92 - row * 16} height="6" rx="3" fill="var(--uai-text)" />
              <rect x="40" y="28" width="60" height="5" rx="2.5" fill="var(--uai-border-strong)" />
              <rect x="146" y="17" width="30" height="14" rx="7" fill={tone} opacity="0.22" />
            </g>
          ))}
        </svg>
      </HeroSectionMedia>
    </HeroSection>
  );
}
`,
    accessibility: [
      "The section is labelled by its heading, which renders as the page h1; use one hero per page.",
      "Actions are real links with visible text; the primary and secondary styles never rely on color alone.",
      "Proof renders as a Trust Panel, so ratings keep their text equivalent and logos keep their names.",
      'Media is consumer-owned: give meaningful artwork role="img" and a label, or hide decorative art.',
    ],
  },
  {
    id: "feature-showcase",
    name: "Feature Showcase",
    category: "Marketing",
    icon: LayoutList,
    description: "Benefits as alternating copy and media with supporting details.",
    usage: `import {
  FeatureShowcase,
  FeatureShowcaseContent,
  FeatureShowcaseDescription,
  FeatureShowcaseDetails,
  FeatureShowcaseHeader,
  FeatureShowcaseItem,
  FeatureShowcaseItemDescription,
  FeatureShowcaseItemTitle,
  FeatureShowcaseLabel,
  FeatureShowcaseList,
  FeatureShowcaseMedia,
  FeatureShowcaseTitle,
  type FeatureShowcaseVariant,
} from "@/components/uai/feature-showcase";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";

const features = [
  {
    label: "Routing",
    title: "Requests reach the right crew on their own",
    description:
      "Rules read the address, trade, and urgency of each request, then assign it to whoever is closest and free.",
    detail: ["Median assignment", "under 2 minutes"],
    bars: [72, 48, 60],
  },
  {
    label: "Scheduling",
    title: "A calendar that respects travel time",
    description:
      "Visits are spaced by real driving distance, so dispatchers stop double-booking the far side of town.",
    detail: ["Drive time saved", "41 minutes a day"],
    bars: [40, 80, 56],
  },
  {
    label: "Updates",
    title: "Customers know when someone is on the way",
    description:
      "Arrival windows go out by text and email, and replies land back in the same conversation.",
    detail: ["Fewer “where are you” calls", "38% drop"],
    bars: [64, 36, 76],
  },
];

export function FeatureShowcasePreview({
  variant = "alternating",
}: {
  variant?: FeatureShowcaseVariant;
}) {
  return (
    <FeatureShowcase variant={variant}>
      <FeatureShowcaseHeader>
        <FeatureShowcaseTitle>Less dispatching, more finished jobs</FeatureShowcaseTitle>
        <FeatureShowcaseDescription>
          Three parts of the day that Ferrow takes off a coordinator’s desk.
        </FeatureShowcaseDescription>
      </FeatureShowcaseHeader>
      <FeatureShowcaseList>
        {features.map((feature) => (
          <FeatureShowcaseItem key={feature.label}>
            <FeatureShowcaseContent>
              <FeatureShowcaseLabel>{feature.label}</FeatureShowcaseLabel>
              <FeatureShowcaseItemTitle>{feature.title}</FeatureShowcaseItemTitle>
              <FeatureShowcaseItemDescription>{feature.description}</FeatureShowcaseItemDescription>
              <FeatureShowcaseDetails>
                <DescriptionListItem>
                  <DescriptionListTerm>{feature.detail[0]}</DescriptionListTerm>
                  <DescriptionListDetails>{feature.detail[1]}</DescriptionListDetails>
                </DescriptionListItem>
              </FeatureShowcaseDetails>
            </FeatureShowcaseContent>
            <FeatureShowcaseMedia>
              <svg
                aria-hidden="true"
                viewBox="0 0 160 120"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={{ display: "block" }}
              >
                <rect
                  x="16"
                  y="16"
                  width="128"
                  height="88"
                  rx="8"
                  fill="var(--uai-surface-raised)"
                />
                {feature.bars.map((width, index) => (
                  <rect
                    key={width}
                    x="28"
                    y={32 + index * 22}
                    width={width}
                    height="10"
                    rx="5"
                    fill={index === 0 ? "var(--uai-text)" : "var(--uai-border-strong)"}
                  />
                ))}
              </svg>
            </FeatureShowcaseMedia>
          </FeatureShowcaseItem>
        ))}
      </FeatureShowcaseList>
    </FeatureShowcase>
  );
}
`,
    accessibility: [
      "Features are list items under a labelled section, each with an h3 heading.",
      "Alternating rows reorder only visually; reading order stays copy first, then media.",
      "Supporting details render as a Description List, so terms and values keep their pairing.",
    ],
  },
  {
    id: "pricing-section",
    name: "Pricing Section",
    category: "Marketing",
    icon: BadgeDollarSign,
    description: "Plans, billing periods, limits, and purchase actions in one section.",
    usage: `"use client";

import { useState } from "react";
import {
  PricingSection,
  PricingSectionDescription,
  PricingSectionFootnote,
  PricingSectionHeader,
  PricingSectionPlan,
  PricingSectionPlanAction,
  PricingSectionPlanBadge,
  PricingSectionPlanDescription,
  PricingSectionPlanFeature,
  PricingSectionPlanFeatures,
  PricingSectionPlanName,
  PricingSectionPlanPeriod,
  PricingSectionPlanPrice,
  PricingSectionPlans,
  PricingSectionTitle,
  type PricingSectionVariant,
} from "@/components/uai/pricing-section";
import {
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  {
    name: "Crew",
    monthly: 18,
    yearly: 15,
    note: "For one team answering its own requests.",
    features: [
      { label: "Up to 5 seats", included: true },
      { label: "2 shared inboxes", included: true },
      { label: "Text arrival updates", included: true },
      { label: "Routing rules", included: false },
    ],
  },
  {
    name: "Operations",
    monthly: 32,
    yearly: 26,
    note: "For dispatchers coordinating several crews.",
    featured: true,
    features: [
      { label: "Up to 50 seats", included: true },
      { label: "Unlimited inboxes", included: true },
      { label: "Routing rules and travel-time scheduling", included: true },
      { label: "Single sign-on", included: false },
    ],
  },
  {
    name: "Enterprise",
    monthly: 54,
    yearly: 45,
    note: "For regional companies with audit needs.",
    features: [
      { label: "Unlimited seats", included: true },
      { label: "Single sign-on and SCIM", included: true },
      { label: "Audit log retention for 2 years", included: true },
      { label: "Named support manager", included: true },
    ],
  },
];

export function PricingSectionPreview({ variant = "cards" }: { variant?: PricingSectionVariant }) {
  const [period, setPeriod] = useState("yearly");
  return (
    <PricingSection variant={variant} value={period} onValueChange={setPeriod}>
      <PricingSectionHeader>
        <PricingSectionTitle>Pay for the crews you dispatch</PricingSectionTitle>
        <PricingSectionDescription>
          Every plan includes the shared inbox and customer updates. Change plans at any time.
        </PricingSectionDescription>
        <PricingToggleList aria-label="Billing period">
          <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
          <PricingToggleOption value="yearly">
            Yearly <PricingToggleSavings>Save 18%</PricingToggleSavings>
          </PricingToggleOption>
        </PricingToggleList>
      </PricingSectionHeader>
      <PricingSectionPlans>
        {plans.map((plan) => (
          <PricingSectionPlan key={plan.name} featured={plan.featured}>
            <PricingSectionPlanName>
              {plan.name}
              {plan.featured ? (
                <PricingSectionPlanBadge>Most popular</PricingSectionPlanBadge>
              ) : null}
            </PricingSectionPlanName>
            <PricingSectionPlanPrice>
              <PricingTogglePrice period="monthly">\${plan.monthly}</PricingTogglePrice>
              <PricingTogglePrice period="yearly">\${plan.yearly}</PricingTogglePrice>
              <PricingSectionPlanPeriod>per seat / month</PricingSectionPlanPeriod>
            </PricingSectionPlanPrice>
            <PricingSectionPlanDescription>{plan.note}</PricingSectionPlanDescription>
            <PricingSectionPlanFeatures>
              {plan.features.map((feature) => (
                <PricingSectionPlanFeature key={feature.label} included={feature.included}>
                  {feature.label}
                </PricingSectionPlanFeature>
              ))}
            </PricingSectionPlanFeatures>
            <PricingSectionPlanAction href={\`#checkout-\${plan.name.toLowerCase()}\`}>
              {plan.name === "Enterprise" ? "Talk to sales" : \`Choose \${plan.name}\`}
            </PricingSectionPlanAction>
          </PricingSectionPlan>
        ))}
      </PricingSectionPlans>
      <PricingSectionFootnote>
        Prices in US dollars, before tax. Yearly plans are billed once and renew annually.
      </PricingSectionFootnote>
    </PricingSection>
  );
}
`,
    accessibility: [
      "The billing period is an APG radio group from Pricing Toggle with arrow, Home, and End keys.",
      "Each plan is a list item named by its plan heading; the featured plan also says so in text.",
      "Excluded limits use a minus icon plus hidden “Not included” text, so they never depend on the icon.",
    ],
  },
  {
    id: "testimonials-section",
    name: "Testimonials Section",
    category: "Marketing",
    icon: MessagesSquare,
    description: "Customer stories with people, roles, organizations, and a rating summary.",
    usage: `import {
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
`,
    accessibility: [
      "Stories are list items that render Testimonial Cards, with quotes in blockquote and attribution in figcaption.",
      "The Featured layout changes size and column only; every story keeps the same reading order.",
      "Use a rating summary with its text equivalent instead of stars alone.",
    ],
  },
  {
    id: "faq-section",
    name: "FAQ Section",
    category: "Marketing",
    icon: CircleHelp,
    description: "Searchable questions with accessible disclosure answers.",
    usage: `import {
  FaqSection,
  FaqSectionAnswer,
  FaqSectionDescription,
  FaqSectionEmpty,
  FaqSectionHeader,
  FaqSectionItem,
  FaqSectionList,
  FaqSectionQuestion,
  FaqSectionSearch,
  FaqSectionTitle,
  type FaqSectionVariant,
} from "@/components/uai/faq-section";
import {
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
} from "@/components/ui/uai/search-field";

const questions = [
  {
    question: "Can we keep our existing phone number?",
    answer:
      "Yes. Forward calls and voicemail to your Ferrow number, or port the number over in about five business days.",
  },
  {
    question: "How does billing work when crews change size?",
    answer:
      "You pay for active seats. Adding someone mid-cycle is prorated, and removed seats are credited on the next invoice.",
  },
  {
    question: "Do customers need to install an app?",
    answer:
      "No. Arrival windows and replies work over text message and email, so customers use what they already have.",
  },
  {
    question: "Where is our data stored?",
    answer:
      "Customer records are stored in the region you choose at signup, encrypted at rest, and backed up every hour.",
  },
  {
    question: "Can we import jobs from a spreadsheet?",
    answer:
      "Upload a CSV with addresses and dates. Ferrow matches columns automatically and shows a preview before importing.",
  },
];

export function FaqSectionPreview({ variant = "list" }: { variant?: FaqSectionVariant }) {
  return (
    <FaqSection variant={variant}>
      <FaqSectionHeader>
        <FaqSectionTitle>Questions before you switch</FaqSectionTitle>
        <FaqSectionDescription>
          Search the answers, or write to support@ferrow.example for anything we missed.
        </FaqSectionDescription>
      </FaqSectionHeader>
      <FaqSectionSearch>
        <SearchFieldLabel style={{ fontWeight: 550 }}>Search questions</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Try “billing” or “phone”" />
          <SearchFieldClear />
        </SearchFieldControl>
        <SearchFieldMessage />
      </FaqSectionSearch>
      <FaqSectionList>
        {questions.map((item, index) => (
          <FaqSectionItem key={item.question} defaultOpen={index === 0}>
            <FaqSectionQuestion>{item.question}</FaqSectionQuestion>
            <FaqSectionAnswer>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </FaqSectionAnswer>
          </FaqSectionItem>
        ))}
      </FaqSectionList>
      <FaqSectionEmpty>
        <p style={{ margin: 0 }}>No questions match that search.</p>
        <a href="#contact" style={{ color: "var(--uai-text)", fontWeight: 550 }}>
          Ask the support team
        </a>
      </FaqSectionEmpty>
    </FaqSection>
  );
}
`,
    accessibility: [
      "Each question is an h3 button with aria-expanded and aria-controls pointing at its answer.",
      "Search filters by question and answer text; the Search Field status announces when nothing matches.",
      "Escape clears the search, and filtered-out questions are hidden from assistive technology.",
    ],
  },
  {
    id: "call-to-action",
    name: "Call to Action",
    category: "Marketing",
    icon: MousePointerClick,
    description: "Close a page with one goal, supporting copy, and reassurance.",
    usage: `import {
  CallToAction,
  CallToActionAction,
  CallToActionActions,
  CallToActionContent,
  CallToActionDescription,
  CallToActionReassurance,
  CallToActionReassuranceItem,
  CallToActionTitle,
  type CallToActionVariant,
} from "@/components/uai/call-to-action";

export function CallToActionPreview({ variant = "banner" }: { variant?: CallToActionVariant }) {
  return (
    <CallToAction variant={variant}>
      <CallToActionContent>
        <CallToActionTitle>Route tomorrow’s requests with Ferrow</CallToActionTitle>
        <CallToActionDescription>
          Connect your inbox in ten minutes. Your first week of jobs imports automatically.
        </CallToActionDescription>
      </CallToActionContent>
      <CallToActionActions>
        <CallToActionAction href="#start-trial">Start a 14-day trial</CallToActionAction>
        <CallToActionAction href="#demo" priority="secondary">
          Book a 20-minute demo
        </CallToActionAction>
      </CallToActionActions>
      <CallToActionReassurance aria-label="Trial terms">
        <CallToActionReassuranceItem>No card required</CallToActionReassuranceItem>
        <CallToActionReassuranceItem>Cancel from settings</CallToActionReassuranceItem>
        <CallToActionReassuranceItem>Keep your data if you leave</CallToActionReassuranceItem>
      </CallToActionReassurance>
    </CallToAction>
  );
}
`,
    accessibility: [
      "The section is labelled by its heading, and actions are links with descriptive text.",
      "The secondary action is underlined text, so the two priorities differ without relying on color.",
      "Reassurance is a list of Trust Panel badges; name it with aria-label.",
    ],
  },
  {
    id: "waitlist-section",
    name: "Waitlist Section",
    category: "Marketing",
    icon: ListPlus,
    description: "Collect interest with qualification fields, consent, and confirmation.",
    usage: `"use client";

import {
  WaitlistSection,
  WaitlistSectionConfirmation,
  WaitlistSectionConfirmationTitle,
  WaitlistSectionContent,
  WaitlistSectionDescription,
  WaitlistSectionEmail,
  WaitlistSectionForm,
  WaitlistSectionHighlight,
  WaitlistSectionHighlights,
  WaitlistSectionQualification,
  WaitlistSectionQualificationLegend,
  WaitlistSectionRestart,
  WaitlistSectionTitle,
  type WaitlistSectionVariant,
} from "@/components/uai/waitlist-section";
import { FormField, FormFieldInput, FormFieldLabel } from "@/components/ui/uai/form-field";
import {
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  NewsletterFormSubmit,
  type NewsletterSubmission,
} from "@/components/ui/uai/newsletter-form";

const waitlist = new Set(["ana@example.com"]);

async function join({ email }: NewsletterSubmission) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email.endsWith("@fail.test")) return "error" as const;
  if (waitlist.has(email.toLowerCase())) return "duplicate" as const;
  waitlist.add(email.toLowerCase());
  return "success" as const;
}

export function WaitlistSectionPreview({
  variant = "split",
}: {
  variant?: WaitlistSectionVariant;
}) {
  return (
    <WaitlistSection variant={variant}>
      <WaitlistSectionContent>
        <WaitlistSectionTitle>Join the Ferrow Routes beta</WaitlistSectionTitle>
        <WaitlistSectionDescription>
          Route planning for crews with more than ten stops a day. We are inviting teams in small
          groups through November.
        </WaitlistSectionDescription>
        <WaitlistSectionHighlights>
          <WaitlistSectionHighlight>Invites go out every Tuesday</WaitlistSectionHighlight>
          <WaitlistSectionHighlight>Free during the beta, no card needed</WaitlistSectionHighlight>
        </WaitlistSectionHighlights>
      </WaitlistSectionContent>
      <WaitlistSectionForm onSubscribe={join}>
        <WaitlistSectionQualification>
          <WaitlistSectionQualificationLegend>About your team</WaitlistSectionQualificationLegend>
          <FormField variant="compact">
            <FormFieldLabel>Company</FormFieldLabel>
            <FormFieldInput
              name="company"
              autoComplete="organization"
              placeholder="Larkspur Landscaping"
            />
          </FormField>
          <FormField variant="compact">
            <FormFieldLabel>Crews on the road each day</FormFieldLabel>
            <FormFieldInput name="crews" inputMode="numeric" placeholder="6" />
          </FormField>
        </WaitlistSectionQualification>
        <NewsletterFormLabel>Work email</NewsletterFormLabel>
        <NewsletterFormField>
          <NewsletterFormInput placeholder="you@company.com" />
          <NewsletterFormSubmit pendingLabel="Joining…">Join the waitlist</NewsletterFormSubmit>
        </NewsletterFormField>
        <NewsletterFormConsent>
          Email me about my invite and beta updates. Unsubscribe from any message.
        </NewsletterFormConsent>
        <NewsletterFormMessage
          messages={{ duplicate: "This email is already on the waitlist. Watch for your invite." }}
        >
          Try ana@example.com to see the already-joined state.
        </NewsletterFormMessage>
      </WaitlistSectionForm>
      <WaitlistSectionConfirmation>
        <WaitlistSectionConfirmationTitle>You’re on the list</WaitlistSectionConfirmationTitle>
        <p style={{ margin: 0, color: "var(--uai-muted)" }}>
          We sent a confirmation to <WaitlistSectionEmail />. Expect your invite within three weeks.
        </p>
        <WaitlistSectionRestart>Add another email</WaitlistSectionRestart>
      </WaitlistSectionConfirmation>
    </WaitlistSection>
  );
}
`,
    accessibility: [
      "Qualification fields sit in a fieldset with a legend, and every input has a visible label.",
      "Email and consent validation come from Newsletter Form and are announced in its status message.",
      "After a successful signup, focus moves to the confirmation status so the result is announced.",
    ],
  },
  {
    id: "contact-section",
    name: "Contact Section",
    category: "Marketing",
    icon: Contact,
    description: "Contact options, availability, a message form with its states, and expectations.",
    usage: `"use client";

import { Headset, Mail, MessagesSquare } from "lucide-react";
import {
  ContactSection,
  ContactSectionAvailability,
  ContactSectionDescription,
  ContactSectionDetails,
  ContactSectionError,
  ContactSectionExpectation,
  ContactSectionExpectations,
  ContactSectionFields,
  ContactSectionForm,
  ContactSectionHeader,
  ContactSectionOption,
  ContactSectionOptionDetail,
  ContactSectionOptionIcon,
  ContactSectionOptionLink,
  ContactSectionOptions,
  ContactSectionOptionTitle,
  ContactSectionReset,
  ContactSectionSubmit,
  ContactSectionSuccess,
  ContactSectionTitle,
  type ContactSectionVariant,
} from "@/components/uai/contact-section";
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
  FormFieldTextarea,
} from "@/components/ui/uai/form-field";
import { StatusBannerDescription, StatusBannerTitle } from "@/components/ui/uai/status-banner";

async function send(data: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return String(data.get("email")).endsWith("@fail.test")
    ? ("error" as const)
    : ("success" as const);
}

export function ContactSectionPreview({ variant = "split" }: { variant?: ContactSectionVariant }) {
  return (
    <ContactSection variant={variant}>
      <ContactSectionDetails>
        <ContactSectionHeader>
          <ContactSectionTitle>Talk to the Ferrow team</ContactSectionTitle>
          <ContactSectionDescription>
            Questions about plans, migrations, or a tricky dispatch setup. A person reads every
            message.
          </ContactSectionDescription>
        </ContactSectionHeader>
        <ContactSectionAvailability available>
          Support is online now · Monday to Friday, 7:00–19:00 CET
        </ContactSectionAvailability>
        <ContactSectionOptions>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <Mail size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Email</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>Replies within one business day</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="mailto:hello@ferrow.example">
              hello@ferrow.example
            </ContactSectionOptionLink>
          </ContactSectionOption>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <Headset size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Phone</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>For urgent outages</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="tel:+15550134200">
              +1 555 013 4200
            </ContactSectionOptionLink>
          </ContactSectionOption>
          <ContactSectionOption>
            <ContactSectionOptionIcon>
              <MessagesSquare size={14} />
            </ContactSectionOptionIcon>
            <ContactSectionOptionTitle>Community</ContactSectionOptionTitle>
            <ContactSectionOptionDetail>Ask other dispatchers</ContactSectionOptionDetail>
            <ContactSectionOptionLink href="#community">Open the forum</ContactSectionOptionLink>
          </ContactSectionOption>
        </ContactSectionOptions>
      </ContactSectionDetails>
      <ContactSectionForm onSend={send} aria-label="Send the team a message">
        <ContactSectionFields>
          <FormField required>
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldInput name="name" autoComplete="name" />
          </FormField>
          <FormField required>
            <FormFieldLabel>Work email</FormFieldLabel>
            <FormFieldInput name="email" type="email" autoComplete="email" />
          </FormField>
          <FormField required>
            <FormFieldLabel>How can we help?</FormFieldLabel>
            <FormFieldTextarea name="message" rows={4} />
          </FormField>
          <ContactSectionExpectations aria-label="What happens next">
            <ContactSectionExpectation>
              A support specialist replies by email.
            </ContactSectionExpectation>
            <ContactSectionExpectation>
              Use an address ending in @fail.test to preview the error state.
            </ContactSectionExpectation>
          </ContactSectionExpectations>
          <ContactSectionSubmit>Send message</ContactSectionSubmit>
        </ContactSectionFields>
        <ContactSectionError>
          <StatusBannerTitle>Your message wasn’t sent</StatusBannerTitle>
          <StatusBannerDescription>
            Check your connection and try again. Your text is still in the form.
          </StatusBannerDescription>
        </ContactSectionError>
        <ContactSectionSuccess>
          <StatusBannerTitle>Message sent</StatusBannerTitle>
          <StatusBannerDescription>
            We’ll reply within one business day. A copy is on its way to your inbox.
          </StatusBannerDescription>
        </ContactSectionSuccess>
        <ContactSectionReset>Send another message</ContactSectionReset>
      </ContactSectionForm>
    </ContactSection>
  );
}
`,
    accessibility: [
      "Availability is stated in text; the status dot is decorative.",
      "Required fields are validated natively before sending, and the submit stays focusable while pending with aria-disabled.",
      "Success and failure render as Status Banners: success is a polite status, failure is an alert.",
    ],
  },
];
