"use client";

import { BellOff } from "lucide-react";
import { useState } from "react";
import {
  NotificationCenter,
  NotificationCenterAction,
  NotificationCenterActions,
  NotificationCenterCount,
  NotificationCenterEmpty,
  NotificationCenterGroup,
  NotificationCenterGroupDate,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemContent,
  NotificationCenterItemDescription,
  NotificationCenterItemTime,
  NotificationCenterItemTitle,
  NotificationCenterItemToggle,
  NotificationCenterList,
  NotificationCenterTabs,
  NotificationCenterTitle,
  type NotificationCenterVariant,
} from "@/components/uai/notification-center";
import {
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@/components/ui/uai/empty-state";
import {
  PageTabsBar,
  PageTabsCount,
  PageTabsList,
  PageTabsPanel,
  PageTabsTab,
} from "@/components/ui/uai/page-tabs";

type Notice = {
  id: string;
  day: "Today" | "Yesterday";
  title: string;
  detail: string;
  time: string;
  at: string;
  read: boolean;
  mention?: boolean;
};

const initial: Notice[] = [
  {
    id: "n1",
    day: "Today",
    title: "Tomás mentioned you on order #4817",
    detail: "“Can you approve the partial refund before 3 pm?”",
    time: "10:42",
    at: "2026-09-30T10:42",
    read: false,
    mention: true,
  },
  {
    id: "n2",
    day: "Today",
    title: "Payout of $12,480.00 sent",
    detail: "Arrives in the account ending 4421 by Friday.",
    time: "08:15",
    at: "2026-09-30T08:15",
    read: false,
  },
  {
    id: "n3",
    day: "Yesterday",
    title: "Linen apron, sand is low on stock",
    detail: "6 left at the Lisbon warehouse.",
    time: "17:30",
    at: "2026-09-29T17:30",
    read: true,
  },
  {
    id: "n4",
    day: "Yesterday",
    title: "Mei invited jonas@harbor.example",
    detail: "Role: Editor. The invitation expires in 7 days.",
    time: "11:02",
    at: "2026-09-29T11:02",
    read: true,
  },
];

export function NotificationCenterPreview({
  variant = "panel",
}: {
  variant?: NotificationCenterVariant;
}) {
  const [notices, setNotices] = useState(initial);
  const unread = notices.filter((notice) => !notice.read).length;
  const filters = [
    { value: "all", label: "All", items: notices },
    { value: "unread", label: "Unread", items: notices.filter((notice) => !notice.read) },
    { value: "mentions", label: "Mentions", items: notices.filter((notice) => notice.mention) },
  ];

  function setRead(id: string, read: boolean) {
    setNotices((current) =>
      current.map((notice) => (notice.id === id ? { ...notice, read } : notice)),
    );
  }

  return (
    <NotificationCenter variant={variant}>
      <NotificationCenterHeader>
        <NotificationCenterTitle>
          Notifications
          {unread > 0 ? <NotificationCenterCount>{unread} unread</NotificationCenterCount> : null}
        </NotificationCenterTitle>
        <NotificationCenterActions>
          <NotificationCenterAction
            disabled={unread === 0}
            onClick={() => setNotices((current) => current.map((n) => ({ ...n, read: true })))}
          >
            Mark all as read
          </NotificationCenterAction>
        </NotificationCenterActions>
      </NotificationCenterHeader>
      <NotificationCenterTabs defaultValue="all">
        <PageTabsBar>
          <PageTabsList aria-label="Filter notifications">
            {filters.map((filter) => (
              <PageTabsTab key={filter.value} value={filter.value}>
                {filter.label}
                <PageTabsCount>{filter.items.length}</PageTabsCount>
              </PageTabsTab>
            ))}
          </PageTabsList>
        </PageTabsBar>
        {filters.map((filter) => (
          <PageTabsPanel key={filter.value} value={filter.value}>
            <div style={{ display: "grid", gap: 12 }}>
              {filter.items.length === 0 ? (
                <NotificationCenterEmpty>
                  <EmptyStateMedia>
                    <BellOff aria-hidden="true" />
                  </EmptyStateMedia>
                  <EmptyStateContent>
                    <EmptyStateHeader>
                      <EmptyStateTitle>You’re all caught up</EmptyStateTitle>
                      <EmptyStateDescription>
                        New mentions, payouts, and stock alerts will appear here.
                      </EmptyStateDescription>
                    </EmptyStateHeader>
                  </EmptyStateContent>
                </NotificationCenterEmpty>
              ) : (
                (["Today", "Yesterday"] as const).map((day) => {
                  const items = filter.items.filter((notice) => notice.day === day);
                  if (items.length === 0) return null;
                  return (
                    <NotificationCenterGroup key={day}>
                      <NotificationCenterGroupDate>{day}</NotificationCenterGroupDate>
                      <NotificationCenterList>
                        {items.map((notice) => (
                          <NotificationCenterItem
                            key={notice.id}
                            read={notice.read}
                            onReadChange={(read) => setRead(notice.id, read)}
                          >
                            <NotificationCenterItemContent>
                              <NotificationCenterItemTitle>
                                {notice.title}
                              </NotificationCenterItemTitle>
                              <NotificationCenterItemDescription>
                                {notice.detail}
                              </NotificationCenterItemDescription>
                              <NotificationCenterItemTime dateTime={notice.at}>
                                {notice.time}
                              </NotificationCenterItemTime>
                            </NotificationCenterItemContent>
                            <NotificationCenterItemActions>
                              <NotificationCenterItemToggle />
                            </NotificationCenterItemActions>
                          </NotificationCenterItem>
                        ))}
                      </NotificationCenterList>
                    </NotificationCenterGroup>
                  );
                })
              )}
            </div>
          </PageTabsPanel>
        ))}
      </NotificationCenterTabs>
    </NotificationCenter>
  );
}
