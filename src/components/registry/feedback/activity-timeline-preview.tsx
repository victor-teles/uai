import { GitMerge, MessageSquare, Rocket, UserPlus } from "lucide-react";
import {
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
} from "@/components/ui/uai/activity-timeline";

export function ActivityTimelinePreview({
  variant = "rail",
}: {
  variant?: ActivityTimelineVariant;
}) {
  const iconSize = variant === "compact" ? 10 : 14;
  return (
    <ActivityTimeline variant={variant} aria-label="Project activity">
      <ActivityTimelineGroup>
        <ActivityTimelineDate>Today</ActivityTimelineDate>
        <ActivityTimelineEvents>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <Rocket size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Maya Chen</ActivityTimelineActor> deployed v2.14.0 to
                production
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-04T14:32">2:32 PM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>Build 4m 08s</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <GitMerge size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Jonas Weber</ActivityTimelineActor> merged “Fix invoice
                rounding”
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-04T11:05">11:05 AM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>#1287</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
        </ActivityTimelineEvents>
      </ActivityTimelineGroup>
      <ActivityTimelineGroup>
        <ActivityTimelineDate>Yesterday</ActivityTimelineDate>
        <ActivityTimelineEvents>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <MessageSquare size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Priya Natarajan</ActivityTimelineActor> commented on the
                pricing page brief
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-03T16:48">4:48 PM</ActivityTimelineTime>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
          <ActivityTimelineEvent>
            <ActivityTimelineMarker>
              <UserPlus size={iconSize} />
            </ActivityTimelineMarker>
            <ActivityTimelineContent>
              <ActivityTimelineTitle>
                <ActivityTimelineActor>Sam Ortiz</ActivityTimelineActor> joined as an editor
              </ActivityTimelineTitle>
              <ActivityTimelineMeta>
                <ActivityTimelineTime dateTime="2026-06-03T09:12">9:12 AM</ActivityTimelineTime>
                <span aria-hidden="true">·</span>
                <span>Invited by Maya Chen</span>
              </ActivityTimelineMeta>
            </ActivityTimelineContent>
          </ActivityTimelineEvent>
        </ActivityTimelineEvents>
      </ActivityTimelineGroup>
    </ActivityTimeline>
  );
}
