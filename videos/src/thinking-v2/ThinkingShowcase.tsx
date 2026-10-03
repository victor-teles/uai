import {
  AlertTriangle,
  Check,
  ChevronDown,
  Circle,
  FileText,
  LoaderCircle,
  type LucideIcon,
  Search,
  Wrench,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export type ShowcaseStatus = "thinking" | "complete" | "error";

type ShowcaseTheme = "light" | "dark";

type ThinkingShowcaseProps = {
  status: ShowcaseStatus;
  theme: ShowcaseTheme;
  animateDisclosure?: boolean;
};

type ShowcaseStyle = CSSProperties & {
  "--showcase-surface": string;
  "--showcase-raised": string;
  "--showcase-border": string;
  "--showcase-text": string;
  "--showcase-muted": string;
  "--showcase-success": string;
  "--showcase-danger": string;
};

type Activity = {
  icon: LucideIcon;
  label: string;
  description: string;
  evidence?: string;
  elapsed: string;
  revealAt: number;
};

const activities: readonly Activity[] = [
  {
    icon: Search,
    label: "Busca",
    description: "Encontrou o contrato do componente",
    evidence: "acessibilidade do componente Thinking",
    elapsed: "0,3 s",
    revealAt: 18,
  },
  {
    icon: FileText,
    label: "Arquivo",
    description: "Leu a interface pública",
    evidence: "src/registry/uai/components/thinking.tsx",
    elapsed: "0,8 s",
    revealAt: 42,
  },
  {
    icon: Wrench,
    label: "Ferramenta",
    description: "Validou a saída do registro",
    evidence: "bun run registry:build",
    elapsed: "2,1 s",
    revealAt: 66,
  },
  {
    icon: Circle,
    label: "Atualização",
    description: "Verificou a composição pública",
    elapsed: "3,4 s",
    revealAt: 90,
  },
];

const statusDetails: Record<
  ShowcaseStatus,
  {
    title: string;
    label: string;
    summary: string;
    icon: LucideIcon;
  }
> = {
  thinking: {
    title: "Pensando",
    label: "Em andamento",
    summary: "Verificando a interface e os estados do componente.",
    icon: LoaderCircle,
  },
  complete: {
    title: "Trabalho concluído",
    label: "Concluído",
    summary: "O contrato do componente está pronto para revisão.",
    icon: Check,
  },
  error: {
    title: "Trabalho interrompido",
    label: "Erro",
    summary: "A validação visual precisa ser executada novamente.",
    icon: AlertTriangle,
  },
};

type ActivityRowProps = {
  activity: Activity;
  status: ShowcaseStatus;
};

const ActivityRow = ({ activity, status }: ActivityRowProps) => {
  const frame = useCurrentFrame();
  const ActivityIcon = activity.icon;
  const activityVisible = frame >= activity.revealAt;

  return (
    <li
      className="group grid min-w-0 grid-cols-[32px_minmax(0,1fr)_auto] gap-x-3 overflow-hidden"
      style={{
        maxHeight:
          status !== "thinking"
            ? 88
            : activityVisible
              ? interpolate(frame, [activity.revealAt, activity.revealAt + 12], [0, 88], {
                  easing: Easing.bezier(0.23, 1, 0.32, 1),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0,
        opacity:
          status !== "thinking"
            ? 1
            : activityVisible
              ? interpolate(frame, [activity.revealAt + 1, activity.revealAt + 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0,
        paddingBlock:
          status !== "thinking"
            ? 13
            : activityVisible
              ? interpolate(frame, [activity.revealAt, activity.revealAt + 12], [0, 13], {
                  easing: Easing.bezier(0.23, 1, 0.32, 1),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0,
        translate:
          status !== "thinking"
            ? "0px 0px"
            : activityVisible
              ? interpolate(
                  frame,
                  [activity.revealAt, activity.revealAt + 10],
                  ["0px 8px", "0px 0px"],
                  {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )
              : "0px 8px",
      }}
    >
      <span className="relative grid size-8 place-items-center text-[var(--showcase-muted)] after:absolute after:top-8 after:bottom-[-13px] after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-[var(--showcase-border)] group-last:after:hidden">
        <ActivityIcon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2.5">
          <span className="shrink-0 text-[13px] leading-5 font-medium uppercase tracking-[0.055em] text-[var(--showcase-muted)]">
            {activity.label}
          </span>
          <span className="min-w-0 text-[17px] leading-6 text-[var(--showcase-text)]">
            {activity.description}
          </span>
        </span>
        {activity.evidence ? (
          <span className="mt-1 block break-all font-mono text-[14px] leading-5 text-[var(--showcase-muted)]">
            {activity.evidence}
          </span>
        ) : null}
      </span>
      <span className="pl-3 font-mono text-[14px] leading-5 tabular-nums text-[var(--showcase-muted)]">
        {activity.elapsed}
      </span>
    </li>
  );
};

export const ThinkingShowcase = ({
  status,
  theme,
  animateDisclosure = false,
}: ThinkingShowcaseProps) => {
  const frame = useCurrentFrame();
  const copy = statusDetails[status];
  const StatusIcon = copy.icon;
  const disclosureProgress = animateDisclosure
    ? interpolate(frame, [180, 190, 224, 234], [1, 0, 0, 1], {
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const duration =
    status === "thinking"
      ? `${Math.min(frame / 30, 3.3)
          .toFixed(1)
          .replace(".", ",")} s`
      : "3,4 s";
  const showcaseStyle: ShowcaseStyle = {
    "--showcase-surface": theme === "light" ? "#ffffff" : "#171716",
    "--showcase-raised": theme === "light" ? "#f6f6f4" : "#20201f",
    "--showcase-border": theme === "light" ? "#deded9" : "#343432",
    "--showcase-text": theme === "light" ? "#1c1c1a" : "#f2f2ef",
    "--showcase-muted": theme === "light" ? "#92918b" : "#8d8c87",
    "--showcase-success": theme === "light" ? "#158258" : "#4ecb91",
    "--showcase-danger": theme === "light" ? "#bd483c" : "#ff7468",
    borderColor: status === "error" ? "var(--showcase-danger)" : "var(--showcase-border)",
    boxShadow:
      theme === "light" ? "0 1px 2px rgba(20, 20, 18, 0.04)" : "0 1px 0 rgba(255, 255, 255, 0.02)",
  };

  return (
    <section
      className="w-[820px] overflow-hidden rounded-[18px] border bg-[var(--showcase-surface)] text-[var(--showcase-text)]"
      style={showcaseStyle}
      data-status={status}
      aria-busy={status === "thinking"}
    >
      <button
        type="button"
        className="flex min-h-[92px] w-full items-center gap-4 px-5 text-left outline-none"
        aria-expanded={disclosureProgress > 0.5}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[11px] border border-[var(--showcase-border)] bg-[var(--showcase-raised)]">
          <StatusIcon
            className={`size-5 ${
              status === "complete"
                ? "text-[var(--showcase-success)]"
                : status === "error"
                  ? "text-[var(--showcase-danger)]"
                  : "text-[var(--showcase-text)]"
            }`}
            style={{
              rotate:
                status === "thinking"
                  ? interpolate(frame, [0, 600], ["0deg", "7200deg"], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  : "0deg",
            }}
            aria-hidden="true"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[18px] leading-6 font-medium">{copy.title}</span>
            <span
              className={`shrink-0 text-[13px] leading-5 font-medium uppercase tracking-[0.055em] ${
                status === "complete"
                  ? "text-[var(--showcase-success)]"
                  : status === "error"
                    ? "text-[var(--showcase-danger)]"
                    : "text-[var(--showcase-muted)]"
              }`}
            >
              {copy.label}
            </span>
          </span>
          <span className="block truncate text-[16px] leading-6 text-[var(--showcase-muted)]">
            {copy.summary}
          </span>
        </span>

        <span className="shrink-0 font-mono text-[14px] leading-5 tabular-nums text-[var(--showcase-muted)]">
          {duration}
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-[var(--showcase-muted)]"
          style={{ rotate: disclosureProgress > 0.5 ? "180deg" : "0deg" }}
          aria-hidden="true"
        />
      </button>

      <div
        className="overflow-hidden border-t border-[var(--showcase-border)] px-5"
        style={{
          maxHeight: interpolate(disclosureProgress, [0, 1], [0, 390]),
          opacity: disclosureProgress,
        }}
      >
        <div role="log" aria-label="Atividades observáveis">
          <ol>
            {activities.map((activity) => (
              <ActivityRow key={activity.label} activity={activity} status={status} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
