import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findRegistryItem, registryCatalog } from "@/components/registry/catalog";
import { RegistryItem } from "@/components/registry/registry-item";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return registryCatalog.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = findRegistryItem((await params).id);
  if (!item) return {};
  return { title: item.name, description: item.description };
}

export default async function ComponentPage({ params }: PageProps) {
  const item = findRegistryItem((await params).id);
  if (!item) notFound();
  return <RegistryItem id={item.id} />;
}
