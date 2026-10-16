/**
 * Syntax themes for every code block on the site. Fumadocs defaults to
 * `github-light`, whose keyword red and parameter orange fall below 4.5:1 on the
 * light code well; `github-light-default` keeps the same palette at AA contrast.
 */
export const codeBlockOptions = {
  themes: { light: "github-light-default", dark: "github-dark" },
} as const;
