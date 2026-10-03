"use client";

import { GitPullRequest, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import {
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
  PublicProfileWorkDescription,
  PublicProfileWorkItem,
  PublicProfileWorkMeta,
  PublicProfileWorkTitle,
} from "@/components/uai/public-profile";
import {
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
  AuthorCardFollow,
  AuthorCardHeader,
  AuthorCardLink,
  AuthorCardLinks,
  AuthorCardName,
  AuthorCardRole,
} from "@/components/ui/uai/author-card";

export function PublicProfilePreview({ variant = "sidebar" }: { variant?: PublicProfileVariant }) {
  const [following, setFollowing] = useState(false);
  const followers = 1284 + (following ? 1 : 0);
  return (
    <PublicProfile variant={variant}>
      <PublicProfileAside>
        <PublicProfileIdentity>
          <AuthorCardAvatar name="Amara Okafor" />
          <AuthorCardHeader>
            <div style={{ display: "grid", gap: 2 }}>
              <AuthorCardName>Amara Okafor</AuthorCardName>
              <AuthorCardRole>Plugin author · Lagos</AuthorCardRole>
            </div>
            <AuthorCardFollow pressed={following} onPressedChange={setFollowing}>
              {following ? "Following" : "Follow"}
            </AuthorCardFollow>
          </AuthorCardHeader>
          <AuthorCardBio>
            Builds mapping and data plugins for Kiln. Previously on the maps team at a logistics
            startup.
          </AuthorCardBio>
          <AuthorCardLinks>
            <AuthorCardLink href="#site">amara.example</AuthorCardLink>
            <AuthorCardLink href="#code">Code</AuthorCardLink>
            <AuthorCardLink href="#mastodon">Mastodon</AuthorCardLink>
          </AuthorCardLinks>
        </PublicProfileIdentity>
        <PublicProfileStats>
          <PublicProfileStat label="Followers">
            {followers.toLocaleString("en-US")}
          </PublicProfileStat>
          <PublicProfileStat label="Following">86</PublicProfileStat>
          <PublicProfileStat label="Posts">142</PublicProfileStat>
        </PublicProfileStats>
      </PublicProfileAside>
      <PublicProfileMain>
        <PublicProfileSection>
          <PublicProfileSectionTitle>Pinned work</PublicProfileSectionTitle>
          <PublicProfileWork>
            <PublicProfileWorkItem href="#kiln-plugin-maps">
              <PublicProfileWorkTitle>kiln-plugin-maps</PublicProfileWorkTitle>
              <PublicProfileWorkDescription>
                Offline maps for documentation sites, rendered at build time.
              </PublicProfileWorkDescription>
              <PublicProfileWorkMeta>
                <span>2.1k stars</span>
                <span>Updated Sep 30</span>
              </PublicProfileWorkMeta>
            </PublicProfileWorkItem>
            <PublicProfileWorkItem href="#kiln-plugin-csv">
              <PublicProfileWorkTitle>kiln-plugin-csv</PublicProfileWorkTitle>
              <PublicProfileWorkDescription>
                Turns CSV files into sortable tables and typed page data.
              </PublicProfileWorkDescription>
              <PublicProfileWorkMeta>
                <span>640 stars</span>
                <span>Updated Aug 12</span>
              </PublicProfileWorkMeta>
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
                  <ActivityTimelineMarker>
                    <MessageSquare size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      Posted “Show Kiln: offline maps for documentation sites”
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-30T07:45">Today</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <GitPullRequest size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      Contributed cache keys to the CI guide
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-28T16:10">Sep 28</ActivityTimelineTime>
                  </ActivityTimelineContent>
                </ActivityTimelineEvent>
                <ActivityTimelineEvent>
                  <ActivityTimelineMarker>
                    <Star size={14} />
                  </ActivityTimelineMarker>
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>Starred kiln-theme-print</ActivityTimelineTitle>
                    <ActivityTimelineTime dateTime="2026-09-27T22:02">Sep 27</ActivityTimelineTime>
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
