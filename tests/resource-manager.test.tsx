import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  RESOURCE_MANAGER_VARIANTS,
  ResourceManager,
  ResourceManagerBody,
  ResourceManagerDetails,
  ResourceManagerHeader,
  ResourceManagerInspector,
  ResourceManagerInspectorTitle,
  ResourceManagerList,
  type ResourceManagerProps,
  ResourceManagerRecord,
  ResourceManagerRecordStatus,
  ResourceManagerRecordTitle,
  ResourceManagerTitle,
} from "@/registry/uai/blocks/resource-manager";

const records = [
  { id: "SUP-1", name: "Northwind Freight" },
  { id: "SUP-2", name: "Halden Packaging" },
  { id: "SUP-3", name: "Cobre Components" },
];

function Fixture(props: ResourceManagerProps) {
  return (
    <ResourceManager defaultValue="SUP-1" {...props}>
      <ResourceManagerHeader>
        <ResourceManagerTitle>Suppliers</ResourceManagerTitle>
      </ResourceManagerHeader>
      <ResourceManagerBody>
        <ResourceManagerList aria-label="Suppliers">
          {records.map((record) => (
            <ResourceManagerRecord key={record.id} value={record.id}>
              <ResourceManagerRecordTitle>{record.name}</ResourceManagerRecordTitle>
              <ResourceManagerRecordStatus tone="success">Active</ResourceManagerRecordStatus>
            </ResourceManagerRecord>
          ))}
        </ResourceManagerList>
        <ResourceManagerInspector>
          <ResourceManagerInspectorTitle>Northwind Freight</ResourceManagerInspectorTitle>
          <ResourceManagerDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Owner</DescriptionListTerm>
              <DescriptionListDetails>Priya Raman</DescriptionListDetails>
            </DescriptionListItem>
          </ResourceManagerDetails>
        </ResourceManagerInspector>
      </ResourceManagerBody>
    </ResourceManager>
  );
}

test("selects records by pointer and reports the inspected value", async () => {
  const user = userEvent.setup();
  const change = mock((_value: string) => {});
  render(<Fixture onValueChange={change} />);
  expect(screen.getByRole("region", { name: "Suppliers" })).toBeTruthy();
  const first = screen.getByRole("button", { name: /Northwind Freight/ });
  const second = screen.getByRole("button", { name: /Halden Packaging/ });
  expect(first.getAttribute("aria-current")).toBe("true");
  await user.click(second);
  expect(change).toHaveBeenCalledWith("SUP-2");
  expect(second.getAttribute("aria-current")).toBe("true");
  expect(first.getAttribute("aria-current")).toBeNull();
  expect(screen.getByRole("region", { name: "Northwind Freight" })).toBeTruthy();
});

test("moves focus through records with arrows, Home, and End", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const [first, second, third] = screen.getAllByRole("button") as [
    HTMLElement,
    HTMLElement,
    HTMLElement,
  ];
  first.focus();
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(second);
  await user.keyboard("{End}");
  expect(document.activeElement).toBe(third);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(third);
  await user.keyboard("{Home}");
  expect(document.activeElement).toBe(first);
  await user.keyboard("{Enter}");
  expect(first.getAttribute("aria-current")).toBe("true");
});

test("respects the controlled value", async () => {
  const user = userEvent.setup();
  render(<Fixture value="SUP-3" onValueChange={() => {}} />);
  await user.click(screen.getByRole("button", { name: /Northwind Freight/ }));
  expect(
    screen.getByRole("button", { name: /Cobre Components/ }).getAttribute("aria-current"),
  ).toBe("true");
});

test("maps each layout variant onto the composed components and guards its parts", () => {
  const details = { split: "inline", stacked: "grid", compact: "stacked" } as const;
  for (const variant of RESOURCE_MANAGER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelector("dl")?.getAttribute("data-variant")).toBe(details[variant]);
    view.unmount();
  }
  expect(() =>
    render(<ResourceManagerRecord value="SUP-1">Northwind</ResourceManagerRecord>),
  ).toThrow("ResourceManagerRecord must be used within ResourceManager");
});
