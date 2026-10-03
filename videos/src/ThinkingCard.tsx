import {
  Check,
  ChevronDown,
  Circle,
  FileText,
  LoaderCircle,
  type LucideIcon,
  Search,
  Wrench,
} from "lucide-react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

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
    revealAt: 68,
  },
  {
    icon: FileText,
    label: "Arquivo",
    description: "Leu a interface pública",
    evidence: "src/registry/uai/components/thinking.tsx",
    elapsed: "0,8 s",
    revealAt: 116,
  },
  {
    icon: Wrench,
    label: "Ferramenta",
    description: "Validou a saída do registro",
    evidence: "bun run registry:build",
    elapsed: "2,1 s",
    revealAt: 164,
  },
  {
    icon: Circle,
    label: "Atualização",
    description: "Verificou a composição pública",
    elapsed: "3,4 s",
    revealAt: 212,
  },
];

const ActivityRow = ({ activity }: { activity: Activity }) => {
  const frame = useCurrentFrame();
  const ActivityIcon = activity.icon;

  return (
    <li
      className="group grid min-w-0 grid-cols-[24px_minmax(0,1fr)_auto] gap-x-2.5 overflow-hidden"
      style={{
        maxHeight: interpolate(frame, [activity.revealAt, activity.revealAt + 16], [0, 76], {
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        opacity: interpolate(frame, [activity.revealAt + 2, activity.revealAt + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        paddingBlock: interpolate(frame, [activity.revealAt, activity.revealAt + 16], [0, 10], {
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [activity.revealAt, activity.revealAt + 14],
          ["0px 8px", "0px 0px"],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <span className="relative grid size-6 place-items-center text-[var(--uai-muted)] after:absolute after:top-6 after:bottom-[-10px] after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-[var(--uai-border)] group-last:after:hidden">
        <ActivityIcon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] text-[var(--uai-muted)]">
            {activity.label}
          </span>
          <span className="min-w-0 text-[13px] leading-[18px] text-[var(--uai-text)]">
            {activity.description}
          </span>
        </span>
        {activity.evidence ? (
          <span className="mt-0.5 block break-all font-mono text-[0.72rem] leading-4 text-[var(--uai-muted)]">
            {activity.evidence}
          </span>
        ) : null}
      </span>
      <span className="pl-2 font-mono text-[0.72rem] leading-4 tabular-nums text-[var(--uai-muted)]">
        {activity.elapsed}
      </span>
    </li>
  );
};

export const ThinkingCard = () => {
  const frame = useCurrentFrame();
  const complete = frame >= 276;

  return (
    <section
      className="w-[560px] overflow-hidden rounded-[14px] border border-[var(--uai-border)] bg-[var(--uai-surface)] text-[var(--uai-text)]"
      data-status={complete ? "complete" : "thinking"}
      aria-busy={!complete}
    >
      <button
        type="button"
        className="flex min-h-[66px] w-full items-center gap-3 px-3.5 text-left outline-none"
        aria-expanded="true"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--uai-border)] bg-[var(--uai-surface-raised)]">
          <span className="relative grid size-3.5 place-items-center">
            <LoaderCircle
              className="absolute size-3.5 text-[var(--uai-text)]"
              style={{
                opacity: interpolate(frame, [268, 280], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                rotate: interpolate(frame, [0, 420], ["0deg", "5040deg"], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
              aria-hidden="true"
            />
            <Check
              className="absolute size-3.5 text-[var(--uai-success)]"
              style={{
                opacity: interpolate(frame, [276, 288], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                scale: interpolate(frame, [276, 292], [0.7, 1], {
                  easing: Easing.spring({ damping: 180 }),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  output: "perceptual-scale",
                }),
              }}
              aria-hidden="true"
            />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[13px] leading-[18px] font-medium">
              {complete ? "Trabalho concluído" : "Pensando"}
            </span>
            <span
              className={`shrink-0 text-[0.66rem] leading-4 font-medium uppercase tracking-[0.055em] ${
                complete ? "text-[var(--uai-success)]" : "text-[var(--uai-muted)]"
              }`}
            >
              {complete ? "Concluído" : "Em andamento"}
            </span>
          </span>
          <span
            className="block truncate text-xs leading-[18px] text-[var(--uai-muted)]"
            role="status"
          >
            {complete
              ? "O contrato do componente está pronto para revisão."
              : "Verificando a interface e os estados do componente."}
          </span>
        </span>

        <span className="shrink-0 font-mono text-[0.72rem] leading-4 tabular-nums text-[var(--uai-muted)]">
          {complete
            ? "3,4 s"
            : `${Math.min(frame / 60, 3.3)
                .toFixed(1)
                .replace(".", ",")} s`}
        </span>
        <ChevronDown
          className="size-4 shrink-0 rotate-180 text-[var(--uai-muted)]"
          aria-hidden="true"
        />
      </button>

      <div className="border-t border-[var(--uai-border)] px-3.5 py-1.5">
        {frame < 68 ? (
          <p
            className="py-3 text-[13px] leading-[18px] text-[var(--uai-muted)]"
            style={{
              opacity: interpolate(frame, [52, 62, 64, 68], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Aguardando a primeira atividade…
          </p>
        ) : null}
        <div role="log" aria-label="Atividades observáveis">
          <ol>
            {activities.map((activity) => (
              <ActivityRow key={activity.label} activity={activity} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
