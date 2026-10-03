import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DESCRIPTION_LIST_VARIANTS,
  DescriptionList,
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  type DescriptionListVariant,
} from "@/registry/uai/components/description-list";

function Fixture({ variant, onEdit }: { variant?: DescriptionListVariant; onEdit?: () => void }) {
  return (
    <DescriptionList variant={variant}>
      <DescriptionListItem>
        <DescriptionListTerm>Owner</DescriptionListTerm>
        <DescriptionListDetails>
          Priya Raman
          <DescriptionListAction onClick={onEdit}>Change</DescriptionListAction>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  );
}

test("renders native term and details pairs", () => {
  const view = render(<Fixture />);
  expect(view.container.querySelector("dl > div > dt")?.textContent).toBe("Owner");
  expect(view.container.querySelector("dl > div > dd")?.textContent).toContain("Priya Raman");
  expect(screen.getByRole("term").textContent).toBe("Owner");
});

test("actions are keyboard-operable buttons that never submit forms", async () => {
  const user = userEvent.setup();
  const edit = mock(() => {});
  render(<Fixture onEdit={edit} />);
  const action = screen.getByRole("button", { name: "Change" });
  expect(action.getAttribute("type")).toBe("button");
  await user.tab();
  expect(document.activeElement).toBe(action);
  await user.keyboard("{Enter}");
  expect(edit).toHaveBeenCalledTimes(1);
});

test("renders every variant and guards compound children", () => {
  for (const variant of DESCRIPTION_LIST_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<DescriptionListTerm>Owner</DescriptionListTerm>)).toThrow(
    "DescriptionListTerm must be used within DescriptionList",
  );
});
