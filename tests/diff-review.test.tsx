import { expect, mock, test } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DIFF_REVIEW_VARIANTS,
  DiffReview,
  DiffReviewFile,
  type DiffReviewFileData,
  DiffReviewFileHeader,
  DiffReviewFileList,
  DiffReviewFooter,
  DiffReviewHunks,
  type DiffReviewProps,
  DiffReviewStale,
  diffReviewFilesFromPatch,
} from "@/registry/uai/components/diff-review";

const files: DiffReviewFileData[] = [
  {
    path: "src/lib/pricing.ts",
    hunks: [
      {
        id: "a",
        header: "export function totalFor(cart)",
        oldStart: 12,
        newStart: 12,
        lines: [
          { kind: "context", content: "export function totalFor(cart: Cart) {" },
          { kind: "del", content: "  const subtotal = sum(cart.items.map((i) => i.price));" },
          { kind: "add", content: "  const subtotal = sum(cart.items, lineTotal);" },
          { kind: "add", content: "  const discount = applyCoupon(subtotal, cart.coupon);" },
          { kind: "context", content: "  const shipping = shippingFor(cart);" },
        ],
      },
      {
        id: "b",
        oldStart: 19,
        newStart: 22,
        lines: [
          { kind: "del", content: "  return subtotal + shipping;" },
          { kind: "add", content: "  return Math.max(0, subtotal - discount + shipping);" },
          { kind: "add", content: "}" },
          { kind: "add", content: "" },
          { kind: "add", content: "const lineTotal = (i: Item) => i.price * i.qty;" },
        ],
      },
    ],
  },
  {
    path: "src/lib/coupons.ts",
    hunks: [
      {
        id: "c",
        oldStart: 4,
        newStart: 4,
        lines: [
          { kind: "del", content: "  if (!code) return subtotal;" },
          { kind: "add", content: "  if (!code) return 0;" },
        ],
      },
    ],
  },
];

function Review(props: Partial<DiffReviewProps>) {
  return (
    <DiffReview files={files} {...props}>
      {props.variant === "compact" ? (
        <DiffReviewFileList />
      ) : (
        files.map((file) => (
          <DiffReviewFile key={file.path} path={file.path}>
            <DiffReviewFileHeader />
            <DiffReviewStale />
            <DiffReviewHunks />
          </DiffReviewFile>
        ))
      )}
      <DiffReviewFooter />
    </DiffReview>
  );
}

const reduce = () =>
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({ matches: query.includes("reduce"), addEventListener() {} }),
  });

test("exports the unified and compact variants", () => {
  expect(DIFF_REVIEW_VARIANTS).toEqual(["unified", "compact"]);
});

test("parts throw outside the root", () => {
  const error = console.error;
  console.error = () => {};
  expect(() => render(<DiffReviewFooter />)).toThrow(
    "DiffReviewFooter must be used within DiffReview",
  );
  expect(() =>
    render(
      <DiffReview files={files}>
        <DiffReviewHunks />
      </DiffReview>,
    ),
  ).toThrow("DiffReviewHunks must be used within DiffReviewFile");
  console.error = error;
});

test("names files and hunks and prefixes every changed line for screen readers", () => {
  render(<Review />);
  expect(screen.getByRole("region", { name: "src/lib/pricing.ts" })).toBeTruthy();
  const hunk = screen.getByRole("region", { name: "Lines 19–25: 4 added, 1 removed" });
  const items = within(hunk)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
  expect(items[0]).toBe("removed,   return subtotal + shipping;");
  expect(items[1]).toStartWith("added, ");
  expect(screen.getByRole("region", { name: "Lines 13–14: 2 added, 1 removed" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Accept change at lines 13–14" })).toBeTruthy();
  expect(screen.getByText("Proposed by the agent · 3 of 3 pending")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Accept all" })).toBeTruthy();
});

test("accepting collapses to a resolved row, announces, and moves focus to Undo", async () => {
  reduce();
  const onValueChange = mock();
  render(<Review onValueChange={onValueChange} />);
  await userEvent.click(screen.getByRole("button", { name: "Accept change at lines 13–14" }));
  expect(onValueChange).toHaveBeenLastCalledWith({ a: "accepted" });
  expect(screen.getByText("Accepted lines 13–14")).toBeTruthy();
  const undo = screen.getByRole("button", { name: "Undo, accepted lines 13–14" });
  expect(document.activeElement).toBe(undo);
  expect(screen.getByRole("status").textContent).toBe("Change at lines 13–14 accepted. 2 pending.");
  expect(screen.getByText("1 accepted · 0 rejected · 2 pending")).toBeTruthy();
  await userEvent.click(undo);
  expect(onValueChange).toHaveBeenLastCalledWith({ a: "pending" });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Accept change at lines 13–14" }),
  );
});

test("y, n and ] work inside a hunk but never in text fields", async () => {
  reduce();
  const onValueChange = mock();
  render(
    <>
      <Review onValueChange={onValueChange} />
      <input aria-label="Notes" />
    </>,
  );
  screen.getByRole("button", { name: "Reject change at lines 13–14" }).focus();
  await userEvent.keyboard("]");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Accept change at lines 19–25" }),
  );
  await userEvent.keyboard("n");
  expect(onValueChange).toHaveBeenLastCalledWith({ b: "rejected" });
  expect(screen.getByText("Rejected lines 19–25")).toBeTruthy();
  screen.getByRole("textbox", { name: "Notes" }).focus();
  await userEvent.keyboard("y");
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test("a stale file shows the warning and keeps Accept off", async () => {
  reduce();
  const onValueChange = mock();
  render(<Review stale={["src/lib/coupons.ts"]} onValueChange={onValueChange} />);
  expect(
    screen.getByText("coupons.ts changed after this edit. Review it again before accepting."),
  ).toBeTruthy();
  const accept = screen.getByRole("button", {
    name: "Accept change at lines 4",
  }) as HTMLButtonElement;
  expect(accept.disabled).toBe(true);
  await userEvent.click(screen.getByRole("button", { name: "Accept 2 pending" }));
  expect(onValueChange).toHaveBeenLastCalledWith({ a: "accepted", b: "accepted" });
});

test("footer moves from Accept all to Apply and Nothing to apply", async () => {
  const onApply = mock();
  const { rerender } = render(
    <Review value={{ a: "accepted", b: "rejected", c: "accepted" }} onApply={onApply} />,
  );
  expect(screen.getByText("All changes reviewed")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Apply 2 changes" }));
  expect(onApply).toHaveBeenCalledWith({ a: "accepted", b: "rejected", c: "accepted" });
  expect(screen.getAllByText("Reviewed").length).toBe(2);
  rerender(<Review value={{ a: "accepted", b: "rejected", c: "accepted" }} applied />);
  expect(screen.getAllByText("Applied").length).toBe(2);
  expect(screen.queryByRole("button", { name: /^Apply/ })).toBeNull();
  rerender(<Review value={{ a: "rejected", b: "rejected", c: "rejected" }} />);
  expect(screen.getByText("Nothing to apply")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /^Apply|^Accept/ })).toBeNull();
});

test("Reject all decides every pending change and announces it", async () => {
  const onValueChange = mock();
  render(<Review defaultValue={{ a: "accepted" }} onValueChange={onValueChange} />);
  await userEvent.click(screen.getByRole("button", { name: "Reject all" }));
  expect(onValueChange).toHaveBeenLastCalledWith({ a: "accepted", b: "rejected", c: "rejected" });
  expect(screen.getByRole("status").textContent).toBe("All changes reviewed.");
});

test("the file header collapses its hunks and live counters skip rejected changes", async () => {
  render(<Review defaultValue={{ b: "rejected" }} />);
  const toggle = screen.getAllByRole("button", { expanded: true })[0] as HTMLElement;
  expect(toggle.getAttribute("aria-controls")).toBeTruthy();
  const header = toggle.closest("[data-slot=diff-review-file-header]") as HTMLElement;
  expect(header.textContent).toContain("added +2");
  expect(header.textContent).toContain("removed −1");
  await userEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const region = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
  expect(region?.hasAttribute("inert")).toBe(true);
});

test("compact lists files with status and expands one inline", async () => {
  render(<Review variant="compact" defaultValue={{ c: "rejected" }} stale={[]} />);
  expect(screen.getByRole("heading", { name: "2 files changed" })).toBeTruthy();
  const row = screen.getByRole("button", { name: /2 pending:.*pricing\.ts/ });
  expect(row.getAttribute("aria-expanded")).toBe("false");
  expect(screen.getByRole("button", { name: /Rejected:.*coupons\.ts/ })).toBeTruthy();
  await act(async () => {
    await userEvent.click(row);
  });
  expect(row.getAttribute("aria-expanded")).toBe("true");
  expect(screen.queryByRole("button", { name: "Reject all" })).toBeNull();
});

test("parses a unified patch into files and hunks", () => {
  const parsed = diffReviewFilesFromPatch(`diff --git a/a.ts b/a.ts
--- a/a.ts
+++ b/a.ts
@@ -1,3 +1,3 @@ function a()
 const x = 1;
-const y = 2;
+const y = 3;
 const z = 4;
`);
  expect(parsed).toHaveLength(1);
  expect(parsed[0]?.path).toBe("a.ts");
  expect(parsed[0]?.hunks[0]?.lines.map((line) => line.kind)).toEqual([
    "context",
    "del",
    "add",
    "context",
  ]);
  expect(parsed[0]?.hunks[0]?.lines[2]?.content).toBe("const y = 3;");
});
