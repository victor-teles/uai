import { expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import {
  ACTIVITY_TIMELINE_VARIANTS,
  ActivityTimeline,
  ActivityTimelineActor,
  ActivityTimelineContent,
  ActivityTimelineDate,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineGroup,
  ActivityTimelineMarker,
  ActivityTimelineMeta,
  ActivityTimelineTime,
  ActivityTimelineTitle,
  type ActivityTimelineVariant,
} from "@/registry/uai/components/activity-timeline";

function Fixture({ variant }: { variant?: ActivityTimelineVariant }) {
  return (
    <ActivityTimeline variant={variant} aria-label="Project activity">
      {["Today", "Yesterday"].map((date) => (
        <ActivityTimelineGroup key={date}>
          <ActivityTimelineDate>{date}</ActivityTimelineDate>
          <ActivityTimelineEvents>
            <ActivityTimelineEvent>
              <ActivityTimelineMarker />
              <ActivityTimelineContent>
                <ActivityTimelineTitle>
                  <ActivityTimelineActor>Maya Chen</ActivityTimelineActor> deployed v2.14.0
                </ActivityTimelineTitle>
                <ActivityTimelineMeta>
                  <ActivityTimelineTime dateTime="2026-06-04T14:32">2:32 PM</ActivityTimelineTime>
                </ActivityTimelineMeta>
              </ActivityTimelineContent>
            </ActivityTimelineEvent>
            <ActivityTimelineEvent>
              <ActivityTimelineMarker />
              <ActivityTimelineContent>
                <ActivityTimelineTitle>
                  <ActivityTimelineActor>Sam Ortiz</ActivityTimelineActor> joined
                </ActivityTimelineTitle>
              </ActivityTimelineContent>
            </ActivityTimelineEvent>
          </ActivityTimelineEvents>
        </ActivityTimelineGroup>
      ))}
    </ActivityTimeline>
  );
}

test("groups events under labelled date sections in ordered lists", () => {
  render(<Fixture />);
  const today = screen.getByRole("region", { name: "Today" });
  expect(screen.getByRole("region", { name: "Yesterday" })).toBeTruthy();
  const list = within(today).getByRole("list");
  expect(list.tagName).toBe("OL");
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(within(today).getByRole("heading", { level: 3 }).textContent).toBe("Today");
});

test("keeps time machine-readable and markers decorative", () => {
  const view = render(<Fixture />);
  const [time] = screen.getAllByText("2:32 PM");
  if (!time) throw new Error("Missing time");
  expect(time.tagName).toBe("TIME");
  expect(time.getAttribute("datetime")).toBe("2026-06-04T14:32");
  const markers = view.container.querySelectorAll("li > [aria-hidden='true']");
  expect(markers.length).toBe(4);
  expect(screen.getAllByRole("listitem")[0]?.textContent).toContain("Maya Chen deployed v2.14.0");
});

test("renders every variant and guards compound children", () => {
  for (const variant of ACTIVITY_TIMELINE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<ActivityTimelineEvent />)).toThrow(
    "ActivityTimelineEvent must be used within ActivityTimeline",
  );
  expect(() =>
    render(
      <ActivityTimeline>
        <ActivityTimelineDate>Today</ActivityTimelineDate>
      </ActivityTimeline>,
    ),
  ).toThrow("ActivityTimelineDate must be used within ActivityTimelineGroup");
});
