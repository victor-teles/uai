"use client";

import { cva } from "class-variance-authority";
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
import { cn } from "@/lib/uai-utils";

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

const faqSectionLayoutVariants = cva("grid min-w-0 items-start gap-5", {
  variants: {
    variant: {
      list: "",
      cards: "",
      split:
        "@min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] @min-[720px]:gap-x-12 @min-[720px]:[&>:not([data-slot=faq-section-header])]:col-start-2",
    },
  },
});

const faqSectionItemVariants = cva("min-w-0 border-solid motion-reduce:transition-none", {
  variants: {
    variant: {
      list: "rounded-none border-b bg-transparent p-0",
      cards:
        "rounded-[14px] border bg-card px-4 shadow-[0_1px_2px_oklch(0_0_0/0.04)] transition-[border-color] duration-120 ease-out hover:border-border-strong",
      split: "rounded-none border-b bg-transparent p-0",
    },
  },
});

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Searchable questions with disclosure answers. Split moves the header beside the list from 720px. */
export function FaqSection({ variant = "list", children, className, ...props }: FaqSectionProps) {
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
        data-slot="faq-section"
        data-variant={variant}
        className={cn(
          "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
          className,
        )}
        {...props}
      >
        <div className={faqSectionLayoutVariants({ variant })}>{children}</div>
      </section>
    </Context.Provider>
  );
}

export function FaqSectionHeader({ className, ...props }: ComponentProps<"header">) {
  const { variant } = useSection("FaqSectionHeader");
  return (
    <header
      data-slot="faq-section-header"
      className={cn(
        "grid min-w-0 gap-2",
        variant === "split" && "@min-[720px]:sticky @min-[720px]:top-4 @min-[720px]:row-[1/span_4]",
        className,
      )}
      {...props}
    />
  );
}

export function FaqSectionTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id } = useSection("FaqSectionTitle");
  return (
    <h2
      data-slot="faq-section-title"
      className={cn(
        "m-0 text-[length:clamp(22px,2.5cqi_+_12px,30px)] leading-[1.15] font-medium tracking-[-0.025em] text-balance",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

export function FaqSectionDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="faq-section-description"
      className={cn("m-0 text-[15px]/[23px] text-pretty text-muted-foreground", className)}
      {...props}
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

export function FaqSectionList({ className, ...props }: ComponentProps<"ul">) {
  const { variant } = useSection("FaqSectionList");
  return (
    <ul
      data-slot="faq-section-list"
      className={cn(
        "m-0 grid min-w-0 list-none p-0",
        variant === "cards" ? "mt-0 gap-2 border-t-0" : "mt-1 gap-0 border-t",
        className,
      )}
      {...props}
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
  className,
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
        data-slot="faq-section-item"
        data-variant={section.variant}
        className={cn(faqSectionItemVariants({ variant: section.variant }), className)}
        {...props}
        ref={ref}
        hidden={hidden}
      />
    </ItemContext.Provider>
  );
}

export function FaqSectionQuestion({ children, className, ...props }: ComponentProps<"button">) {
  const item = useItem("FaqSectionQuestion");
  return (
    <h3 className="m-0 text-sm/5 font-medium">
      <button
        type="button"
        data-slot="faq-section-question"
        className={cn(
          "group/faq-question flex min-h-13 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-3.5 text-start text-foreground focus-visible:rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
        {...props}
        id={`${item.id}-question`}
        aria-expanded={item.open}
        aria-controls={`${item.id}-answer`}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) item.toggle();
        }}
      >
        <span className="min-w-0">{children}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="flex-none text-subtle-foreground [transition:rotate_180ms_cubic-bezier(0.23,1,0.32,1),color_120ms_ease-out] group-hover/faq-question:text-foreground group-aria-expanded/faq-question:rotate-180 motion-reduce:transition-none"
        />
      </button>
    </h3>
  );
}

/** The answer expands with its row height and stays in the DOM until the collapse finishes. */
export function FaqSectionAnswer({ className, children, ...props }: ComponentProps<"div">) {
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
      data-slot="faq-section-answer"
      className="grid min-w-0 grid-rows-[0fr] opacity-0 [transition:grid-template-rows_300ms_cubic-bezier(0.23,1,0.32,1),opacity_200ms_ease-out] data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100 data-[state=open]:starting:grid-rows-[0fr] data-[state=open]:starting:opacity-0 motion-reduce:transition-none"
      {...props}
      id={`${item.id}-answer`}
      hidden={!shown}
      data-state={item.open ? "open" : "closed"}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "grid max-w-[64ch] gap-2 pb-4 leading-5 text-pretty text-muted-foreground",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Shown only while a search matches no questions. */
export function FaqSectionEmpty({ className, ...props }: ComponentProps<"div">) {
  const section = useSection("FaqSectionEmpty");
  if (!section.query.trim() || section.visible > 0) return null;
  return (
    <div
      data-slot="faq-section-empty"
      className={cn(
        "grid justify-items-start gap-2 rounded-[14px] bg-muted/60 p-4 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
