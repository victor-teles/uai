"use client";

import {
  Citation,
  CitationClaim,
  CitationExcerpt,
  CitationLink,
  CitationPopover,
  CitationSource,
  CitationTitle,
  CitationTrigger,
  type CitationVariant,
} from "@/components/ui/uai/citation";

export function CitationPreview({ variant = "number" }: { variant?: CitationVariant }) {
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: "24px", color: "var(--uai-text)" }}>
      Heat pumps cut household heating emissions{" "}
      <Citation variant={variant} index={1}>
        <CitationClaim>by roughly 45% compared with gas boilers</CitationClaim>
        <CitationTrigger aria-label="Source 1: The Future of Heat Pumps">
          {variant === "chip" ? "iea.org" : undefined}
        </CitationTrigger>
        <CitationPopover>
          <CitationSource>iea.org · Report · 2022</CitationSource>
          <CitationTitle>The Future of Heat Pumps</CitationTitle>
          <CitationExcerpt>
            Switching from a gas boiler to a heat pump reduces greenhouse gas emissions by at least
            20% today, and by around 45% in countries with cleaner electricity.
          </CitationExcerpt>
          <CitationLink
            href="https://www.iea.org/reports/the-future-of-heat-pumps"
            target="_blank"
            rel="noreferrer"
          >
            Open report
          </CitationLink>
        </CitationPopover>
      </Citation>
      , and the gap widens as grids decarbonize{" "}
      <Citation variant={variant} index={2}>
        <CitationTrigger aria-label="Source 2: Heat pumps in Europe">
          {variant === "chip" ? "ember-energy.org" : undefined}
        </CitationTrigger>
        <CitationPopover>
          <CitationSource>ember-energy.org · Analysis · 2024</CitationSource>
          <CitationTitle>Heat pumps in Europe</CitationTitle>
          <CitationExcerpt>
            Each percentage point of clean power added to the grid lowers the lifetime emissions of
            an installed heat pump.
          </CitationExcerpt>
          <CitationLink href="https://ember-energy.org" target="_blank" rel="noreferrer">
            Open analysis
          </CitationLink>
        </CitationPopover>
      </Citation>
      .
    </p>
  );
}
