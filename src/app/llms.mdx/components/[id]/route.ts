import { notFound } from "next/navigation";

import { getLlmsPage, llmsPages, renderLlmsPage } from "@/lib/llms";

export const dynamicParams = false;

export function generateStaticParams() {
  return llmsPages.map((page) => ({ id: page.data.item.id }));
}

/** Markdown for one item, served at `/components/<id>.md` through a rewrite. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/llms.mdx/components/[id]">,
) {
  const page = getLlmsPage((await params).id);
  if (!page) notFound();
  return new Response(renderLlmsPage(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
