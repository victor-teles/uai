import { afterEach, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ANNOUNCEMENT_BAR_VARIANTS,
  AnnouncementBar,
  AnnouncementBarAction,
  AnnouncementBarActions,
  AnnouncementBarDismiss,
  AnnouncementBarLabel,
  AnnouncementBarMessage,
  type AnnouncementBarProps,
} from "@/registry/uai/components/announcement-bar";

afterEach(() => window.localStorage.clear());

function Fixture(props: AnnouncementBarProps) {
  return (
    <AnnouncementBar {...props}>
      <AnnouncementBarLabel>New</AnnouncementBarLabel>
      <AnnouncementBarMessage>Shared workspaces are now on every plan.</AnnouncementBarMessage>
      <AnnouncementBarActions>
        <AnnouncementBarAction href="#notes">Read release notes</AnnouncementBarAction>
        <AnnouncementBarDismiss />
      </AnnouncementBarActions>
    </AnnouncementBar>
  );
}

test("is a region labelled by its message and dismisses with the keyboard", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  render(<Fixture onOpenChange={change} />);
  const region = screen.getByRole("region", { name: "Shared workspaces are now on every plan." });
  expect(region).toBeTruthy();
  expect(screen.getByRole("link", { name: "Read release notes" }).getAttribute("href")).toBe(
    "#notes",
  );
  await user.tab();
  await user.tab();
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Dismiss announcement");
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.queryByRole("region")).toBeNull();
});

test("remembers dismissal under a storage key", async () => {
  const user = userEvent.setup();
  const first = render(<Fixture storageKey="campaign-42" />);
  await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));
  expect(window.localStorage.getItem("campaign-42")).toBe("dismissed");
  first.unmount();
  render(<Fixture storageKey="campaign-42" />);
  expect(screen.queryByRole("region")).toBeNull();
});

test("respects controlled open state", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  const view = render(<Fixture open onOpenChange={change} />);
  await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("region")).toBeTruthy();
  view.rerender(<Fixture open={false} onOpenChange={change} />);
  expect(screen.queryByRole("region")).toBeNull();
});

test("renders every variant and guards compound children", () => {
  for (const variant of ANNOUNCEMENT_BAR_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<AnnouncementBarDismiss />)).toThrow(
    "AnnouncementBarDismiss must be used within AnnouncementBar",
  );
});
