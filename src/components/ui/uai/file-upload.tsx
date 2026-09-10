"use client";

import { Upload } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId, useRef, useState } from "react";

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
          minWidth: 0,
          ...style,
        }}
      >
        {children}
        <div role="alert" id={`${id}-errors`}>
          {errors.map((error) => (
            <p
              key={`${error.file.name}-${error.file.size}-${error.file.lastModified}`}
              style={{
                margin: "4px 0",
                fontSize: 12,
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
      style={{
        margin: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: context.variant === "dropzone" ? "column" : "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: context.variant === "dropzone" ? "center" : "flex-start",
        gap: 12,
        padding:
          context.variant === "dropzone" ? "32px 16px" : context.variant === "compact" ? 10 : 16,
        border: `1px ${context.variant === "dropzone" ? "dashed" : "solid"} var(--uai-border-strong)`,
        borderRadius: context.variant === "compact" ? 12 : 14,
        background: dragging ? "var(--uai-surface-raised)" : "var(--uai-surface)",
        opacity: context.disabled ? 0.55 : 1,
        ...style,
      }}
    >
      <Upload size={20} aria-hidden="true" />
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
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useUpload();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      style={{
        padding: "8px 12px",
        border: "1px solid var(--uai-border-strong)",
        borderRadius: 8,
        background: "var(--uai-text)",
        color: "var(--uai-surface)",
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
      style={{ display: "grid", gap: 8, padding: 0, margin: 0, listStyle: "none", ...style }}
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
        style={{
          display: "grid",
          gap: 8,
          padding: 12,
          border: "1px solid var(--uai-border)",
          borderRadius: 12,
          overflowWrap: "anywhere",
          ...style,
        }}
      >
        {children}
        <span
          role="status"
          style={{
            fontSize: 12,
            color:
              status === "error"
                ? "color-mix(in oklab, var(--uai-danger) 75%, var(--uai-text))"
                : "var(--uai-muted)",
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
export function FileUploadProgress({ style, ...props }: ComponentProps<"progress">) {
  const context = useItem();
  if (context.status !== "uploading") return null;
  return (
    <progress
      aria-label="Upload progress"
      {...props}
      max={100}
      value={context.progress}
      style={{ width: "100%", height: 6, accentColor: "var(--uai-text)", ...style }}
    />
  );
}
export function FileUploadRetry({
  children = "Retry upload",
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
      style={{
        justifySelf: "start",
        padding: "5px 8px",
        background: "transparent",
        color: "inherit",
        border: "1px solid var(--uai-border-strong)",
        borderRadius: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
export function FileUploadRemove({
  children = "Remove file",
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useItem();
  return (
    <button
      {...props}
      type="button"
      disabled={context.disabled || props.disabled}
      style={{
        justifySelf: "start",
        padding: "5px 8px",
        background: "transparent",
        color: "inherit",
        border: 0,
        textDecoration: "underline",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
