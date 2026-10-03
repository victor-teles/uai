import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  REACTION_BAR_VARIANTS,
  ReactionBar,
  ReactionBarItem,
  ReactionBarPicker,
  ReactionBarPickerOption,
  type ReactionBarProps,
} from "@/registry/uai/components/reaction-bar";

function Fixture(props: Omit<ReactionBarProps, "children">) {
  return (
    <ReactionBar {...props}>
      <ReactionBarItem value="up" emoji="👍" label="Thumbs up" count={3} />
      <ReactionBarItem value="heart" emoji="❤️" label="Heart" count={1} />
      <ReactionBarPicker>
        <ReactionBarPickerOption value="up" emoji="👍" label="Thumbs up" />
        <ReactionBarPickerOption value="heart" emoji="❤️" label="Heart" />
        <ReactionBarPickerOption value="eyes" emoji="👀" label="Eyes" />
      </ReactionBarPicker>
    </ReactionBar>
  );
}

test("names each reaction with its count and toggles pressed state", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string[]) => {});
  render(<Fixture onValueChange={change} />);
  expect(screen.getByRole("group", { name: "Reactions" })).toBeTruthy();
  const up = screen.getByRole("button", { name: "Thumbs up, 3 reactions" });
  expect(screen.getByRole("button", { name: "Heart, 1 reaction" })).toBeTruthy();
  expect(up.getAttribute("aria-pressed")).toBe("false");
  await user.click(up);
  expect(up.getAttribute("aria-pressed")).toBe("true");
  expect(change).toHaveBeenLastCalledWith(["up"]);
  await user.click(up);
  expect(change).toHaveBeenLastCalledWith([]);
});

test("opens the picker with the keyboard, roves focus, and restores focus", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string[]) => {});
  render(<Fixture defaultValue={["heart"]} onValueChange={change} />);
  const trigger = screen.getByRole("button", { name: "Add reaction" });
  trigger.focus();
  await user.keyboard("{ArrowDown}");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const items = screen.getAllByRole("menuitemcheckbox");
  expect(document.activeElement).toBe(items[0] as HTMLElement);
  expect(items[1]?.getAttribute("aria-checked")).toBe("true");
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(items[2] as HTMLElement);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(items[0] as HTMLElement);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  await user.keyboard("{ArrowUp}");
  expect(document.activeElement).toBe(screen.getAllByRole("menuitemcheckbox")[2] as HTMLElement);
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenLastCalledWith(["heart", "eyes"]);
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("respects controlled and disabled state", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string[]) => {});
  const view = render(<Fixture value={["up"]} onValueChange={change} />);
  const up = screen.getByRole("button", { name: "Thumbs up, 3 reactions" });
  await user.click(up);
  expect(change).toHaveBeenCalledWith([]);
  expect(up.getAttribute("aria-pressed")).toBe("true");
  view.rerender(<Fixture disabled />);
  expect((screen.getByRole("button", { name: "Add reaction" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});

test("renders every variant and guards compound children", () => {
  for (const variant of REACTION_BAR_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ReactionBarItem value="up" emoji="👍" label="Up" count={1} />)).toThrow(
    "ReactionBarItem must be used within ReactionBar",
  );
  expect(() =>
    render(
      <ReactionBar>
        <ReactionBarPickerOption value="up" emoji="👍" label="Up" />
      </ReactionBar>,
    ),
  ).toThrow("ReactionBarPickerOption must be used within ReactionBarPicker");
});
