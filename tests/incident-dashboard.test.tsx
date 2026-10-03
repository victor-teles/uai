import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  ActivityTimelineContent,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineMarker,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import { StatusBannerContent, StatusBannerTitle } from "@/components/ui/uai/status-banner";
import {
  INCIDENT_DASHBOARD_VARIANTS,
  IncidentDashboard,
  IncidentDashboardBody,
  IncidentDashboardImpact,
  IncidentDashboardPanel,
  IncidentDashboardPanelTitle,
  IncidentDashboardResponder,
  IncidentDashboardResponderAvatar,
  IncidentDashboardResponderName,
  IncidentDashboardResponders,
  IncidentDashboardSeverity,
  IncidentDashboardStatus,
  IncidentDashboardTimeline,
  IncidentDashboardTitle,
  IncidentDashboardUpdate,
  IncidentDashboardUpdateInput,
  IncidentDashboardUpdateLabel,
  IncidentDashboardUpdateSubmit,
  type IncidentDashboardVariant,
} from "@/registry/uai/blocks/incident-dashboard";

function Fixture({
  variant,
  resolved = false,
  onPost,
}: {
  variant?: IncidentDashboardVariant;
  resolved?: boolean;
  onPost?: (text: string) => void;
}) {
  const [updates, setUpdates] = useState(["Rolled back payments-api."]);
  const [draft, setDraft] = useState("");
  return (
    <IncidentDashboard variant={variant}>
      <IncidentDashboardSeverity level="critical">SEV 1</IncidentDashboardSeverity>
      <IncidentDashboardTitle>INC-2291</IncidentDashboardTitle>
      <IncidentDashboardStatus tone={resolved ? "success" : "error"}>
        <StatusBannerContent>
          <StatusBannerTitle>{resolved ? "Resolved" : "Mitigating"}</StatusBannerTitle>
        </StatusBannerContent>
      </IncidentDashboardStatus>
      <IncidentDashboardBody>
        <IncidentDashboardPanel span="wide">
          <IncidentDashboardPanelTitle>Updates</IncidentDashboardPanelTitle>
          <IncidentDashboardUpdate
            onSubmit={(event) => {
              event.preventDefault();
              onPost?.(draft);
              setUpdates((list) => [draft, ...list]);
              setDraft("");
            }}
          >
            <IncidentDashboardUpdateLabel>New update</IncidentDashboardUpdateLabel>
            <IncidentDashboardUpdateInput
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <IncidentDashboardUpdateSubmit />
          </IncidentDashboardUpdate>
          <IncidentDashboardTimeline>
            <ActivityTimelineEvents>
              {updates.map((update) => (
                <ActivityTimelineEvent key={update}>
                  <ActivityTimelineMarker />
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>{update}</ActivityTimelineTitle>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              ))}
            </ActivityTimelineEvents>
          </IncidentDashboardTimeline>
        </IncidentDashboardPanel>
        <IncidentDashboardPanel>
          <IncidentDashboardPanelTitle>Impact</IncidentDashboardPanelTitle>
          <IncidentDashboardImpact>
            <DescriptionListItem>
              <DescriptionListTerm>Services</DescriptionListTerm>
              <DescriptionListDetails>payments-api</DescriptionListDetails>
            </DescriptionListItem>
          </IncidentDashboardImpact>
        </IncidentDashboardPanel>
        <IncidentDashboardPanel>
          <IncidentDashboardPanelTitle>Responders</IncidentDashboardPanelTitle>
          <IncidentDashboardResponders>
            <IncidentDashboardResponder>
              <IncidentDashboardResponderAvatar>PR</IncidentDashboardResponderAvatar>
              <IncidentDashboardResponderName>Priya Raman</IncidentDashboardResponderName>
            </IncidentDashboardResponder>
          </IncidentDashboardResponders>
        </IncidentDashboardPanel>
      </IncidentDashboardBody>
    </IncidentDashboard>
  );
}

test("posts an update from the labelled form with the keyboard", async () => {
  const user = userEvent.setup();
  const post = mock((_text: string) => {});
  render(<Fixture onPost={post} />);
  const input = screen.getByLabelText("New update");
  await user.type(input, "Error rate back under 0.1%.");
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Post update" }));
  await user.keyboard("{Enter}");
  expect(post).toHaveBeenCalledWith("Error rate back under 0.1%.");
  expect(screen.getByText("Error rate back under 0.1%.")).toBeTruthy();
});

test("labels panels, states severity in text, and escalates active incidents", () => {
  const view = render(<Fixture />);
  expect(screen.getByRole("region", { name: "INC-2291" })).toBeTruthy();
  for (const name of ["Updates", "Impact", "Responders"]) {
    expect(screen.getByRole("region", { name })).toBeTruthy();
  }
  expect(screen.getByText("SEV 1").closest("[data-level]")?.getAttribute("data-level")).toBe(
    "critical",
  );
  expect(screen.getByRole("alert").textContent).toContain("Mitigating");
  expect(screen.getByText("PR").getAttribute("aria-hidden")).toBe("true");
  view.rerender(<Fixture resolved />);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("Resolved");
});

test("maps each layout variant onto the composed components and guards its parts", () => {
  const impact = { overview: "grid", split: "inline", compact: "stacked" } as const;
  for (const variant of INCIDENT_DASHBOARD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelector("dl")?.getAttribute("data-variant")).toBe(impact[variant]);
    view.unmount();
  }
  expect(() =>
    render(
      <IncidentDashboard>
        <IncidentDashboardPanelTitle>Updates</IncidentDashboardPanelTitle>
      </IncidentDashboard>,
    ),
  ).toThrow("IncidentDashboardPanelTitle must be used within IncidentDashboardPanel");
  expect(() => render(<IncidentDashboardUpdateInput />)).toThrow(
    "IncidentDashboardUpdateInput must be used within IncidentDashboardUpdate",
  );
});
