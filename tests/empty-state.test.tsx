import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  EMPTY_STATE_VARIANTS,
  EmptyState,
  EmptyStateAction,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateNote,
  EmptyStateTitle,
  type EmptyStateVariant,
} from "@/registry/uai/components/empty-state";

function EmptyStateFixture({
  variant = "card",
  onCreate,
}: {
  variant?: EmptyStateVariant;
  onCreate?: () => void;
}) {
  return (
    <EmptyState variant={variant}>
      <EmptyStateMedia aria-hidden="true">Icon</EmptyStateMedia>
      <EmptyStateContent>
        <EmptyStateHeader>
          <EmptyStateTitle>No projects yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create a project to organize files, feedback, and release notes.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateActions>
          <EmptyStateAction onClick={onCreate}>Create project</EmptyStateAction>
          <EmptyStateAction href="/import" emphasis="secondary">
            Import project
          </EmptyStateAction>
        </EmptyStateActions>
        <EmptyStateNote>You can invite collaborators after setup.</EmptyStateNote>
      </EmptyStateContent>
    </EmptyState>
  );
}

test("labels the static empty region from its composed title", () => {
  const { container } = render(<EmptyStateFixture />);
  const section = container.querySelector("section");
  const heading = screen.getByRole("heading", { name: "No projects yet" });

  expect(section?.getAttribute("aria-labelledby")).toBe(heading.id);
  expect(section?.getAttribute("role")).toBeNull();
  expect(screen.getByText(/organize files/).tagName).toBe("P");
});

test("renders card, plain, compact, and page placement variants", () => {
  const { container, rerender } = render(<EmptyStateFixture variant="card" />);
  const section = container.querySelector("section");

  expect(EMPTY_STATE_VARIANTS).toEqual(["card", "plain", "compact", "page"]);
  expect(section?.dataset.variant).toBe("card");
  expect(section?.style.borderRadius).toBe("14px");
  expect(section?.style.padding).toBe("32px 28px");

  rerender(<EmptyStateFixture variant="plain" />);
  expect(section?.dataset.variant).toBe("plain");
  expect(section?.style.borderRadius).toBe("0px");
  expect(section?.className).toContain("bg-transparent");

  rerender(<EmptyStateFixture variant="compact" />);
  expect(section?.dataset.variant).toBe("compact");
  expect(section?.style.borderRadius).toBe("12px");
  expect(section?.style.padding).toBe("14px");
  expect(section?.className).toContain("text-left");
  expect(screen.getByRole("heading").className).toContain("text-[13px]");

  rerender(<EmptyStateFixture variant="page" />);
  expect(section?.dataset.variant).toBe("page");
  expect(section?.style.minHeight).toBe("400px");
  expect(section?.style.padding).toBe("48px 32px");
  expect(section?.className).toContain("flex-wrap");
  expect(screen.getByRole("heading").className).toContain("text-xl");
  expect(section?.firstElementChild?.getAttribute("style")).toContain("width: 160px");
});

test("supports button and link actions without stealing consumer behavior", () => {
  let createCount = 0;
  render(<EmptyStateFixture onCreate={() => createCount++} />);

  const create = screen.getByRole("button", { name: "Create project" });
  const importProject = screen.getByRole("link", { name: "Import project" });

  expect(create.getAttribute("type")).toBe("button");
  fireEvent.click(create);
  expect(createCount).toBe(1);
  expect(importProject.getAttribute("href")).toBe("/import");
});

test("contains long localized copy without truncation", () => {
  render(
    <EmptyState variant="compact">
      <EmptyStateContent>
        <EmptyStateHeader>
          <EmptyStateTitle>
            Nenhum projeto compartilhado com esta equipe internacional foi encontrado
          </EmptyStateTitle>
          <EmptyStateDescription>
            Crie um projeto para organizar documentos, decisões e entregas em um único lugar.
          </EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyStateContent>
    </EmptyState>,
  );

  expect(screen.getByRole("heading").className).toContain("[overflow-wrap:anywhere]");
  expect(screen.getByText(/Crie um projeto/).className).not.toContain("truncate");
});

test("compound empty-state children require their root", () => {
  expect(() => render(<EmptyStateTitle>Nothing here</EmptyStateTitle>)).toThrow(
    "EmptyStateTitle must be used within EmptyState",
  );
  expect(() => render(<EmptyStateAction>Continue</EmptyStateAction>)).toThrow(
    "EmptyStateAction must be used within EmptyState",
  );
});
