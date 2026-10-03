import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressSummaryBar, ProgressSummaryTitle } from "@/components/ui/uai/progress-summary";
import { TaskListItem, TaskListTitle } from "@/components/ui/uai/task-list";
import { ThinkingActivity, ThinkingContent, ThinkingTrigger } from "@/components/ui/uai/thinking";
import {
  RESEARCH_SESSION_VARIANTS,
  ResearchSession,
  ResearchSessionActivity,
  ResearchSessionAside,
  ResearchSessionHeader,
  ResearchSessionMain,
  ResearchSessionPanelTitle,
  ResearchSessionPlan,
  ResearchSessionProgress,
  ResearchSessionSearches,
  ResearchSessionSource,
  ResearchSessionSourceLink,
  ResearchSessionSourceList,
  ResearchSessionSources,
  ResearchSessionSynthesis,
  ResearchSessionTasks,
  ResearchSessionTitle,
  type ResearchSessionVariant,
} from "@/registry/uai/blocks/research-session";

function Fixture({ variant }: { variant?: ResearchSessionVariant }) {
  return (
    <ResearchSession variant={variant}>
      <ResearchSessionHeader>
        <ResearchSessionTitle>Shelf labels</ResearchSessionTitle>
        <ResearchSessionProgress value={3} max={7}>
          <ProgressSummaryTitle>Research progress</ProgressSummaryTitle>
          <ProgressSummaryBar />
        </ResearchSessionProgress>
      </ResearchSessionHeader>
      <ResearchSessionAside>
        <ResearchSessionPlan>
          <ResearchSessionPanelTitle>Plan</ResearchSessionPanelTitle>
          <ResearchSessionTasks>
            <TaskListItem status="complete">
              <TaskListTitle>Frame the question</TaskListTitle>
            </TaskListItem>
            <TaskListItem status="active">
              <TaskListTitle>Search trade press</TaskListTitle>
            </TaskListItem>
          </ResearchSessionTasks>
        </ResearchSessionPlan>
        <ResearchSessionActivity>
          <ResearchSessionPanelTitle>Search activity</ResearchSessionPanelTitle>
          <ResearchSessionSearches>
            <ThinkingTrigger title="Searching" />
            <ThinkingContent>
              <ThinkingActivity type="search" query="shelf labels Europe">
                Searched trade press
              </ThinkingActivity>
            </ThinkingContent>
          </ResearchSessionSearches>
        </ResearchSessionActivity>
      </ResearchSessionAside>
      <ResearchSessionMain>
        <ResearchSessionSynthesis>
          <ResearchSessionPanelTitle>Synthesis</ResearchSessionPanelTitle>
        </ResearchSessionSynthesis>
        <ResearchSessionSources>
          <ResearchSessionPanelTitle>Sources</ResearchSessionPanelTitle>
          <ResearchSessionSourceList>
            <ResearchSessionSource index={1}>
              <ResearchSessionSourceLink href="#a">Adoption survey</ResearchSessionSourceLink>
            </ResearchSessionSource>
          </ResearchSessionSourceList>
        </ResearchSessionSources>
      </ResearchSessionMain>
    </ResearchSession>
  );
}

test("labels the session and each of its panels", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Shelf labels" })).toBeTruthy();
  for (const name of ["Plan", "Search activity", "Synthesis", "Sources"]) {
    expect(screen.getByRole("region", { name })).toBeTruthy();
  }
  expect(screen.getByRole("list", { name: "Sources" })).toBeTruthy();
  expect(
    screen.getByRole("progressbar", { name: "Research progress" }).getAttribute("aria-valuenow"),
  ).toBe("3");
  const active = screen.getByText("Search trade press").closest("li");
  expect(active?.getAttribute("aria-current")).toBe("step");
});

test("toggles search activity with the keyboard", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const trigger = screen.getByRole("button", { name: /Searching/ });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("log")).toBeTruthy();
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("log")).toBeNull();
});

test("maps each layout onto its parts and guards them", () => {
  const taskLists = { split: "timeline", stacked: "card", compact: "compact" } as const;
  for (const variant of RESEARCH_SESSION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelector("ol[data-variant]")?.getAttribute("data-variant")).toBe(
      taskLists[variant],
    );
    view.unmount();
  }
  expect(() => render(<ResearchSessionMain />)).toThrow(
    "ResearchSessionMain must be used within ResearchSession",
  );
  expect(() => render(<ResearchSessionPanelTitle>Plan</ResearchSessionPanelTitle>)).toThrow(
    "ResearchSessionPanelTitle must be used within a ResearchSession panel",
  );
});
