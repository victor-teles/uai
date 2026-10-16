import { describe, expect, test } from "bun:test";

import {
  lintPreview,
  lintSource,
  PREMIUM_EXCEPTIONS,
  PREMIUM_RULES,
} from "../scripts/premium-lint";

const rules = (source: string) => lintSource("x.tsx", source).map((finding) => finding.rule);

describe("premium lint", () => {
  test("names every rule from the rubric", () => {
    expect(PREMIUM_RULES).toHaveLength(15);
  });

  test("passes gold-standard class strings", () => {
    const source = `
      const a = "transition-[scale,background-color] duration-140 ease-out-quint active:scale-[0.94] motion-reduce:active:scale-100";
      const b = "data-[state=open]:animate-in data-[state=closed]:animate-out zoom-in-96 duration-180 motion-reduce:animate-none absolute";
      const c = "rounded-[14px] border bg-card text-[12px] text-subtle-foreground font-medium";
      export function X() { return <button className={a} />; }
    `;
    expect(rules(source)).toEqual([]);
  });

  test("flags motion outside the tokens", () => {
    expect(rules(`"transition-colors duration-220 ease-out"`)).toContain("motion-duration");
    expect(rules(`"transition-opacity duration-200 ease-in"`)).toContain("motion-easing");
    expect(rules(`"transition-colors"`)).toContain("motion-easing");
    expect(rules(`"animate-spin ease-linear motion-reduce:animate-none"`)).not.toContain(
      "motion-easing",
    );
    expect(rules(`"ease-[cubic-bezier(0.4,0,0.2,1)] duration-200"`)).toContain("motion-easing");
  });

  test("flags press feedback problems", () => {
    expect(rules(`"transition-transform duration-140"`)).toContain("press-transform");
    expect(rules(`"transition-all duration-140"`)).toContain("press-transform");
    expect(rules(`"active:scale-[0.99] motion-reduce:active:scale-100"`)).toContain("press-scale");
    expect(rules(`const b = <button className="p-2" />;`)).toContain("press-scale");
    expect(rules(`"active:scale-[0.97]"`)).toContain("reduced-motion-pair");
  });

  test("flags animation without a reduced-motion pair", () => {
    expect(rules(`"animate-in fade-in-0"`)).toContain("reduced-motion-pair");
    expect(rules(`"motion-safe:animate-spin"`)).not.toContain("reduced-motion-pair");
  });

  test("flags scale from zero except small dots", () => {
    expect(rules(`"zoom-in-0 motion-reduce:animate-none"`)).toContain("scale-from-zero");
    expect(rules(`"size-2 scale-0 data-checked:scale-100"`)).not.toContain("scale-from-zero");
  });

  test("flags floating layers with no exit", () => {
    expect(rules(`"absolute animate-in zoom-in-96 motion-reduce:animate-none"`)).toContain(
      "exit-missing",
    );
    expect(rules(`"animate-in fade-in-0 motion-reduce:animate-none"`)).not.toContain(
      "exit-missing",
    );
  });

  test("caps stagger", () => {
    expect(rules("const style = { animationDelay: index * 60 };")).toContain("stagger-cap");
    expect(rules("const style = { animationDelay: index * 40 };")).not.toContain("stagger-cap");
    expect(rules(`"[animation-delay:240ms]"`)).toContain("stagger-cap");
    expect(rules(`"*:duration-400 *:ease-out-quint"`)).not.toContain("stagger-cap");
  });

  test("flags literal colors and theme reads", () => {
    expect(rules(`"bg-[#ff0000]"`)).toContain("no-literal-color");
    expect(rules(`"text-[oklch(0.5_0.1_20)]"`)).toContain("no-literal-color");
    expect(rules(`"bg-[var(--uai-canvas)]"`)).toContain("no-literal-color");
    expect(rules(`"text-[oklch(0.99_0_0)]"`)).not.toContain("no-literal-color");
  });

  test("flags weight, radius, shadow, and subtle size", () => {
    expect(rules(`"font-bold"`)).toContain("font-weight");
    expect(rules(`"font-[550]"`)).toContain("font-weight");
    expect(rules(`"rounded-md border bg-card"`)).toContain("radius");
    expect(rules(`"rounded-lg border bg-card shadow-lg"`)).toContain("shadow");
    expect(rules(`"fixed z-50 shadow-lg"`)).not.toContain("shadow");
    expect(rules(`"text-sm text-subtle-foreground"`)).toContain("subtle-size");
    expect(rules(`"text-sm placeholder:text-subtle-foreground"`)).not.toContain("subtle-size");
  });

  test("ignores classes named in comments", () => {
    expect(rules(`// never use "font-bold" here\nconst a = 1;`)).toEqual([]);
  });

  test("details name the file and token, not a line", () => {
    expect(lintSource("src/a.tsx", `"font-bold"`)[0]?.detail).toBe("src/a.tsx: font-bold");
  });

  test("flags placeholder content in previews", () => {
    expect(lintPreview("p.tsx", `<Card name="John Doe" />`)).toHaveLength(1);
    expect(lintPreview("p.tsx", `<p>Lorem ipsum</p>`).length).toBeGreaterThan(0);
    expect(lintPreview("p.tsx", `<Card name="Marina Costa" />`)).toEqual([]);
  });

  test("flags layout properties in transitions (E5)", () => {
    expect(rules(`"transition-[height,opacity] duration-200 ease-out"`)).toContain(
      "cheap-properties",
    );
    expect(rules(`"[transition:width_200ms_ease-out]"`)).toContain("cheap-properties");
    expect(rules(`"transition-[grid-template-rows,opacity] duration-200 ease-out"`)).not.toContain(
      "cheap-properties",
    );
  });

  test("honors approved exceptions only for their file and property", () => {
    const menu = "src/registry/uai/components/command-menu.tsx";
    const lint = (file: string, cls: string) =>
      lintSource(file, `"${cls} duration-200 ease-out"`).map((finding) => finding.rule);
    expect(PREMIUM_EXCEPTIONS.some((e) => e.file === menu && e.properties.includes("height"))).toBe(
      true,
    );
    expect(lint(menu, "transition-[height]")).not.toContain("cheap-properties");
    expect(lint(menu, "transition-[width]")).toContain("cheap-properties");
    expect(lint("src/registry/uai/components/kanban-board.tsx", "transition-[height]")).toContain(
      "cheap-properties",
    );
  });
});
