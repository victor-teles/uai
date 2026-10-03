import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Bell, Boxes } from "lucide-react";

import {
  APP_HEADER_VARIANTS,
  AppHeader,
  AppHeaderAction,
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderMenuButton,
  AppHeaderNav,
  AppHeaderNavItem,
  AppHeaderOverflow,
  AppHeaderSearch,
  type AppHeaderVariant,
} from "@/registry/uai/components/app-header";

function AppHeaderFixture({ variant = "bar" }: { variant?: AppHeaderVariant }) {
  return (
    <AppHeader variant={variant}>
      <AppHeaderBrand href="/">
        <Boxes aria-hidden="true" />
        Atlas
      </AppHeaderBrand>
      <AppHeaderOverflow data-testid="overflow">
        <AppHeaderNav>
          <AppHeaderNavItem href="/overview" active>
            Overview
          </AppHeaderNavItem>
          <AppHeaderNavItem href="/projects">Projects</AppHeaderNavItem>
        </AppHeaderNav>
        <AppHeaderSearch placeholder="Search workspace" />
      </AppHeaderOverflow>
      <AppHeaderActions>
        <AppHeaderAction aria-label="Notifications">
          <Bell aria-hidden="true" />
        </AppHeaderAction>
      </AppHeaderActions>
      <AppHeaderMenuButton />
    </AppHeader>
  );
}

test("composes landmark, navigation, search, and account action semantics", () => {
  render(<AppHeaderFixture />);

  expect(screen.getByRole("banner").dataset.variant).toBe("bar");
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Overview" }).getAttribute("aria-current")).toBe("page");
  expect(screen.getByRole("searchbox", { name: "Search" }).getAttribute("placeholder")).toBe(
    "Search workspace",
  );
  expect(screen.getByRole("button", { name: "Notifications" }).getAttribute("type")).toBe("button");
});

test("renders bar, floating, and compact visual contexts from the root", () => {
  const { rerender } = render(<AppHeaderFixture />);
  const header = screen.getByRole("banner");

  expect(APP_HEADER_VARIANTS).toEqual(["bar", "floating", "compact"]);
  expect(header.className).toContain("rounded-none");
  expect(header.className).toContain("min-h-14");

  rerender(<AppHeaderFixture variant="floating" />);
  expect(header.dataset.variant).toBe("floating");
  expect(header.className).toContain("rounded-[14px]");
  expect(header.className).toContain("p-2");
  expect(header.className).toContain("shadow-[");

  rerender(<AppHeaderFixture variant="compact" />);
  expect(header.dataset.variant).toBe("compact");
  expect(header.className).toContain("rounded-xl");
  expect(header.className).toContain("min-h-11");
  expect(screen.getByRole("button", { name: "Notifications" }).className).toContain("size-7");
});

test("owns uncontrolled responsive overflow disclosure", () => {
  render(<AppHeaderFixture />);
  const menu = screen.getByRole("button", { name: "Open navigation" });
  const overflow = screen.getByTestId("overflow");

  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(menu.getAttribute("aria-controls")).toBe(overflow.id);
  expect(overflow.dataset.state).toBe("closed");

  fireEvent.click(menu);

  expect(
    screen.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded"),
  ).toBe("true");
  expect(overflow.dataset.state).toBe("open");
  expect(screen.getByRole("banner").dataset.open).toBe("true");
});

test("reports controlled responsive overflow changes without mutating the controlled state", () => {
  let requestedOpen: boolean | undefined;

  render(
    <AppHeader open={false} onOpenChange={(open) => (requestedOpen = open)}>
      <AppHeaderBrand href="/">Atlas</AppHeaderBrand>
      <AppHeaderOverflow data-testid="controlled-overflow" />
      <AppHeaderMenuButton />
    </AppHeader>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

  expect(requestedOpen).toBe(true);
  expect(screen.getByTestId("controlled-overflow").dataset.state).toBe("closed");
});

test("compound app header children require their root", () => {
  expect(() => render(<AppHeaderNavItem href="/">Overview</AppHeaderNavItem>)).toThrow(
    "AppHeaderNavItem must be used within AppHeader",
  );
});
