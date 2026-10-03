"use client";

import { ArrowUpRight } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export const CITATION_VARIANTS = ["number", "chip", "underline"] as const;
export type CitationVariant = (typeof CITATION_VARIANTS)[number];
export type CitationProps = ComponentProps<"span"> & {
  variant?: CitationVariant;
  /** Source number shown by the default marker. */
  index?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type CitationContextValue = {
  id: string;
  index?: number;
  variant: CitationVariant;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const CitationContext = createContext<CitationContextValue | null>(null);

function useCitation(part: string) {
  const context = useContext(CitationContext);
  if (!context) throw new Error(`${part} must be used within Citation`);
  return context;
}

const CLOSE_DELAY = 120;

const citationCss = `
[data-uai-citation-trigger]{transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
[data-uai-citation-trigger]:hover,[data-uai-citation-trigger][aria-expanded="true"]{background:color-mix(in oklab,var(--uai-surface-raised) 80%,var(--uai-text))!important;color:var(--uai-text)!important}
[data-uai-citation-trigger]:active{transform:scale(0.94)}
[data-uai-citation-trigger]:focus-visible,[data-uai-citation-link]:focus-visible{outline:2px solid var(--uai-accent);outline-offset:1px}
[data-uai-citation-link]{transition:background-color 120ms ease-out}
[data-uai-citation-link]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))!important}
@media (prefers-reduced-motion:reduce){[data-uai-citation-trigger],[data-uai-citation-link]{transition:none}[data-uai-citation-trigger]:active{transform:none}}
`;

export function Citation({
  variant = "number",
  index,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  style,
  onPointerEnter,
  onPointerLeave,
  onBlur,
  onKeyDown,
  ...props
}: CitationProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [internal, setInternal] = useState(defaultOpen);
  const visible = open ?? internal;
  const setOpen = (next: boolean) => {
    window.clearTimeout(closeTimer.current);
    if (next === visible) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  return (
    <CitationContext.Provider value={{ id, index, variant, open: visible, setOpen, triggerRef }}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover and focus-out handlers coordinate the preview; the trigger is the interactive element. */}
      <span
        {...props}
        data-variant={variant}
        data-state={visible ? "open" : "closed"}
        style={{ position: "relative", display: "inline", ...style }}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (event.pointerType !== "touch") setOpen(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.pointerType === "touch") return;
          window.clearTimeout(closeTimer.current);
          closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          const next = event.relatedTarget as Node | null;
          if (!next || !event.currentTarget.contains(next)) setOpen(false);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== "Escape" || !visible) return;
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <style href="uai-citation" precedence="default">
          {citationCss}
        </style>
        {children}
      </span>
    </CitationContext.Provider>
  );
}

export function CitationClaim({ style, ...props }: ComponentProps<"span">) {
  const context = useCitation("CitationClaim");
  const underline = context.variant === "underline";
  return (
    <span
      {...props}
      style={{
        borderRadius: 4,
        textDecorationLine: underline ? "underline" : undefined,
        textDecorationStyle: "dotted",
        textDecorationColor: context.open ? "var(--uai-muted)" : "var(--uai-border-strong)",
        textDecorationThickness: 1.5,
        textUnderlineOffset: 4,
        background:
          underline && context.open
            ? "color-mix(in oklab, var(--uai-text) 7%, transparent)"
            : undefined,
        boxShadow:
          underline && context.open
            ? "0 0 0 2px color-mix(in oklab, var(--uai-text) 7%, transparent)"
            : undefined,
        transition:
          "background-color 120ms ease-out, box-shadow 120ms ease-out, text-decoration-color 120ms ease-out",
        ...style,
      }}
    />
  );
}

export function CitationTrigger({
  children,
  onClick,
  onFocus,
  onPointerDown,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useCitation("CitationTrigger");
  const press = useRef<{ pointerType: string; wasOpen: boolean } | null>(null);
  const chip = context.variant === "chip";
  return (
    <button
      type="button"
      aria-label={children === undefined ? `Source ${context.index ?? ""}`.trim() : undefined}
      {...props}
      ref={context.triggerRef}
      data-uai-citation-trigger=""
      aria-expanded={context.open}
      aria-controls={`${context.id}-source`}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) context.setOpen(true);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        press.current = { pointerType: event.pointerType, wasOpen: context.open };
      }}
      onClick={(event) => {
        onClick?.(event);
        const pointer = press.current;
        press.current = null;
        if (event.defaultPrevented) return;
        // Mouse hover already previews the source, so a click keeps it open.
        if (pointer?.pointerType === "mouse") context.setOpen(true);
        else if (pointer) context.setOpen(!pointer.wasOpen);
        else context.setOpen(!context.open);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        minWidth: chip ? undefined : 17,
        height: chip ? 20 : 17,
        margin: "0 2px",
        padding: chip ? "0 7px" : "0 5px",
        justifyContent: "center",
        verticalAlign: chip ? "1px" : "2px",
        border: 0,
        borderRadius: chip ? 6 : 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        fontFamily: chip ? "var(--font-mono, ui-monospace, monospace)" : "inherit",
        fontSize: chip ? 11 : 10.5,
        fontWeight: 500,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        cursor: "pointer",
        ...style,
      }}
    >
      {children ?? context.index}
    </button>
  );
}

export function CitationPopover({ children, style, ...props }: ComponentProps<"span">) {
  const context = useCitation("CitationPopover");
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!context.open) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    ref.current?.animate?.(
      [
        { opacity: 0, transform: "scale(0.96)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [context.open]);
  return (
    // biome-ignore lint/a11y/useSemanticElements: the preview sits inside phrasing content, where a fieldset is invalid.
    <span
      role="group"
      aria-labelledby={`${context.id}-title`}
      {...props}
      ref={ref}
      id={`${context.id}-source`}
      hidden={!context.open}
      style={{
        position: "absolute",
        zIndex: 20,
        top: "calc(100% + 8px)",
        left: 0,
        display: context.open ? "grid" : "none",
        gap: 4,
        width: 300,
        maxWidth: "calc(100vw - 32px)",
        padding: 4,
        borderRadius: 14,
        background: "var(--uai-surface)",
        boxShadow:
          "0 0 0 1px var(--uai-border-strong), 0 16px 32px -12px rgb(0 0 0 / 0.28), 0 4px 8px -4px rgb(0 0 0 / 0.12)",
        transformOrigin: "top left",
        color: "var(--uai-text)",
        fontSize: 13,
        lineHeight: "18px",
        fontWeight: 400,
        textAlign: "left",
        whiteSpace: "normal",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function CitationSource({ style, ...props }: ComponentProps<"span">) {
  useCitation("CitationSource");
  return (
    <span
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 8px 0",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function CitationTitle({ style, ...props }: ComponentProps<"span">) {
  const context = useCitation("CitationTitle");
  return (
    <span
      {...props}
      id={`${context.id}-title`}
      style={{
        display: "block",
        padding: "0 8px",
        fontSize: 13,
        lineHeight: "18px",
        fontWeight: 500,
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

export function CitationExcerpt({ style, ...props }: ComponentProps<"span">) {
  useCitation("CitationExcerpt");
  return (
    <span
      {...props}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        margin: "0 8px 6px",
        color: "var(--uai-muted)",
        fontSize: 12.5,
        lineHeight: "18px",
        maxHeight: 54,
        ...style,
      }}
    />
  );
}

export function CitationLink({ children, style, ...props }: ComponentProps<"a">) {
  useCitation("CitationLink");
  return (
    <a
      data-uai-citation-link=""
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        minHeight: 32,
        padding: "0 8px 0 10px",
        borderRadius: 10,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 12.5,
        fontWeight: 500,
        textDecoration: "none",
        ...style,
      }}
    >
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {children ?? "Open source"}
      </span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        style={{ flex: "none", color: "var(--uai-muted)" }}
      />
    </a>
  );
}
