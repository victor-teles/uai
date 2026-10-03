import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CITATION_VARIANTS,
  Citation,
  CitationClaim,
  CitationExcerpt,
  CitationLink,
  CitationPopover,
  type CitationProps,
  CitationSource,
  CitationTitle,
  CitationTrigger,
} from "@/registry/uai/components/citation";

function Fixture(props: CitationProps) {
  return (
    <p>
      Heat pumps cut emissions{" "}
      <Citation index={1} {...props}>
        <CitationClaim>by roughly 45%</CitationClaim>
        <CitationTrigger />
        <CitationPopover>
          <CitationSource>iea.org</CitationSource>
          <CitationTitle>The Future of Heat Pumps</CitationTitle>
          <CitationExcerpt>Emissions fall by around 45%.</CitationExcerpt>
          <CitationLink href="https://www.iea.org">Open report</CitationLink>
        </CitationPopover>
      </Citation>{" "}
      <button type="button">After</button>
    </p>
  );
}

test("opens on focus, lets keyboard users reach the link, and closes on Escape", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: "Source 1" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  await user.tab();
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const preview = screen.getByRole("group", { name: "The Future of Heat Pumps" });
  expect(trigger.getAttribute("aria-controls")).toBe(preview.id);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("link", { name: "Open report" }));
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

test("closes when focus leaves the citation", async () => {
  const user = userEvent.setup();
  render(<Fixture defaultOpen />);
  screen.getByRole("link").focus();
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  expect(screen.queryByRole("group")).toBeNull();
});

test("opens on hover and reports controlled changes", () => {
  const change = mock((_open: boolean) => {});
  const view = render(<Fixture open={false} onOpenChange={change} />);
  const root = view.container.querySelector("[data-variant]") as HTMLElement;
  fireEvent.pointerEnter(root, { pointerType: "mouse" });
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByRole("button", { name: "Source 1" }).getAttribute("aria-expanded")).toBe(
    "false",
  );
});

test("renders every variant and guards compound children", () => {
  for (const variant of CITATION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("[data-variant]")?.getAttribute("data-variant")).toBe(
      variant,
    );
    view.unmount();
  }
  expect(() => render(<CitationTrigger />)).toThrow("CitationTrigger must be used within Citation");
});
