import registry from "../../../registry.json";

type CssRules = { [selector: string]: string | CssRules };

type ThemeItem = {
  name: string;
  cssVars: Record<"theme" | "light" | "dark", Record<string, string>>;
  css: CssRules;
};

const themeItem = registry.items.find((item) => item.name === "uai-theme") as unknown as ThemeItem;

export const themeTokens = themeItem.cssVars;

function declarations(vars: Record<string, string>, indent: string) {
  return Object.entries(vars)
    .map(([name, value]) => `${indent}--${name}: ${value};`)
    .join("\n");
}

function rules(css: CssRules, indent = ""): string {
  return Object.entries(css)
    .map(([key, value]) =>
      typeof value === "string"
        ? `${indent}${key}: ${value};`
        : `${indent}${key} {\n${rules(value, `${indent}  `)}\n${indent}}`,
    )
    .join("\n");
}

/** The CSS the shadcn CLI writes when it installs `uai-theme`, for manual setup. */
export const themeCss = [
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  "",
  "@custom-variant dark (&:is(.dark *));",
  "",
  `@theme inline {\n${declarations(themeItem.cssVars.theme, "  ")}\n}`,
  "",
  `:root {\n${declarations(themeItem.cssVars.light, "  ")}\n}`,
  "",
  `.dark {\n${declarations(themeItem.cssVars.dark, "  ")}\n}`,
  "",
  "@layer base {\n  * {\n    @apply border-border;\n  }\n}",
  "",
  rules(themeItem.css),
  "",
].join("\n");
