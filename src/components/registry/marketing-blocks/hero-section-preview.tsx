"use client";

import { FileText, Mail, Phone, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  HeroSection,
  HeroSectionAction,
  HeroSectionActions,
  HeroSectionContent,
  HeroSectionDescription,
  HeroSectionEyebrow,
  HeroSectionMedia,
  HeroSectionProof,
  HeroSectionTitle,
  type HeroSectionVariant,
} from "@/components/uai/hero-section";
import { Badge } from "@/components/ui/badge";
import { TaskList, TaskListItem, TaskListTitle } from "@/components/ui/uai/task-list";
import { TrustPanelRating, TrustPanelTitle } from "@/components/ui/uai/trust-panel";

const requests = [
  {
    icon: Mail,
    name: "Leaking water heater",
    from: "Ana Lima · Savassi · “Water under the tank since 6 am”",
    time: "07:42",
  },
  {
    icon: Phone,
    name: "No heat upstairs",
    from: "Voicemail · Funcionários · 0:48",
    time: "07:31",
    badge: "Crew en route",
    tone: "success",
  },
  {
    icon: FileText,
    name: "Quote for 3 AC units",
    from: "Web form · Lourdes · Commercial",
    time: "07:18",
    badge: "Assigned · Rui",
  },
  {
    icon: Mail,
    name: "Reschedule Thursday visit",
    from: "Paulo Reis · Anchieta",
    time: "07:02",
    badge: "Replied",
    tone: "success",
  },
];
const steps = [
  "Matched “water heater” to Plumbing",
  "North crew is 9 min from Savassi",
  "Texted Ana an arrival window",
];
const avatars = [
  { initials: "M", color: "oklch(0.62 0.12 250)" },
  { initials: "J", color: "oklch(0.62 0.12 160)" },
  { initials: "A", color: "oklch(0.66 0.13 60)" },
  { initials: "T", color: "oklch(0.6 0.14 20)" },
];

/** One routing beat when the media is 30% in view: card at 600ms, steps at 900/1150/1400ms. */
function useRoutingBeat() {
  const ref = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setBeat(4);
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        [600, 900, 1150, 1400].forEach((at, index) => {
          timers.push(window.setTimeout(() => setBeat(index + 1), at));
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);
  return { ref, beat };
}

export function HeroSectionPreview({ variant = "split" }: { variant?: HeroSectionVariant }) {
  const { ref, beat } = useRoutingBeat();
  const routed = beat >= 4;

  return (
    <HeroSection variant={variant}>
      <HeroSectionContent>
        <HeroSectionEyebrow href="#inbox">
          <span data-tag>
            New<span className="sr-only">:</span>
          </span>
          Shared inbox for field teams
        </HeroSectionEyebrow>
        <HeroSectionTitle>
          Every customer request, routed <em>before the first coffee.</em>
        </HeroSectionTitle>
        <HeroSectionDescription>
          Ferrow sorts email, forms, and voicemail into one queue, assigns the right crew, and tells
          customers when someone is on the way.
        </HeroSectionDescription>
        <HeroSectionActions>
          <HeroSectionAction href="#start-trial">Start a 14-day trial</HeroSectionAction>
          <HeroSectionAction href="#tour" priority="secondary">
            <Play aria-hidden="true" className="size-3.5" strokeWidth={2} />
            Watch the 2-min tour
          </HeroSectionAction>
        </HeroSectionActions>
        <HeroSectionProof>
          <span data-avatars aria-hidden="true">
            {avatars.map((avatar) => (
              <span key={avatar.initials} style={{ background: avatar.color, color: "white" }}>
                {avatar.initials}
              </span>
            ))}
          </span>
          <TrustPanelTitle>
            <b>1,900</b> service teams
          </TrustPanelTitle>
          <TrustPanelRating value={4.7}>from 860 reviews</TrustPanelRating>
        </HeroSectionProof>
      </HeroSectionContent>
      <HeroSectionMedia aria-hidden="true">
        <div ref={ref} className="absolute inset-0">
          {/* Framed already pads the media; elsewhere the card keeps a gutter on its outer edge
              instead of running into the canvas edge. */}
          <div
            className={`absolute top-[30px] bottom-[70px] left-6 overflow-hidden rounded-[14px] bg-card text-[13px]/[18px] shadow-[0_0_0_1px_var(--border),0_24px_48px_-24px_oklch(0_0_0/0.35)] ${variant === "framed" ? "right-0" : "right-6"}`}
          >
            <div className="flex h-10 items-center gap-2 border-b px-3.5">
              <span className="font-medium">Inbox</span>
              <span className="text-muted-foreground">· 12 open</span>
              <span className="ml-auto flex rounded-full bg-muted p-0.5 text-[11.5px]/4 text-muted-foreground">
                <span className="rounded-full bg-card px-2.5 py-1 font-medium text-foreground shadow-[0_0_0_1px_var(--border)]">
                  Unassigned
                </span>
                <span className="px-2.5 py-1">Mine</span>
                <span className="px-2.5 py-1">All</span>
              </span>
            </div>
            {requests.map((request, index) => {
              const Icon = request.icon;
              const first = index === 0;
              return (
                <div
                  key={request.name}
                  className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b px-3.5 py-3 ${first ? "bg-muted/50" : ""}`}
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{request.name}</span>
                    <span className="block truncate text-[12px]/4 text-muted-foreground">
                      {request.from}
                    </span>
                  </span>
                  <span className="grid justify-items-end gap-1">
                    {first ? (
                      <Badge
                        key={routed ? "routing" : "new"}
                        variant="secondary"
                        className="rounded-full border-0 bg-primary/14 text-[11.5px] text-[color-mix(in_oklab,var(--primary)_60%,var(--foreground))] animate-in fade-in-0 duration-200 ease-out-quint motion-reduce:animate-none"
                      >
                        {routed ? "Routing" : "New"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={`rounded-full border-0 text-[11.5px] ${request.tone === "success" ? "bg-success/14 text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]" : "bg-muted text-muted-foreground"}`}
                      >
                        {request.badge}
                      </Badge>
                    )}
                    <span className="text-[11.5px]/4 text-muted-foreground tabular-nums">
                      {request.time}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          {beat >= 1 && (
            <div className="absolute bottom-0 left-0 w-[min(300px,85%)] origin-bottom-left rounded-[14px] bg-popover p-1 text-[12.5px]/[18px] shadow-[0_0_0_1px_var(--border-strong),0_18px_40px_-16px_oklch(0_0_0/0.45)] animate-in fade-in-0 zoom-in-96 duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none">
              <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
                <span className={routed ? "font-medium" : "font-medium shimmer-text"}>
                  {routed ? "Routed request" : "Routing request"}
                </span>
                <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
                  {routed ? "2.1s" : `${(beat * 0.5).toFixed(1)}s`}
                </span>
              </div>
              <TaskList
                variant="compact"
                className="border-0 bg-transparent divide-y-0 [&_[data-slot=badge]]:hidden"
              >
                {steps.map((step, index) => (
                  <TaskListItem
                    key={step}
                    status={beat >= index + 2 || routed ? "complete" : "pending"}
                    className="min-h-0 grid-cols-[20px_minmax(0,1fr)] px-2.5 py-1.5"
                  >
                    <TaskListTitle className="font-normal">
                      {index === 2 && !routed ? "Texting Ana an arrival window…" : step}
                    </TaskListTitle>
                  </TaskListItem>
                ))}
              </TaskList>
            </div>
          )}
        </div>
      </HeroSectionMedia>
    </HeroSection>
  );
}
