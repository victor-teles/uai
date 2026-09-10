"use client";

import { useEffect, useState } from "react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadInput,
  FileUploadItem,
  FileUploadList,
  FileUploadProgress,
  FileUploadRemove,
  FileUploadRetry,
  FileUploadTrigger,
  type FileUploadVariant,
} from "@/components/ui/uai/file-upload";

type DemoFile = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "complete" | "error";
};
export function FileUploadPreview({ variant = "dropzone" }: { variant?: FileUploadVariant }) {
  const [files, setFiles] = useState<DemoFile[]>([
    { id: "sample", name: "Project brief.pdf", progress: 0, status: "error" },
  ]);
  const uploading = files.some((file) => file.status === "uploading");
  useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(
      () =>
        setFiles((current) =>
          current.map((file) =>
            file.status === "uploading"
              ? {
                  ...file,
                  progress: Math.min(100, file.progress + 20),
                  status: file.progress >= 80 ? "complete" : "uploading",
                }
              : file,
          ),
        ),
      350,
    );
    return () => clearInterval(timer);
  }, [uploading]);
  return (
    <FileUpload
      variant={variant}
      accept=".pdf,image/*"
      maxSize={5 * 1024 * 1024}
      maxFiles={3}
      fileCount={files.length}
      onFilesAccepted={(accepted) =>
        setFiles((current) => [
          ...current,
          ...accepted.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            progress: 0,
            status: "uploading" as const,
          })),
        ])
      }
    >
      <FileUploadDropzone>
        <div
          style={{
            textAlign: variant === "dropzone" ? "center" : "left",
            flex: variant === "dropzone" ? undefined : 1,
          }}
        >
          <strong>Add project files</strong>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--uai-muted)" }}>
            Drop PDFs or images · up to 5 MB each · 3 files
          </p>
        </div>
        <FileUploadInput />
        <FileUploadTrigger />
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file) => (
          <FileUploadItem key={file.id} status={file.status} progress={file.progress}>
            <strong style={{ fontWeight: 500 }}>{file.name}</strong>
            <FileUploadProgress aria-label={`Uploading ${file.name}`} />
            <div style={{ display: "flex", gap: 8 }}>
              <FileUploadRetry
                onClick={() =>
                  setFiles((current) =>
                    current.map((item) =>
                      item.id === file.id ? { ...item, progress: 0, status: "uploading" } : item,
                    ),
                  )
                }
              />
              <FileUploadRemove
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
              />
            </div>
          </FileUploadItem>
        ))}
      </FileUploadList>
      <p style={{ margin: 0, fontSize: 12, color: "var(--uai-muted)" }}>
        Local demo: progress is simulated. Files are not sent to a server.
      </p>
    </FileUpload>
  );
}
