import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkeletonGroupPreview } from "@/components/registry/feedback/skeleton-group-preview";
import {
  SKELETON_GROUP_VARIANTS,
  SkeletonGroup,
  SkeletonGroupBlock,
  SkeletonGroupCard,
  SkeletonGroupCircle,
  SkeletonGroupLine,
  SkeletonGroupRow,
  SkeletonGroupStack,
  type SkeletonGroupVariant,
} from "@/registry/uai/components/skeleton-group";

function Fixture({ variant }: { variant?: SkeletonGroupVariant }) {
  return (
    <SkeletonGroup variant={variant} label="Loading invoices">
      <SkeletonGroupCard>
        <SkeletonGroupBlock height={72} />
        <SkeletonGroupRow>
          <SkeletonGroupCircle size={32} />
          <SkeletonGroupStack>
            <SkeletonGroupLine width="40%" />
            <SkeletonGroupLine width={120} height={10} />
          </SkeletonGroupStack>
        </SkeletonGroupRow>
      </SkeletonGroupCard>
    </SkeletonGroup>
  );
}

test("announces a busy, labelled status and hides placeholder shapes", () => {
  const view = render(<Fixture />);
  const status = screen.getByRole("status");
  expect(status.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByText("Loading invoices").parentElement).toBe(status);
  const shapes = view.container.querySelectorAll(".uai-skeleton");
  expect(shapes.length).toBe(4);
  for (const shape of shapes) expect(shape.closest("[aria-hidden='true']")).toBeTruthy();
});

test("sizes shapes explicitly so loaded content can match them", () => {
  const view = render(<Fixture />);
  const [block, circle, line, small] = Array.from(
    view.container.querySelectorAll<HTMLElement>(".uai-skeleton"),
  );
  if (!block || !circle || !line || !small) throw new Error("Missing skeleton shapes");
  expect(block.style.height).toBe("72px");
  expect(circle.style.width).toBe("32px");
  expect(circle.style.height).toBe("32px");
  expect(line.style.width).toBe("40%");
  expect(small.style.width).toBe("120px");
  expect(small.style.height).toBe("10px");
});

test("applies motion per variant with a reduced-motion override", () => {
  for (const variant of SKELETON_GROUP_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelector(".uai-skeleton")?.getAttribute("data-motion")).toBe(
      variant,
    );
    expect(view.container.querySelector("style")?.textContent).toContain(
      "prefers-reduced-motion: reduce",
    );
    view.unmount();
  }
});

test("swaps to loaded content from the keyboard in the preview", async () => {
  const user = userEvent.setup();
  render(<SkeletonGroupPreview />);
  await user.tab();
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("region", { name: "Team members" }).textContent).toContain("Maya Chen");
});

test("guards compound children", () => {
  expect(() => render(<SkeletonGroupLine />)).toThrow(
    "SkeletonGroupLine must be used within SkeletonGroup",
  );
});
