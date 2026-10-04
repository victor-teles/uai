import { afterEach, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SHARE_MENU_VARIANTS,
  ShareMenu,
  ShareMenuChannel,
  ShareMenuContent,
  ShareMenuCopy,
  ShareMenuNative,
  type ShareMenuProps,
  ShareMenuSeparator,
  ShareMenuTrigger,
} from "@/registry/uai/components/share-menu";

const url = "https://example.com/post";
function Fixture(props: Omit<ShareMenuProps, "url" | "children">) {
  return (
    <ShareMenu url={url} shareTitle="Post" {...props}>
      <ShareMenuTrigger />
      <ShareMenuContent>
        <ShareMenuNative />
        <ShareMenuCopy />
        <ShareMenuSeparator />
        <ShareMenuChannel href="mailto:?body=post">Email</ShareMenuChannel>
      </ShareMenuContent>
    </ShareMenu>
  );
}
const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
afterEach(() => {
  if (originalShare) Object.defineProperty(navigator, "share", originalShare);
  else delete (navigator as { share?: unknown }).share;
});

test("follows the APG menu button keyboard pattern", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: "Share" });
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  trigger.focus();
  await user.keyboard("{ArrowDown}");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const items = screen.getAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual(["Copy link", "Email"]);
  expect(document.activeElement).toBe(items[0] as HTMLElement);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(items[1] as HTMLElement);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(items[0] as HTMLElement);
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(items[1] as HTMLElement);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await user.keyboard("{ArrowUp}");
  expect(document.activeElement).toBe(screen.getAllByRole("menuitem")[1] as HTMLElement);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
});

test("copies the link and announces the result", async () => {
  const user = userEvent.setup();
  const write = mock(async (_text: string) => {});
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: write },
    configurable: true,
  });
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Share" }));
  await user.click(screen.getByRole("menuitem", { name: "Copy link" }));
  expect(write).toHaveBeenCalledWith(url);
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Link copied to clipboard"),
  );
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Share" }));
  write.mockImplementation(async () => {
    throw new Error("denied");
  });
  await user.click(screen.getByRole("button", { name: "Share" }));
  await user.click(screen.getByRole("menuitem", { name: "Copy link" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Couldn’t copy the link"),
  );
});

test("offers native sharing only when the browser supports it", async () => {
  const user = userEvent.setup();
  const share = mock(async (_data: ShareData) => {});
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Share" }));
  await user.click(screen.getByRole("menuitem", { name: "Share via…" }));
  expect(share).toHaveBeenCalledWith({ url, title: "Post", text: undefined });
});

test("supports controlled open state and closes on outside pointer", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  const view = render(<Fixture open onOpenChange={change} />);
  expect(screen.getByRole("menu")).toBeTruthy();
  await user.click(document.body);
  expect(change).toHaveBeenCalledWith(false);
  view.rerender(<Fixture open={false} onOpenChange={change} />);
  expect(screen.queryByRole("menu")).toBeNull();
});

test("renders every variant and guards compound children", () => {
  for (const variant of SHARE_MENU_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ShareMenuTrigger />)).toThrow(
    "ShareMenuTrigger must be used within ShareMenu",
  );
});
