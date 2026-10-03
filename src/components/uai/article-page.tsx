"use client";

import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useId,
  useState,
} from "react";
import { AuthorCard, type AuthorCardProps } from "@/components/ui/uai/author-card";
import {
  ShareMenu,
  type ShareMenuProps,
  type ShareMenuVariant,
} from "@/components/ui/uai/share-menu";

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

const layoutCss = `
[data-uai-article-layout]{display:grid;gap:28px;min-width:0}
[data-uai-article="compact"]>[data-uai-article-layout]{gap:16px}
[data-uai-article="centered"]>[data-uai-article-layout]{max-width:680px;margin:0 auto}
@container (min-width: 760px){
  [data-uai-article="sidebar"]>[data-uai-article-layout]{grid-template-columns:minmax(0,1fr) 240px;column-gap:48px;align-items:start}
  [data-uai-article="sidebar"] [data-uai-article-region="header"]{grid-column:1 / -1}
  [data-uai-article="sidebar"] [data-uai-article-region="related"]{position:sticky;top:16px}
}
[data-uai-article-content]>*{margin:0}
[data-uai-article-content]>*+*{margin-top:1em}
[data-uai-article-content] h2{font-size:1.25em;line-height:1.3;font-weight:600;letter-spacing:-0.01em;margin-top:1.6em}
[data-uai-article-content] h3{font-size:1.08em;line-height:1.35;font-weight:500;margin-top:1.4em}
[data-uai-article-content] a{color:inherit;text-decoration:underline;text-decoration-color:var(--uai-border-strong);text-underline-offset:3px;transition:text-decoration-color 120ms ease-out}
[data-uai-article-content] a:hover{text-decoration-color:var(--uai-text)}
[data-uai-article-content] blockquote{padding:2px 0 2px 16px;border-inline-start:2px solid var(--uai-border-strong);color:var(--uai-muted)}
[data-uai-article-content] ul,[data-uai-article-content] ol{padding-inline-start:1.25em}
[data-uai-article-content] ul{list-style:disc}
[data-uai-article-content] ol{list-style:decimal}
[data-uai-article-content] li+li{margin-top:0.35em}
[data-uai-article-content] li::marker{color:var(--uai-subtle)}
[data-uai-article-content] code{padding:1px 6px;border-radius:6px;background:var(--uai-surface-raised);font-size:0.88em}
[data-uai-article-content]{transition:font-size 180ms cubic-bezier(0.23,1,0.32,1),line-height 180ms cubic-bezier(0.23,1,0.32,1)}
.uai-article-size{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-article-size[aria-checked=false]:hover{color:var(--uai-text)}
.uai-article-size:active{transform:scale(0.94)}
.uai-article-size:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
.uai-article-related{transition:background-color 120ms ease-out}
.uai-article-related:hover{background:var(--uai-surface-raised)}
.uai-article-related:focus-visible{outline:2px solid var(--uai-accent);outline-offset:0}
@media (prefers-reduced-motion: reduce){[data-uai-article-content],.uai-article-size,.uai-article-related{transition:none}.uai-article-size:active{transform:none}}
`;

const contentType: Record<ArticlePageTextSize, { fontSize: number; lineHeight: string }> = {
  small: { fontSize: 14, lineHeight: "22px" },
  default: { fontSize: 16, lineHeight: "26px" },
  large: { fontSize: 18, lineHeight: "30px" },
};
const shareVariants: Record<ArticlePageVariant, ShareMenuVariant> = {
  centered: "outlined",
  sidebar: "outlined",
  compact: "compact",
};

/** A long-form article with metadata, reading controls, content, sharing, and related reading. */
export function ArticlePage({
  variant = "centered",
  textSize,
  defaultTextSize = "default",
  onTextSizeChange,
  children,
  style,
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
        {...props}
        data-variant={variant}
        data-uai-article={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-article-layout="">{children}</div>
      </article>
    </Context.Provider>
  );
}

export function ArticlePageHeader({ style, ...props }: ComponentProps<"header">) {
  const { variant } = useArticle("ArticlePageHeader");
  return (
    <header
      {...props}
      data-uai-article-region="header"
      style={{
        display: "grid",
        gap: variant === "compact" ? 10 : 16,
        minWidth: 0,
        paddingBottom: variant === "compact" ? 12 : 20,
        borderBottom: "1px solid var(--uai-border)",
        ...style,
      }}
    />
  );
}

/** A short label above the title, such as the section or topic. */
export function ArticlePageCategory({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-accent)",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        ...style,
      }}
    />
  );
}

export function ArticlePageTitle({ style, ...props }: ComponentProps<"h1">) {
  const { id, variant } = useArticle("ArticlePageTitle");
  return (
    <h1
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 22 : "clamp(26px, 3cqi + 12px, 36px)",
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function ArticlePageDescription({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useArticle("ArticlePageDescription");
  return (
    <p
      {...props}
      style={{
        maxWidth: "60ch",
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: variant === "compact" ? 13 : 15,
        lineHeight: variant === "compact" ? "18px" : "22px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

/** Byline row: the author, dates, and reading time on the start side, reading controls on the end side. */
export function ArticlePageMeta({ style, ...props }: ComponentProps<"div">) {
  useArticle("ArticlePageMeta");
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

/** The byline, an inline Author Card. Compose Author Card parts inside it. */
export function ArticlePageAuthor({ style, ...props }: Omit<AuthorCardProps, "variant">) {
  useArticle("ArticlePageAuthor");
  return (
    <AuthorCard {...props} variant="inline" style={{ alignItems: "center", rowGap: 2, ...style }} />
  );
}

/** Muted publication details such as dates and reading time. */
export function ArticlePageDetails({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 8px",
        margin: 0,
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

/** Reading controls and sharing. */
export function ArticlePageToolbar({
  "aria-label": label = "Reading controls",
  style,
  ...props
}: ComponentProps<"div">) {
  useArticle("ArticlePageToolbar");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of controls, not a fieldset.
    <div
      role="group"
      aria-label={label}
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, ...style }}
    />
  );
}

/** A radio group that sets the reading size of ArticlePageContent. Arrow keys move the selection. */
export function ArticlePageTextSizeControl({
  "aria-label": label = "Text size",
  onKeyDown,
  style,
  ...props
}: ComponentProps<"div">) {
  const { variant } = useArticle("ArticlePageTextSizeControl");
  const compact = variant === "compact";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveRadio(event);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: compact ? 1 : 2,
        borderRadius: 999,
        background: "var(--uai-surface)",
        ...style,
      }}
    />
  );
}

export type ArticlePageTextSizeOptionProps = Omit<ComponentProps<"button">, "value"> & {
  value: ArticlePageTextSize;
};
export function ArticlePageTextSizeOption({
  value,
  onClick,
  style,
  ...props
}: ArticlePageTextSizeOptionProps) {
  const context = useArticle("ArticlePageTextSizeOption");
  const checked = context.textSize === value;
  const compact = context.variant === "compact";
  return (
    // biome-ignore lint/a11y/useSemanticElements: APG radio group built from buttons for custom segmented styling.
    <button
      {...props}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      className={props.className ? `uai-article-size ${props.className}` : "uai-article-size"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setTextSize(value);
      }}
      style={{
        display: "grid",
        placeItems: "center",
        minWidth: compact ? 24 : 28,
        height: compact ? 22 : 24,
        padding: "0 6px",
        border: 0,
        borderRadius: 999,
        background: checked ? "var(--uai-surface-raised)" : "transparent",
        color: checked ? "var(--uai-text)" : "var(--uai-subtle)",
        fontSize: value === "small" ? 11 : value === "large" ? 15 : 13,
        fontWeight: 500,
        lineHeight: 1,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

/** Share Menu sized for the article. Compose ShareMenuTrigger and ShareMenuContent inside it. */
export function ArticlePageShare(props: Omit<ShareMenuProps, "variant">) {
  const { variant } = useArticle("ArticlePageShare");
  return <ShareMenu {...props} variant={shareVariants[variant]} />;
}

/** The article body. Type size follows the reading controls. */
export function ArticlePageContent({ style, ...props }: ComponentProps<"div">) {
  const { textSize, variant } = useArticle("ArticlePageContent");
  const type = contentType[textSize];
  return (
    <div
      {...props}
      data-uai-article-content=""
      data-text-size={textSize}
      style={{
        minWidth: 0,
        maxWidth: variant === "compact" ? undefined : "68ch",
        fontSize: type.fontSize,
        lineHeight: type.lineHeight,
        textWrap: "pretty",
        overflowWrap: "anywhere",
        ...style,
      }}
    />
  );
}

/** Related reading, rendered as a labelled complementary region. */
export function ArticlePageRelated({ style, ...props }: ComponentProps<"aside">) {
  const { variant } = useArticle("ArticlePageRelated");
  const id = useId();
  const compact = variant === "compact";
  return (
    <RelatedContext.Provider value={id}>
      <aside
        aria-labelledby={id}
        {...props}
        data-uai-article-region="related"
        style={{
          display: "grid",
          gap: compact ? 8 : 12,
          minWidth: 0,
          padding: compact ? 10 : 12,
          borderRadius: compact ? 12 : 14,
          background: "var(--uai-surface)",
          ...style,
        }}
      />
    </RelatedContext.Provider>
  );
}

export function ArticlePageRelatedTitle({ style, ...props }: ComponentProps<"h2">) {
  const id = useContext(RelatedContext);
  if (!id) throw new Error("ArticlePageRelatedTitle must be used within ArticlePageRelated");
  return (
    <h2
      {...props}
      id={id}
      style={{
        margin: 0,
        padding: "2px 8px 0",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function ArticlePageRelatedList({ style, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: 2,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export function ArticlePageRelatedItem({ style, children, ...props }: ComponentProps<"a">) {
  const { variant } = useArticle("ArticlePageRelatedItem");
  return (
    <li style={{ display: "grid", minWidth: 0 }}>
      <a
        {...props}
        className={
          props.className ? `uai-article-related ${props.className}` : "uai-article-related"
        }
        style={{
          display: "grid",
          gap: 2,
          minWidth: 0,
          padding: variant === "compact" ? "6px 8px" : "8px",
          borderRadius: 8,
          color: "var(--uai-text)",
          fontWeight: 500,
          textDecoration: "none",
          ...style,
        }}
      >
        {children}
      </a>
    </li>
  );
}

/** Muted detail under a related link, such as the reading time. */
export function ArticlePageRelatedMeta({ style, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      style={{
        color: "var(--uai-subtle)",
        fontSize: 12,
        fontWeight: 400,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
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
