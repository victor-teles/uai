import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { EmptyStateTitle } from "@/components/ui/uai/empty-state";
import {
  PageTabsBar,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
} from "@/components/ui/uai/page-tabs";
import {
  NOTIFICATION_CENTER_VARIANTS,
  NotificationCenter,
  NotificationCenterAction,
  NotificationCenterEmpty,
  NotificationCenterGroup,
  NotificationCenterGroupDate,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemContent,
  NotificationCenterItemTitle,
  NotificationCenterItemToggle,
  NotificationCenterList,
  NotificationCenterTabs,
  NotificationCenterTitle,
  type NotificationCenterVariant,
} from "@/registry/uai/blocks/notification-center";

function Fixture({ variant }: { variant?: NotificationCenterVariant }) {
  const [read, setRead] = useState({ payout: false, stock: true });
  const unread = Object.values(read).filter((value) => !value).length;
  return (
    <NotificationCenter variant={variant}>
      <NotificationCenterTitle>Notifications</NotificationCenterTitle>
      <NotificationCenterAction
        disabled={unread === 0}
        onClick={() => setRead({ payout: true, stock: true })}
      >
        Mark all as read
      </NotificationCenterAction>
      <NotificationCenterTabs defaultValue="all">
        <PageTabsBar>
          <PageTabsList aria-label="Filter notifications">
            <PageTabsTab value="all">All</PageTabsTab>
            <PageTabsTab value="mentions">Mentions</PageTabsTab>
          </PageTabsList>
        </PageTabsBar>
        <PageTabsPanel value="all">
          <NotificationCenterGroup>
            <NotificationCenterGroupDate>Today</NotificationCenterGroupDate>
            <NotificationCenterList>
              <NotificationCenterItem
                read={read.payout}
                onReadChange={(value) => setRead({ ...read, payout: value })}
              >
                <NotificationCenterItemContent>
                  <NotificationCenterItemTitle>Payout sent</NotificationCenterItemTitle>
                </NotificationCenterItemContent>
                <NotificationCenterItemActions>
                  <NotificationCenterItemToggle />
                </NotificationCenterItemActions>
              </NotificationCenterItem>
              <NotificationCenterItem
                read={read.stock}
                onReadChange={(value) => setRead({ ...read, stock: value })}
              >
                <NotificationCenterItemContent>
                  <NotificationCenterItemTitle>Low stock</NotificationCenterItemTitle>
                </NotificationCenterItemContent>
                <NotificationCenterItemActions>
                  <NotificationCenterItemToggle />
                </NotificationCenterItemActions>
              </NotificationCenterItem>
            </NotificationCenterList>
          </NotificationCenterGroup>
        </PageTabsPanel>
        <PageTabsPanel value="mentions">
          <NotificationCenterEmpty>
            <EmptyStateTitle>You’re all caught up</EmptyStateTitle>
          </NotificationCenterEmpty>
        </PageTabsPanel>
      </NotificationCenterTabs>
    </NotificationCenter>
  );
}

test("groups items by date and announces unread state in text", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Today" })).toBeTruthy();
  expect(screen.getByText("Payout sent").textContent).toBe("Unread: Payout sent");
  expect(screen.getByText("Low stock").textContent).toBe("Low stock");
  const toggle = screen.getAllByRole("button", { name: "Mark as read" })[0];
  expect(toggle?.getAttribute("aria-describedby")).toBe(screen.getByText(/Payout sent/).id);
});

test("toggles single items and marks everything as read", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Mark as unread" }));
  expect(screen.getAllByRole("button", { name: "Mark as read" })).toHaveLength(2);
  const all = screen.getByRole("button", { name: "Mark all as read" }) as HTMLButtonElement;
  await user.click(all);
  expect(screen.getAllByRole("button", { name: "Mark as unread" })).toHaveLength(2);
  expect(all.disabled).toBe(true);
});

test("switches filters with arrow keys and shows an empty state", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  screen.getByRole("tab", { name: "All" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Mentions" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.getByRole("region", { name: "You’re all caught up" })).toBeTruthy();
});

test("supports uncontrolled items, maps variants, and guards parts", async () => {
  const user = userEvent.setup();
  const view = render(
    <NotificationCenter>
      <NotificationCenterList>
        <NotificationCenterItem defaultRead>
          <NotificationCenterItemTitle>Invite accepted</NotificationCenterItemTitle>
          <NotificationCenterItemToggle />
        </NotificationCenterItem>
      </NotificationCenterList>
    </NotificationCenter>,
  );
  await user.click(screen.getByRole("button", { name: "Mark as unread" }));
  expect(screen.getByRole("listitem").hasAttribute("data-read")).toBe(false);
  view.unmount();
  const tabs = { panel: "underline", page: "pill", compact: "segmented" };
  for (const variant of NOTIFICATION_CENTER_VARIANTS) {
    const rendered = render(<Fixture variant={variant} />);
    expect(rendered.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(
      screen.getByRole("tablist").parentElement?.parentElement?.getAttribute("data-variant"),
    ).toBe(tabs[variant]);
    rendered.unmount();
  }
  expect(() => render(<NotificationCenterList />)).not.toThrow();
  expect(() =>
    render(
      <NotificationCenter>
        <NotificationCenterItemToggle />
      </NotificationCenter>,
    ),
  ).toThrow("NotificationCenterItemToggle must be used within NotificationCenterItem");
  expect(() => render(<NotificationCenterTitle>Inbox</NotificationCenterTitle>)).toThrow(
    "NotificationCenterTitle must be used within NotificationCenter",
  );
});
