"use client";

import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  SearchField,
  type SearchFieldProps,
  type SearchFieldVariant,
} from "@/components/ui/uai/search-field";

export const FAQ_SECTION_VARIANTS = ["list", "cards", "split"] as const;
export type FaqSectionVariant = (typeof FAQ_SECTION_VARIANTS)[number];
export type FaqSectionProps = ComponentProps<"section"> & { variant?: FaqSectionVariant };

type SectionContext = {
  id: string;
  variant: FaqSectionVariant;
  query: string;
  setQuery: (query: string) => void;
  visible: number;
  report: (id: string, matches: boolean | null) => void;
};
const Context = createContext<SectionContext | null>(null);
function useSection(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within FaqSection`);
  return context;
}
type ItemContext = { id: string; open: boolean; toggle: () => void };
const ItemContext = createContext<ItemContext | null>(null);
function useItem(part: string) {
  const context = useContext(ItemContext);
  if (!context) throw new Error(`${part} must be used within FaqSectionItem`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const layoutCss = `
[data-uai-faq-layout]{display:grid;gap:20px;align-items:start;min-width:0}
[data-uai-faq-chevron]{transition:transform 180ms cubic-bezier(0.23,1,0.32,1),color 120ms ease-out}
[aria-expanded="true"]>[data-uai-faq-chevron]{transform:rotate(180deg)}
[data-uai-faq-question]:hover>[data-uai-faq-chevron]{color:var(--uai-text)}
[data-uai-faq-question]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px;border-radius:6px}
[data-uai-faq-item][data-variant="cards"]{transition:border-color 120ms ease-out}
[data-uai-faq-item][data-variant="cards"]:hover{border-color:var(--uai-border-strong)}
[data-uai-faq-answer]{grid-template-rows:0fr;opacity:0;transition:grid-template-rows 300ms cubic-bezier(0.23,1,0.32,1),opacity 200ms ease-out}
[data-uai-faq-answer][data-state="open"]{grid-template-rows:1fr;opacity:1;animation:uai-faq-expand 300ms cubic-bezier(0.23,1,0.32,1)}
@keyframes uai-faq-expand{from{grid-template-rows:0fr;opacity:0}}
@media (prefers-reduced-motion: reduce){[data-uai-faq-chevron],[data-uai-faq-answer],[data-uai-faq-item]{transition:none;animation:none}}
@container (min-width: 720px){
  [data-uai-faq="split"]>[data-uai-faq-layout]{grid-template-columns:minmax(0,1fr) minmax(0,1.7fr);column-gap:48px}
  [data-uai-faq="split"]>[data-uai-faq-layout]>[data-uai-faq-header]{grid-row:1 / span 4;position:sticky;top:16px}
  [data-uai-faq="split"]>[data-uai-faq-layout]>:not([data-uai-faq-header]):not(style){grid-column:2}
}`;

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Searchable questions with disclosure answers. Split moves the header beside the list from 720px. */
export function FaqSection({ variant = "list", children, style, ...props }: FaqSectionProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Readonly<Record<string, boolean>>>({});
  const report = useCallback((itemId: string, match: boolean | null) => {
    setMatches((current) => {
      if (match === null) {
        if (!(itemId in current)) return current;
        const { [itemId]: _removed, ...rest } = current;
        return rest;
      }
      return current[itemId] === match ? current : { ...current, [itemId]: match };
    });
  }, []);
  const visible = Object.values(matches).filter(Boolean).length;
  return (
    <Context.Provider value={{ id, variant, query, setQuery, visible, report }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-faq={variant}
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
        <div data-uai-faq-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

export function FaqSectionHeader({ style, ...props }: ComponentProps<"header">) {
  useSection("FaqSectionHeader");
  return (
    <header
      {...props}
      data-uai-faq-header=""
      style={{ display: "grid", gap: 8, minWidth: 0, ...style }}
    />
  );
}

export function FaqSectionTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("FaqSectionTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: "clamp(22px, 2.5cqi + 12px, 30px)",
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function FaqSectionDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{
        margin: 0,
        color: "var(--uai-muted)",
        fontSize: 15,
        lineHeight: "23px",
        textWrap: "pretty",
        ...style,
      }}
    />
  );
}

export type FaqSectionSearchProps = Omit<
  SearchFieldProps,
  "value" | "defaultValue" | "onValueChange" | "status"
>;

/** A Search Field bound to the question filter. Compose the label, control, input, clear, and message inside. */
export function FaqSectionSearch({ variant, ...props }: FaqSectionSearchProps) {
  const section = useSection("FaqSectionSearch");
  const fieldVariant: SearchFieldVariant =
    variant ?? (section.variant === "cards" ? "pill" : "rounded");
  return (
    <SearchField
      {...props}
      variant={fieldVariant}
      value={section.query}
      onValueChange={section.setQuery}
      status={section.query.trim() && section.visible === 0 ? "empty" : "idle"}
    />
  );
}

export function FaqSectionList({ style, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("FaqSectionList");
  return (
    <ul
      {...props}
      style={{
        display: "grid",
        gap: variant === "cards" ? 8 : 0,
        minWidth: 0,
        margin: 0,
        padding: 0,
        borderTop: variant === "cards" ? 0 : "1px solid var(--uai-border)",
        marginTop: variant === "cards" ? 0 : 4,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

export type FaqSectionItemProps = ComponentProps<"li"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** One question. It hides itself when neither the question nor the answer matches the search. */
export function FaqSectionItem({
  open,
  defaultOpen = false,
  onOpenChange,
  style,
  ...props
}: FaqSectionItemProps) {
  const section = useSection("FaqSectionItem");
  const { report } = section;
  const id = useId();
  const ref = useRef<HTMLLIElement>(null);
  const [internal, setInternal] = useState(defaultOpen);
  const [hidden, setHidden] = useState(false);
  const current = open ?? internal;
  const query = normalize(section.query);
  useIsomorphicLayoutEffect(() => {
    const match = !query || normalize(ref.current?.textContent ?? "").includes(query);
    setHidden(!match);
    report(id, match);
  }, [id, query, report]);
  useEffect(() => () => report(id, null), [id, report]);
  const cards = section.variant === "cards";
  return (
    <ItemContext.Provider
      value={{
        id,
        open: current,
        toggle: () => {
          if (open === undefined) setInternal(!current);
          onOpenChange?.(!current);
        },
      }}
    >
      <li
        {...props}
        ref={ref}
        hidden={hidden}
        data-uai-faq-item=""
        data-variant={section.variant}
        style={{
          minWidth: 0,
          padding: cards ? "0 16px" : 0,
          borderStyle: "solid",
          borderWidth: cards ? 1 : "0 0 1px",
          borderColor: "var(--uai-border)",
          borderRadius: cards ? 14 : 0,
          background: cards ? "var(--uai-surface)" : "transparent",
          boxShadow: cards ? "0 1px 2px oklch(0 0 0 / 0.04)" : undefined,
          ...style,
        }}
      />
    </ItemContext.Provider>
  );
}

export function FaqSectionQuestion({ children, style, ...props }: ComponentProps<"button">) {
  const item = useItem("FaqSectionQuestion");
  return (
    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: "20px" }}>
      <button
        type="button"
        {...props}
        data-uai-faq-question=""
        id={`${item.id}-question`}
        aria-expanded={item.open}
        aria-controls={`${item.id}-answer`}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) item.toggle();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          width: "100%",
          minHeight: 52,
          padding: "14px 0",
          border: 0,
          background: "transparent",
          color: "var(--uai-text)",
          font: "inherit",
          textAlign: "start",
          cursor: "pointer",
          ...style,
        }}
      >
        <span style={{ minWidth: 0 }}>{children}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          data-uai-faq-chevron=""
          style={{ flex: "none", color: "var(--uai-subtle)" }}
        />
      </button>
    </h3>
  );
}

/** The answer expands with its row height and stays in the DOM until the collapse finishes. */
export function FaqSectionAnswer({ style, children, ...props }: ComponentProps<"div">) {
  const item = useItem("FaqSectionAnswer");
  const [rendered, setRendered] = useState(item.open);
  useEffect(() => {
    if (item.open) {
      setRendered(true);
      return;
    }
    const timer = window.setTimeout(() => setRendered(false), 300);
    return () => window.clearTimeout(timer);
  }, [item.open]);
  const shown = item.open || rendered;
  return (
    <div
      {...props}
      id={`${item.id}-answer`}
      hidden={!shown}
      data-uai-faq-answer=""
      data-state={item.open ? "open" : "closed"}
      style={{ display: shown ? "grid" : "none", minWidth: 0 }}
    >
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gap: 8,
            maxWidth: "64ch",
            paddingBottom: 16,
            color: "var(--uai-muted)",
            lineHeight: "20px",
            textWrap: "pretty",
            ...style,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Shown only while a search matches no questions. */
export function FaqSectionEmpty({ style, ...props }: ComponentProps<"div">) {
  const section = useSection("FaqSectionEmpty");
  if (!section.query.trim() || section.visible > 0) return null;
  return (
    <div
      {...props}
      style={{
        display: "grid",
        justifyItems: "start",
        gap: 8,
        padding: 16,
        borderRadius: 14,
        background: "color-mix(in oklab, var(--uai-surface-raised) 60%, transparent)",
        color: "var(--uai-muted)",
        ...style,
      }}
    />
  );
}
