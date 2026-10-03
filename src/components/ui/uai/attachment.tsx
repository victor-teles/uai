"use client";

import {
  CircleAlert,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImageIcon,
  type LucideIcon,
  RotateCw,
  X,
} from "lucide-react";
import { type ComponentProps, type CSSProperties, createContext, useContext, useId } from "react";

export const ATTACHMENT_VARIANTS = ["row", "card", "chip"] as const;
export type AttachmentVariant = (typeof ATTACHMENT_VARIANTS)[number];
export type AttachmentStatus = "uploading" | "ready" | "error";
export type AttachmentProps = ComponentProps<"div"> & {
  variant?: AttachmentVariant;
  status?: AttachmentStatus;
  /** Upload progress from 0 to 100. Omit for indeterminate progress. */
  progress?: number;
  /** MIME type, used to choose the default file icon. */
  mimeType?: string;
};

type AttachmentContextValue = {
  id: string;
  variant: AttachmentVariant;
  status: AttachmentStatus;
  progress?: number;
  mimeType: string;
};

const AttachmentContext = createContext<AttachmentContextValue | null>(null);

function useAttachment(part: string) {
  const context = useContext(AttachmentContext);
  if (!context) throw new Error(`${part} must be used within Attachment`);
  return context;
}

function iconFor(mimeType: string): LucideIcon {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (/zip|tar|gzip|compressed/.test(mimeType)) return FileArchive;
  if (/csv|spreadsheet|excel/.test(mimeType)) return FileSpreadsheet;
  if (/json|javascript|typescript|xml|html|x-/.test(mimeType)) return FileCode;
  if (mimeType.startsWith("text/") || /pdf|document|word/.test(mimeType)) return FileText;
  return File;
}

const dangerText = "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))";

const attachmentCss = `
@keyframes uai-attachment-in{from{opacity:0;transform:scale(0.98)}}
@keyframes uai-attachment-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@keyframes uai-attachment-indeterminate{from{transform:translateX(-100%)}to{transform:translateX(290%)}}
[data-uai-attachment]{animation:uai-attachment-in 200ms cubic-bezier(0.23,1,0.32,1);transition:border-color 120ms ease-out,background-color 120ms ease-out}
[data-uai-attachment][data-status="ready"]:hover{border-color:var(--uai-border-strong)!important}
[data-uai-attachment][data-status="uploading"] [data-uai-attachment-meta]{background-image:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:uai-attachment-shimmer 2s linear infinite}
[data-uai-attachment-indeterminate]{animation:uai-attachment-indeterminate 1.2s cubic-bezier(0.65,0,0.35,1) infinite}
[data-uai-attachment-control]{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-attachment-control]:hover{background:var(--uai-surface-raised)!important;color:var(--uai-text)!important}
[data-uai-attachment-control]:active{transform:scale(0.92)}
[data-uai-attachment-control]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
@media (prefers-reduced-motion:reduce){[data-uai-attachment],[data-uai-attachment-control],[data-uai-attachment-indeterminate],[data-uai-attachment][data-status="uploading"] [data-uai-attachment-meta]{animation:none;transition:none}[data-uai-attachment][data-status="uploading"] [data-uai-attachment-meta]{background:none;color:var(--uai-subtle)!important}[data-uai-attachment-control]:active{transform:none}}
`;

export function Attachment({
  variant = "row",
  status = "ready",
  progress,
  mimeType = "",
  children,
  style,
  ...props
}: AttachmentProps) {
  const id = useId();
  const clamped = progress === undefined ? undefined : Math.min(100, Math.max(0, progress));
  const layout: Record<AttachmentVariant, CSSProperties> = {
    row: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 8px 8px 8px",
      borderRadius: 12,
    },
    card: {
      display: "grid",
      gridTemplateRows: "auto auto",
      gap: 8,
      width: 176,
      padding: 4,
      borderRadius: 14,
    },
    chip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      maxWidth: 260,
      minHeight: 30,
      padding: "3px 3px 3px 4px",
      borderRadius: 999,
    },
  };
  return (
    <AttachmentContext.Provider value={{ id, variant, status, progress: clamped, mimeType }}>
      {/* biome-ignore lint/a11y/useSemanticElements: an attachment groups its name, status, and actions; fieldset is for form controls. */}
      <div
        role="group"
        aria-labelledby={`${id}-name`}
        {...props}
        aria-busy={status === "uploading" || undefined}
        data-variant={variant}
        data-status={status}
        data-uai-attachment=""
        style={{
          position: "relative",
          minWidth: 0,
          border: `1px solid ${
            status === "error"
              ? "color-mix(in oklab, var(--uai-danger) 45%, var(--uai-border))"
              : "var(--uai-border)"
          }`,
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...layout[variant],
          ...style,
        }}
      >
        <style href="uai-attachment" precedence="default">
          {attachmentCss}
        </style>
        {children}
      </div>
    </AttachmentContext.Provider>
  );
}

export type AttachmentThumbnailProps = Omit<ComponentProps<"span">, "children"> & {
  /** Image thumbnail URL. Without it, a file-type icon is shown. */
  src?: string;
  alt?: string;
};

export function AttachmentThumbnail({ src, alt = "", style, ...props }: AttachmentThumbnailProps) {
  const context = useAttachment("AttachmentThumbnail");
  const Icon = context.status === "error" ? CircleAlert : iconFor(context.mimeType);
  const chip = context.variant === "chip";
  const size = chip ? 22 : 36;
  const card = context.variant === "card";
  return (
    <span
      {...props}
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        flex: "none",
        width: card ? "100%" : size,
        height: card ? 96 : size,
        overflow: "hidden",
        borderRadius: card ? 10 : chip ? 999 : 8,
        background:
          context.status === "error"
            ? "color-mix(in oklab, var(--uai-danger) 14%, transparent)"
            : "var(--uai-surface-raised)",
        boxShadow: chip ? "0 0 0 1px oklch(1 0 0 / 0.08)" : undefined,
        color: context.status === "error" ? dangerText : "var(--uai-muted)",
        ...style,
      }}
    >
      {src && context.status !== "error" ? (
        // biome-ignore lint/performance/noImgElement: registry components stay framework-neutral.
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: context.status === "uploading" ? 0.6 : 1,
            transition: "opacity 200ms ease-out",
          }}
        />
      ) : (
        <Icon size={card ? 20 : chip ? 12 : 16} strokeWidth={1.75} aria-hidden="true" />
      )}
    </span>
  );
}

export function AttachmentDetails({ style, ...props }: ComponentProps<"div">) {
  const context = useAttachment("AttachmentDetails");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "chip" ? 0 : 1,
        flex: "1 1 auto",
        minWidth: 0,
        padding:
          context.variant === "card" ? "0 6px 6px" : context.variant === "chip" ? "0 2px" : 0,
        ...style,
      }}
    />
  );
}

export function AttachmentName({ style, ...props }: ComponentProps<"span">) {
  const context = useAttachment("AttachmentName");
  return (
    <span
      {...props}
      id={`${context.id}-name`}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        fontSize: context.variant === "chip" ? 12.5 : 13,
        lineHeight: "18px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function AttachmentMeta({ style, ...props }: ComponentProps<"span">) {
  const context = useAttachment("AttachmentMeta");
  if (context.status === "error") return null;
  return (
    <span
      data-uai-attachment-meta=""
      {...props}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        color: "var(--uai-subtle)",
        fontSize: context.variant === "chip" ? 11 : 11.5,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function AttachmentProgress({ style, ...props }: ComponentProps<"div">) {
  const context = useAttachment("AttachmentProgress");
  if (context.status !== "uploading") return null;
  const value = context.progress;
  return (
    <div
      role="progressbar"
      aria-labelledby={`${context.id}-name`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={value === undefined ? "Uploading" : `${Math.round(value)}% uploaded`}
      {...props}
      style={{
        height: 3,
        marginTop: 5,
        overflow: "hidden",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        ...style,
      }}
    >
      <span
        data-uai-attachment-indeterminate={value === undefined ? "" : undefined}
        style={{
          display: "block",
          width: `${value ?? 35}%`,
          height: "100%",
          borderRadius: 999,
          background: "var(--uai-text)",
          opacity: value === undefined ? 0.6 : 1,
          transition: "width 240ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </div>
  );
}

export function AttachmentError({ style, children, ...props }: ComponentProps<"span">) {
  const context = useAttachment("AttachmentError");
  if (context.status !== "error") return null;
  return (
    <span
      role="alert"
      {...props}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        color: dangerText,
        fontSize: context.variant === "chip" ? 11 : 11.5,
        lineHeight: "16px",
        ...style,
      }}
    >
      {children ?? "Upload failed"}
    </span>
  );
}

function controlStyle(variant: AttachmentVariant): CSSProperties {
  const size = variant === "chip" ? 22 : 28;
  return {
    display: "grid",
    placeItems: "center",
    flex: "none",
    width: size,
    height: size,
    padding: 0,
    border: 0,
    borderRadius: variant === "chip" ? 999 : 8,
    background: "transparent",
    color: "var(--uai-subtle)",
    cursor: "pointer",
  };
}

function overlayControlStyle(right: number): CSSProperties {
  return {
    position: "absolute",
    top: 10,
    right,
    width: 24,
    height: 24,
    borderRadius: 999,
    background: "color-mix(in oklab, var(--uai-surface) 82%, transparent)",
    backdropFilter: "blur(8px)",
    color: "var(--uai-text)",
    boxShadow: "0 0 0 1px color-mix(in oklab, var(--uai-text) 10%, transparent)",
  };
}

export function AttachmentRetry({ children, style, ...props }: ComponentProps<"button">) {
  const context = useAttachment("AttachmentRetry");
  if (context.status !== "error") return null;
  return (
    <button
      type="button"
      aria-label="Retry upload"
      title="Retry upload"
      aria-describedby={`${context.id}-name`}
      data-uai-attachment-control=""
      {...props}
      style={{
        ...controlStyle(context.variant),
        ...(context.variant === "card" ? overlayControlStyle(38) : null),
        ...style,
      }}
    >
      {children ?? <RotateCw size={context.variant === "chip" ? 12 : 14} aria-hidden="true" />}
    </button>
  );
}

export function AttachmentRemove({ children, style, ...props }: ComponentProps<"button">) {
  const context = useAttachment("AttachmentRemove");
  const label = context.status === "uploading" ? "Cancel upload" : "Remove attachment";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-describedby={`${context.id}-name`}
      data-uai-attachment-control=""
      {...props}
      style={{
        ...controlStyle(context.variant),
        ...(context.variant === "card" ? overlayControlStyle(10) : null),
        ...style,
      }}
    >
      {children ?? <X size={context.variant === "chip" ? 12 : 14} aria-hidden="true" />}
    </button>
  );
}
