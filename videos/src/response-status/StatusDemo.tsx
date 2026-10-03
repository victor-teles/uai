import {
  ResponseStatus,
  ResponseStatusActions,
  ResponseStatusDetail,
  ResponseStatusIndicator,
  ResponseStatusLabel,
  ResponseStatusRetry,
  ResponseStatusStop,
  type ResponseStatusValue,
  type ResponseStatusVariant,
} from "@uai/components/response-status";
import { RotateCw, Square } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

// Light theme tokens from src/app/global.css.
export const lightTokens = {
  "--uai-canvas": "oklch(0.975 0.001 260)",
  "--uai-surface": "oklch(1 0 0)",
  "--uai-surface-raised": "oklch(0.94 0.003 260)",
  "--uai-border": "oklch(0.915 0.003 260)",
  "--uai-border-strong": "oklch(0.84 0.005 260)",
  "--uai-text": "oklch(0.247 0.006 258)",
  "--uai-muted": "oklch(0.47 0.01 260)",
  "--uai-subtle": "oklch(0.55 0.01 260)",
  "--uai-accent": "oklch(0.57 0.185 257)",
  "--uai-success": "oklch(0.6 0.15 153)",
  "--uai-danger": "oklch(0.58 0.2 23)",
} as CSSProperties;

// Disables a transition rather than adding one.
// eslint-disable-next-line @remotion/non-pure-animation
const noTransition: CSSProperties = { transition: "none" };

const labels: Record<ResponseStatusValue, string> = {
  queued: "Aguardando início…",
  streaming: "Gerando resposta…",
  stopped: "Resposta interrompida",
  complete: "Resposta concluída",
  failed: "Falha na resposta",
};

type StatusDemoProps = {
  variant: ResponseStatusVariant;
  status: ResponseStatusValue;
  detail: ReactNode;
  // The cursor cannot trigger :hover or :active, so the demo applies the same
  // styles the registry CSS uses for those states.
  hovered?: boolean;
  pressed?: boolean;
};

export const StatusDemo = ({ variant, status, detail, hovered, pressed }: StatusDemoProps) => {
  // Only set keys for active states: the parts spread `style` over their defaults.
  const actionStyle: CSSProperties = {
    ...(pressed ? { transform: "scale(0.97)" } : {}),
    ...(hovered
      ? {
          background:
            variant === "pill"
              ? "var(--uai-surface-raised)"
              : "color-mix(in oklab, var(--uai-surface-raised) 85%, var(--uai-text))",
        }
      : {}),
  };

  return (
    <ResponseStatus variant={variant} status={status}>
      {/* The 200 ms color fade starts from the transparent shimmer text, which reads
          as a blank label at video scale. StatusSequence crossfades instead. */}
      <ResponseStatusIndicator style={noTransition} />
      <ResponseStatusLabel style={noTransition}>{labels[status]}</ResponseStatusLabel>
      <ResponseStatusDetail>{detail}</ResponseStatusDetail>
      <ResponseStatusActions>
        <ResponseStatusStop style={actionStyle}>
          <Square size={9} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          Parar
        </ResponseStatusStop>
        <ResponseStatusRetry style={actionStyle}>
          <RotateCw size={12} aria-hidden="true" />
          {status === "failed" ? "Tentar de novo" : "Regenerar"}
        </ResponseStatusRetry>
      </ResponseStatusActions>
    </ResponseStatus>
  );
};
