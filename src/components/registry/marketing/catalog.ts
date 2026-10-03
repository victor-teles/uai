import { BadgeCheck, Images, MailPlus, Megaphone, Quote, Repeat } from "lucide-react";
import type { RegistryCatalogItem } from "../catalog";

export type MarketingItemId =
  | "announcement-bar"
  | "pricing-toggle"
  | "testimonial-card"
  | "product-gallery"
  | "trust-panel"
  | "newsletter-form";

export const marketingCatalog: readonly RegistryCatalogItem[] = [
  {
    id: "announcement-bar",
    name: "Announcement Bar",
    category: "Marketing",
    icon: Megaphone,
    description: "A campaign message with actions, dismissal, and remembered dismissal.",
    usage: `"use client";

import { useState } from "react";
import {
  AnnouncementBar,
  AnnouncementBarAction,
  AnnouncementBarActions,
  AnnouncementBarDismiss,
  AnnouncementBarLabel,
  AnnouncementBarMessage,
  type AnnouncementBarVariant,
} from "@/components/ui/uai/announcement-bar";

const STORAGE_KEY = "uai-preview-announcement-4-2";

export function AnnouncementBarPreview({ variant = "bar" }: { variant?: AnnouncementBarVariant }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AnnouncementBar
        variant={variant}
        open={open}
        onOpenChange={setOpen}
        storageKey={STORAGE_KEY}
      >
        <AnnouncementBarLabel>New</AnnouncementBarLabel>
        <AnnouncementBarMessage>
          Shared workspaces are now included on every plan.
        </AnnouncementBarMessage>
        <AnnouncementBarActions>
          <AnnouncementBarAction href="#release-notes" onClick={(event) => event.preventDefault()}>
            Read release notes
          </AnnouncementBarAction>
          <AnnouncementBarDismiss />
        </AnnouncementBarActions>
      </AnnouncementBar>
      {open ? null : (
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setOpen(true);
          }}
          style={{
            justifySelf: "center",
            height: 28,
            padding: "0 12px",
            border: 0,
            borderRadius: 999,
            background: "var(--uai-surface-raised)",
            color: "var(--uai-text)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Show the announcement again
        </button>
      )}
    </div>
  );
}
`,
    accessibility: [
      "The bar is a region labelled by its message, so assistive technology can find and skip it.",
      "Dismiss is a 28px button with an accessible name; dismissal does not move focus, and actions stay in normal tab order.",
      "Pass storageKey to remember dismissal in localStorage, or control open with onOpenChange. Campaign scheduling stays consumer-owned.",
    ],
  },
  {
    id: "pricing-toggle",
    name: "Pricing Toggle",
    category: "Marketing",
    icon: Repeat,
    description:
      "Switch billing periods while keeping prices, billing context, and savings labels in sync.",
    usage: `"use client";

import { useState } from "react";
import {
  PricingToggle,
  PricingToggleList,
  PricingToggleOption,
  PricingTogglePrice,
  PricingToggleSavings,
  type PricingToggleVariant,
} from "@/components/ui/uai/pricing-toggle";

const plans = [
  { name: "Starter", monthly: 12, yearly: 10, note: "For small teams getting organized." },
  { name: "Team", monthly: 24, yearly: 19, note: "Shared workspaces, roles, and audit history." },
];

export function PricingTogglePreview({
  variant = "segmented",
}: {
  variant?: PricingToggleVariant;
}) {
  const [period, setPeriod] = useState("yearly");
  return (
    <PricingToggle variant={variant} value={period} onValueChange={setPeriod}>
      <PricingToggleList aria-label="Billing period">
        <PricingToggleOption value="monthly">Monthly</PricingToggleOption>
        <PricingToggleOption value="yearly">
          Yearly <PricingToggleSavings>Save 20%</PricingToggleSavings>
        </PricingToggleOption>
      </PricingToggleList>
      <div
        aria-live="polite"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              display: "grid",
              alignContent: "start",
              gap: 6,
              padding: 16,
              border: "1px solid var(--uai-border)",
              borderRadius: 14,
              background: "var(--uai-surface)",
            }}
          >
            <strong style={{ fontWeight: 500 }}>{plan.name}</strong>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                lineHeight: "28px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <PricingTogglePrice period="monthly">\${plan.monthly}</PricingTogglePrice>
              <PricingTogglePrice period="yearly">\${plan.yearly}</PricingTogglePrice>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  letterSpacing: 0,
                  color: "var(--uai-subtle)",
                }}
              >
                {" "}
                per seat / month
              </span>
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--uai-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <PricingTogglePrice period="monthly">
                Billed monthly. Cancel anytime.
              </PricingTogglePrice>
              <PricingTogglePrice period="yearly">
                Billed \${plan.yearly * 12} yearly instead of \${plan.monthly * 12}.
              </PricingTogglePrice>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--uai-subtle)" }}>{plan.note}</p>
          </div>
        ))}
      </div>
    </PricingToggle>
  );
}
`,
    accessibility: [
      "Options form an APG radio group: one tab stop, with arrow keys, Home, and End moving and selecting.",
      "Savings labels sit inside the option, so the accessible name reads “Yearly Save 20%”.",
      "PricingTogglePrice renders only for the selected period; wrap prices in a polite live region to announce changes.",
    ],
  },
  {
    id: "testimonial-card",
    name: "Testimonial Card",
    category: "Marketing",
    icon: Quote,
    description: "A quote with the person, role, organization, and an optional proof link.",
    usage: `import {
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
`,
    accessibility: [
      "Uses figure, blockquote, and figcaption so the quote stays tied to its attribution.",
      "The avatar is decorative; the person’s name, role, and organization are text.",
      "The proof link marks its external-style arrow as decorative; give it descriptive link text.",
    ],
  },
  {
    id: "product-gallery",
    name: "Product Gallery",
    category: "Marketing",
    icon: Images,
    description:
      "Media selection with thumbnails, zoom, fullscreen viewing, and required alt text.",
    usage: `"use client";

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
  return \`data:image/svg+xml,\${encodeURIComponent(svg)}\`;
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
`,
    accessibility: [
      "Every image requires alt text, which names its thumbnail button and the main image.",
      "Thumbnails use one tab stop; arrow keys, Home, and End move between them and a polite message announces the position.",
      "Fullscreen opens a native modal dialog that focuses Close, supports Left and Right arrows, and returns focus on Escape. Zoom is a toggle button and animation respects reduced motion.",
    ],
  },
  {
    id: "trust-panel",
    name: "Trust Panel",
    category: "Marketing",
    icon: BadgeCheck,
    description: "Customer logos, ratings, certifications, and security evidence in one section.",
    usage: `import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  TrustPanel,
  TrustPanelBadge,
  TrustPanelBadges,
  TrustPanelLogo,
  TrustPanelLogos,
  TrustPanelRating,
  TrustPanelTitle,
  type TrustPanelVariant,
} from "@/components/ui/uai/trust-panel";

const customers = [
  { name: "Brightmoor", mark: <circle cx="8" cy="8" r="7" /> },
  { name: "Quillon", mark: <rect x="1" y="1" width="14" height="14" rx="3" /> },
  { name: "Tessaline", mark: <path d="M8 1 15 15H1z" /> },
  { name: "Orvik", mark: <path d="M1 8a7 7 0 0 1 14 0z" /> },
  { name: "Calder Works", mark: <rect x="1" y="5" width="14" height="6" rx="3" /> },
  { name: "Lumen Row", mark: <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="3" /> },
];

export function TrustPanelPreview({ variant = "card" }: { variant?: TrustPanelVariant }) {
  return (
    <TrustPanel variant={variant}>
      <TrustPanelTitle>Trusted by 2,400 operations teams</TrustPanelTitle>
      <TrustPanelLogos>
        {customers.map((customer) => (
          <TrustPanelLogo key={customer.name} name={customer.name}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {customer.mark}
            </svg>
            {customer.name}
          </TrustPanelLogo>
        ))}
      </TrustPanelLogos>
      <TrustPanelRating value={4.8}>from 1,240 verified reviews</TrustPanelRating>
      <TrustPanelBadges aria-label="Security and compliance">
        <TrustPanelBadge>SOC 2 Type II report</TrustPanelBadge>
        <TrustPanelBadge icon={<ShieldCheck size={14} aria-hidden="true" />}>
          ISO/IEC 27001 certified
        </TrustPanelBadge>
        <TrustPanelBadge icon={<LockKeyhole size={14} aria-hidden="true" />}>
          Encrypted at rest and in transit
        </TrustPanelBadge>
      </TrustPanelBadges>
    </TrustPanel>
  );
}
`,
    accessibility: [
      "The section is labelled by its title; logos are a list whose items expose each customer name as text.",
      "Ratings render stars as decoration with a visible “4.8 out of 5” text equivalent.",
      "Certification badges are a list of text items; only claim evidence you can show on request.",
    ],
  },
  {
    id: "newsletter-form",
    name: "Newsletter Form",
    category: "Marketing",
    icon: MailPlus,
    description:
      "Email signup with consent, validation, submission, success, and duplicate-email states.",
    usage: `"use client";

import {
  NewsletterForm,
  NewsletterFormConsent,
  NewsletterFormField,
  NewsletterFormInput,
  NewsletterFormLabel,
  NewsletterFormMessage,
  NewsletterFormSubmit,
  type NewsletterFormVariant,
  type NewsletterSubmission,
} from "@/components/ui/uai/newsletter-form";

const subscribers = new Set(["ana@example.com"]);

async function subscribe({ email }: NewsletterSubmission) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email.endsWith("@fail.test")) return "error" as const;
  if (subscribers.has(email.toLowerCase())) return "duplicate" as const;
  subscribers.add(email.toLowerCase());
  return "success" as const;
}

export function NewsletterFormPreview({ variant = "inline" }: { variant?: NewsletterFormVariant }) {
  return (
    <NewsletterForm variant={variant} onSubscribe={subscribe}>
      <NewsletterFormLabel>Get the monthly product letter</NewsletterFormLabel>
      <NewsletterFormField>
        <NewsletterFormInput placeholder="you@company.com" />
        <NewsletterFormSubmit>Subscribe</NewsletterFormSubmit>
      </NewsletterFormField>
      <NewsletterFormConsent>
        Send me one email a month about releases. Unsubscribe from any issue.
      </NewsletterFormConsent>
      <NewsletterFormMessage>
        Try ana@example.com to see the already-subscribed state.
      </NewsletterFormMessage>
    </NewsletterForm>
  );
}
`,
    accessibility: [
      "The email input is labelled, uses type email with autocomplete, and is described by the status message.",
      "Invalid email or missing consent moves focus to the field that needs attention and announces the reason.",
      "Submission stays focusable with aria-disabled while pending. onSubscribe owns delivery and returns success, duplicate, or error.",
    ],
  },
];
