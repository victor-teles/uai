import type { MetadataRoute } from "next";

import { registryCatalog } from "@/components/registry/catalog";
import { absoluteUrl } from "@/lib/site";

/** Prerendered at build time, which a static export (`build:workers`) requires. */
export const dynamic = "force-static";

/** Every indexable page: the overview, the theming guide, and one page per registry item. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/theming"), changeFrequency: "monthly", priority: 0.7 },
    ...registryCatalog.map((item) => ({
      url: absoluteUrl(`/components/${item.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
