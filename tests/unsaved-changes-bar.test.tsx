import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  UNSAVED_CHANGES_BAR_VARIANTS,
  UnsavedChangesBar,
  UnsavedChangesBarDiscard,
  UnsavedChangesBarMessage,
  type UnsavedChangesBarProps,
  UnsavedChangesBarSave,
} from "@/registry/uai/components/unsaved-changes-bar";

function Fixture(props: UnsavedChangesBarProps) {
  return (
    <UnsavedChangesBar {...props}>
      <UnsavedChangesBarMessage />
      <UnsavedChangesBarDiscard />
      <UnsavedChangesBarSave />
    </UnsavedChangesBar>
  );
}
test("saves and discards through consumer callbacks without submitting a parent form", async () => {
  const user = userEvent.setup();
  const save = mock(() => {});
  const discard = mock(() => {});
  const submit = mock(() => {});
  const view = render(
    <form onSubmit={submit}>
      <Fixture dirty onSave={save} onDiscard={discard} />
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await user.click(screen.getByRole("button", { name: "Discard" }));
  expect(save).toHaveBeenCalledTimes(1);
  expect(discard).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
  view.unmount();
});
test("guards duplicate actions while saving and keeps failed changes available", async () => {
  const save = mock(() => {});
  const user = userEvent.setup();
  const view = render(<Fixture dirty status="saving" onSave={save} />);
  for (const button of screen.getAllByRole("button"))
    expect((button as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole("region").getAttribute("aria-busy")).toBe("true");
  view.rerender(<Fixture dirty status="error" onSave={save} />);
  expect(screen.getByRole("alert").textContent).toContain("could not be saved");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(save).toHaveBeenCalledTimes(1);
  view.rerender(<Fixture dirty={false} />);
  expect(screen.queryByRole("region")).toBeNull();
  view.unmount();
});
test("confirms a successful save before leaving", async () => {
  const view = render(<Fixture dirty status="saving" />);
  view.rerender(<Fixture dirty={false} status="idle" />);
  expect(screen.getByRole("status").textContent).toContain("Changes saved.");
  const saved = screen.getByRole("button", { name: "Saved" }) as HTMLButtonElement;
  expect(saved.disabled).toBe(true);
  expect(saved.className).toContain("bg-success/14");
  expect((screen.getByRole("button", { name: "Discard" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  const section = () => view.container.querySelector("section")?.dataset.state;
  expect(section()).toBe("saved");
  await waitFor(() => expect(section()).toBe("closing"), { timeout: 2000 });
  await waitFor(() => expect(section()).toBeUndefined());
  view.unmount();
});
test("warns on native navigation only while dirty and cleans up after unmount", () => {
  const view = render(<Fixture dirty />);
  const leave = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(leave);
  expect(leave.defaultPrevented).toBe(true);
  view.rerender(<Fixture dirty={false} />);
  const savedLeave = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(savedLeave);
  expect(savedLeave.defaultPrevented).toBe(false);
  view.rerender(<Fixture dirty warnBeforeUnload={false} />);
  const previewLeave = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(previewLeave);
  expect(previewLeave.defaultPrevented).toBe(false);
  view.rerender(<Fixture dirty />);
  view.unmount();
  const unmounted = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unmounted);
  expect(unmounted.defaultPrevented).toBe(false);
});
test("renders all save bar variants and guards its children", () => {
  for (const variant of UNSAVED_CHANGES_BAR_VARIANTS) {
    const view = render(<Fixture dirty variant={variant} warnBeforeUnload={false} />);
    expect(screen.getByRole("region").getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<UnsavedChangesBarSave />)).toThrow("within UnsavedChangesBar");
});
