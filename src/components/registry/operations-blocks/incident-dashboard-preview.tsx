"use client";

import { useState } from "react";
import {
  IncidentDashboard,
  IncidentDashboardAction,
  IncidentDashboardActions,
  IncidentDashboardBody,
  IncidentDashboardDescription,
  IncidentDashboardHeader,
  IncidentDashboardHeading,
  IncidentDashboardImpact,
  IncidentDashboardMetric,
  IncidentDashboardMetrics,
  IncidentDashboardPanel,
  IncidentDashboardPanelTitle,
  IncidentDashboardResponder,
  IncidentDashboardResponderAvatar,
  IncidentDashboardResponderName,
  IncidentDashboardResponderRole,
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
} from "@/components/uai/incident-dashboard";
import {
  ActivityTimelineActor,
  ActivityTimelineContent,
  ActivityTimelineEvent,
  ActivityTimelineEvents,
  ActivityTimelineMarker,
  ActivityTimelineTime,
  ActivityTimelineTitle,
} from "@/components/ui/uai/activity-timeline";
import {
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/uai/description-list";
import {
  MetricCardComparison,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
} from "@/components/ui/uai/metric-card";
import {
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerIcon,
  StatusBannerTitle,
} from "@/components/ui/uai/status-banner";

const responders = [
  { initials: "PR", name: "Priya Raman", role: "Incident commander" },
  { initials: "ML", name: "Marcus Lee", role: "Payments on-call" },
  { initials: "AD", name: "Ana Duarte", role: "Customer communications" },
];

const initialUpdates = [
  {
    id: "u3",
    actor: "Marcus Lee",
    text: "Rolled back payments-api to v4.18.2. Error rate is falling.",
    time: "14:41",
  },
  {
    id: "u2",
    actor: "Priya Raman",
    text: "Card authorizations time out for EU merchants after the 14:00 deploy.",
    time: "14:12",
  },
  {
    id: "u1",
    actor: "Alerting",
    text: "Checkout error rate crossed 2% for 5 minutes.",
    time: "14:02",
  },
];

export function IncidentDashboardPreview({
  variant = "overview",
}: {
  variant?: IncidentDashboardVariant;
}) {
  const [resolved, setResolved] = useState(false);
  const [updates, setUpdates] = useState(initialUpdates);
  const [draft, setDraft] = useState("");

  return (
    <IncidentDashboard variant={variant}>
      <IncidentDashboardHeader>
        <IncidentDashboardHeading>
          <IncidentDashboardSeverity level={resolved ? "minor" : "critical"}>
            SEV 1
          </IncidentDashboardSeverity>
          <IncidentDashboardTitle>
            INC-2291 · Checkout payments failing in EU
          </IncidentDashboardTitle>
          <IncidentDashboardDescription>
            Opened 47 minutes ago by Alerting
          </IncidentDashboardDescription>
        </IncidentDashboardHeading>
        <IncidentDashboardActions>
          <IncidentDashboardAction>Open war room</IncidentDashboardAction>
        </IncidentDashboardActions>
      </IncidentDashboardHeader>
      <IncidentDashboardStatus tone={resolved ? "success" : "error"}>
        <StatusBannerIcon />
        <StatusBannerContent>
          <StatusBannerTitle>{resolved ? "Resolved" : "Mitigating"}</StatusBannerTitle>
          <StatusBannerDescription>
            {resolved
              ? "Error rate has been under 0.1% for 15 minutes."
              : "A rollback is in progress. Next update due at 15:00 UTC."}
          </StatusBannerDescription>
        </StatusBannerContent>
        <StatusBannerActions>
          <StatusBannerAction onClick={() => setResolved((value) => !value)}>
            {resolved ? "Reopen" : "Mark resolved"}
          </StatusBannerAction>
        </StatusBannerActions>
      </IncidentDashboardStatus>
      <IncidentDashboardMetrics>
        <IncidentDashboardMetric>
          <MetricCardHeader>
            <MetricCardLabel>Checkout error rate</MetricCardLabel>
            <MetricCardTrend direction="down" sentiment="positive">
              6.1 pts
            </MetricCardTrend>
          </MetricCardHeader>
          <MetricCardValue>{resolved ? "0.08%" : "4.8%"}</MetricCardValue>
          <MetricCardComparison>Peak 10.9% at 14:18</MetricCardComparison>
        </IncidentDashboardMetric>
        <IncidentDashboardMetric>
          <MetricCardLabel>Failed orders</MetricCardLabel>
          <MetricCardValue>1,312</MetricCardValue>
          <MetricCardComparison>€184,900 at risk</MetricCardComparison>
        </IncidentDashboardMetric>
        <IncidentDashboardMetric>
          <MetricCardLabel>Duration</MetricCardLabel>
          <MetricCardValue>47 min</MetricCardValue>
          <MetricCardComparison>Since 14:02 UTC</MetricCardComparison>
        </IncidentDashboardMetric>
      </IncidentDashboardMetrics>
      <IncidentDashboardBody>
        <IncidentDashboardPanel span="wide">
          <IncidentDashboardPanelTitle>Updates</IncidentDashboardPanelTitle>
          <IncidentDashboardUpdate
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setUpdates((list) => [
                { id: `u${list.length + 1}`, actor: "You", text: draft.trim(), time: "Now" },
                ...list,
              ]);
              setDraft("");
            }}
          >
            <IncidentDashboardUpdateLabel>New update</IncidentDashboardUpdateLabel>
            <IncidentDashboardUpdateInput
              name="update"
              rows={2}
              value={draft}
              placeholder="What changed, and when is the next update?"
              onChange={(event) => setDraft(event.target.value)}
            />
            <IncidentDashboardUpdateSubmit disabled={!draft.trim()} />
          </IncidentDashboardUpdate>
          <IncidentDashboardTimeline>
            <ActivityTimelineEvents>
              {updates.map((update) => (
                <ActivityTimelineEvent key={update.id}>
                  <ActivityTimelineMarker />
                  <ActivityTimelineContent>
                    <ActivityTimelineTitle>
                      <ActivityTimelineActor>{update.actor}</ActivityTimelineActor> {update.text}
                    </ActivityTimelineTitle>
                    <ActivityTimelineTime>{update.time}</ActivityTimelineTime>
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
              <DescriptionListTerm>Customers</DescriptionListTerm>
              <DescriptionListDetails>EU merchants using card payments</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Services</DescriptionListTerm>
              <DescriptionListDetails>payments-api, checkout-web</DescriptionListDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Workaround</DescriptionListTerm>
              <DescriptionListDetails>
                Retrying succeeds for about 60% of orders
              </DescriptionListDetails>
            </DescriptionListItem>
          </IncidentDashboardImpact>
        </IncidentDashboardPanel>
        <IncidentDashboardPanel>
          <IncidentDashboardPanelTitle>Responders</IncidentDashboardPanelTitle>
          <IncidentDashboardResponders>
            {responders.map((responder) => (
              <IncidentDashboardResponder key={responder.name}>
                <IncidentDashboardResponderAvatar>
                  {responder.initials}
                </IncidentDashboardResponderAvatar>
                <IncidentDashboardResponderName>{responder.name}</IncidentDashboardResponderName>
                <IncidentDashboardResponderRole>{responder.role}</IncidentDashboardResponderRole>
              </IncidentDashboardResponder>
            ))}
          </IncidentDashboardResponders>
        </IncidentDashboardPanel>
      </IncidentDashboardBody>
    </IncidentDashboard>
  );
}
