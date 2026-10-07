"use client";

import { cva } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AuthorCard, type AuthorCardProps } from "@/components/ui/uai/author-card";
import {
  ShareMenu,
  type ShareMenuProps,
  type ShareMenuVariant,
} from "@/components/ui/uai/share-menu";
import { cn } from "@/lib/uai-utils";

export const ARTICLE_PAGE_VARIANTS = ["centered", "sidebar", "compact"] as const;
export type ArticlePageVariant = (typeof ARTICLE_PAGE_VARIANTS)[number];
export const ARTICLE_PAGE_TEXT_SIZES = ["small", "default", "large"] as const;
export type ArticlePageTextSize = (typeof ARTICLE_PAGE_TEXT_SIZES)[number];
export type ArticlePageProps = ComponentProps<"article"> & {
  variant?: ArticlePageVariant;
  /** Reading text size for ArticlePageContent. */
  textSize?: ArticlePageTextSize;
  defaultTextSize?: ArticlePageTextSize;
  onTextSizeChange?: (textSize: ArticlePageTextSize) => void;
};

type ArticleContext = {
  id: string;
  variant: ArticlePageVariant;
  textSize: ArticlePageTextSize;
  setTextSize: (textSize: ArticlePageTextSize) => void;
};
const Context = createContext<ArticleContext | null>(null);
function useArticle(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ArticlePage`);
  return context;
}
const RelatedContext = createContext<string | null>(null);

const contentType: Record<ArticlePageTextSize, string> = {
  small: "text-[14px]/[22px]",
  default: "text-[16px]/[26px]",
  large: "text-[18px]/[30px]",
};
const shareVariants: Record<ArticlePageVariant, ShareMenuVariant> = {
  centered: "outlined",
  sidebar: "outlined",
  compact: "compact",
};

const articlePageLayoutVariants = cva("grid min-w-0", {
  variants: {
    variant: {
      centered: "mx-auto max-w-[680px] gap-7",
      sidebar:
        "gap-7 @min-[760px]:grid-cols-[minmax(0,1fr)_240px] @min-[760px]:items-start @min-[760px]:gap-x-12",
      compact: "gap-4",
    },
  },
});

/** A long-form article with metadata, reading controls, content, sharing, and related reading. */
export function ArticlePage({
  variant = "centered",
  textSize,
  defaultTextSize = "default",
  onTextSizeChange,
  className,
  children,
  ...props
}: ArticlePageProps) {
  const id = useId();
  const [internal, setInternal] = useState<ArticlePageTextSize>(defaultTextSize);
  const current = textSize ?? internal;
  return (
    <Context.Provider
      value={{
        id,
        variant,
        textSize: current,
        setTextSize: (next) => {
          if (next === current) return;
          if (textSize === undefined) setInternal(next);
          onTextSizeChange?.(next);
        },
      }}
    >
      <article
        aria-labelledby={`${id}-title`}
        data-slot="article-page"
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
        data-variant={variant}
      >
        <div data-slot="article-page-layout" className={articlePageLayoutVariants({ variant })}>
          {children}
        </div>
      </article>
    </Context.Provider>
  );
}

export function ArticlePageHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useArticle("ArticlePageHeader");
  return (
    <header
      data-slot="article-page-header"
      className={cn(
        "grid min-w-0 border-b",
        variant === "compact" ? "gap-2.5 pb-3" : "gap-4 pb-5",
        variant === "sidebar" && "@min-[760px]:col-span-full",
        className,
      )}
      {...props}
    />
  );
}

/** A short label above the title, such as the section or topic. */
export function ArticlePageCategory({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="article-page-category"
      className={cn("m-0 text-xs/4 font-medium text-primary", className)}
      {...props}
    />
  );
}

export function ArticlePageTitle({ className, ...props }: ComponentProps<"h1">) {
  const { id, variant } = useArticle("ArticlePageTitle");
  return (
    <h1
      data-slot="article-page-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.02em] text-balance",
        variant === "compact"
          ? "text-[22px]/[1.15]"
          : "text-[length:clamp(26px,3cqi+12px,36px)]/[1.15]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function ArticlePageDescription({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useArticle("ArticlePageDescription");
  return (
    <p
      data-slot="article-page-description"
      className={cn(
        "m-0 max-w-[60ch] text-pretty text-muted-foreground",
        variant === "compact" ? "text-[13px]/[18px]" : "text-[15px]/[22px]",
        className,
      )}
      {...props}
    />
  );
}

/** Byline row: the author, dates, and reading time on the start side, reading controls on the end side. */
export function ArticlePageMeta({ className, ...props }: ComponentProps<"div">) {
  useArticle("ArticlePageMeta");
  return (
    <div
      data-slot="article-page-meta"
      className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

/** The byline, an inline Author Card. Compose Author Card parts inside it. */
export function ArticlePageAuthor({ className, ...props }: Omit<AuthorCardProps, "variant">) {
  useArticle("ArticlePageAuthor");
  return (
    <AuthorCard
      data-slot="article-page-author"
      className={cn("items-center gap-y-0.5", className)}
      {...props}
      variant="inline"
    />
  );
}

/** Muted publication details such as dates and reading time. */
export function ArticlePageDetails({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="article-page-details"
      className={cn(
        "m-0 flex flex-wrap gap-x-2 gap-y-0 text-[12px] text-subtle-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** Reading controls and sharing. */
export function ArticlePageToolbar({
  "aria-label": label = "Reading controls",
  className,
  ...props
}: ComponentProps<"div">) {
  useArticle("ArticlePageToolbar");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of controls, not a fieldset.
    <div
      role="group"
      aria-label={label}
      data-slot="article-page-toolbar"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export type ArticlePageTextSizeControlProps = Omit<ComponentProps<"div">, "defaultValue" | "dir">;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** A radio group that sets the reading size of ArticlePageContent. Arrow keys move the selection. */
export function ArticlePageTextSizeControl({
  "aria-label": label = "Text size",
  onKeyDown,
  className,
  children,
  ...props
}: ArticlePageTextSizeControlProps) {
  const { variant, textSize, setTextSize } = useArticle("ArticlePageTextSizeControl");
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; width: number; height: number }>();
  useIsomorphicLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const checked = list.querySelector<HTMLElement>("[role=radio][aria-checked=true]");
      if (!checked || checked.offsetWidth === 0) return setThumb(undefined);
      setThumb({
        x: checked.offsetLeft,
        y: checked.offsetTop,
        width: checked.offsetWidth,
        height: checked.offsetHeight,
      });
    };
    measure();
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [textSize]);
  return (
    <ToggleGroup
      type="single"
      rovingFocus={false}
      spacing={0.5}
      value={textSize}
      onValueChange={(next) => {
        if (next) setTextSize(next as ArticlePageTextSize);
      }}
      role="radiogroup"
      aria-label={label}
      data-slot="article-page-text-size-control"
      className={cn(
        "group/text-size relative isolate inline-flex items-center gap-0.5 rounded-full bg-card",
        variant === "compact" ? "p-px" : "p-0.5",
        className,
      )}
      {...props}
      ref={ref}
      data-ready={thumb ? "" : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
    >
      {/* One measured thumb slides between sizes; until it is measured the checked option paints itself. */}
      <span
        aria-hidden="true"
        data-slot="article-page-text-size-thumb"
        className="pointer-events-none absolute top-0 left-0 -z-1 rounded-full bg-accent opacity-0 transition-[translate,width] duration-240 ease-out-quint group-data-ready/text-size:opacity-100 motion-reduce:transition-none"
        style={{
          width: thumb?.width ?? 0,
          height: thumb?.height ?? 0,
          translate: thumb ? `${thumb.x}px ${thumb.y}px` : undefined,
        }}
      />
      {children}
    </ToggleGroup>
  );
}

export type ArticlePageTextSizeOptionProps = Omit<
  ComponentProps<typeof ToggleGroupItem>,
  "value"
> & {
  value: ArticlePageTextSize;
};

const optionTextSize: Record<ArticlePageTextSize, string> = {
  small: "text-[11px]/none",
  default: "text-[13px]/none",
  large: "text-[15px]/none",
};

export function ArticlePageTextSizeOption({
  value,
  className,
  ...props
}: ArticlePageTextSizeOptionProps) {
  const context = useArticle("ArticlePageTextSizeOption");
  const checked = context.textSize === value;
  const compact = context.variant === "compact";
  return (
    <ToggleGroupItem
      data-slot="article-page-text-size-option"
      className={cn(
        "grid cursor-pointer place-items-center rounded-full border-0 px-1.5 font-medium",
        "transition-[color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)]",
        "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid active:scale-94",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        compact ? "h-6 min-w-6" : "h-6 min-w-7",
        checked
          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground group-data-ready/text-size:bg-transparent group-data-ready/text-size:hover:bg-transparent"
          : "bg-transparent text-subtle-foreground hover:bg-transparent hover:text-foreground",
        optionTextSize[value],
        className,
      )}
      {...props}
      value={value}
      tabIndex={checked ? 0 : -1}
    />
  );
}

/** Share Menu sized for the article. Compose ShareMenuTrigger and ShareMenuContent inside it. */
export function ArticlePageShare(props: Omit<ShareMenuProps, "variant">) {
  const { variant } = useArticle("ArticlePageShare");
  return <ShareMenu data-slot="article-page-share" {...props} variant={shareVariants[variant]} />;
}

const articleContentProse = [
  "[&>*]:mx-0 [&>*]:mb-0 [&>:where(:first-child)]:mt-0 [&>*+*]:mt-[1em]",
  "[&_h2]:mt-[1.6em] [&_h2]:text-[1.25em]/[1.3] [&_h2]:font-medium [&_h2]:tracking-[-0.01em]",
  "[&_h3]:mt-[1.4em] [&_h3]:text-[1.08em]/[1.35] [&_h3]:font-medium",
  "[&_a]:text-inherit [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-3 [&_a]:transition-[text-decoration-color] [&_a]:duration-120 [&_a]:ease-[ease-out] [&_a:hover]:decoration-foreground motion-reduce:[&_a]:transition-none",
  "[&_blockquote]:border-s-2 [&_blockquote]:border-border-strong [&_blockquote]:py-0.5 [&_blockquote]:ps-4 [&_blockquote]:pe-0 [&_blockquote]:text-muted-foreground",
  "[&_ol]:list-decimal [&_ol]:ps-[1.25em] [&_ul]:list-disc [&_ul]:ps-[1.25em] [&_li+li]:mt-[0.35em] [&_li::marker]:text-subtle-foreground",
  "[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-px [&_code]:text-[0.88em]",
];

/** The article body. Type size follows the reading controls. */
export function ArticlePageContent({ className, ...props }: ComponentProps<"div">) {
  const { textSize, variant } = useArticle("ArticlePageContent");
  return (
    <div
      data-slot="article-page-content"
      className={cn(
        "min-w-0 text-pretty wrap-anywhere",
        variant !== "compact" && "max-w-[68ch]",
        contentType[textSize],
        articleContentProse,
        className,
      )}
      {...props}
      data-text-size={textSize}
    />
  );
}

/** Related reading, rendered as a labelled complementary region. */
export function ArticlePageRelated({ className, ...props }: ComponentProps<"aside">) {
  const { variant } = useArticle("ArticlePageRelated");
  const id = useId();
  const compact = variant === "compact";
  return (
    <RelatedContext.Provider value={id}>
      <aside
        aria-labelledby={id}
        data-slot="article-page-related"
        className={cn(
          "grid min-w-0 bg-card",
          compact ? "gap-2 rounded-xl p-2.5" : "gap-3 rounded-[14px] p-3",
          variant === "sidebar" && "@min-[760px]:sticky @min-[760px]:top-4",
          className,
        )}
        {...props}
      />
    </RelatedContext.Provider>
  );
}

export function ArticlePageRelatedTitle({ className, ...props }: ComponentProps<"h2">) {
  const id = useContext(RelatedContext);
  if (!id) throw new Error("ArticlePageRelatedTitle must be used within ArticlePageRelated");
  return (
    <h2
      data-slot="article-page-related-title"
      className={cn(
        "m-0 px-2 pt-0.5 text-[11.5px]/4 font-medium text-subtle-foreground",
        className,
      )}
      {...props}
      id={id}
    />
  );
}

export function ArticlePageRelatedList({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="article-page-related-list"
      className={cn("m-0 grid list-none gap-0.5 p-0", className)}
      {...props}
    />
  );
}

export function ArticlePageRelatedItem({ className, children, ...props }: ComponentProps<"a">) {
  const { variant } = useArticle("ArticlePageRelatedItem");
  return (
    <li className="grid min-w-0">
      <a
        data-slot="article-page-related-item"
        className={cn(
          "grid min-w-0 gap-0.5 rounded-lg font-medium text-foreground no-underline",
          "transition-[background-color] duration-120 ease-[ease-out] hover:bg-accent motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
          variant === "compact" ? "px-2 py-1.5" : "p-2",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    </li>
  );
}

/** Muted detail under a related link, such as the reading time. */
export function ArticlePageRelatedMeta({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="article-page-related-meta"
      className={cn("text-[12px] font-normal text-subtle-foreground tabular-nums", className)}
      {...props}
    />
  );
}

function moveRadio(event: KeyboardEvent<HTMLElement>) {
  const radios = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
  const index = radios.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;
  const next = {
    ArrowRight: index + 1,
    ArrowDown: index + 1,
    ArrowLeft: index - 1,
    ArrowUp: index - 1,
    Home: 0,
    End: radios.length - 1,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  const target = radios[(next + radios.length) % radios.length];
  target?.focus();
  target?.click();
}
