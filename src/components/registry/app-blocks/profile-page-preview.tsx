"use client";

import { FileText, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  ProfilePage,
  ProfilePageAction,
  ProfilePageActions,
  ProfilePageActivity,
  ProfilePageAside,
  ProfilePageDetails,
  ProfilePageIdentity,
  ProfilePageMain,
  ProfilePageSection,
  ProfilePageSectionHeader,
  ProfilePageSectionTitle,
  type ProfilePageVariant,
} from "@/components/uai/profile-page";
import {
  ActivityTimelineActor,
  ActivityTimelineContent,
  ActivityTimelineDate,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineGroup,
  ActivityTimelineMarker,
  ActivityTimelineTime,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import {
  AuthorCardAvatar,
  AuthorCardBio,
  AuthorCardName,
  AuthorCardRole,
} from "@/components/ui/uai/author-card";
import {
  DescriptionListAction,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";

export function ProfilePagePreview({ variant = "sidebar" }: { variant?: ProfilePageVariant }) {
  const [copied, setCopied] = useState(false);
  return (
    <ProfilePage variant={variant}>
      <ProfilePageAside>
        <ProfilePageIdentity>
          <AuthorCardAvatar name="Amara Okafor" />
          <div style={{ display: "grid", gap: 2 }}>
            <AuthorCardName>Amara Okafor</AuthorCardName>
            <AuthorCardRole>Operations lead · Lagos</AuthorCardRole>
          </div>
          <AuthorCardBio>
            Runs fulfilment for the West Africa warehouses and owns the returns policy.
          </AuthorCardBio>
        </ProfilePageIdentity>
        <ProfilePageActions>
          <ProfilePageAction emphasis="primary">Edit profile</ProfilePageAction>
          <ProfilePageAction>Send message</ProfilePageAction>
          <ProfilePageAction tone="danger">Deactivate</ProfilePageAction>
        </ProfilePageActions>
      </ProfilePageAside>
      <ProfilePageMain>
        <ProfilePageSection>
          <ProfilePageSectionHeader>
            <ProfilePageSectionTitle>Contact details</ProfilePageSectionTitle>
          </ProfilePageSectionHeader>
          <ProfilePageDetails>
            <DescriptionListItem>
              <DescriptionListTerm>Email</DescriptionListTerm>
              <DescriptionListDetails>
                amara@northwind.example
                <DescriptionListAction
                  aria-label="Copy email address"
                  onClick={() => {
                    void navigator.clipboard?.writeText("amara@northwind.example");
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </DescriptionListAction>
              </DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Phone</DescriptionListTerm>
              <DescriptionListDetails>+234 803 555 0142</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Time zone</DescriptionListTerm>
              <DescriptionListDetails>West Africa Time (UTC+1)</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Member since</DescriptionListTerm>
              <DescriptionListDetails>March 2023</DescriptionListDetails>
            </DescriptionListItem>
          </ProfilePageDetails>
        </ProfilePageSection>
        <ProfilePageSection>
          <ProfilePageSectionHeader>
            <ProfilePageSectionTitle>Recent activity</ProfilePageSectionTitle>
          </ProfilePageSectionHeader>
          <ProfilePageActivity>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>Today</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <FileText size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> updated the returns
                      policy
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T09:12">09:12</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <MessageSquare size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> replied on order #4817
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T08:40">08:40</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
              </ActivityTimelineEvents>
            </ActivityTimelineGroup>
            <ActivityTimelineGroup>
              <ActivityTimelineDate>September 28</ActivityTimelineDate>
              <ActivityTimelineEvents>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <UserPlus size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>Amara</ActivityTimelineActor> invited Tomás Rivera to
                      Fulfilment
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-28T16:05">16:05</ActivityTimelineTime>
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
