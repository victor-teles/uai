"use client";

import { Upload } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
  useId,
  useRef,
  useState,
} from "react";

export const FILE_UPLOAD_VARIANTS = ["dropzone", "inline", "compact"] as const;
export type FileUploadVariant = (typeof FILE_UPLOAD_VARIANTS)[number];
export type FileUploadRejection = { file: File; reason: string };
export type FileUploadProps = ComponentProps<"div"> & {
  variant?: FileUploadVariant;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  fileCount?: number;
  disabled?: boolean;
  multiple?: boolean;
  onFilesAccepted?: (files: File[]) => void;
  onFilesRejected?: (files: FileUploadRejection[]) => void;
};
type UploadContext = {
  id: string;
  variant: FileUploadVariant;
  disabled: boolean;
  accept?: string;
  multiple: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  receive: (files: File[]) => void;
};
const Context = createContext<UploadContext | null>(null);
const uploadCss = `
.uai-file-upload-zone{border:1px var(--uai-upload-line) var(--uai-border-strong);background:var(--uai-upload-fill);transition:border-color 120ms ease-out,background-color 120ms ease-out}
.uai-file-upload-zone:not(:disabled):hover{border-color:color-mix(in oklab,var(--uai-border-strong) 60%,var(--uai-text))}
.uai-file-upload-zone[data-dragging]{border-color:var(--uai-accent);background:color-mix(in oklab,var(--uai-accent) 8%,var(--uai-surface))}
.uai-file-upload-zone[data-dragging] .uai-file-upload-icon{color:var(--uai-accent);transform:translateY(-2px)}
.uai-file-upload-icon{transition:color 120ms ease-out,transform 180ms cubic-bezier(0.23,1,0.32,1)}
.uai-file-upload-trigger,.uai-file-upload-retry{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-file-upload-remove{background:transparent;color:var(--uai-muted)}
.uai-file-upload-trigger,.uai-file-upload-retry,.uai-file-upload-remove{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-file-upload-trigger:hover:not(:disabled),.uai-file-upload-retry:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-file-upload-remove:hover:not(:disabled){background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-file-upload-trigger:active:not(:disabled),.uai-file-upload-retry:active:not(:disabled),.uai-file-upload-remove:active:not(:disabled){transform:scale(0.97)}
.uai-file-upload-trigger:focus-visible,.uai-file-upload-retry:focus-visible,.uai-file-upload-remove:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-file-upload-trigger:disabled,.uai-file-upload-retry:disabled,.uai-file-upload-remove:disabled{cursor:not-allowed;opacity:0.5}
.uai-file-upload-item{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;animation:uai-file-upload-in 240ms cubic-bezier(0.23,1,0.32,1) both}
.uai-file-upload-item>:first-child{order:-1;flex:1 1 auto;min-width:0}
.uai-file-upload-item>[role="status"]{order:-1}
.uai-file-upload-item>.uai-file-upload-progress{order:10;flex-basis:100%}
.uai-file-upload-progress{appearance:none;-webkit-appearance:none;border:0;overflow:hidden;border-radius:999px;background:color-mix(in oklab,var(--uai-text) 10%,transparent)}
.uai-file-upload-progress::-webkit-progress-bar{background:transparent}
.uai-file-upload-progress::-webkit-progress-value{background:var(--uai-text);border-radius:999px;transition:width 240ms cubic-bezier(0.23,1,0.32,1)}
.uai-file-upload-progress::-moz-progress-bar{background:var(--uai-text);border-radius:999px}
.uai-file-upload-shimmer{color:transparent;background:linear-gradient(90deg,var(--uai-subtle) 0%,var(--uai-subtle) 35%,var(--uai-text) 50%,var(--uai-subtle) 65%,var(--uai-subtle) 100%) 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;animation:uai-file-upload-shimmer 2s linear infinite}
@keyframes uai-file-upload-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes uai-file-upload-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion: reduce){.uai-file-upload-zone,.uai-file-upload-icon,.uai-file-upload-trigger,.uai-file-upload-retry,.uai-file-upload-remove{transition:none}.uai-file-upload-item{animation:none}.uai-file-upload-progress::-webkit-progress-value{transition:none}.uai-file-upload-shimmer{animation:none;color:var(--uai-subtle);background:none}}
`;
const actionStyle = {
  justifySelf: "start",
  height: 26,
  padding: "0 10px",
  border: 0,
  borderRadius: 999,
  font: "inherit",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
} as const;
function useUpload() {
  const context = useContext(Context);
  if (!context) throw new Error("FileUpload children must be used within FileUpload");
  return context;
}
function acceptsFile(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}
export function FileUpload({
  variant = "dropzone",
  accept,
  maxSize = Infinity,
  maxFiles = Infinity,
  fileCount = 0,
  disabled = false,
  multiple = true,
  onFilesAccepted,
  onFilesRejected,
  children,
  style,
  ...props
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FileUploadRejection[]>([]);
  const receive = (files: File[]) => {
    if (disabled) return;
    const accepted: File[] = [];
    const rejected: FileUploadRejection[] = [];
    for (const file of files) {
      let reason = "";
      if (!acceptsFile(file, accept)) reason = "File type is not supported.";
      else if (file.size > maxSize) reason = "File exceeds the size limit.";
      else if (accepted.length + fileCount >= Math.min(maxFiles, multiple ? Infinity : 1))
        reason = "File count limit reached.";
      if (reason) rejected.push({ file, reason });
      else accepted.push(file);
    }
    setErrors(rejected);
    if (accepted.length) onFilesAccepted?.(accepted);
    if (rejected.length) onFilesRejected?.(rejected);
  };
  return (
    <Context.Provider value={{ id, variant, accept, multiple, disabled, inputRef, receive }}>
      <div
        {...props}
        data-variant={variant}
        style={{
          display: "grid",
          gap: 10,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          minWidth: 0,
          ...style,
        }}
      >
        <style>{uploadCss}</style>
        {children}
        <div role="alert" id={`${id}-errors`} style={{ display: "grid", gap: 4 }}>
          {errors.map((error) => (
            <p
              key={`${error.file.name}-${error.file.size}-${error.file.lastModified}`}
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: "16px",
                color: "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))",
                overflowWrap: "anywhere",
              }}
            >
              {error.file.name}: {error.reason}
            </p>
          ))}
        </div>
      </div>
    </Context.Provider>
  );
}
export function FileUploadDropzone({
  children,
  className,
  style,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}: ComponentProps<"fieldset">) {
  const context = useUpload();
  const [dragging, setDragging] = useState(false);
  return (
    <fieldset
      {...props}
      aria-label="Upload files"
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        onDragOver?.(event);
        event.preventDefault();
        if (!context.disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        onDrop?.(event);
        const cancelled = event.defaultPrevented;
        event.preventDefault();
        setDragging(false);
        if (!cancelled) context.receive(Array.from(event.dataTransfer.files));
      }}
      className={className ? `uai-file-upload-zone ${className}` : "uai-file-upload-zone"}
      style={
        {
          "--uai-upload-line": context.variant === "dropzone" ? "dashed" : "solid",
          "--uai-upload-fill":
            context.variant === "compact" ? "var(--uai-canvas)" : "var(--uai-surface)",
          margin: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: context.variant === "dropzone" ? "column" : "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: context.variant === "dropzone" ? "center" : "flex-start",
          gap: context.variant === "dropzone" ? 10 : 12,
          padding:
            context.variant === "dropzone"
              ? "28px 16px"
              : context.variant === "compact"
                ? "8px 8px 8px 10px"
                : "12px 12px 12px 14px",
          borderRadius: context.variant === "compact" ? 12 : 14,
          opacity: context.disabled ? 0.55 : 1,
          ...style,
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className="uai-file-upload-icon"
        style={{
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          width: context.variant === "compact" ? 28 : 36,
          height: context.variant === "compact" ? 28 : 36,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-muted)",
        }}
      >
        <Upload size={context.variant === "compact" ? 14 : 16} strokeWidth={1.75} />
      </span>
      {children}
    </fieldset>
  );
}
export function FileUploadInput({
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "type" | "multiple" | "accept" | "disabled" | "id">) {
  const context = useUpload();
  return (
    <input
      aria-label="Choose files"
      {...props}
      type="file"
      id={context.id}
      ref={context.inputRef}
      className="sr-only"
      tabIndex={-1}
      accept={context.accept}
      multiple={context.multiple}
      disabled={context.disabled}
      aria-describedby={`${context.id}-errors`}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) context.receive(Array.from(event.target.files ?? []));
        event.target.value = "";
      }}
    />
  );
}
export function FileUploadTrigger({
  children = "Choose files",
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useUpload();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      className={className ? `uai-file-upload-trigger ${className}` : "uai-file-upload-trigger"}
      style={{
        flexShrink: 0,
        height: context.variant === "compact" ? 28 : 30,
        padding: "0 14px",
        border: 0,
        borderRadius: 999,
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.inputRef.current?.click();
      }}
    >
      {children}
    </button>
  );
}
export function FileUploadList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{ display: "grid", gap: 6, padding: 0, margin: 0, listStyle: "none", ...style }}
    />
  );
}
type FileItemContext = {
  status: "uploading" | "complete" | "error";
  progress: number;
  disabled: boolean;
};
const ItemContext = createContext<FileItemContext | null>(null);
function useItem() {
  const context = useContext(ItemContext);
  if (!context) throw new Error("FileUpload item children must be used within FileUploadItem");
  return context;
}
export function FileUploadItem({
  status = "uploading",
  progress = 0,
  children,
  className,
  style,
  ...props
}: ComponentProps<"li"> & { status?: FileItemContext["status"]; progress?: number }) {
  const context = useUpload();
  return (
    <ItemContext.Provider
      value={{
        status,
        progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0,
        disabled: context.disabled,
      }}
    >
      <li
        {...props}
        aria-busy={status === "uploading"}
        data-status={status}
        className={className ? `uai-file-upload-item ${className}` : "uai-file-upload-item"}
        style={{
          padding: context.variant === "compact" ? "6px 6px 6px 12px" : "8px 8px 8px 12px",
          borderRadius: 10,
          background:
            status === "error"
              ? "color-mix(in oklab, var(--uai-danger) 8%, var(--uai-surface))"
              : "var(--uai-surface)",
          boxShadow:
            status === "error"
              ? "inset 0 0 0 1px color-mix(in oklab, var(--uai-danger) 28%, transparent)"
              : "inset 0 0 0 1px var(--uai-border)",
          overflowWrap: "anywhere",
          ...style,
        }}
      >
        {children}
        <span
          role="status"
          className={status === "uploading" ? "uai-file-upload-shimmer" : undefined}
          style={{
            fontSize: 11.5,
            lineHeight: "16px",
            color:
              status === "error"
                ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
                : status === "complete"
                  ? "var(--uai-success)"
                  : "var(--uai-subtle)",
          }}
        >
          {status === "uploading"
            ? "Uploading…"
            : status === "complete"
              ? "Upload complete"
              : "Upload failed"}
        </span>
      </li>
    </ItemContext.Provider>
  );
}
export function FileUploadProgress({ className, style, ...props }: ComponentProps<"progress">) {
  const context = useItem();
  if (context.status !== "uploading") return null;
  return (
    <progress
      aria-label="Upload progress"
      {...props}
      max={100}
      value={context.progress}
      className={className ? `uai-file-upload-progress ${className}` : "uai-file-upload-progress"}
      style={{ display: "block", width: "100%", height: 4, ...style }}
    />
  );
}
export function FileUploadRetry({
  children = "Retry upload",
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useItem();
  if (context.status !== "error") return null;
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      className={className ? `uai-file-upload-retry ${className}` : "uai-file-upload-retry"}
      style={{ ...actionStyle, ...style }}
    >
      {children}
    </button>
  );
}
export function FileUploadRemove({
  children = "Remove file",
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useItem();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      className={className ? `uai-file-upload-remove ${className}` : "uai-file-upload-remove"}
      style={{ ...actionStyle, ...style }}
    >
      {children}
    </button>
  );
}
