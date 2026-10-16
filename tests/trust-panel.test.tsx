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
  const stars = rating?.querySelector("[aria-hidden=true]");
  // An empty track plus a filled copy clipped to the value.
  expect(stars?.querySelectorAll("svg").length).toBe(10);
  const fill = rating?.querySelector<HTMLElement>("[data-slot=trust-panel-rating-fill]");
  // 4.8 of 5 fills 96% of the 78px track instead of rounding up to five stars.
  expect(fill?.style.width).toBe("74.9px");
});

test("lifts the proof number and badge claim to the foreground", () => {
  const view = render(
    <TrustPanel>
      <TrustPanelTitle>
        <b>2,400</b> teams
      </TrustPanelTitle>
      <TrustPanelBadges aria-label="Security">
        <TrustPanelBadge>
          <b>SOC 2</b> report
        </TrustPanelBadge>
      </TrustPanelBadges>
    </TrustPanel>,
  );
  const title = view.getByRole("heading", { name: "2,400 teams" });
  expect(title.className).toContain("[&_b]:text-foreground");
  expect(view.getByRole("list", { name: "Security" }).textContent).toBe("SOC 2 report");
});

test("falls back to the company name when a logo image fails", () => {
  const view = render(
    <TrustPanel>
      <TrustPanelTitle>Customers</TrustPanelTitle>
      <TrustPanelLogos>
        <TrustPanelLogo name="Quillon">
          {/* biome-ignore lint/performance/noImgElement: a registry logo is a plain image, not next/image. */}
          <img alt="" src="/missing.svg" />
        </TrustPanelLogo>
      </TrustPanelLogos>
    </TrustPanel>,
  );
  const logo = view.getByRole("listitem");
  const image = logo.querySelector("img");
  image?.dispatchEvent(new Event("error"));
  expect(logo.querySelector("img")).toBeNull();
  expect(logo.textContent).toBe("Quillon");
  expect(logo.getAttribute("data-fallback")).toBe("true");
});

test("works without a panel root, as in testimonials", () => {
  const view = render(<TrustPanelRating value={4.7}>from 860 reviews</TrustPanelRating>);
  expect(view.container.textContent).toContain("4.7 out of 5");
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
