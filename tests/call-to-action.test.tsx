import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import {
  CALL_TO_ACTION_VARIANTS,
  CallToAction,
  CallToActionAction,
  CallToActionActions,
  CallToActionContent,
  CallToActionDescription,
  CallToActionReassurance,
  CallToActionReassuranceItem,
  CallToActionTitle,
  type CallToActionVariant,
} from "@/registry/uai/blocks/call-to-action";

function Fixture({ variant }: { variant?: CallToActionVariant }) {
  return (
    <CallToAction variant={variant}>
      <CallToActionContent>
        <CallToActionTitle>Start routing today</CallToActionTitle>
        <CallToActionDescription>Connect your inbox in ten minutes.</CallToActionDescription>
      </CallToActionContent>
      <CallToActionActions>
        <CallToActionAction href="#trial">Start trial</CallToActionAction>
        <CallToActionAction href="#demo" priority="secondary">
          Book a demo
        </CallToActionAction>
      </CallToActionActions>
      <CallToActionReassurance aria-label="Trial terms">
        <CallToActionReassuranceItem>No card required</CallToActionReassuranceItem>
        <CallToActionReassuranceItem>Cancel anytime</CallToActionReassuranceItem>
      </CallToActionReassurance>
    </CallToAction>
  );
}

test("labels the section and separates primary and secondary actions", () => {
  render(<Fixture />);
  const section = screen.getByRole("region", { name: "Start routing today" });
  const primary = within(section).getByRole("link", { name: "Start trial" });
  const secondary = within(section).getByRole("link", { name: "Book a demo" });
  expect(primary.dataset.priority).toBe("primary");
  expect(secondary.style.textDecoration).toBe("underline");
  const terms = within(section).getByRole("list", { name: "Trial terms" });
  expect(
    within(terms)
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["No card required", "Cancel anytime"]);
  expect(terms.querySelectorAll("svg[aria-hidden=true]")).toHaveLength(2);
});

test("renders every variant and guards regions", () => {
  for (const variant of CALL_TO_ACTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CallToActionTitle />)).toThrow(
    "CallToActionTitle must be used within CallToAction",
  );
});
