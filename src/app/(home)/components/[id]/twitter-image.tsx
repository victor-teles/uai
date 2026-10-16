import { notFound } from "next/navigation";

import {
  findRegistryItem,
  getRegistryItemKind,
  registryCatalog,
} from "@/components/registry/catalog";
import { ogImageContentType, ogImageSize, renderOgImage } from "@/lib/og";

type ImageProps = { params: Promise<{ id: string }> };

export const alt = "Uai registry component";
export const size = ogImageSize;
export const contentType = ogImageContentType;

export function generateStaticParams() {
  return registryCatalog.map((item) => ({ id: item.id }));
}

export default async function Image({ params }: ImageProps) {
  const item = findRegistryItem((await params).id);
  if (!item) notFound();
  return renderOgImage({
    eyebrow: `${item.category} · ${getRegistryItemKind(item.id)}`,
    title: item.name,
    description: item.description,
    path: `/components/${item.id}`,
  });
}
