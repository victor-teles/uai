import {
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
            <g key={tone} transform={`translate(100 ${36 + row * 58})`}>
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
