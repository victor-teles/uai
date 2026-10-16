/**
 * Static checks from `quality/premium-rubric.md` › §10 "lint", run by
 * `scripts/registry-check.ts` over every distributed source file and preview.
 *
 * Each finding is `{ rule, detail }` where the detail names the file and the class
 * token, never a line number, so baseline entries survive unrelated edits.
 *
 * Rule → rubric rows:
 *   motion-duration      E4, X5   durations outside the §0 token set
 *   motion-easing        E4, X4   linear / ease-in on UI feedback, unnamed cubic-beziers, bare transition
 *   press-scale          P1       press scale outside 0.92–0.97, or buttons with no press scale
 *   press-transform      P2, X5   transition-transform / transition-all instead of `scale`
 *   reduced-motion-pair  R2       animate-* or active:scale with no motion-reduce: counterpart
 *   scale-from-zero      E1, X6   zoom-in-0 / scale-0 on anything bigger than an 8px dot
 *   exit-missing         E3       animate-in with no animate-out / closed-state exit in the file
 *   stagger-cap          S1       per-item step over 40ms, or a delay over 200ms
 *   no-literal-color     V1       hex / rgb / hsl / oklch literals or var(--uai-*) reads
 *   font-weight          V2       font-bold and heavier, or arbitrary weights outside 400/500/600
 *   radius               V4, X1   card surfaces without the card radius
 *   shadow               V5       shadow-md and up on in-flow surfaces
 *   subtle-size          C2       text-subtle-foreground on text larger than 12.5px
 *   preview-content      X8       lorem / placeholder names in preview files
 *   cheap-properties     E5       transitions on height, width, top, left, or margin
 *
 * §10 names the first 14. `cheap-properties` covers E5, which the rubric marks
 * `lint` but §10 doesn't name. Approved deviations live in
 * `quality/premium-exceptions.json` (the rubric itself has no exceptions section).
 */

import exceptionsFile from "../quality/premium-exceptions.json";

export type PremiumFinding = { rule: string; detail: string };

export const PREMIUM_RULES = [
  "motion-duration",
  "motion-easing",
  "press-scale",
  "press-transform",
  "reduced-motion-pair",
  "scale-from-zero",
  "exit-missing",
  "stagger-cap",
  "no-literal-color",
  "font-weight",
  "radius",
  "shadow",
  "subtle-size",
  "preview-content",
  "cheap-properties",
] as const;

export type PremiumException = {
  id: string;
  rule: string;
  item: string;
  file: string;
  properties: string[];
  scope: string;
  approvedBy: string;
  approved: string;
};

export const PREMIUM_EXCEPTIONS: PremiumException[] = exceptionsFile.exceptions;

/** E5: layout properties that must never animate. */
const EXPENSIVE_PROPERTY =
  /^(?:(?:min-|max-)?(?:height|width)|top|left|right|bottom|inset|margin(?:-\w+)?)$/;

/** The properties a `transition-[…]`, `[transition:…]`, or `[transition-property:…]` token animates. */
function transitionProperties(base: string): string[] {
  const list =
    base.match(/^transition-\[([^\]]+)\]$/) ?? base.match(/^\[transition-property:([^\]]+)\]$/);
  if (list?.[1]) return list[1].split(",").map((part) => part.trim());
  const shorthand = base.match(/^\[transition:([^\]]+)\]$/);
  if (shorthand?.[1])
    return shorthand[1].split(",").map((part) => part.split("_")[0]?.trim() ?? "");
  return [];
}

function isExcepted(rule: string, file: string, property: string, exceptions: PremiumException[]) {
  return exceptions.some(
    (exception) =>
      exception.rule === rule && exception.file === file && exception.properties.includes(property),
  );
}

/** §0: 100–300 for UI feedback, 400 ceiling, 480 for data-viz grow. */
const ALLOWED_DURATIONS = new Set([100, 120, 140, 150, 160, 180, 200, 240, 300, 400, 480]);
/** The named curves: --ease-out-quint and --uai-ease-pop. */
const ALLOWED_BEZIERS = new Set(["0.23,1,0.32,1", "0.16,1,0.3,1"]);
/** Linear and in-out easing are only for loops. */
const LOOP_PATTERN =
  /animate-(?:spin|pulse|ping|bounce|skeleton|shimmer|indeterminate)|shimmer|skeleton|infinite/;
const FLOATING_PATTERN =
  /\b(?:fixed|absolute|sticky|z-\d+|z-\[|origin-|animate-in|data-\[state|data-open|popover|tooltip)/;
/** Text sizes C2 allows for subtle text, and sizes that exceed it. */
const LARGE_TEXT = /^text-(?:sm|base|lg|xl|[2-9]xl|\[(?:1[3-9]|[2-9]\d)(?:\.\d+)?px\])$/;
const PLACEHOLDER_CONTENT =
  /\b(?:Lorem|ipsum|John Doe|Jane Doe|Foo Bar|Placeholder text|Item [1-9])\b|>\s*Title\s*<|"Title"/;

/** Drops comments so documentation that names a class never counts as using it. */
function stripComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** Every string literal (including static template parts) in the source. */
export function stringLiterals(source: string): string[] {
  const literals: string[] = [];
  for (const match of stripComments(source).matchAll(
    /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`([^`]*)`/g,
  )) {
    const text = match[1] ?? match[2] ?? match[3] ?? "";
    literals.push(match[3] === undefined ? text : text.replace(/\$\{[^}]*\}/g, " "));
  }
  return literals;
}

/** Splits a class string into `{ token, base }`, where base drops variant prefixes. */
function classTokens(literal: string) {
  return literal
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      // Split on colons outside brackets: `data-[state=open]:animate-in` → base `animate-in`.
      let depth = 0;
      let cut = -1;
      for (let index = 0; index < token.length; index += 1) {
        const char = token[index];
        if (char === "[" || char === "(") depth += 1;
        else if (char === "]" || char === ")") depth -= 1;
        else if (char === ":" && depth === 0) cut = index;
      }
      const base = (cut === -1 ? token : token.slice(cut + 1)).replace(/^!/, "");
      return { token, base, prefix: cut === -1 ? "" : token.slice(0, cut + 1) };
    });
}

function scaleValue(base: string): number | undefined {
  const arbitrary = base.match(/^scale-\[([\d.]+)\]$/);
  if (arbitrary?.[1]) return Number(arbitrary[1]);
  const preset = base.match(/^scale-(\d+)$/);
  if (preset?.[1]) return Number(preset[1]) / 100;
  return undefined;
}

/** Findings for one distributed source file. */
export function lintSource(
  file: string,
  source: string,
  exceptions: PremiumException[] = PREMIUM_EXCEPTIONS,
): PremiumFinding[] {
  const findings = new Map<string, PremiumFinding>();
  const add = (rule: string, detail: string) =>
    findings.set(`${rule}:${detail}`, { rule, detail: `${file}: ${detail}` });
  const code = stripComments(source);

  for (const literal of stringLiterals(source)) {
    const tokens = classTokens(literal);
    if (tokens.length === 0) continue;
    const isLoop = LOOP_PATTERN.test(literal);
    const hasReduced = tokens.some(({ prefix }) => /motion-(?:reduce|safe):/.test(prefix));
    const hasEase = tokens.some(({ base }) => base.startsWith("ease-"));
    const hasDuration = tokens.some(({ base }) => base.startsWith("duration-"));

    for (const { token, base, prefix } of tokens) {
      // motion-duration
      const duration = base.match(/^duration-(\d+)$/) ?? base.match(/^duration-\[(\d+)ms\]$/);
      if (duration?.[1] && !ALLOWED_DURATIONS.has(Number(duration[1])))
        add("motion-duration", token);

      // motion-easing
      if ((base === "ease-linear" || base === "ease-in-out") && !isLoop)
        add("motion-easing", token);
      if (base === "ease-in") add("motion-easing", token);
      const bezier = base.match(/^ease-\[cubic-bezier\(([^)]*)\)\]$/);
      if (bezier?.[1] && !ALLOWED_BEZIERS.has(bezier[1].replace(/[\s_]/g, ""))) {
        add("motion-easing", token);
      }
      if (/^transition(?:-colors|-opacity|-\[[^\]]+\])?$/.test(base) && !hasEase && !hasDuration) {
        add("motion-easing", `${token} without duration or easing`);
      }

      // cheap-properties (E5)
      for (const property of transitionProperties(base)) {
        if (
          EXPENSIVE_PROPERTY.test(property) &&
          !isExcepted("cheap-properties", file, property, exceptions)
        )
          add("cheap-properties", token);
      }

      // press-transform
      if (base === "transition-transform" || base === "transition-all")
        add("press-transform", token);
      if (/^transition-\[[^\]]*\b(?:transform|all)\b[^\]]*\]$/.test(base))
        add("press-transform", token);

      // press-scale
      if (prefix.includes("active:") && base.startsWith("scale-")) {
        const value = scaleValue(base);
        const isReset = value === 1;
        if (value !== undefined && !isReset && (value < 0.92 || value > 0.97))
          add("press-scale", token);
        // reduced-motion-pair: a press scale needs a reduced-motion reset.
        if (!isReset && !hasReduced && !/motion-reduce:/.test(code))
          add("reduced-motion-pair", token);
      }

      // reduced-motion-pair: entrance and loop animations.
      if (
        (/^animate-(?!none\b)/.test(base) || base === "animate-in") &&
        !/motion-(?:reduce|safe):/.test(prefix) &&
        !hasReduced
      ) {
        add("reduced-motion-pair", token);
      }

      // scale-from-zero
      if (/^(?:zoom-in-0|zoom-in-\[0\]|scale-0|scale-\[0\])$/.test(base)) {
        const isDot = /\bsize-(?:1|1\.5|2|\[(?:[1-8])px\])\b/.test(literal);
        if (!isDot) add("scale-from-zero", token);
      }

      // stagger-cap: literal delays
      const delay = base.match(/^(?:delay-(\d+)|\[animation-delay:(\d+)ms\]|delay-\[(\d+)ms\])$/);
      const delayMs = Number(delay?.[1] ?? delay?.[2] ?? delay?.[3]);
      if (delay && delayMs > 200) add("stagger-cap", token);

      // font-weight
      if (/^font-(?:bold|extrabold|black)$/.test(base)) add("font-weight", token);
      const weight = base.match(/^font-\[(\d+)\]$/);
      if (weight?.[1] && !["400", "500", "600"].includes(weight[1])) add("font-weight", token);

      // shadow
      if (/^shadow-(?:md|lg|xl|2xl)$/.test(base) && !FLOATING_PATTERN.test(literal))
        add("shadow", token);

      // subtle-size
      // Prefixed uses (placeholder:, disabled:, marker:, hover:) style something else.
      if (base === "text-subtle-foreground" && !prefix) {
        const large = tokens.find(
          ({ base: other, prefix: otherPrefix }) => !otherPrefix && LARGE_TEXT.test(other),
        );
        if (large) add("subtle-size", `${token} with ${large.token}`);
      }
    }

    // radius: a card surface (bg-card plus a border) must use the card radius.
    const isCard =
      tokens.some(({ base, prefix }) => !prefix && base === "bg-card") &&
      tokens.some(({ base, prefix }) => !prefix && /^border$/.test(base));
    if (isCard) {
      const radius = tokens.find(({ base, prefix }) => !prefix && base.startsWith("rounded"));
      if (radius && !/^rounded-(?:\[14px\]|\[12px\]|xl|2xl|\[inherit\]|none)$/.test(radius.base)) {
        add("radius", `card with ${radius.token}`);
      }
    }
  }

  // press-scale: a file that renders buttons needs press feedback somewhere.
  if (/<button\b/.test(code) && !/active:scale-/.test(code))
    add("press-scale", "renders <button> without active:scale");

  // exit-missing: floating layers (menus, popovers, toasts, drawers) that pop in must
  // also animate out. In-flow state swaps (thinking, approval-card) don't unmount.
  const popsInFloating = stringLiterals(source).some(
    (literal) =>
      /\banimate-in\b/.test(literal) &&
      FLOATING_PATTERN.test(literal.replace(/\banimate-in\b/g, "")),
  );
  if (
    popsInFloating &&
    !/\banimate-out\b|data-\[state=closed\]:|data-closed:|data-\[closed\]:|data-\[ending-style\]:|data-ending-style:/.test(
      code,
    )
  ) {
    add("exit-missing", "floating layer animates in without an animate-out or closed-state exit");
  }

  // stagger-cap: computed per-item steps such as `${index * 60}ms`.
  for (const line of code.split("\n")) {
    if (!/delay/i.test(line)) continue;
    for (const match of line.matchAll(
      /\b[A-Za-z_]\w*\s*\*\s*(\d+)\b|\b(\d+)\s*\*\s*[A-Za-z_]\w*\b/g,
    )) {
      const step = Number(match[1] ?? match[2]);
      if (step > 40 && step < 1000) add("stagger-cap", `step of ${step}ms`);
    }
  }

  // no-literal-color
  for (const match of code.matchAll(
    /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
  )) {
    add("no-literal-color", match[0].toLowerCase());
  }
  for (const match of code.matchAll(/\b(?:rgba?|hsla?|oklch|oklab)\([^)]*\)/g)) {
    const value = match[0].replace(/[\s_]+/g, " ");
    if (value !== "oklch(0.99 0 0)") add("no-literal-color", value);
  }
  for (const match of code.matchAll(/var\(--uai-[\w-]+\)/g)) add("no-literal-color", match[0]);

  return [...findings.values()];
}

/** Findings for one preview file (`<id>-preview.tsx`). */
export function lintPreview(file: string, source: string): PremiumFinding[] {
  const findings = new Map<string, PremiumFinding>();
  for (const match of stripComments(source).matchAll(new RegExp(PLACEHOLDER_CONTENT, "g"))) {
    const detail = `${file}: ${match[0].trim()}`;
    findings.set(detail, { rule: "preview-content", detail });
  }
  return [...findings.values()];
}
