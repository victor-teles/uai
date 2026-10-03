"use client";

import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const PRODUCT_GALLERY_VARIANTS = ["stacked", "side", "compact"] as const;
export type ProductGalleryVariant = (typeof PRODUCT_GALLERY_VARIANTS)[number];
export type ProductGalleryMedia = { value: string; src: string; alt: string };
export type ProductGalleryProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  variant?: ProductGalleryVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};
type GalleryContext = {
  id: string;
  variant: ProductGalleryVariant;
  items: ProductGalleryMedia[];
  value: string;
  select: (value: string) => void;
  step: (offset: number) => void;
  register: (media: ProductGalleryMedia) => () => void;
  zoomed: boolean;
  setZoomed: (zoomed: boolean) => void;
};
const Context = createContext<GalleryContext | null>(null);
function useGallery(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ProductGallery`);
  return context;
}
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
const floatingControl: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: 999,
  cursor: "pointer",
};
const CONTROL = "uai-product-gallery-control";
const galleryCss = `
.uai-product-gallery{grid-template-columns:minmax(0,1fr);grid-template-areas:"view" "thumbs"}
.uai-product-gallery[data-variant=side]{grid-template-columns:72px minmax(0,1fr);grid-template-areas:"thumbs view"}
.uai-product-gallery[data-variant=side] .uai-product-gallery-thumbs{flex-direction:column}
@media (max-width:560px){
.uai-product-gallery[data-variant=side]{grid-template-columns:minmax(0,1fr);grid-template-areas:"view" "thumbs"}
.uai-product-gallery[data-variant=side] .uai-product-gallery-thumbs{flex-direction:row}
}
.uai-product-gallery-image{transition:transform 240ms cubic-bezier(0.23,1,0.32,1)}
.uai-product-gallery-control{background:color-mix(in oklab,var(--uai-surface) 84%,transparent);box-shadow:0 0 0 1px var(--uai-border),0 1px 2px oklch(0 0 0 / 0.08);color:var(--uai-muted);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-product-gallery-control:hover,.uai-product-gallery-control[aria-pressed=true]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-product-gallery-control:active{transform:scale(0.94)}
.uai-product-gallery-control:focus-visible,.uai-product-gallery-thumb:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-product-gallery-thumb{opacity:0.62;box-shadow:inset 0 0 0 1px var(--uai-border);transition:opacity 120ms ease-out,box-shadow 160ms cubic-bezier(0.23,1,0.32,1),transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-product-gallery-thumb:hover{opacity:0.9}
.uai-product-gallery-thumb[aria-current=true]{opacity:1;box-shadow:0 0 0 2px var(--uai-surface),0 0 0 3.5px var(--uai-text)}
.uai-product-gallery-thumb:active{transform:scale(0.97)}
.uai-product-gallery-dialog[open]{animation:uai-product-gallery-in 180ms cubic-bezier(0.16,1,0.3,1)}
.uai-product-gallery-dialog::backdrop{background:color-mix(in oklab,var(--uai-canvas) 72%,transparent);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
@keyframes uai-product-gallery-in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-product-gallery-image,.uai-product-gallery-control,.uai-product-gallery-thumb{transition:none}
.uai-product-gallery-control:active,.uai-product-gallery-thumb:active{transform:none}
.uai-product-gallery-dialog[open]{animation:none}
}
`;

export function ProductGallery({
  variant = "stacked",
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  style,
  ...props
}: ProductGalleryProps) {
  const id = useId();
  const [items, setItems] = useState<ProductGalleryMedia[]>([]);
  const [internal, setInternal] = useState(defaultValue);
  const [zoomed, setZoomed] = useState(false);
  const current = value ?? internal ?? items[0]?.value ?? "";
  const select = (next: string) => {
    setZoomed(false);
    if (next === current) return;
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  const step = (offset: number) => {
    if (items.length === 0) return;
    const index = Math.max(
      items.findIndex((item) => item.value === current),
      0,
    );
    const next = items[(index + offset + items.length) % items.length];
    if (next) select(next.value);
  };
  const register = (media: ProductGalleryMedia) => {
    setItems((previous) => {
      const index = previous.findIndex((item) => item.value === media.value);
      if (index === -1) return [...previous, media];
      return previous.map((item, position) => (position === index ? media : item));
    });
    return () => setItems((previous) => previous.filter((item) => item.value !== media.value));
  };
  return (
    <Context.Provider
      value={{ id, variant, items, value: current, select, step, register, zoomed, setZoomed }}
    >
      <div
        {...props}
        data-variant={variant}
        className={["uai-product-gallery", className].filter(Boolean).join(" ")}
        style={{
          display: "grid",
          gap: variant === "compact" ? 8 : 12,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{galleryCss}</style>
        {children}
      </div>
    </Context.Provider>
  );
}

export function ProductGalleryViewport({ children, style, ...props }: ComponentProps<"div">) {
  const context = useGallery("ProductGalleryViewport");
  const [origin, setOrigin] = useState("50% 50%");
  const index = context.items.findIndex((item) => item.value === context.value);
  const media = context.items[index];
  return (
    <div
      {...props}
      style={{
        gridArea: "view",
        position: "relative",
        aspectRatio: "4 / 3",
        minWidth: 0,
        overflow: "hidden",
        borderRadius: context.variant === "compact" ? 12 : 14,
        background: "var(--uai-surface-raised)",
        outline: "1px solid color-mix(in oklab, var(--uai-text) 8%, transparent)",
        outlineOffset: -1,
        ...style,
      }}
    >
      {media ? (
        // biome-ignore lint/a11y/useKeyWithClickEvents: ProductGalleryZoom is the keyboard control.
        // biome-ignore lint/performance/noImgElement: registry source is framework-agnostic.
        <img
          src={media.src}
          alt={media.alt}
          className="uai-product-gallery-image"
          draggable={false}
          onClick={() => context.setZoomed(!context.zoomed)}
          onPointerMove={(event) => {
            if (!context.zoomed) return;
            const box = event.currentTarget.getBoundingClientRect();
            if (!box.width || !box.height) return;
            const x = ((event.clientX - box.left) / box.width) * 100;
            const y = ((event.clientY - box.top) / box.height) * 100;
            setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
          }}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: context.zoomed ? "scale(2)" : "none",
            transformOrigin: origin,
            cursor: context.zoomed ? "zoom-out" : "zoom-in",
          }}
        />
      ) : null}
      <p id={`${context.id}-position`} aria-live="polite" style={visuallyHidden}>
        {media ? `Image ${index + 1} of ${context.items.length}: ${media.alt}` : ""}
      </p>
      {children ? (
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ProductGalleryZoom({
  onClick,
  className,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useGallery("ProductGalleryZoom");
  return (
    <button
      aria-label="Zoom image"
      {...props}
      type="button"
      aria-pressed={context.zoomed}
      className={[CONTROL, className].filter(Boolean).join(" ")}
      style={{ ...floatingControl, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setZoomed(!context.zoomed);
      }}
    >
      {context.zoomed ? (
        <ZoomOut size={14} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <ZoomIn size={14} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}

export function ProductGalleryFullscreen({
  onClick,
  className,
  style,
  "aria-label": label = "View fullscreen",
  ...props
}: ComponentProps<"button">) {
  const context = useGallery("ProductGalleryFullscreen");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      closeRef.current?.focus();
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      triggerRef.current?.focus();
    }
  }, [open]);
  const index = context.items.findIndex((item) => item.value === context.value);
  const media = context.items[index];
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") context.step(1);
    else if (event.key === "ArrowLeft") context.step(-1);
    else if (event.key === "Escape") setOpen(false);
    else return;
    event.preventDefault();
  };
  return (
    <>
      <button
        aria-label={label}
        aria-haspopup="dialog"
        {...props}
        ref={triggerRef}
        type="button"
        className={[CONTROL, className].filter(Boolean).join(" ")}
        style={{ ...floatingControl, ...style }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        }}
      >
        <Maximize2 size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Fullscreen product images"
        className="uai-product-gallery-dialog"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onKeyDown={handleKeyDown}
        style={{
          boxSizing: "border-box",
          width: "min(100% - 32px, 1040px)",
          maxWidth: "100%",
          maxHeight: "calc(100% - 32px)",
          margin: "auto",
          padding: 4,
          border: 0,
          borderRadius: 14,
          background: "var(--uai-surface)",
          color: "var(--uai-text)",
          boxShadow: "0 0 0 1px var(--uai-border-strong), 0 16px 40px -12px oklch(0 0 0 / 0.32)",
          fontSize: 13,
          lineHeight: "18px",
        }}
      >
        {open && media ? (
          <div style={{ display: "grid", gap: 4 }}>
            {/* biome-ignore lint/performance/noImgElement: registry source is framework-agnostic. */}
            <img
              src={media.src}
              alt={media.alt}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "calc(100dvh - 120px)",
                objectFit: "contain",
                borderRadius: 10,
                background: "var(--uai-surface-raised)",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 4px 4px 10px",
              }}
            >
              <p
                aria-live="polite"
                style={{
                  flex: 1,
                  minWidth: 0,
                  margin: 0,
                  color: "var(--uai-subtle)",
                  fontSize: 12,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {index + 1} / {context.items.length}
                <span style={visuallyHidden}>: {media.alt}</span>
              </p>
              <button
                type="button"
                aria-label="Previous image"
                className={CONTROL}
                style={floatingControl}
                onClick={() => context.step(-1)}
              >
                <ChevronLeft size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                className={CONTROL}
                style={floatingControl}
                onClick={() => context.step(1)}
              >
                <ChevronRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close fullscreen"
                className={CONTROL}
                style={floatingControl}
                onClick={() => setOpen(false)}
              >
                <X size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

export function ProductGalleryThumbnails({
  className,
  onKeyDown,
  style,
  "aria-label": label = "Product images",
  ...props
}: ComponentProps<"div">) {
  const context = useGallery("ProductGalleryThumbnails");
  const ref = useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const move = MOVES[event.key];
    if (event.defaultPrevented || !move || !ref.current) return;
    const thumbs = Array.from(
      ref.current.querySelectorAll<HTMLButtonElement>("[data-gallery-item]:not(:disabled)"),
    );
    if (thumbs.length === 0) return;
    event.preventDefault();
    const index = thumbs.indexOf(document.activeElement as HTMLButtonElement);
    const next = thumbs[move(Math.max(index, 0), thumbs.length)];
    next?.focus();
    if (next?.dataset.value) context.select(next.dataset.value);
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled group of thumbnail buttons, not a fieldset.
    <div
      role="group"
      aria-label={label}
      aria-describedby={`${context.id}-position`}
      {...props}
      ref={ref}
      className={["uai-product-gallery-thumbs", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
      style={{
        gridArea: "thumbs",
        display: "flex",
        gap: context.variant === "compact" ? 6 : 8,
        minWidth: 0,
        overflow: "auto",
        padding: 4,
        margin: -4,
        ...style,
      }}
    />
  );
}

export function ProductGalleryItem({
  value,
  src,
  alt,
  onClick,
  className,
  style,
  ...props
}: Omit<ComponentProps<"button">, "value" | "children"> & ProductGalleryMedia) {
  const context = useGallery("ProductGalleryItem");
  const { register } = context;
  useIsomorphicLayoutEffect(() => register({ value, src, alt }), [value, src, alt]);
  const selected = context.value === value;
  const orphaned = !context.items.some((item) => item.value === context.value);
  const size = context.variant === "compact" ? 48 : 64;
  return (
    <button
      aria-label={alt}
      {...props}
      type="button"
      data-gallery-item=""
      data-value={value}
      aria-current={selected || undefined}
      tabIndex={selected || orphaned ? 0 : -1}
      className={["uai-product-gallery-thumb", className].filter(Boolean).join(" ")}
      style={{
        flex: "none",
        width: size,
        height: size,
        padding: 0,
        overflow: "hidden",
        border: 0,
        borderRadius: context.variant === "compact" ? 8 : 10,
        background: "var(--uai-surface-raised)",
        cursor: "pointer",
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: registry source is framework-agnostic. */}
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
      />
    </button>
  );
}
