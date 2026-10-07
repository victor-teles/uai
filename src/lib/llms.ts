import { llms, loader, type PageData, source } from "fumadocs-core/source";

import { getAnatomyTree } from "@/components/registry/anatomy";
import {
  getRegistryItemKind,
  type RegistryCatalogItem,
  registryGroups,
} from "@/components/registry/catalog";

/** Same base the install command uses, so llms.txt links match the deployed registry. */
export const registryUrl = process.env.NEXT_PUBLIC_REGISTRY_URL ?? "http://localhost:3000/r";
export const siteUrl = registryUrl.replace(/\/r\/?$/, "");

const title = "Uai";
const summary =
  "Open-code React components and page blocks for websites and web apps, distributed as a shadcn registry. The CLI copies every line into your project, so you own the markup, the styles, and the behavior.";

type ItemPageData = PageData & { title: string; description: string; item: RegistryCatalogItem };

const slugify = (value: string) => value.toLowerCase().replaceAll(" ", "-");

const llmsSource = loader({
  baseUrl: "/",
  url: (slugs) => `${siteUrl}/${slugs.join("/")}.md`,
  source: source<ItemPageData, { title: string; pages: string[] }>({
    metas: [
      {
        type: "meta",
        path: "meta.json",
        data: { title, pages: registryGroups.map((group) => slugify(group.category)) },
      },
      ...registryGroups.map((group) => ({
        type: "meta" as const,
        path: `${slugify(group.category)}/meta.json`,
        data: { title: group.category, pages: group.items.map((item) => item.id) },
      })),
    ],
    pages: registryGroups.flatMap((group) =>
      group.items.map((item) => ({
        type: "page" as const,
        path: `${slugify(group.category)}/${item.id}.mdx`,
        slugs: ["components", item.id],
        data: { title: item.name, description: item.description, item },
      })),
    ),
  }),
});

const intro = `# ${title}

> ${summary}

Uai is pronounced /waj/, like "why", or "UI" said fast. It is the Minas Gerais word for surprise.

## Install

Install any item with the shadcn CLI. Each item pulls in the \`uai-theme\` tokens, the \`cn()\` utility, and the shadcn primitives it composes:

\`\`\`bash
bunx shadcn@latest add ${registryUrl}/<name>.json
\`\`\`

Components are compound React components with named parts (for example \`PromptComposer\`, \`PromptComposerInput\`, \`PromptComposerActions\`). They are styled with Tailwind classes and the standard shadcn tokens, every part exposes \`data-slot\`, a consumer's \`className\` always wins, and every root takes a \`variant\` prop. Each page below links to a Markdown version with the usage example, the part tree, and the accessibility contract. The full text of every page is at ${siteUrl}/llms-full.txt.`;

/** The `llms.txt` index: the summary and install notes, then every item grouped by category. */
export function getLlmsIndex() {
  const index = llms(llmsSource);
  const tree = llmsSource.getPageTree().children.map((node) => index.indexNode(node));
  return `${intro}\n\n## Components\n\n${tree.join("\n")}\n`;
}

export function getLlmsPage(id: string) {
  return llmsSource.getPage(["components", id]);
}

export const llmsPages = llmsSource.getPages();

/** One registry item as Markdown: install, usage, part tree, and accessibility notes. */
export function renderLlmsPage(page: (typeof llmsPages)[number]) {
  const { item } = page.data;
  const kind = getRegistryItemKind(item.id);
  const anatomy = getAnatomyTree(item.usage)
    .map((node) => `${"  ".repeat(node.depth)}- \`${node.name}\``)
    .join("\n");

  return `# ${item.name}

> ${item.description}

- Category: ${item.category}
- Kind: ${kind}
- Page: ${siteUrl}/components/${item.id}
- Registry item: ${registryUrl}/${item.id}.json

## Install

\`\`\`bash
bunx shadcn@latest add ${registryUrl}/${item.id}.json
\`\`\`

## Usage

\`\`\`tsx
${item.usage.trim()}
\`\`\`
${anatomy ? `\n## Anatomy\n\n${anatomy}\n` : ""}
## Accessibility

${item.accessibility.map((note) => `- ${note}`).join("\n")}
`;
}

/** Every page in reading order, for `llms-full.txt`. */
export function getLlmsFull() {
  return [intro].concat(llmsPages.map(renderLlmsPage)).join("\n---\n\n");
}
