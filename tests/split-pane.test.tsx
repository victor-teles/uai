import { afterEach, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SPLIT_PANE_VARIANTS,
  SplitPane,
  SplitPaneHandle,
  SplitPanePrimary,
  type SplitPaneProps,
  SplitPaneSecondary,
} from "@/registry/uai/components/split-pane";

function Fixture(props: Omit<SplitPaneProps, "children">) {
  return (
    <SplitPane {...props}>
      <SplitPanePrimary>Inbox</SplitPanePrimary>
      <SplitPaneHandle />
      <SplitPaneSecondary>Conversation</SplitPaneSecondary>
    </SplitPane>
  );
}
afterEach(() => window.localStorage.clear());

test("exposes a window splitter that resizes with the keyboard within bounds", async () => {
  const user = userEvent.setup();
  const change = mock((_value: number) => {});
  render(<Fixture defaultValue={40} min={20} max={70} step={10} onValueChange={change} />);
  const handle = screen.getByRole("separator", { name: "Resize panels" });
  expect(handle.getAttribute("aria-orientation")).toBe("vertical");
  expect(handle.getAttribute("aria-valuenow")).toBe("40");
  expect(handle.getAttribute("aria-controls")).toBe(screen.getByText("Inbox").id);
  handle.focus();
  await user.keyboard("{ArrowRight}");
  expect(handle.getAttribute("aria-valuenow")).toBe("50");
  await user.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(handle.getAttribute("aria-valuenow")).toBe("30");
  await user.keyboard("{End}");
  expect(handle.getAttribute("aria-valuenow")).toBe("70");
  await user.keyboard("{ArrowRight}");
  expect(handle.getAttribute("aria-valuenow")).toBe("70");
  await user.keyboard("{Home}");
  expect(handle.getAttribute("aria-valuenow")).toBe("20");
  expect(change).toHaveBeenLastCalledWith(20);
  expect(screen.getByText("Inbox").style.flex).toContain("20%");
});

test("Enter collapses the primary region to its minimum and restores it", async () => {
  const user = userEvent.setup();
  render(<Fixture defaultValue={45} min={15} />);
  const handle = screen.getByRole("separator");
  handle.focus();
  await user.keyboard("{Enter}");
  expect(handle.getAttribute("aria-valuenow")).toBe("15");
  await user.keyboard("{Enter}");
  expect(handle.getAttribute("aria-valuenow")).toBe("45");
});

test("vertical orientation uses up and down arrows", async () => {
  const user = userEvent.setup();
  render(<Fixture orientation="vertical" defaultValue={50} />);
  const handle = screen.getByRole("separator");
  expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
  handle.focus();
  await user.keyboard("{ArrowDown}");
  expect(handle.getAttribute("aria-valuenow")).toBe("55");
  await user.keyboard("{ArrowUp}{ArrowUp}");
  expect(handle.getAttribute("aria-valuenow")).toBe("45");
});

test("drags with the pointer relative to the container", () => {
  const { container } = render(<Fixture defaultValue={50} />);
  const root = container.firstElementChild as HTMLElement;
  root.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 400, height: 200, right: 400, bottom: 200 }) as DOMRect;
  const handle = screen.getByRole("separator");
  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 200 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 120 });
  expect(handle.getAttribute("aria-valuenow")).toBe("30");
  fireEvent.pointerUp(handle, { pointerId: 1 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 300 });
  expect(handle.getAttribute("aria-valuenow")).toBe("30");
});

test("saves and restores proportions and respects controlled values", async () => {
  const user = userEvent.setup();
  window.localStorage.setItem("split", "62");
  const view = render(<Fixture storageKey="split" />);
  const handle = screen.getByRole("separator");
  expect(handle.getAttribute("aria-valuenow")).toBe("62");
  handle.focus();
  await user.keyboard("{ArrowRight}");
  expect(window.localStorage.getItem("split")).toBe("67");
  view.unmount();
  const change = mock((_value: number) => {});
  render(<Fixture value={40} onValueChange={change} />);
  const controlled = screen.getByRole("separator");
  controlled.focus();
  await user.keyboard("{ArrowRight}");
  expect(change).toHaveBeenCalledWith(45);
  expect(controlled.getAttribute("aria-valuenow")).toBe("40");
});

test("renders every variant and guards compound children", () => {
  for (const variant of SPLIT_PANE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<SplitPaneHandle />)).toThrow(
    "SplitPaneHandle must be used within SplitPane",
  );
});
