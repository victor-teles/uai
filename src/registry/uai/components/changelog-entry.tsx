import { cva } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { type ComponentProps, createContext, useContext, useId } from "react";
import { cn } from "@/lib/uai-utils";

export const CHANGELOG_ENTRY_VARIANTS = ["timeline", "card", "compact"] as const;
export type ChangelogEntryVariant = (typeof CHANGELOG_ENTRY_VARIANTS)[number];
export type ChangelogEntryCategoryTone = "added" | "improved" | "fixed" | "removed" | "security";
export type ChangelogEntryProps = ComponentProps<"article"> & { variant?: ChangelogEntryVariant };
type EntryContext = { id: string; variant: ChangelogEntryVariant };
const Context = createContext<EntryContext | null>(null);
function useEntry(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ChangelogEntry`);
  return context;
}
const toneClasses: Record<ChangelogEntryCategoryTone, string> = {
  added: "bg-success/14 text-success",
  improved:
    "bg-[color-mix(in_oklab,color-mix(in_oklab,var(--primary)_62%,var(--foreground))_14%,transparent)] text-[color-mix(in_oklab,var(--primary)_62%,var(--foreground))]",
  fixed: "bg-warning/14 text-warning",
  removed: "bg-muted-foreground/14 text-muted-foreground",
  security: "bg-destructive/14 text-destructive",
};

const changelogEntryVariants = cva(
  "flex min-w-0 flex-wrap text-[13px]/[18px] text-foreground [&_li]:marker:text-subtle-foreground",
  {
    variants: {
      variant: {
        timeline: "flex-row gap-x-6 gap-y-2 rounded-[14px] border-0 bg-transparent p-0",
        card: "flex-col gap-3 rounded-[14px] border bg-card p-[18px] text-card-foreground",
        compact: "flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground",
      },
    },
  },
);

export function ChangelogEntry({
  variant = "timeline",
  className,
  children,
  ...props
}: ChangelogEntryProps) {
  const id = useId();
  return (
    <Context.Provider value={{ id, variant }}>
      <article
        aria-labelledby={`${id}-title`}
        data-slot="changelog-entry"
        className={cn(changelogEntryVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </article>
    </Context.Provider>
  );
}

export function ChangelogEntryHeader({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useEntry("ChangelogEntryHeader");
  return (
    <div
      data-slot="changelog-entry-header"
      className={cn(
        "flex min-w-0 flex-wrap",
        variant === "timeline"
          ? "flex-[0_0_128px] flex-col items-start gap-1"
          : "flex-row items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

export function ChangelogEntryVersion({ className, ...props }: ComponentProps<"span">) {
  const { variant } = useEntry("ChangelogEntryVersion");
  return (
    <span
      data-slot="changelog-entry-version"
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-1.75 font-mono text-[11.5px] font-medium text-foreground tabular-nums",
        variant === "compact" ? "h-5" : "h-5.5",
        className,
      )}
      {...props}
    />
  );
}

export function ChangelogEntryDate({
  className,
  ...props
}: ComponentProps<"time"> & { dateTime: string }) {
  useEntry("ChangelogEntryDate");
  return (
    <time
      data-slot="changelog-entry-date"
      className={cn("text-[12px] text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export function ChangelogEntryContent({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useEntry("ChangelogEntryContent");
  return (
    <div
      data-slot="changelog-entry-content"
      className={cn(
        "grid min-w-0",
        variant === "compact" ? "gap-2" : "gap-3",
        variant === "timeline" ? "flex-[1_1_320px] border-s ps-6" : "border-s-0 ps-0",
        className,
      )}
      {...props}
    />
  );
}

export function ChangelogEntryTitle({
  level = 3,
  className,
  ...props
}: ComponentProps<"h3"> & { level?: 2 | 3 | 4 }) {
  const { id, variant } = useEntry("ChangelogEntryTitle");
  const Heading = `h${level}` as "h3";
  return (
    <Heading
      data-slot="changelog-entry-title"
      className={cn(
        "m-0 tracking-[-0.01em] text-balance",
        variant === "compact" ? "text-sm/5 font-medium" : "text-[15px]/[22px] font-semibold",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ChangelogEntryCategories({
  "aria-label": label = "Categories",
  className,
  ...props
}: ComponentProps<"ul">) {
  useEntry("ChangelogEntryCategories");
  return (
    <ul
      aria-label={label}
      data-slot="changelog-entry-categories"
      className={cn("m-0 flex list-none flex-wrap gap-1.5 p-0", className)}
      {...props}
    />
  );
}

export function ChangelogEntryCategory({
  tone = "improved",
  className,
  children,
  ...props
}: ComponentProps<"li"> & { tone?: ChangelogEntryCategoryTone }) {
  useEntry("ChangelogEntryCategory");
  return (
    <li
      data-slot="changelog-entry-category"
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[11.5px]/4 font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
      data-tone={tone}
    >
      {children}
    </li>
  );
}

export function ChangelogEntryBody({ className, ...props }: ComponentProps<"div">) {
  useEntry("ChangelogEntryBody");
  return (
    <div
      data-slot="changelog-entry-body"
      className={cn("leading-[19px] text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ChangelogEntryChanges({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useEntry("ChangelogEntryChanges");
  return (
    <ul
      data-slot="changelog-entry-changes"
      className={cn(
        "m-0 grid list-disc ps-4.5",
        variant === "compact" ? "gap-1" : "gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

export function ChangelogEntryChange({
  href,
  className,
  children,
  ...props
}: ComponentProps<"li"> & { href?: string }) {
  useEntry("ChangelogEntryChange");
  return (
    <li
      data-slot="changelog-entry-change"
      className={cn("ps-0.5 text-pretty", className)}
      {...props}
    >
      {href ? (
        <a
          href={href}
          className="group/link text-foreground underline decoration-border-strong underline-offset-3 transition-[text-decoration-color] duration-120 ease-[ease-out] hover:decoration-current focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          {children}
          <ArrowUpRight
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            className="ms-0.5 inline-block align-[-1px] text-subtle-foreground [transition:translate_140ms_var(--ease-out-quint),color_120ms_ease-out] group-hover/link:translate-x-px group-hover/link:-translate-y-px group-hover/link:text-foreground motion-reduce:transition-none"
          />
        </a>
      ) : (
        children
      )}
    </li>
  );
}
