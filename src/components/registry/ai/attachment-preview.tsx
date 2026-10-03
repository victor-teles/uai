"use client";

import { useEffect, useState } from "react";
import {
  Attachment,
  AttachmentDetails,
  AttachmentError,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  AttachmentRemove,
  AttachmentRetry,
  type AttachmentStatus,
  AttachmentThumbnail,
  type AttachmentVariant,
} from "@/components/ui/uai/attachment";

const thumbnail =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 96'><rect width='160' height='96' fill='%23e8e6e1'/><rect x='14' y='14' width='58' height='68' rx='6' fill='%23ffffff'/><rect x='84' y='14' width='62' height='30' rx='6' fill='%23cfccc5'/><rect x='84' y='52' width='62' height='30' rx='6' fill='%23ffffff'/></svg>";

export function AttachmentPreview({ variant = "row" }: { variant?: AttachmentVariant }) {
  const [progress, setProgress] = useState(18);
  const [contract, setContract] = useState<AttachmentStatus>("error");
  const [files, setFiles] = useState(["mockup", "deck", "contract"]);
  const uploading = progress < 100;
  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => setProgress((value) => Math.min(100, value + 7)), 240);
    return () => window.clearTimeout(timer);
  }, [uploading]);
  const remove = (file: string) => setFiles((current) => current.filter((item) => item !== file));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexDirection: variant === "row" ? "column" : "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {files.includes("mockup") && (
          <Attachment variant={variant} mimeType="image/png">
            <AttachmentThumbnail src={thumbnail} />
            <AttachmentDetails>
              <AttachmentName>checkout-redesign.png</AttachmentName>
              <AttachmentMeta>PNG · 1.4 MB</AttachmentMeta>
            </AttachmentDetails>
            <AttachmentRemove onClick={() => remove("mockup")} />
          </Attachment>
        )}
        {files.includes("deck") && (
          <Attachment
            variant={variant}
            mimeType="application/pdf"
            status={uploading ? "uploading" : "ready"}
            progress={progress}
          >
            <AttachmentThumbnail />
            <AttachmentDetails>
              <AttachmentName>Q3 board update.pdf</AttachmentName>
              <AttachmentMeta>
                {uploading ? `${progress}% of 8.2 MB` : "PDF · 8.2 MB"}
              </AttachmentMeta>
              <AttachmentProgress />
            </AttachmentDetails>
            <AttachmentRemove onClick={() => remove("deck")} />
          </Attachment>
        )}
        {files.includes("contract") && (
          <Attachment variant={variant} mimeType="application/pdf" status={contract}>
            <AttachmentThumbnail />
            <AttachmentDetails>
              <AttachmentName>Vendor agreement (signed).pdf</AttachmentName>
              <AttachmentMeta>PDF · 640 KB</AttachmentMeta>
              <AttachmentError>Connection lost at 62%</AttachmentError>
            </AttachmentDetails>
            <AttachmentRetry onClick={() => setContract("ready")} />
            <AttachmentRemove onClick={() => remove("contract")} />
          </Attachment>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setFiles(["mockup", "deck", "contract"]);
          setProgress(18);
          setContract("error");
        }}
        style={{
          justifySelf: "start",
          height: 28,
          padding: "0 12px",
          border: 0,
          borderRadius: 999,
          background: "var(--uai-surface-raised)",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Reset attachments
      </button>
    </div>
  );
}
