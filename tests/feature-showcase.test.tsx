import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  FEATURE_SHOWCASE_VARIANTS,
  FeatureShowcase,
  FeatureShowcaseContent,
  FeatureShowcaseDetails,
  FeatureShowcaseHeader,
  FeatureShowcaseItem,
  FeatureShowcaseItemDescription,
  FeatureShowcaseItemTitle,
  FeatureShowcaseList,
  FeatureShowcaseMedia,
  FeatureShowcaseTitle,
  type FeatureShowcaseVariant,
} from "@/registry/uai/blocks/feature-showcase";

function Fixture({ variant }: { variant?: FeatureShowcaseVariant }) {
  return (
    <FeatureShowcase variant={variant}>
      <FeatureShowcaseHeader>
        <FeatureShowcaseTitle>Less dispatching</FeatureShowcaseTitle>
      </FeatureShowcaseHeader>
      <FeatureShowcaseList>
        {["Routing", "Scheduling"].map((name) => (
          <FeatureShowcaseItem key={name}>
            <FeatureShowcaseContent>
              <FeatureShowcaseItemTitle>{name}</FeatureShowcaseItemTitle>
              <FeatureShowcaseItemDescription>{name} copy</FeatureShowcaseItemDescription>
              <FeatureShowcaseDetails>
                <DescriptionListItem>
                  <DescriptionListTerm>Saved</DescriptionListTerm>
                  <DescriptionListDetails>41 minutes</DescriptionListDetails>
                </DescriptionListItem>
              </FeatureShowcaseDetails>
            </FeatureShowcaseContent>
            <FeatureShowcaseMedia>
              <svg aria-hidden="true" />
            </FeatureShowcaseMedia>
          </FeatureShowcaseItem>
        ))}
      </FeatureShowcaseList>
    </FeatureShowcase>
  );
}

test("lists features under a labelled section with copy before media", () => {
  render(<Fixture />);
  const section = screen.getByRole("region", { name: "Less dispatching" });
  const items = within(section).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  const first = items[0] as HTMLElement;
  expect(within(first).getByRole("heading", { level: 3 }).textContent).toBe("Routing");
  expect(first.firstElementChild?.tagName).toBe("DIV");
  expect(first.lastElementChild?.tagName).toBe("FIGURE");
  expect(within(first).getByText("Saved").tagName).toBe("DT");
});

test("renders every variant and maps details to a matching description list", () => {
  const expected = { alternating: "inline", stacked: "inline", cards: "stacked" };
  for (const variant of FEATURE_SHOWCASE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    expect(view.container.querySelector("dl")?.dataset.variant).toBe(expected[variant]);
    view.unmount();
  }
});

test("guards regions outside the root", () => {
  expect(() => render(<FeatureShowcaseItem />)).toThrow(
    "FeatureShowcaseItem must be used within FeatureShowcase",
  );
});
