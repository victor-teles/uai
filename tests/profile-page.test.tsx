import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
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
import { AuthorCardAvatar, AuthorCardName, AuthorCardRole } from "@/components/ui/uai/author-card";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  PROFILE_PAGE_VARIANTS,
  ProfilePage,
  ProfilePageAction,
  ProfilePageActions,
  ProfilePageActivity,
  ProfilePageAside,
  ProfilePageDetails,
  ProfilePageIdentity,
  ProfilePageMain,
  ProfilePageSection,
  ProfilePageSectionTitle,
  type ProfilePageVariant,
} from "@/registry/uai/blocks/profile-page";

function Fixture({ variant, onEdit }: { variant?: ProfilePageVariant; onEdit?: () => void }) {
  return (
    <ProfilePage variant={variant}>
      <ProfilePageAside>
        <ProfilePageIdentity>
          <AuthorCardAvatar name="Amara Okafor" />
          <AuthorCardName>Amara Okafor</AuthorCardName>
          <AuthorCardRole>Operations lead</AuthorCardRole>
        </ProfilePageIdentity>
        <ProfilePageActions>
          <ProfilePageAction emphasis="primary" onClick={onEdit}>
            Edit profile
          </ProfilePageAction>
          <ProfilePageAction tone="danger">Deactivate</ProfilePageAction>
        </ProfilePageActions>
      </ProfilePageAside>
      <ProfilePageMain>
        <ProfilePageSection>
          <ProfilePageSectionTitle>Contact details</ProfilePageSectionTitle>
          <ProfilePageDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Email</DescriptionListTerm>
              <DescriptionListDetails>amara@northwind.example</DescriptionListDetails>
            </DescriptionListItem>
          </ProfilePageDetails>
        </ProfilePageSection>
        <ProfilePageSection>
          <ProfilePageSectionTitle>Recent activity</ProfilePageSectionTitle>
          <ProfilePageActivity>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>Today</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker />
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>Updated the returns policy</ActivityTimelineTitle>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
          </ProfilePageActivity>
        </ProfilePageSection>
      </ProfilePageMain>
    </ProfilePage>
  );
}

test("names the identity, actions, and sections", () => {
  render(<Fixture />);
  expect(screen.getByRole("article", { name: "Amara Okafor" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Account actions" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Contact details" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Today" })).toBeTruthy();
  expect(screen.getByText("Email").tagName).toBe("DT");
});

test("account actions are native buttons", async () => {
  const user = userEvent.setup();
  let edits = 0;
  render(<Fixture onEdit={() => edits++} />);
  const edit = screen.getByRole("button", { name: "Edit profile" });
  expect(edit.getAttribute("type")).toBe("button");
  await user.tab();
  expect(document.activeElement).toBe(edit);
  await user.keyboard(" ");
  expect(edits).toBe(1);
});

test("maps variants onto the identity card, details, and timeline", () => {
  const card = { sidebar: "card", stacked: "card", compact: "compact" };
  const details = { sidebar: "inline", stacked: "grid", compact: "stacked" };
  const timeline = { sidebar: "rail", stacked: "rail", compact: "compact" };
  for (const variant of PROFILE_PAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getByRole("article").getAttribute("data-variant")).toBe(card[variant]);
    expect(view.container.querySelector("dl")?.getAttribute("data-variant")).toBe(details[variant]);
    expect(
      screen.getByRole("region", { name: "Today" }).parentElement?.getAttribute("data-variant"),
    ).toBe(timeline[variant]);
    view.unmount();
  }
});

test("guards regions rendered outside the page", () => {
  expect(() => render(<ProfilePageAction>Edit</ProfilePageAction>)).toThrow(
    "ProfilePageAction must be used within ProfilePage",
  );
  expect(() =>
    render(
      <ProfilePage>
        <ProfilePageSectionTitle>Contact</ProfilePageSectionTitle>
      </ProfilePage>,
    ),
  ).toThrow("ProfilePageSectionTitle must be used within ProfilePageSection");
});
