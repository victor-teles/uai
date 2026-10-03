import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import {
  TRUST_PANEL_VARIANTS,
  TrustPanel,
  TrustPanelBadge,
  TrustPanelBadges,
  TrustPanelLogo,
  TrustPanelLogos,
  TrustPanelRating,
  TrustPanelTitle,
  type TrustPanelVariant,
} from "@/registry/uai/components/trust-panel";

function Fixture({ variant }: { variant?: TrustPanelVariant }) {
  return (
    <TrustPanel variant={variant}>
      <TrustPanelTitle>Trusted by operations teams</TrustPanelTitle>
      <TrustPanelLogos>
        <TrustPanelLogo name="Quillon">
          <svg aria-hidden="true" />Q
        </TrustPanelLogo>
        <TrustPanelLogo name="Orvik">O</TrustPanelLogo>
      </TrustPanelLogos>
      <TrustPanelRating value={4.8}>from 1,240 reviews</TrustPanelRating>
      <TrustPanelBadges aria-label="Security">
        <TrustPanelBadge>SOC 2 Type II report</TrustPanelBadge>
      </TrustPanelBadges>
    </TrustPanel>
  );
}

test("labels the section and exposes logos and badges as text lists", () => {
  render(<Fixture />);
  const region = screen.getByRole("region", { name: "Trusted by operations teams" });
  const lists = within(region).getAllByRole("list");
  expect(lists).toHaveLength(2);
  const logos = within(lists[0] as HTMLElement).getAllByRole("listitem");
  expect(logos.map((logo) => logo.textContent)).toEqual(["QQuillon", "OOrvik"]);
  expect(logos[0]?.querySelector("[aria-hidden=true]")?.textContent).toBe("Q");
  expect(screen.getByRole("list", { name: "Security" }).textContent).toContain("SOC 2");
});

test("gives ratings a text equivalent and hides decorative stars", () => {
  const view = render(<Fixture />);
  const rating = view.getByText("4.8").closest("p");
  expect(rating?.textContent).toContain("4.8 out of 5");
  expect(rating?.textContent).toContain("from 1,240 reviews");
  expect(rating?.querySelector("[aria-hidden=true]")?.querySelectorAll("svg").length).toBe(5);
});

test("renders every variant and guards compound children", () => {
  for (const variant of TRUST_PANEL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<TrustPanelTitle />)).toThrow(
    "TrustPanelTitle must be used within TrustPanel",
  );
});
