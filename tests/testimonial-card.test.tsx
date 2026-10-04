import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
  TESTIMONIAL_CARD_VARIANTS,
  TestimonialCard,
  TestimonialCardAuthor,
  TestimonialCardAvatar,
  TestimonialCardName,
  TestimonialCardOrganization,
  TestimonialCardProof,
  TestimonialCardQuote,
  TestimonialCardRole,
  type TestimonialCardVariant,
} from "@/registry/uai/components/testimonial-card";

function Fixture({ variant }: { variant?: TestimonialCardVariant }) {
  return (
    <TestimonialCard variant={variant}>
      <TestimonialCardQuote cite="https://example.com/case-study">
        <p>First-reply time dropped from six hours to under two.</p>
      </TestimonialCardQuote>
      <TestimonialCardAuthor>
        <TestimonialCardAvatar>ML</TestimonialCardAvatar>
        <TestimonialCardName>Mara Lindqvist</TestimonialCardName>
        <TestimonialCardRole>Head of Support</TestimonialCardRole>
        <TestimonialCardOrganization>Brightmoor</TestimonialCardOrganization>
      </TestimonialCardAuthor>
      <TestimonialCardProof href="https://example.com/case-study">
        Read the case study
      </TestimonialCardProof>
    </TestimonialCard>
  );
}

test("ties the quote to its attribution with figure semantics", () => {
  const view = render(<Fixture />);
  const figure = screen.getByRole("figure");
  expect(figure.querySelector("blockquote")?.getAttribute("cite")).toBe(
    "https://example.com/case-study",
  );
  const caption = figure.querySelector("figcaption");
  expect(caption?.textContent).toContain("Mara Lindqvist");
  expect(caption?.textContent).toContain("Head of Support");
  expect(caption?.textContent).toContain("Brightmoor");
  expect(
    view
      .getByText("ML")
      .closest("[data-slot='testimonial-card-avatar']")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(screen.getByRole("link", { name: "Read the case study" }).getAttribute("href")).toBe(
    "https://example.com/case-study",
  );
});

test("renders an image avatar decoratively", () => {
  // The Avatar primitive renders its image only after it loads; happy-dom never loads images.
  const prototype = window.HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(prototype, "complete");
  const naturalWidth = Object.getOwnPropertyDescriptor(prototype, "naturalWidth");
  Object.defineProperty(prototype, "complete", { configurable: true, get: () => true });
  Object.defineProperty(prototype, "naturalWidth", { configurable: true, get: () => 32 });
  try {
    const view = render(
      <TestimonialCard>
        <TestimonialCardAuthor>
          <TestimonialCardAvatar src="/avatar.png" />
          <TestimonialCardName>Mara</TestimonialCardName>
        </TestimonialCardAuthor>
      </TestimonialCard>,
    );
    const image = view.container.querySelector("img");
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.closest("[aria-hidden='true']")).toBeTruthy();
  } finally {
    if (complete) Object.defineProperty(prototype, "complete", complete);
    else Reflect.deleteProperty(prototype, "complete");
    if (naturalWidth) Object.defineProperty(prototype, "naturalWidth", naturalWidth);
    else Reflect.deleteProperty(prototype, "naturalWidth");
  }
});

test("renders every variant and guards compound children", () => {
  for (const variant of TESTIMONIAL_CARD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<TestimonialCardQuote />)).toThrow(
    "TestimonialCardQuote must be used within TestimonialCard",
  );
});
