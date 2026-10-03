import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ActivityTimelineContent,
  ActivityTimelineDate,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineGroup,
  ActivityTimelineMarker,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import { AuthorCardFollow, AuthorCardName } from "@/components/ui/uai/author-card";
import {
  PUBLIC_PROFILE_VARIANTS,
  PublicProfile,
  PublicProfileActivity,
  PublicProfileAside,
  PublicProfileIdentity,
  PublicProfileMain,
  PublicProfileSection,
  PublicProfileSectionTitle,
  PublicProfileStat,
  PublicProfileStats,
  type PublicProfileVariant,
  PublicProfileWork,
  PublicProfileWorkItem,
  PublicProfileWorkTitle,
} from "@/registry/uai/blocks/public-profile";

function Fixture({
  variant,
  onFollow,
}: {
  variant?: PublicProfileVariant;
  onFollow?: (pressed: boolean) => void;
}) {
  return (
    <PublicProfile variant={variant}>
      <PublicProfileAside>
        <PublicProfileIdentity>
          <AuthorCardName>Amara Okafor</AuthorCardName>
          <AuthorCardFollow onPressedChange={onFollow} />
        </PublicProfileIdentity>
        <PublicProfileStats>
          <PublicProfileStat label="Followers">1,284</PublicProfileStat>
          <PublicProfileStat label="Posts">142</PublicProfileStat>
        </PublicProfileStats>
      </PublicProfileAside>
      <PublicProfileMain>
        <PublicProfileSection>
          <PublicProfileSectionTitle>Pinned work</PublicProfileSectionTitle>
          <PublicProfileWork>
            <PublicProfileWorkItem href="#maps">
              <PublicProfileWorkTitle>kiln-plugin-maps</PublicProfileWorkTitle>
            </PublicProfileWorkItem>
          </PublicProfileWork>
        </PublicProfileSection>
        <PublicProfileSection>
          <PublicProfileSectionTitle>Recent activity</PublicProfileSectionTitle>
          <PublicProfileActivity>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>This week</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker />
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>Posted offline maps</ActivityTimelineTitle>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
          </PublicProfileActivity>
        </PublicProfileSection>
      </PublicProfileMain>
    </PublicProfile>
  );
}

test("names identity, sections, work, and activity", () => {
  render(<Fixture />);
  expect(screen.getByRole("article", { name: "Amara Okafor" })).toBeTruthy();
  const work = screen.getByRole("region", { name: "Pinned work" });
  expect(within(work).getByRole("link", { name: "kiln-plugin-maps" })).toBeTruthy();
  const activity = screen.getByRole("region", { name: "Recent activity" });
  expect(within(activity).getByRole("region", { name: "This week" })).toBeTruthy();
});

test("reads each count label before its value", () => {
  const view = render(<Fixture />);
  const terms = Array.from(view.container.querySelectorAll("dl > div")).map((item) =>
    Array.from(item.children).map((child) => `${child.tagName}:${child.textContent}`),
  );
  expect(terms).toEqual([
    ["DT:Followers", "DD:1,284"],
    ["DT:Posts", "DD:142"],
  ]);
});

test("toggles follow with the keyboard", async () => {
  const user = userEvent.setup();
  const onFollow = mock();
  render(<Fixture onFollow={onFollow} />);
  const follow = screen.getByRole("button", { name: "Follow" });
  follow.focus();
  await user.keyboard("{Enter}");
  expect(onFollow).toHaveBeenCalledWith(true);
  expect(follow.getAttribute("aria-pressed")).toBe("true");
});

test("renders every variant and guards its parts", () => {
  for (const variant of PUBLIC_PROFILE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(
      view.container.querySelector('[data-slot="public-profile"]')?.getAttribute("data-variant"),
    ).toBe(variant);
    view.unmount();
  }
  expect(() => render(<PublicProfileStats />)).toThrow(
    "PublicProfileStats must be used within PublicProfile",
  );
  expect(() =>
    render(
      <PublicProfile>
        <PublicProfileSectionTitle />
      </PublicProfile>,
    ),
  ).toThrow("PublicProfileSectionTitle must be used within PublicProfileSection");
});
