import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BREADCRUMB_TRAIL_VARIANTS,
  BreadcrumbTrail,
  BreadcrumbTrailCollapsed,
  BreadcrumbTrailItem,
  type BreadcrumbTrailProps,
} from "@/registry/uai/components/breadcrumb-trail";

// shadcn's BreadcrumbPage marks the current page as a disabled link; count navigable links only.
const navigableLinks = () =>
  screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current") !== "page");

function Fixture(props: Omit<BreadcrumbTrailProps, "children">) {
  return (
    <BreadcrumbTrail {...props}>
      <BreadcrumbTrailItem href="/">Northwind</BreadcrumbTrailItem>
      <BreadcrumbTrailCollapsed label="Show 2 more levels">
        <BreadcrumbTrailItem href="/projects">Projects</BreadcrumbTrailItem>
        <BreadcrumbTrailItem href="/projects/2026">2026 launches</BreadcrumbTrailItem>
      </BreadcrumbTrailCollapsed>
      <BreadcrumbTrailItem href="/projects/2026/q3" parent>
        Q3 mobile release
      </BreadcrumbTrailItem>
      <BreadcrumbTrailItem current>Accessibility review checklist</BreadcrumbTrailItem>
    </BreadcrumbTrail>
  );
}

test("renders a labelled breadcrumb with the current page and decorative separators", () => {
  render(<Fixture />);
  const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(nav.querySelector("ol")).not.toBeNull();
  const current = screen.getByText("Accessibility review checklist");
  expect(current.getAttribute("aria-current")).toBe("page");
  expect(current.getAttribute("title")).toBe("Accessibility review checklist");
  expect(current.getAttribute("aria-disabled")).toBe("true");
  expect(navigableLinks().map((link) => link.textContent)).toEqual([
    "Northwind",
    "Q3 mobile release",
  ]);
  const separators = nav.querySelectorAll("[data-slot='breadcrumb-separator']");
  expect(separators.length).toBe(3);
  for (const separator of separators) {
    expect(separator.getAttribute("aria-hidden")).toBe("true");
  }
});

test("reveals collapsed levels and moves focus to the first revealed link", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const reveal = screen.getByRole("button", { name: "Show 2 more levels" });
  expect(reveal.getAttribute("aria-expanded")).toBe("false");
  await user.click(reveal);
  expect(screen.queryByRole("button", { name: "Show 2 more levels" })).toBeNull();
  expect(navigableLinks()).toHaveLength(4);
  expect(document.activeElement?.textContent).toBe("Projects");
});

test("falls back to a single back link in compact mode", () => {
  render(<Fixture compact />);
  expect(screen.getAllByRole("link")).toHaveLength(1);
  const link = screen.getByRole("link", { name: "Back to Q3 mobile release" });
  expect(link.getAttribute("href")).toBe("/projects/2026/q3");
  expect(screen.queryByRole("button")).toBeNull();
});

test("renders every variant and guards compound children", () => {
  for (const variant of BREADCRUMB_TRAIL_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<BreadcrumbTrailItem>Home</BreadcrumbTrailItem>)).toThrow(
    "BreadcrumbTrailItem must be used within BreadcrumbTrail",
  );
});
