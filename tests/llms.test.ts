import { describe, expect, test } from "bun:test";

import { registryCatalog } from "@/components/registry/catalog";
import {
  getLlmsFull,
  getLlmsIndex,
  getLlmsPage,
  llmsPages,
  registryUrl,
  renderLlmsPage,
  siteUrl,
} from "@/lib/llms";

describe("llms.txt", () => {
  test("opens with a title and summary, then links every item to its Markdown page", () => {
    const index = getLlmsIndex();
    expect(index.startsWith("# Uai\n\n> ")).toBe(true);
    expect(index).toContain("## Components");
    for (const item of registryCatalog) {
      expect(index).toContain(`](${siteUrl}/components/${item.id}.md): ${item.description}`);
    }
  });

  test("renders one page per catalog item with install, usage, and accessibility", () => {
    expect(llmsPages).toHaveLength(registryCatalog.length);
    const page = getLlmsPage("pix-payment");
    if (!page) throw new Error("Missing pix-payment page");
    const markdown = renderLlmsPage(page);
    expect(markdown).toStartWith("# Pix Payment\n");
    expect(markdown).toContain(`bunx shadcn@latest add ${registryUrl}/pix-payment.json`);
    expect(markdown).toContain("```tsx\n");
    expect(markdown).toContain("- `PixPayment`\n  - `PixPaymentHeader`");
    expect(markdown).toContain("## Accessibility");
    expect(getLlmsPage("missing")).toBeUndefined();
  });

  test("llms-full.txt concatenates every page", () => {
    const full = getLlmsFull();
    for (const item of registryCatalog) expect(full).toContain(`\n# ${item.name}\n`);
  });
});
