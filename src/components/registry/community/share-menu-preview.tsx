"use client";

import { AtSign, Mail } from "lucide-react";
import {
  ShareMenu,
  ShareMenuChannel,
  ShareMenuContent,
  ShareMenuCopy,
  ShareMenuNative,
  ShareMenuSeparator,
  ShareMenuTrigger,
  type ShareMenuVariant,
} from "@/components/ui/uai/share-menu";

const url = "https://uai.dev/blog/retry-budgets";
const title = "Retry budgets in practice";

export function ShareMenuPreview({ variant = "outlined" }: { variant?: ShareMenuVariant }) {
  return (
    <ShareMenu variant={variant} url={url} shareTitle={title}>
      <ShareMenuTrigger>Share article</ShareMenuTrigger>
      <ShareMenuContent>
        <ShareMenuNative />
        <ShareMenuCopy />
        <ShareMenuSeparator />
        <ShareMenuChannel
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        >
          <Mail size={14} aria-hidden="true" />
          Email
        </ShareMenuChannel>
        <ShareMenuChannel
          href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`}
        >
          <AtSign size={14} aria-hidden="true" />
          Bluesky
        </ShareMenuChannel>
      </ShareMenuContent>
    </ShareMenu>
  );
}
