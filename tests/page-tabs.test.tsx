import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PAGE_TABS_VARIANTS,
  PageTabs,
  PageTabsActions,
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  type PageTabsProps,
  PageTabsTab,
} from "@/registry/uai/components/page-tabs";

function Fixture(props: Omit<PageTabsProps, "children">) {
  return (
    <PageTabs defaultValue="open" {...props}>
      <PageTabsBar>
        <PageTabsList aria-label="Issues">
          <PageTabsTab value="open">
            Open <PageTabsCount>24</PageTabsCount>
          </PageTabsTab>
          <PageTabsTab value="review">In review</PageTabsTab>
          <PageTabsTab value="archived" disabled>
            Archived
          </PageTabsTab>
          <PageTabsTab value="closed">Closed</PageTabsTab>
        </PageTabsList>
        <PageTabsActions>
          <button type="button">New issue</button>
        </PageTabsActions>
      </PageTabsBar>
      <PageTabsPanel value="open">Open panel</PageTabsPanel>
      <PageTabsPanel value="review">Review panel</PageTabsPanel>
      <PageTabsPanel value="closed">Closed panel</PageTabsPanel>
    </PageTabs>
  );
}

test("links tabs and panels and keeps one tab in the tab order", () => {
  render(<Fixture />);
  const open = screen.getByRole("tab", { name: /Open/ });
  expect(open.getAttribute("aria-selected")).toBe("true");
  expect(open.tabIndex).toBe(0);
  expect(screen.getByRole("tab", { name: "In review" }).tabIndex).toBe(-1);
  const panel = screen.getByRole("tabpanel");
  expect(panel.textContent).toBe("Open panel");
  expect(panel.getAttribute("aria-labelledby")).toBe(open.id);
  expect(open.getAttribute("aria-controls")).toBe(panel.id);
  expect(open.textContent).toContain("24");
});

test("arrow keys, Home, and End move and activate tabs, skipping disabled ones", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture onValueChange={change} />);
  await user.click(screen.getByRole("tab", { name: /Open/ }));
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement?.textContent).toBe("In review");
  expect(screen.getByRole("tabpanel").textContent).toBe("Review panel");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement?.textContent).toBe("Closed");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement?.textContent).toContain("Open");
  await user.keyboard("{ArrowLeft}");
  expect(document.activeElement?.textContent).toBe("Closed");
  await user.keyboard("{Home}");
  expect(screen.getByRole("tabpanel").textContent).toBe("Open panel");
  await user.keyboard("{End}");
  expect(screen.getByRole("tabpanel").textContent).toBe("Closed panel");
  expect(change).toHaveBeenLastCalledWith("closed");
  await user.tab();
  expect(document.activeElement?.textContent).toBe("New issue");
});

test("respects a controlled value", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture value="open" onValueChange={change} />);
  await user.click(screen.getByRole("tab", { name: "Closed" }));
  expect(change).toHaveBeenCalledWith("closed");
  expect(screen.getByRole("tabpanel").textContent).toBe("Open panel");
});

test("renders every variant and guards compound children", () => {
  for (const variant of PAGE_TABS_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<PageTabsTab value="x">X</PageTabsTab>)).toThrow(
    "PageTabsTab must be used within PageTabs",
  );
  expect(() =>
    render(
      <PageTabs>
        <PageTabsCount>3</PageTabsCount>
      </PageTabs>,
    ),
  ).toThrow("PageTabsCount must be used within PageTabsTab");
});
