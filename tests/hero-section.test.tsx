import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { TrustPanelRating, TrustPanelTitle } from "@/components/ui/uai/trust-panel";
import {
  HERO_SECTION_VARIANTS,
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
} from "@/registry/uai/blocks/hero-section";

function Fixture({ variant }: { variant?: HeroSectionVariant }) {
  return (
    <HeroSection variant={variant}>
      <HeroSectionContent>
        <HeroSectionEyebrow>New</HeroSectionEyebrow>
        <HeroSectionTitle>Route every request</HeroSectionTitle>
        <HeroSectionDescription>One queue for every crew.</HeroSectionDescription>
        <HeroSectionActions>
          <HeroSectionAction href="#trial">Start trial</HeroSectionAction>
          <HeroSectionAction href="#tour" priority="secondary">
            Take the tour
          </HeroSectionAction>
        </HeroSectionActions>
        <HeroSectionProof>
          <TrustPanelTitle>Used by 1,900 teams</TrustPanelTitle>
          <TrustPanelRating value={4.7} />
        </HeroSectionProof>
      </HeroSectionContent>
      <HeroSectionMedia>
        <svg role="img" aria-label="Queue view" />
      </HeroSectionMedia>
    </HeroSection>
  );
}

test("labels the hero by its h1 and exposes actions, proof, and media", () => {
  render(<Fixture />);
  const hero = screen.getByRole("region", { name: "Route every request" });
  expect(within(hero).getByRole("heading", { level: 1 }).textContent).toBe("Route every request");
  const primary = within(hero).getByRole("link", { name: "Start trial" });
  expect(primary.getAttribute("data-priority")).toBe("primary");
  expect(within(hero).getByRole("link", { name: "Take the tour" }).dataset.priority).toBe(
    "secondary",
  );
  expect(within(hero).getByRole("region", { name: "Used by 1,900 teams" }).textContent).toContain(
    "4.7 out of 5",
  );
  expect(within(hero).getByRole("img", { name: "Queue view" })).toBeTruthy();
});

test("renders every layout variant and picks a matching proof panel", () => {
  for (const variant of HERO_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    const hero = view.container.querySelector("section");
    expect(hero?.getAttribute("data-variant")).toBe(variant);
    const proof = view.getByRole("region", { name: "Used by 1,900 teams" });
    expect(proof.dataset.variant).toBe(variant === "framed" ? "compact" : "plain");
    view.unmount();
  }
});

test("guards regions outside the root", () => {
  expect(() => render(<HeroSectionTitle />)).toThrow(
    "HeroSectionTitle must be used within HeroSection",
  );
  expect(() => render(<HeroSectionMedia />)).toThrow(
    "HeroSectionMedia must be used within HeroSection",
  );
});
