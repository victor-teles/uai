"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { type ComponentProps, createContext, useContext, useState } from "react";

export const STATUS_BANNER_VARIANTS = ["card", "tinted", "bar"] as const;
export type StatusBannerVariant = (typeof STATUS_BANNER_VARIANTS)[number];
export type StatusBannerTone = "info" | "success" | "warning" | "error";
export type StatusBannerProps = ComponentProps<"div"> & {
  variant?: StatusBannerVariant;
  tone?: StatusBannerTone;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
type BannerContext = {
  tone: StatusBannerTone;
  variant: StatusBannerVariant;
  dismiss: () => void;
};
const Context = createContext<BannerContext | null>(null);
function useBanner(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within StatusBanner`);
  return context;
}
const toneColor: Record<StatusBannerTone, string> = {
  info: "var(--uai-accent)",
  success: "var(--uai-success)",
  warning: "var(--uai-warning)",
  error: "var(--uai-danger)",
};
const toneIcon = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
} as const;

const bannerCss = `
@keyframes uai-status-banner-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.uai-status-banner{animation:uai-status-banner-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-status-banner__action{height:28px;padding:0 12px;border:0;border-radius:999px;background:var(--uai-surface-raised);color:var(--uai-text);font:inherit;font-size:12.5px;font-weight:500;line-height:16px;white-space:nowrap;cursor:pointer;transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-status-banner__action:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-status-banner__action:active{transform:scale(0.97)}
.uai-status-banner[data-variant="tinted"] .uai-status-banner__action{background:color-mix(in oklab,var(--uai-text) 8%,transparent)}
.uai-status-banner[data-variant="tinted"] .uai-status-banner__action:hover{background:color-mix(in oklab,var(--uai-text) 14%,transparent)}
.uai-status-banner[data-variant="bar"] .uai-status-banner__action{height:24px;padding:0 10px;font-size:12px}
.uai-status-banner__dismiss{display:grid;place-items:center;flex:none;width:28px;height:28px;margin:-5px -6px -5px 0;border:0;border-radius:8px;background:transparent;color:var(--uai-subtle);cursor:pointer;transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-status-banner__dismiss:hover{background:color-mix(in oklab,var(--uai-text) 8%,transparent);color:var(--uai-text)}
.uai-status-banner__dismiss:active{transform:scale(0.94)}
.uai-status-banner[data-variant="bar"] .uai-status-banner__dismiss{width:24px;height:24px;margin:-3px -4px -3px 0}
.uai-status-banner__action:focus-visible,.uai-status-banner__dismiss:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.uai-status-banner{animation:none}.uai-status-banner__action,.uai-status-banner__dismiss{transition:none}.uai-status-banner__action:active,.uai-status-banner__dismiss:active{transform:none}}
`;

export function StatusBanner({
  variant = "card",
  tone = "info",
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  className,
  style,
  ...props
}: StatusBannerProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const visible = open ?? internal;
  if (!visible) return null;
  const dismiss = () => {
    if (open === undefined) setInternal(false);
    onOpenChange?.(false);
  };
  const urgent = tone === "error" || tone === "warning";
  return (
    <Context.Provider value={{ tone, variant, dismiss }}>
      <div
        role={urgent ? "alert" : "status"}
        {...props}
        className={["uai-status-banner", className].filter(Boolean).join(" ")}
        data-variant={variant}
        data-tone={tone}
        style={{
          display: "flex",
          alignItems: variant === "bar" ? "center" : "flex-start",
          flexWrap: "wrap",
          gap: variant === "bar" ? 10 : 12,
          minWidth: 0,
          padding: variant === "bar" ? "8px 16px" : variant === "tinted" ? "12px 14px" : 14,
          borderStyle: "solid",
          borderWidth: variant === "card" ? 1 : variant === "bar" ? "0 0 1px" : 0,
          borderColor:
            variant === "bar"
              ? `color-mix(in oklab, ${toneColor[tone]} 22%, var(--uai-border))`
              : "var(--uai-border)",
          borderRadius: variant === "bar" ? 0 : variant === "tinted" ? 12 : 14,
          background:
            variant === "card"
              ? "var(--uai-surface)"
              : `color-mix(in oklab, ${toneColor[tone]} ${variant === "bar" ? 8 : 11}%, var(--uai-surface))`,
          boxShadow:
            variant === "tinted"
              ? `inset 0 0 0 1px color-mix(in oklab, ${toneColor[tone]} 18%, transparent)`
              : undefined,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{bannerCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

export function StatusBannerIcon({ children, style, ...props }: ComponentProps<"span">) {
  const context = useBanner("StatusBannerIcon");
  const Icon = toneIcon[context.tone];
  const chip = context.variant === "card";
  return (
    <span
      aria-hidden="true"
      {...props}
      style={{
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: chip ? 28 : 18,
        height: chip ? 28 : 18,
        marginTop: chip ? -5 : 0,
        marginBottom: chip ? -5 : 0,
        borderRadius: 999,
        background: chip
          ? `color-mix(in oklab, ${toneColor[context.tone]} 14%, transparent)`
          : undefined,
        color: toneColor[context.tone],
        ...style,
      }}
    >
      {children ?? <Icon size={chip ? 15 : 16} strokeWidth={1.85} />}
    </span>
  );
}

export function StatusBannerContent({ style, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} style={{ display: "grid", gap: 2, flex: "1 1 220px", minWidth: 0, ...style }} />
  );
}

export function StatusBannerTitle({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, fontWeight: 500, overflowWrap: "anywhere", ...style }} />
  );
}

export function StatusBannerDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 12.5,
        overflowWrap: "anywhere",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export function StatusBannerActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        marginLeft: "auto",
        ...style,
      }}
    />
  );
}

export function StatusBannerAction({ className, ...props }: ComponentProps<"button">) {
  useBanner("StatusBannerAction");
  return (
    <button
      type="button"
      {...props}
      className={["uai-status-banner__action", className].filter(Boolean).join(" ")}
    />
  );
}

export function StatusBannerDismiss({
  children = <X size={14} aria-hidden="true" />,
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useBanner("StatusBannerDismiss");
  return (
    <button
      aria-label="Dismiss"
      {...props}
      type="button"
      className={["uai-status-banner__dismiss", className].filter(Boolean).join(" ")}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.dismiss();
      }}
    >
      {children}
    </button>
  );
}
