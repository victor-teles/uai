import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  COMMAND_MENU_VARIANTS,
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuGroupLabel,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  type CommandMenuProps,
  CommandMenuShortcut,
} from "@/registry/uai/components/command-menu";

function Fixture({
  run = () => {},
  ...props
}: Omit<CommandMenuProps, "children"> & { run?: (name: string) => void }) {
  return (
    <CommandMenu label="Workspace commands" {...props}>
      <CommandMenuInput />
      <CommandMenuList>
        <CommandMenuGroup>
          <CommandMenuGroupLabel>Create</CommandMenuGroupLabel>
          <CommandMenuItem value="New document" keywords={["file"]} onSelect={() => run("new")}>
            New document <CommandMenuShortcut>⌘N</CommandMenuShortcut>
          </CommandMenuItem>
          <CommandMenuItem value="Invite teammate" onSelect={() => run("invite")}>
            Invite teammate
          </CommandMenuItem>
        </CommandMenuGroup>
        <CommandMenuGroup>
          <CommandMenuGroupLabel>Navigate</CommandMenuGroupLabel>
          <CommandMenuItem value="Workspace settings" onSelect={() => run("settings")}>
            Workspace settings
          </CommandMenuItem>
          <CommandMenuItem value="Switch theme" disabled onSelect={() => run("theme")}>
            Switch theme
          </CommandMenuItem>
        </CommandMenuGroup>
        <CommandMenuEmpty />
      </CommandMenuList>
    </CommandMenu>
  );
}
const active = () => {
  const input = screen.getByRole("combobox");
  const id = input.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : null;
};

test("wires the combobox to a grouped listbox and activates the first option", () => {
  render(<Fixture />);
  const input = screen.getByRole("combobox", { name: "Workspace commands" });
  const list = screen.getByRole("listbox", { name: "Workspace commands" });
  expect(input.getAttribute("aria-controls")).toBe(list.id);
  expect(input.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("group", { name: "Create" })).toBeTruthy();
  expect(active()).toContain("New document");
});

test("arrows, Home, End, and Enter navigate and run enabled options", async () => {
  const user = userEvent.setup();
  const run = mock((_name: string) => {});
  render(<Fixture run={run} />);
  await user.click(screen.getByRole("combobox"));
  await user.keyboard("{ArrowDown}");
  expect(active()).toBe("Invite teammate");
  await user.keyboard("{End}");
  expect(active()).toBe("Workspace settings");
  await user.keyboard("{ArrowDown}");
  expect(active()).toContain("New document");
  await user.keyboard("{ArrowUp}");
  expect(active()).toBe("Workspace settings");
  await user.keyboard("{Home}{Enter}");
  expect(run).toHaveBeenLastCalledWith("new");
  await user.click(screen.getByRole("option", { name: "Switch theme" }));
  expect(run).not.toHaveBeenCalledWith("theme");
  await user.click(screen.getByRole("option", { name: "Invite teammate" }));
  expect(run).toHaveBeenLastCalledWith("invite");
});

test("filters options and groups, announces empty results, and clears on Escape", async () => {
  const user = userEvent.setup();
  const dismiss = mock(() => {});
  render(<Fixture onDismiss={dismiss} />);
  const input = screen.getByRole("combobox") as HTMLInputElement;
  await user.type(input, "file");
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
    "New document ⌘N",
  ]);
  expect(screen.queryByRole("group", { name: "Navigate" })).toBeNull();
  expect(active()).toContain("New document");
  await user.clear(input);
  await user.type(input, "zzz");
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  expect(screen.getByRole("status").textContent).toContain("No results");
  expect(input.getAttribute("aria-expanded")).toBe("false");
  expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  await user.keyboard("{Escape}");
  expect(input.value).toBe("");
  expect(dismiss).not.toHaveBeenCalled();
  expect(screen.getAllByRole("option")).toHaveLength(4);
  await user.keyboard("{Escape}");
  expect(dismiss).toHaveBeenCalledTimes(1);
});

test("supports a controlled query", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture value="settings" onValueChange={change} />);
  expect(screen.getAllByRole("option")).toHaveLength(1);
  await user.type(screen.getByRole("combobox"), "x");
  expect(change).toHaveBeenCalledWith("settingsx");
  expect(screen.getAllByRole("option")).toHaveLength(1);
});

test("renders every variant and guards compound children", () => {
  for (const variant of COMMAND_MENU_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CommandMenuItem value="x">X</CommandMenuItem>)).toThrow(
    "CommandMenuItem must be used within CommandMenu",
  );
});
