import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findRegistryItem, registryCatalog } from "@/components/registry/catalog";
import { RegistryItem } from "@/components/registry/registry-item";
import { pageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return registryCatalog.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = findRegistryItem((await params).id);
  if (!item) return {};
  const path = `/components/${item.id}`;
  return pageMetadata({
    title: item.name,
    description: item.description,
    path,
    alternateTypes: { "text/markdown": `${path}.md` },
    shareImage: "route",
  });
}

export default async function ComponentPage({ params }: PageProps) {
  const item = findRegistryItem((await params).id);
  if (!item) notFound();
  // Keyed so the selected variant resets when navigating between items.
  return <RegistryItem key={item.id} id={item.id} />;
}
