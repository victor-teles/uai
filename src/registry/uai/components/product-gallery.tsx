"use client";

import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/uai-utils";

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
const controlClass =
  "grid size-7 min-w-0 cursor-pointer place-items-center rounded-full border-0 bg-card/84 p-0 text-muted-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_oklch(0_0_0/0.08)] backdrop-blur-sm transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.94] aria-pressed:bg-accent aria-pressed:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-accent [&_svg:not([class*='size-'])]:size-3.5";

const productGalleryVariants = cva(
  "grid min-w-0 grid-cols-[minmax(0,1fr)] text-[13px]/[18px] text-foreground [grid-template-areas:'view'_'thumbs']",
  {
    variants: {
      variant: {
        stacked: "gap-3",
        side: "gap-3 grid-cols-[72px_minmax(0,1fr)] [grid-template-areas:'thumbs_view'] max-[560px]:grid-cols-[minmax(0,1fr)] max-[560px]:[grid-template-areas:'view'_'thumbs']",
        compact: "gap-2",
      },
    },
  },
);

export function ProductGallery({
  variant = "stacked",
  value,
  defaultValue,
  onValueChange,
  className,
  children,
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
        data-slot="product-gallery"
        className={cn(productGalleryVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function ProductGalleryViewport({ children, className, ...props }: ComponentProps<"div">) {
  const context = useGallery("ProductGalleryViewport");
  const [origin, setOrigin] = useState("50% 50%");
  const index = context.items.findIndex((item) => item.value === context.value);
  const media = context.items[index];
  return (
    <div
      data-slot="product-gallery-viewport"
      className={cn(
        "relative aspect-4/3 min-w-0 overflow-hidden bg-muted outline -outline-offset-1 outline-foreground/8 [grid-area:view]",
        context.variant === "compact" ? "rounded-xl" : "rounded-[14px]",
        className,
      )}
      {...props}
    >
      {media ? (
        // biome-ignore lint/a11y/useKeyWithClickEvents: ProductGalleryZoom is the keyboard control.
        // biome-ignore lint/performance/noImgElement: registry source is framework-agnostic.
        <img
          src={media.src}
          alt={media.alt}
          className={cn(
            "block size-full object-contain transition-[scale] duration-240 ease-out-quint motion-reduce:transition-none",
            context.zoomed ? "scale-200 cursor-zoom-out" : "scale-none cursor-zoom-in",
          )}
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
          style={{ transformOrigin: origin }}
        />
      ) : null}
      <p id={`${context.id}-position`} aria-live="polite" className="sr-only">
        {media ? `Image ${index + 1} of ${context.items.length}: ${media.alt}` : ""}
      </p>
      {children ? <div className="absolute top-2.5 right-2.5 flex gap-1.5">{children}</div> : null}
    </div>
  );
}

export function ProductGalleryZoom({ onClick, className, ...props }: ComponentProps<"button">) {
  const context = useGallery("ProductGalleryZoom");
  return (
    <Toggle
      data-slot="product-gallery-zoom"
      aria-label="Zoom image"
      className={cn(controlClass, className)}
      {...props}
      type="button"
      pressed={context.zoomed}
      onPressedChange={context.setZoomed}
      onClick={onClick}
    >
      {context.zoomed ? (
        <ZoomOut size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <ZoomIn size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      )}
    </Toggle>
  );
}

export function ProductGalleryFullscreen({
  onClick,
  className,
  "aria-label": label = "View fullscreen",
  ...props
}: ComponentProps<"button">) {
  const context = useGallery("ProductGalleryFullscreen");
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const index = context.items.findIndex((item) => item.value === context.value);
  const media = context.items[index];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") context.step(1);
    else if (event.key === "ArrowLeft") context.step(-1);
    else return;
    event.preventDefault();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={onClick}>
        <Button
          variant="ghost"
          size="icon"
          data-slot="product-gallery-fullscreen"
          aria-label={label}
          className={cn(controlClass, className)}
          {...props}
          type="button"
        >
          <Maximize2 size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="box-border block max-h-[calc(100%_-_32px)] w-[min(100%_-_32px,1040px)] max-w-full gap-0 rounded-[14px] border-0 bg-popover p-1 text-[13px]/[18px] text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_16px_40px_-12px_oklch(0_0_0/0.32)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 sm:max-w-full motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeRef.current?.focus();
        }}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Fullscreen product images</DialogTitle>
        {media ? (
          <div className="grid gap-1">
            {/* biome-ignore lint/performance/noImgElement: registry source is framework-agnostic. */}
            <img
              src={media.src}
              alt={media.alt}
              className="block max-h-[calc(100dvh_-_120px)] w-full rounded-[10px] bg-muted object-contain"
            />
            <div className="flex items-center gap-1 py-1 pr-1 pl-2.5">
              <p
                aria-live="polite"
                className="m-0 min-w-0 flex-1 text-[12px] text-subtle-foreground tabular-nums"
              >
                {index + 1} / {context.items.length}
                <span className="sr-only">: {media.alt}</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous image"
                className={controlClass}
                onClick={() => context.step(-1)}
              >
                <ChevronLeft size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next image"
                className={controlClass}
                onClick={() => context.step(1)}
              >
                <ChevronRight
                  size={14}
                  className="size-3.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Button>
              <DialogClose asChild>
                <Button
                  ref={closeRef}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close fullscreen"
                  className={controlClass}
                >
                  <X size={14} className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
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
      data-slot="product-gallery-thumbnails"
      className={cn(
        "-m-1 flex min-w-0 overflow-auto p-1 [grid-area:thumbs]",
        context.variant === "compact" ? "gap-1.5" : "gap-2",
        context.variant === "side" && "flex-col max-[560px]:flex-row",
        className,
      )}
      {...props}
      ref={ref}
      onKeyDown={handleKeyDown}
    />
  );
}

export function ProductGalleryItem({
  value,
  src,
  alt,
  onClick,
  className,
  ...props
}: Omit<ComponentProps<"button">, "value" | "children"> & ProductGalleryMedia) {
  const context = useGallery("ProductGalleryItem");
  const { register } = context;
  useIsomorphicLayoutEffect(() => register({ value, src, alt }), [value, src, alt]);
  const selected = context.value === value;
  const orphaned = !context.items.some((item) => item.value === context.value);
  const compact = context.variant === "compact";
  return (
    <Button
      variant="ghost"
      data-slot="product-gallery-item"
      aria-label={alt}
      className={cn(
        "block flex-none cursor-pointer overflow-hidden border-0 bg-muted p-0 opacity-62 shadow-[inset_0_0_0_1px_var(--border)] transition-[opacity,box-shadow,scale] duration-[120ms,160ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1),cubic-bezier(0.23,1,0.32,1)] hover:bg-muted hover:opacity-90 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring dark:hover:bg-muted active:scale-[0.97] aria-[current=true]:opacity-100 aria-[current=true]:shadow-[0_0_0_2px_var(--card),0_0_0_3.5px_var(--foreground)] motion-reduce:transition-none motion-reduce:active:scale-100",
        compact ? "size-12 rounded-lg" : "size-16 rounded-[10px]",
        className,
      )}
      {...props}
      type="button"
      data-gallery-item=""
      data-value={value}
      aria-current={selected || undefined}
      tabIndex={selected || orphaned ? 0 : -1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: registry source is framework-agnostic. */}
      <img src={src} alt="" draggable={false} className="block size-full object-cover" />
    </Button>
  );
}
