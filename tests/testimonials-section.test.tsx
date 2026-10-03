import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import {
  TestimonialCardAuthor,
  TestimonialCardName,
  TestimonialCardOrganization,
  TestimonialCardQuote,
  TestimonialCardRole,
} from "@/components/ui/uai/testimonial-card";
import {
  TESTIMONIALS_SECTION_VARIANTS,
  TestimonialsSection,
  TestimonialsSectionItem,
  TestimonialsSectionList,
  TestimonialsSectionTitle,
  type TestimonialsSectionVariant,
} from "@/registry/uai/blocks/testimonials-section";

const people = [
  { name: "Odile Marchetti", featured: true },
  { name: "Kwame Asante", featured: false },
];

function Fixture({ variant }: { variant?: TestimonialsSectionVariant }) {
  return (
    <TestimonialsSection variant={variant}>
      <TestimonialsSectionTitle>Customer stories</TestimonialsSectionTitle>
      <TestimonialsSectionList>
        {people.map((person) => (
          <TestimonialsSectionItem key={person.name} featured={person.featured}>
            <TestimonialCardQuote>
              <p>Quote from {person.name}</p>
            </TestimonialCardQuote>
            <TestimonialCardAuthor>
              <TestimonialCardName>{person.name}</TestimonialCardName>
              <TestimonialCardRole>Dispatch Lead</TestimonialCardRole>
              <TestimonialCardOrganization>Northfield Electric</TestimonialCardOrganization>
            </TestimonialCardAuthor>
          </TestimonialsSectionItem>
        ))}
      </TestimonialsSectionList>
    </TestimonialsSection>
  );
}

test("lists stories as figures with quotes and attribution", () => {
  render(<Fixture />);
  const section = screen.getByRole("region", { name: "Customer stories" });
  const items = within(section).getAllByRole("listitem");
  expect(items).toHaveLength(2);
  const figure = (items[0] as HTMLElement).querySelector("figure");
  expect(figure?.querySelector("blockquote")?.textContent).toBe("Quote from Odile Marchetti");
  expect(figure?.querySelector("figcaption")?.textContent).toContain("Northfield Electric");
});

test("maps the section layout to testimonial card variants", () => {
  const expected: Record<TestimonialsSectionVariant, [string, string]> = {
    grid: ["card", "card"],
    featured: ["editorial", "card"],
    wall: ["compact", "compact"],
  };
  for (const variant of TESTIMONIALS_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    const cards = Array.from(view.container.querySelectorAll("figure")).map(
      (figure) => figure.dataset.variant,
    );
    expect(cards).toEqual(expected[variant]);
    view.unmount();
  }
});

test("guards regions outside the root", () => {
  expect(() => render(<TestimonialsSectionItem />)).toThrow(
    "TestimonialsSectionItem must be used within TestimonialsSection",
  );
});
