"use client";

import { parsePatchFiles, registerCustomTheme } from "@pierre/diffs";
import { type FileDiffOptions, PatchDiff } from "@pierre/diffs/react";
import { cva } from "class-variance-authority";
import { Check, ChevronDown, TriangleAlert, Undo2, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTick } from "@/lib/uai-number-tick";
import { cn } from "@/lib/uai-utils";

export const DIFF_REVIEW_VARIANTS = ["unified", "compact"] as const;
export const DIFF_REVIEW_DECISIONS = ["pending", "accepted", "rejected"] as const;
export type DiffReviewVariant = (typeof DIFF_REVIEW_VARIANTS)[number];
export type DiffReviewDecision = (typeof DIFF_REVIEW_DECISIONS)[number];

export type DiffReviewLine = { kind: "context" | "add" | "del"; content: string };
export type DiffReviewHunkData = {
  /** Stable id; decisions are keyed by it. */
  id: string;
  /** Text after the `@@ … @@` range, usually the enclosing function. */
  header?: string;
  oldStart: number;
  newStart: number;
  lines: DiffReviewLine[];
};
export type DiffReviewFileData = { path: string; hunks: DiffReviewHunkData[] };
export type DiffReviewValue = Record<string, DiffReviewDecision>;

export type DiffReviewProps = Omit<ComponentProps<"section">, "defaultValue"> & {
  variant?: DiffReviewVariant;
  files: DiffReviewFileData[];
  value?: DiffReviewValue;
  defaultValue?: DiffReviewValue;
  onValueChange?: (value: DiffReviewValue) => void;
  /** Paths that changed after the agent's edit. Accepting their hunks stays off until cleared. */
  stale?: string[];
  /** Set once your `onApply` has landed the accepted changes. */
  applied?: boolean;
  onApply?: (value: DiffReviewValue) => void;
  /** Wrap long lines instead of scrolling them inside the file. */
  wrap?: boolean;
};

/**
 * Turns a unified patch (for example `git diff` output) into the `files` prop, using the
 * same parser that renders the lines. Hunk ids are `<path>#<index>`.
 */
export function diffReviewFilesFromPatch(patch: string): DiffReviewFileData[] {
  return parsePatchFiles(patch).flatMap((parsed) =>
    parsed.files.map((file) => ({
      path: file.name,
      hunks: file.hunks.map((hunk, index) => {
        const lines: DiffReviewLine[] = [];
        const clean = (line: string | undefined) => (line ?? "").replace(/\r?\n$/, "");
        for (const block of hunk.hunkContent) {
          if (block.type === "context") {
            for (let i = 0; i < block.lines; i++)
              lines.push({
                kind: "context",
                content: clean(file.additionLines[block.additionLineIndex + i]),
              });
          } else {
            for (let i = 0; i < block.deletions; i++)
              lines.push({
                kind: "del",
                content: clean(file.deletionLines[block.deletionLineIndex + i]),
              });
            for (let i = 0; i < block.additions; i++)
              lines.push({
                kind: "add",
                content: clean(file.additionLines[block.additionLineIndex + i]),
              });
          }
        }
        return {
          id: `${file.name}#${index}`,
          header: hunk.hunkContext,
          oldStart: hunk.deletionStart,
          newStart: hunk.additionStart,
          lines,
        };
      }),
    })),
  );
}

type HunkStats = {
  added: number;
  removed: number;
  oldCount: number;
  newCount: number;
  from: number;
  to: number;
};

function hunkStats(hunk: DiffReviewHunkData): HunkStats {
  let oldLine = hunk.oldStart;
  let newLine = hunk.newStart;
  let added = 0;
  let removed = 0;
  let from = Number.POSITIVE_INFINITY;
  let to = 0;
  for (const line of hunk.lines) {
    if (line.kind === "add") {
      added++;
      from = Math.min(from, newLine);
      to = Math.max(to, newLine);
      newLine++;
    } else if (line.kind === "del") {
      removed++;
      from = Math.min(from, oldLine);
      to = Math.max(to, oldLine);
      oldLine++;
    } else {
      oldLine++;
      newLine++;
    }
  }
  if (to === 0) {
    from = hunk.newStart;
    to = newLine - 1;
  }
  return {
    added,
    removed,
    oldCount: oldLine - hunk.oldStart,
    newCount: newLine - hunk.newStart,
    from,
    to,
  };
}

const range = (stats: HunkStats) =>
  stats.from === stats.to ? `${stats.from}` : `${stats.from}–${stats.to}`;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const splitPath = (path: string) => {
  const slash = path.lastIndexOf("/");
  return { dir: path.slice(0, slash + 1), name: path.slice(slash + 1) };
};

function patchFor(path: string, hunk: DiffReviewHunkData, stats: HunkStats) {
  const sign = { add: "+", del: "-", context: " " } as const;
  return [
    `--- a/${path}`,
    `+++ b/${path}`,
    `@@ -${hunk.oldStart},${stats.oldCount} +${hunk.newStart},${stats.newCount} @@`,
    ...hunk.lines.map((line) => `${sign[line.kind]}${line.content}`),
    "",
  ].join("\n");
}

type DiffReviewContextValue = {
  id: string;
  variant: DiffReviewVariant;
  files: DiffReviewFileData[];
  decisions: DiffReviewValue;
  stale: Set<string>;
  applied: boolean;
  wrap: boolean;
  decide: (hunkIds: string[], decision: DiffReviewDecision, announce?: boolean) => void;
  onApply?: (value: DiffReviewValue) => void;
  rootRef: React.RefObject<HTMLElement | null>;
};

const DiffReviewContext = createContext<DiffReviewContextValue | null>(null);

function useDiffReview(part: string) {
  const context = useContext(DiffReviewContext);
  if (!context) throw new Error(`${part} must be used within DiffReview`);
  return context;
}

type FileContextValue = {
  file: DiffReviewFileData;
  open: boolean;
  setOpen: (open: boolean) => void;
  regionId: string;
};

const DiffReviewFileContext = createContext<FileContextValue | null>(null);

function useDiffReviewFile(part: string) {
  const context = useContext(DiffReviewFileContext);
  if (!context) throw new Error(`${part} must be used within DiffReviewFile`);
  return context;
}

function decisionOf(decisions: DiffReviewValue, id: string): DiffReviewDecision {
  return decisions[id] ?? "pending";
}

function fileSummary(file: DiffReviewFileData, decisions: DiffReviewValue) {
  let added = 0;
  let removed = 0;
  let allAdded = 0;
  let allRemoved = 0;
  let pending = 0;
  let accepted = 0;
  let rejected = 0;
  for (const hunk of file.hunks) {
    const decision = decisionOf(decisions, hunk.id);
    const stats = hunkStats(hunk);
    allAdded += stats.added;
    allRemoved += stats.removed;
    if (decision !== "rejected") {
      added += stats.added;
      removed += stats.removed;
    }
    if (decision === "pending") pending++;
    else if (decision === "accepted") accepted++;
    else rejected++;
  }
  // A fully rejected file keeps its original counts next to its struck-through path.
  const kept = rejected === file.hunks.length;
  return {
    added: kept ? allAdded : added,
    removed: kept ? allRemoved : removed,
    pending,
    accepted,
    rejected,
    total: file.hunks.length,
  };
}

const diffReviewVariants = cva(
  "flex min-w-0 flex-col overflow-hidden rounded-[14px] border bg-card text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        unified: "w-full max-w-[560px]",
        compact: "w-full max-w-[400px]",
      },
    },
  },
);

export function DiffReview({
  variant = "unified",
  files,
  value,
  defaultValue,
  onValueChange,
  stale = [],
  applied = false,
  onApply,
  wrap = false,
  className,
  children,
  ...props
}: DiffReviewProps) {
  const id = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [inner, setInner] = useState<DiffReviewValue>(defaultValue ?? {});
  const decisions = value ?? inner;
  const decisionsRef = useRef(decisions);
  decisionsRef.current = decisions;
  const [message, setMessage] = useState("");
  const staleSet = useMemo(() => new Set(stale), [stale]);

  const decide = useCallback(
    (hunkIds: string[], decision: DiffReviewDecision, announce = true) => {
      const next = { ...decisionsRef.current };
      for (const hunkId of hunkIds) next[hunkId] = decision;
      decisionsRef.current = next;
      if (value === undefined) setInner(next);
      onValueChange?.(next);
      if (!announce) return;
      const all = files.flatMap((file) => file.hunks);
      const pending = all.filter((hunk) => decisionOf(next, hunk.id) === "pending").length;
      const tail = pending === 0 ? "All changes reviewed." : `${pending} pending.`;
      if (hunkIds.length === 1 && decision !== "pending") {
        const hunk = all.find((item) => item.id === hunkIds[0]);
        const lines = hunk ? range(hunkStats(hunk)) : "";
        setMessage(`Change at lines ${lines} ${decision}. ${tail}`);
      } else {
        setMessage(tail);
      }
    },
    [files, onValueChange, value],
  );

  return (
    <DiffReviewContext.Provider
      value={{
        id,
        variant,
        files,
        decisions,
        stale: staleSet,
        applied,
        wrap,
        decide,
        onApply,
        rootRef,
      }}
    >
      <section
        ref={rootRef}
        aria-label="Proposed changes"
        data-slot="diff-review"
        data-variant={variant}
        className={cn(diffReviewVariants({ variant }), className)}
        {...props}
      >
        {children}
        <span role="status" aria-live="polite" className="sr-only">
          {message}
        </span>
      </section>
    </DiffReviewContext.Provider>
  );
}

export type DiffReviewFileProps = ComponentProps<"section"> & {
  path: string;
  defaultOpen?: boolean;
};

/** One file. Collapses from its header; its hunks stay mounted while closed. */
export function DiffReviewFile({
  path,
  defaultOpen = true,
  className,
  children,
  ...props
}: DiffReviewFileProps) {
  const context = useDiffReview("DiffReviewFile");
  const regionId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const file = context.files.find((item) => item.path === path);
  if (!file) return null;
  return (
    <DiffReviewFileContext.Provider value={{ file, open, setOpen, regionId }}>
      <section
        aria-label={path}
        data-slot="diff-review-file"
        data-state={open ? "open" : "closed"}
        className={cn("grid min-w-0 border-b last:border-b-0", className)}
        {...props}
      >
        {children}
      </section>
    </DiffReviewFileContext.Provider>
  );
}

function Path({ path, className }: { path: string; className?: string }) {
  const { dir, name } = splitPath(path);
  return (
    <span className={cn("min-w-0 truncate font-mono text-xs/4 font-medium", className)}>
      <span className="font-normal text-subtle-foreground">{dir}</span>
      {name}
    </span>
  );
}

function Counters({ added, removed }: { added: number; removed: number }) {
  return (
    <span className="inline-flex flex-none gap-1.5 font-mono text-[11.5px]/4 font-medium tabular-nums">
      <span className="text-success-ink">
        <span className="sr-only">added </span>
        <span aria-hidden="true">+</span>
        <NumberTick value={String(added)} />
      </span>
      <span className="text-destructive-ink">
        <span className="sr-only">, removed </span>
        <span aria-hidden="true">−</span>
        <NumberTick value={String(removed)} />
      </span>
    </span>
  );
}

const chipCheck =
  "size-3 animate-in fade-in-0 zoom-in-50 duration-200 ease-out-quint motion-reduce:animate-none";

function FileChip({ file }: { file: DiffReviewFileData }) {
  const context = useDiffReview("DiffReviewFileHeader");
  const summary = fileSummary(file, context.decisions);
  if (summary.pending > 0) {
    return (
      <Badge variant="secondary" className="h-5 flex-none px-1.5 text-[11px] font-medium">
        {summary.pending === 1 ? "1 change" : `${summary.pending} changes`}
      </Badge>
    );
  }
  return (
    <Badge
      key={context.applied ? "applied" : "reviewed"}
      variant="secondary"
      className="h-5 flex-none gap-1 bg-success/14 px-1.5 text-[11px] font-medium text-success-ink animate-in fade-in-0 zoom-in-96 duration-180 ease-out-quint motion-reduce:animate-none"
    >
      <Check aria-hidden="true" strokeWidth={2} className={chipCheck} />
      {context.applied ? "Applied" : "Reviewed"}
    </Badge>
  );
}

/** Chevron toggle, path, live counters and the file's status chip. */
export function DiffReviewFileHeader({ className, ...props }: ComponentProps<"div">) {
  const context = useDiffReview("DiffReviewFileHeader");
  const fileContext = useDiffReviewFile("DiffReviewFileHeader");
  const summary = fileSummary(fileContext.file, context.decisions);
  return (
    <div
      data-slot="diff-review-file-header"
      className={cn("flex min-w-0 items-center gap-2 py-2 pr-2 pl-2.5", className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={fileContext.open}
        aria-controls={fileContext.regionId}
        onClick={() => fileContext.setOpen(!fileContext.open)}
        className="-my-1 -ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 pl-1 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97] motion-reduce:active:scale-100 [transition:scale_150ms_var(--ease-out-quint)]"
      >
        <span className="grid size-6 flex-none place-items-center rounded-md text-subtle-foreground">
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn(
              "size-3.5 transition-[rotate] duration-180 ease-out-quint motion-reduce:transition-none",
              !fileContext.open && "-rotate-90",
            )}
          />
        </span>
        <Path path={fileContext.file.path} className="flex-1" />
      </button>
      <Counters added={summary.added} removed={summary.removed} />
      <FileChip file={fileContext.file} />
    </div>
  );
}

/** Warning row for a file listed in `stale`. Renders nothing for fresh files. */
export function DiffReviewStale({
  path,
  className,
  ...props
}: ComponentProps<"div"> & { path?: string }) {
  const context = useDiffReview("DiffReviewStale");
  const fileContext = useContext(DiffReviewFileContext);
  const target = path ?? fileContext?.file.path;
  if (!target || !context.stale.has(target)) return null;
  return (
    <div
      data-slot="diff-review-stale"
      className={cn(
        "m-1 mt-0 flex items-start gap-2 rounded-[10px] bg-warning/10 p-2.5 text-xs/4 text-foreground",
        className,
      )}
      {...props}
    >
      <TriangleAlert
        aria-hidden="true"
        strokeWidth={1.75}
        className="size-3.5 flex-none text-warning-ink"
      />
      <span>
        {splitPath(target).name} changed after this edit. Review it again before accepting.
      </span>
    </div>
  );
}

/** The file's hunks, each one either open for review or collapsed to its resolved row. */
export function DiffReviewHunks({ className, ...props }: ComponentProps<"div">) {
  const fileContext = useDiffReviewFile("DiffReviewHunks");
  return (
    <div
      id={fileContext.regionId}
      data-slot="diff-review-hunks"
      inert={!fileContext.open}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out-quint motion-reduce:transition-none",
        fileContext.open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        {fileContext.file.hunks.map((hunk) => (
          <DiffReviewHunk key={hunk.id} hunk={hunk} />
        ))}
      </div>
    </div>
  );
}

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const collapse =
  "grid transition-[grid-template-rows] duration-300 ease-out-quint motion-reduce:transition-none";

function isTyping(target: EventTarget) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

function moveFocus(root: HTMLElement | null, from: HTMLElement, step: 1 | -1) {
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>("[data-slot=diff-review-item]")].filter(
    (item) => !item.closest("[inert]"),
  );
  const index = items.findIndex((item) => item.contains(from));
  const target = items[index + step];
  if (!target) return;
  const decision = target.dataset.decision;
  target
    .querySelector<HTMLElement>(
      decision === "pending" ? "[data-action=accept]:not(:disabled)" : "[data-action=undo]",
    )
    ?.focus();
  if (decision === "pending" && target.contains(document.activeElement) === false)
    target.querySelector<HTMLElement>("[data-action=reject]")?.focus();
}

/**
 * A token-driven Shiki theme, so highlighting follows the shadcn palette in both schemes:
 * keywords in primary ink, strings in success ink, comments muted, everything else muted
 * on context lines and full foreground on changed lines (forced in `unsafeCSS` below).
 */
const THEME = "uai-diff";
registerCustomTheme(THEME, async () => ({
  name: THEME,
  type: "dark",
  colors: { "editor.foreground": "var(--muted-foreground)", "editor.background": "var(--card)" },
  tokenColors: [
    { settings: { foreground: "var(--muted-foreground)" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--subtle-foreground)" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "constant.language"],
      settings: { foreground: "var(--primary-ink)" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "var(--success-ink)" },
    },
  ],
}));

const lineOptions = (wrap: boolean): FileDiffOptions<undefined, undefined> => ({
  theme: THEME,
  diffStyle: "unified",
  diffIndicators: "classic",
  disableFileHeader: true,
  hunkSeparators: "simple",
  lineDiffType: "word-alt",
  overflow: wrap ? "wrap" : "scroll",
  unsafeCSS:
    "[data-separator],[data-separator-wrapper]{display:none}[data-line-type^='change'] span{color:var(--foreground)!important}[data-line-type='change-addition']{--mix-light:89%;--mix-dark:92%}[data-line-type='change-deletion']{--mix-light:89%;--mix-dark:91%}",
});

const OPTIONS = { scroll: lineOptions(false), wrap: lineOptions(true) };

/**
 * The library draws the lines in its own shadow root; these custom properties pierce it so
 * the tints, signs and numbers come from the theme tokens in both color schemes.
 */
const linesClass = cn(
  "block [color-scheme:light] dark:[color-scheme:dark]",
  "[--diffs-font-family:var(--font-mono)] [--diffs-font-size:12px] [--diffs-line-height:20px] [--diffs-gap-block:0px]",
  "[--diffs-light-bg:var(--card)] [--diffs-dark-bg:var(--card)] [--diffs-fg-number-override:var(--subtle-foreground)]",
  "[--diffs-addition-color-override:var(--success-ink)] [--diffs-fg-number-addition-override:var(--success-ink)]",
  "[--diffs-bg-addition-override:var(--success)] [--diffs-bg-addition-number-override:var(--success)]",
  "[--diffs-deletion-color-override:var(--destructive-ink)] [--diffs-fg-number-deletion-override:var(--destructive-ink)]",
  "[--diffs-bg-deletion-override:var(--destructive)] [--diffs-bg-deletion-number-override:var(--destructive)]",
  "[--diffs-bg-addition-emphasis-override:color-mix(in_oklab,var(--success)_28%,transparent)] dark:[--diffs-bg-addition-emphasis-override:color-mix(in_oklab,var(--success)_20%,transparent)]",
  "[--diffs-bg-deletion-emphasis-override:color-mix(in_oklab,var(--destructive)_28%,transparent)]",
);

export type DiffReviewHunkProps = ComponentProps<"div"> & { hunk: DiffReviewHunkData };

/** One hunk: header with accept and reject, the lines, and the resolved row it collapses into. */
export function DiffReviewHunk({ hunk, className, ...props }: DiffReviewHunkProps) {
  const context = useDiffReview("DiffReviewHunk");
  const fileContext = useDiffReviewFile("DiffReviewHunk");
  const decision = decisionOf(context.decisions, hunk.id);
  const stats = useMemo(() => hunkStats(hunk), [hunk]);
  const patch = useMemo(
    () => patchFor(fileContext.file.path, hunk, stats),
    [fileContext.file.path, hunk, stats],
  );
  const lines = range(stats);
  const stale = context.stale.has(fileContext.file.path);
  const [phase, setPhase] = useState<"idle" | "wash" | "dim">("idle");
  const focusAfter = useRef<"undo" | "accept" | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const target = focusAfter.current;
    // Undo appears once the hunk is decided; Accept once it is pending again.
    if (!target || (target === "undo") === (decision === "pending")) return;
    focusAfter.current = null;
    itemRef.current?.querySelector<HTMLElement>(`[data-action=${target}]`)?.focus();
  }, [decision]);

  const resolve = (next: "accepted" | "rejected") => {
    if (decision !== "pending" || phase !== "idle") return;
    if (next === "accepted" && stale) return;
    const commit = () => {
      setPhase("idle");
      focusAfter.current = "undo";
      context.decide([hunk.id], next);
    };
    if (reduceMotion()) return commit();
    setPhase(next === "accepted" ? "wash" : "dim");
    timer.current = window.setTimeout(commit, next === "accepted" ? 160 : 120);
  };
  const undo = () => {
    focusAfter.current = "accept";
    context.decide([hunk.id], "pending", false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTyping(event.target)) return;
    if (event.key === "]" || event.key === "[") {
      event.preventDefault();
      moveFocus(context.rootRef.current, event.target as HTMLElement, event.key === "]" ? 1 : -1);
    } else if (decision === "pending" && (event.key === "y" || event.key === "n")) {
      event.preventDefault();
      resolve(event.key === "y" ? "accepted" : "rejected");
    }
  };

  const pending = decision === "pending";
  const ghost =
    "size-6 text-muted-foreground hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100";

  return (
    <div
      ref={itemRef}
      data-slot="diff-review-item"
      data-decision={decision}
      className={cn("grid border-t", className)}
      {...props}
    >
      <div className={cn(collapse, pending ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <section
          aria-label={`Lines ${lines}: ${stats.added} added, ${stats.removed} removed`}
          aria-hidden={pending ? undefined : true}
          inert={!pending}
          onKeyDown={onKeyDown}
          data-slot="diff-review-hunk"
          data-phase={phase}
          className="group/hunk min-h-0 overflow-hidden"
        >
          <div
            className={cn(
              "flex h-7 items-center gap-2 bg-muted/60 pr-2 pl-3 font-mono text-[11.5px] text-subtle-foreground transition-colors duration-160 motion-reduce:transition-none",
              phase === "wash" && "motion-safe:bg-success/14",
            )}
          >
            <span aria-hidden="true" className="min-w-0 truncate">
              @@ −{hunk.oldStart},{stats.oldCount} +{hunk.newStart},{stats.newCount} @@
              {hunk.header ? ` ${hunk.header}` : ""}
            </span>
            <span className="ml-auto flex flex-none gap-0.5 opacity-0 transition-opacity duration-120 group-hover/hunk:opacity-100 group-focus-within/hunk:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-action="accept"
                aria-keyshortcuts="y"
                aria-label={`Accept change at lines ${lines}`}
                title={stale ? "Review the file again before accepting" : "Accept change (y)"}
                disabled={stale}
                onClick={() => resolve("accepted")}
                className={ghost}
              >
                <Check aria-hidden="true" strokeWidth={2} className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-action="reject"
                aria-keyshortcuts="n"
                aria-label={`Reject change at lines ${lines}`}
                title="Reject change (n)"
                onClick={() => resolve("rejected")}
                className={ghost}
              >
                <X aria-hidden="true" strokeWidth={2} className="size-3.5" />
              </Button>
            </span>
          </div>
          <ul className="sr-only">
            {hunk.lines.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional within a hunk.
              <li key={index}>
                {line.kind === "add" ? "added, " : line.kind === "del" ? "removed, " : ""}
                {line.content}
              </li>
            ))}
          </ul>
          <div
            aria-hidden="true"
            className={cn(
              "transition-opacity duration-120 motion-reduce:transition-none",
              phase === "dim" && "opacity-50",
            )}
          >
            <PatchDiff
              patch={patch}
              options={context.wrap ? OPTIONS.wrap : OPTIONS.scroll}
              className={cn(
                linesClass,
                phase === "wash" &&
                  "motion-safe:[--diffs-light-bg:color-mix(in_oklab,var(--success)_14%,var(--card))] motion-safe:[--diffs-dark-bg:color-mix(in_oklab,var(--success)_14%,var(--card))]",
              )}
            />
          </div>
        </section>
      </div>
      <div className={cn(collapse, pending ? "grid-rows-[0fr]" : "grid-rows-[1fr]")}>
        <div className="min-h-0 overflow-hidden">
          {pending ? null : (
            <DiffReviewResolved
              decision={decision}
              lines={lines}
              stats={stats}
              onUndo={undo}
              onKeyDown={onKeyDown}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type DiffReviewResolvedProps = ComponentProps<"div"> & {
  decision: "accepted" | "rejected";
  lines: string;
  stats: { added: number; removed: number };
  onUndo: () => void;
};

/** A decided hunk: tile, what happened, its counts, and Undo. */
export function DiffReviewResolved({
  decision,
  lines,
  stats,
  onUndo,
  className,
  ...props
}: DiffReviewResolvedProps) {
  useDiffReview("DiffReviewResolved");
  const accepted = decision === "accepted";
  return (
    <div
      data-slot="diff-review-resolved"
      data-decision={decision}
      className={cn(
        "flex h-8 items-center gap-2 pr-2 pl-3 text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "grid size-4.5 flex-none place-items-center rounded-full",
          accepted ? "bg-success/14 text-success-ink" : "bg-muted text-muted-foreground",
        )}
      >
        {accepted ? (
          <Check aria-hidden="true" strokeWidth={2} className="size-3" />
        ) : (
          <X aria-hidden="true" strokeWidth={2} className="size-3" />
        )}
      </span>
      <span className="min-w-0 truncate">
        {accepted ? "Accepted" : "Rejected"} lines {lines}
        <span className="text-[11.5px] text-subtle-foreground">
          {" · "}
          {accepted ? `+${stats.added} −${stats.removed}` : "kept the original"}
        </span>
      </span>
      <Button
        type="button"
        variant="secondary"
        size="xs"
        data-action="undo"
        aria-label={`Undo, ${accepted ? "accepted" : "rejected"} lines ${lines}`}
        onClick={onUndo}
        className="ml-auto h-6 rounded-full active:scale-[0.97] motion-reduce:active:scale-100"
      >
        <Undo2 aria-hidden="true" strokeWidth={1.75} />
        Undo
      </Button>
    </div>
  );
}

function blocks(added: number, removed: number) {
  const total = added + removed;
  const filled = Math.min(4, total);
  const green = total === 0 ? 0 : Math.round((added / total) * filled);
  return Array.from({ length: 5 }, (_, index) =>
    index < green ? "add" : index < filled ? "del" : "rest",
  );
}

/** Compact multi-file summary; each row expands its file inline. */
export function DiffReviewFileList({ className, ...props }: ComponentProps<"div">) {
  const context = useDiffReview("DiffReviewFileList");
  const totals = context.files.reduce(
    (sum, file) => {
      const summary = fileSummary(file, context.decisions);
      return { added: sum.added + summary.added, removed: sum.removed + summary.removed };
    },
    { added: 0, removed: 0 },
  );
  return (
    <div data-slot="diff-review-file-list" className={cn("grid p-1", className)} {...props}>
      <div className="flex items-center gap-2 pt-1 pr-1 pb-1.5 pl-1.5">
        <h3 className="m-0 flex-1 text-[13px] font-medium">
          {plural(context.files.length, "file")} changed
        </h3>
        <Counters added={totals.added} removed={totals.removed} />
      </div>
      <ul className="m-0 grid list-none gap-0 p-0">
        {context.files.map((file) => (
          <FileRow key={file.path} file={file} />
        ))}
      </ul>
    </div>
  );
}

const rowStagger =
  "animate-in fade-in-0 slide-in-from-bottom-1 duration-240 ease-out-quint fill-mode-backwards motion-reduce:animate-none nth-2:[animation-delay:40ms] nth-3:[animation-delay:80ms] nth-4:[animation-delay:120ms] nth-5:[animation-delay:160ms] nth-[n+6]:[animation-delay:200ms]";

function FileRow({ file }: { file: DiffReviewFileData }) {
  const context = useDiffReview("DiffReviewFileList");
  const regionId = useId();
  const [open, setOpen] = useState(false);
  const summary = fileSummary(file, context.decisions);
  const stale = context.stale.has(file.path);
  const allRejected = summary.pending === 0 && summary.accepted === 0;
  const status = stale
    ? "Changed since the edit"
    : summary.pending > 0
      ? `${summary.pending} pending`
      : allRejected
        ? "Rejected"
        : context.applied
          ? "Applied"
          : "Reviewed";
  return (
    <li className={cn("grid", rowStagger)}>
      <DiffReviewFileContext.Provider value={{ file, open, setOpen, regionId }}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen(!open)}
          className="grid grid-cols-[16px_minmax(0,1fr)_auto_auto] items-center gap-2.5 rounded-[10px] py-2 pr-2 pl-2.5 text-left text-[12.5px] outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <span
            className={cn(
              "grid size-4 place-items-center rounded-full",
              stale
                ? "text-warning-ink"
                : summary.pending > 0
                  ? "shadow-[inset_0_0_0_1.5px_var(--border-strong)]"
                  : allRejected
                    ? "bg-muted text-muted-foreground"
                    : "bg-success/14 text-success-ink",
            )}
          >
            {stale ? (
              <TriangleAlert aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
            ) : summary.pending > 0 ? null : allRejected ? (
              <X aria-hidden="true" strokeWidth={2} className="size-3" />
            ) : (
              <Check aria-hidden="true" strokeWidth={2} className={chipCheck} />
            )}
            <span className="sr-only">{status}: </span>
          </span>
          <Path
            path={file.path}
            className={cn(
              "font-normal",
              allRejected && !stale && "text-subtle-foreground line-through",
            )}
          />
          <Counters added={summary.added} removed={summary.removed} />
          <span aria-hidden="true" className="flex gap-0.5">
            {blocks(summary.added, summary.removed).map((kind, index) => (
              <i
                // biome-ignore lint/suspicious/noArrayIndexKey: the five blocks are positional.
                key={index}
                className={cn(
                  "block size-[7px] rounded-[2px]",
                  kind === "add" ? "bg-success" : kind === "del" ? "bg-destructive" : "bg-muted",
                )}
              />
            ))}
          </span>
        </button>
        <DiffReviewStale path={file.path} className="mt-1" />
        <div
          id={regionId}
          inert={!open}
          className={cn(collapse, open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mx-1 mb-1 overflow-hidden rounded-[10px] border [&>[data-slot=diff-review-item]:first-child]:border-t-0">
              {file.hunks.map((hunk) => (
                <DiffReviewHunk key={hunk.id} hunk={hunk} />
              ))}
            </div>
          </div>
        </div>
      </DiffReviewFileContext.Provider>
    </li>
  );
}

/** Live counts, Reject all, and Accept all, Accept n pending, or Apply n changes. */
export function DiffReviewFooter({ className, ...props }: ComponentProps<"div">) {
  const context = useDiffReview("DiffReviewFooter");
  const all = context.files.flatMap((file) =>
    file.hunks.map((hunk) => ({ hunk, stale: context.stale.has(file.path) })),
  );
  const total = all.length;
  const pendingHunks = all.filter(
    ({ hunk }) => decisionOf(context.decisions, hunk.id) === "pending",
  );
  const acceptable = pendingHunks.filter(({ stale }) => !stale).map(({ hunk }) => hunk.id);
  const pending = pendingHunks.length;
  const accepted = all.filter(
    ({ hunk }) => decisionOf(context.decisions, hunk.id) === "accepted",
  ).length;
  const rejected = total - pending - accepted;
  const hint =
    pending === total
      ? `Proposed by the agent · ${pending} of ${total} pending`
      : pending > 0
        ? `${accepted} accepted · ${rejected} rejected · ${pending} pending`
        : accepted > 0
          ? "All changes reviewed"
          : "Nothing to apply";
  const primary =
    pending > 0
      ? acceptable.length === total
        ? "Accept all"
        : `Accept ${acceptable.length} pending`
      : accepted > 0 && !context.applied
        ? `Apply ${accepted} ${accepted === 1 ? "change" : "changes"}`
        : null;
  const pill = "h-7 rounded-full px-3 text-xs active:scale-[0.97] motion-reduce:active:scale-100";
  return (
    <div
      data-slot="diff-review-footer"
      className={cn(
        "flex min-h-11 items-center justify-between gap-2 border-t py-2 pr-2 pl-3",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 text-[11.5px]/4 text-subtle-foreground">{hint}</span>
      <span className="flex flex-none gap-2">
        {pending > 0 && context.variant !== "compact" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={pill}
            onClick={() =>
              context.decide(
                pendingHunks.map(({ hunk }) => hunk.id),
                "rejected",
              )
            }
          >
            Reject all
          </Button>
        ) : null}
        {primary ? (
          <Button
            type="button"
            size="sm"
            className={pill}
            disabled={pending > 0 && acceptable.length === 0}
            onClick={() =>
              pending > 0
                ? context.decide(acceptable, "accepted")
                : context.onApply?.(context.decisions)
            }
          >
            {primary}
          </Button>
        ) : null}
      </span>
    </div>
  );
}
