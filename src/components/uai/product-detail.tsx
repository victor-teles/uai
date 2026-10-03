"use client";

import { LoaderCircle } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import {
  ProductGallery,
  type ProductGalleryProps,
  type ProductGalleryVariant,
} from "@/components/ui/uai/product-gallery";
import {
  QuantityPicker,
  type QuantityPickerProps,
  type QuantityPickerVariant,
} from "@/components/ui/uai/quantity-picker";

export const PRODUCT_DETAIL_VARIANTS = ["split", "stacked", "compact"] as const;
export type ProductDetailVariant = (typeof PRODUCT_DETAIL_VARIANTS)[number];
export type ProductDetailAvailabilityTone = "available" | "low" | "unavailable";
export type ProductDetailProps = ComponentProps<"section"> & {
  variant?: ProductDetailVariant;
  /**
   * Called with the purchase form data (selected options and quantity) when the shopper adds
   * the product. Return a promise to keep the action pending until the cart confirms.
   */
  onAddToCart?: (data: FormData) => void | Promise<void>;
};

type DetailContext = {
  id: string;
  variant: ProductDetailVariant;
  pending: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
};
const Context = createContext<DetailContext | null>(null);
function useDetail(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ProductDetail`);
  return context;
}
type OptionContext = { name: string; legendId: string };
const OptionContext = createContext<OptionContext | null>(null);
function useOption(part: string) {
  const context = useContext(OptionContext);
  if (!context) throw new Error(`${part} must be used within ProductDetailOption`);
  return context;
}

const layoutCss = `
[data-uai-product-detail-layout]{display:grid;gap:24px;align-items:start;min-width:0}
[data-uai-product-detail="compact"]>[data-uai-product-detail-layout]{gap:16px}
@container (min-width: 720px){
  [data-uai-product-detail="split"]>[data-uai-product-detail-layout]{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);column-gap:40px}
}
@container (min-width: 560px){
  [data-uai-product-detail="compact"]>[data-uai-product-detail-layout]{grid-template-columns:minmax(0,0.9fr) minmax(0,1fr);column-gap:20px}
}
.uai-product-detail-swatch{transition:background-color 120ms ease-out,box-shadow 120ms ease-out,color 120ms ease-out}
.uai-product-detail-swatch:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-product-detail-swatch:has(input:focus-visible){outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-product-detail-swatch:has(input:checked){box-shadow:inset 0 0 0 1.5px var(--uai-text);background:var(--uai-surface);color:var(--uai-text)}
.uai-product-detail-swatch:has(input:disabled){opacity:0.45;cursor:not-allowed;text-decoration:line-through;background:var(--uai-surface-raised)}
.uai-product-detail-button{transition:filter 120ms ease-out,background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-product-detail-button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-product-detail-button:active:not(:disabled){transform:scale(0.97)}
.uai-product-detail-button[data-kind="primary"]:hover:not(:disabled){filter:brightness(1.08)}
.uai-product-detail-button[data-kind="secondary"]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-product-detail-spin{animation:uai-product-detail-spin 900ms linear infinite}
@keyframes uai-product-detail-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.uai-product-detail-spin{animation:none}.uai-product-detail-swatch,.uai-product-detail-button{transition:none}.uai-product-detail-button:active:not(:disabled){transform:none}}
`;

const galleryVariants: Record<ProductDetailVariant, ProductGalleryVariant> = {
  split: "side",
  stacked: "stacked",
  compact: "compact",
};
const quantityVariants: Record<ProductDetailVariant, QuantityPickerVariant> = {
  split: "rounded",
  stacked: "pill",
  compact: "compact",
};
const toneColor: Record<ProductDetailAvailabilityTone, string> = {
  available: "var(--uai-success)",
  low: "var(--uai-warning)",
  unavailable: "var(--uai-danger)",
};

/** Gallery, options, availability, price, delivery, and purchase actions for one product. */
export function ProductDetail({
  variant = "split",
  onAddToCart,
  children,
  style,
  ...props
}: ProductDetailProps) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const result = onAddToCart?.(new FormData(event.currentTarget));
    if (!result) return;
    setPending(true);
    result.then(
      () => setPending(false),
      () => setPending(false),
    );
  };
  return (
    <Context.Provider value={{ id, variant, pending, submit }}>
      <section
        aria-labelledby={`${id}-title`}
        {...props}
        data-variant={variant}
        data-uai-product-detail={variant}
        style={{
          boxSizing: "border-box",
          containerType: "inline-size",
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...(variant === "stacked" ? { maxWidth: 640, margin: "0 auto" } : null),
          ...style,
        }}
      >
        <style>{layoutCss}</style>
        <div data-uai-product-detail-layout="">{children}</div>
      </section>
    </Context.Provider>
  );
}

/** Product media. Compose ProductGallery parts inside; the block picks the gallery layout. */
export function ProductDetailGallery({
  "aria-label": ariaLabel = "Product images",
  ...props
}: Omit<ProductGalleryProps, "variant">) {
  const { variant } = useDetail("ProductDetailGallery");
  return (
    <ProductGallery
      role="group"
      aria-label={ariaLabel}
      {...props}
      variant={galleryVariants[variant]}
    />
  );
}

export function ProductDetailInfo({ style, ...props }: ComponentProps<"div">) {
  const { variant } = useDetail("ProductDetailInfo");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: variant === "compact" ? 14 : 20,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export function ProductDetailHeader({ style, ...props }: ComponentProps<"header">) {
  return <header {...props} style={{ display: "grid", gap: 6, minWidth: 0, ...style }} />;
}

export function ProductDetailEyebrow({ style, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      style={{ margin: 0, color: "var(--uai-subtle)", fontSize: 12, lineHeight: "16px", ...style }}
    />
  );
}

export function ProductDetailTitle({ style, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useDetail("ProductDetailTitle");
  return (
    <h2
      {...props}
      id={`${id}-title`}
      style={{
        margin: 0,
        fontSize: variant === "compact" ? 18 : "clamp(20px, 2cqi + 12px, 26px)",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.015em",
        textWrap: "balance",
        ...style,
      }}
    />
  );
}

/** Current price, with an optional compare-at price inside ProductDetailComparePrice. */
export function ProductDetailPrice({ style, ...props }: ComponentProps<"p">) {
  const { variant } = useDetail("ProductDetailPrice");
  return (
    <p
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 8,
        margin: 0,
        fontSize: variant === "compact" ? 16 : 20,
        fontWeight: 500,
        lineHeight: 1.2,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    />
  );
}

export function ProductDetailComparePrice({ children, style, ...props }: ComponentProps<"s">) {
  return (
    <s {...props} style={{ color: "var(--uai-subtle)", fontSize: 13, fontWeight: 400, ...style }}>
      <span style={visuallyHidden}>Was </span>
      {children}
    </s>
  );
}

export function ProductDetailDescription({ style, ...props }: ComponentProps<"p">) {
  return (
    <p {...props} style={{ margin: 0, color: "var(--uai-muted)", textWrap: "pretty", ...style }} />
  );
}

/** The purchase form. Options and quantity inside it are submitted to onAddToCart. */
export function ProductDetailPurchase({ style, onSubmit, ...props }: ComponentProps<"form">) {
  const context = useDetail("ProductDetailPurchase");
  return (
    <form
      {...props}
      aria-busy={context.pending || undefined}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (!event.defaultPrevented) context.submit(event);
        else event.preventDefault();
      }}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 12 : 16,
        minWidth: 0,
        ...style,
      }}
    />
  );
}

export type ProductDetailOptionProps = Omit<ComponentProps<"fieldset">, "onChange"> & {
  /** Form field name submitted with the purchase. */
  name: string;
  /** The visible legend, for example "Color". */
  label: ReactNode;
  /** Optional current selection text shown beside the legend. */
  selection?: ReactNode;
  onValueChange?: (value: string) => void;
};

/** A required radio group for one product option, such as color or size. */
export function ProductDetailOption({
  name,
  label,
  selection,
  onValueChange,
  children,
  style,
  ...props
}: ProductDetailOptionProps) {
  useDetail("ProductDetailOption");
  const legendId = useId();
  return (
    <OptionContext.Provider value={{ name, legendId }}>
      <fieldset
        {...props}
        onChange={(event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement && target.name === name) {
            onValueChange?.(target.value);
          }
        }}
        style={{ display: "grid", gap: 8, minWidth: 0, margin: 0, padding: 0, border: 0, ...style }}
      >
        <legend
          id={legendId}
          style={{ display: "flex", gap: 6, padding: 0, marginBottom: 6, fontWeight: 500 }}
        >
          {label}
          {selection ? (
            <span style={{ color: "var(--uai-subtle)", fontWeight: 400 }}>{selection}</span>
          ) : null}
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
      </fieldset>
    </OptionContext.Provider>
  );
}

export type ProductDetailOptionValueProps = Omit<
  ComponentProps<"input">,
  "type" | "name" | "value" | "children"
> & {
  value: string;
  children: ReactNode;
  /** Optional swatch color shown before the label. */
  swatch?: string;
};

/** One choice inside ProductDetailOption. Disable sold-out values instead of hiding them. */
export function ProductDetailOptionValue({
  value,
  swatch,
  children,
  style,
  ...props
}: ProductDetailOptionValueProps) {
  const option = useOption("ProductDetailOptionValue");
  return (
    <label
      className="uai-product-detail-swatch"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        minHeight: 32,
        padding: swatch ? "0 12px 0 6px" : "0 12px",
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-muted)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        ...style,
      }}
    >
      <input
        {...props}
        type="radio"
        name={option.name}
        value={value}
        required
        style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, cursor: "inherit" }}
      />
      {swatch ? (
        <span
          aria-hidden="true"
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: swatch,
            boxShadow: "0 0 0 1px oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(0 0 0 / 0.12)",
          }}
        />
      ) : null}
      {children}
    </label>
  );
}

export type ProductDetailAvailabilityProps = ComponentProps<"p"> & {
  tone?: ProductDetailAvailabilityTone;
};

/** Stock status as text with a colored dot; the text carries the meaning. */
export function ProductDetailAvailability({
  tone = "available",
  children,
  style,
  ...props
}: ProductDetailAvailabilityProps) {
  return (
    <p
      role="status"
      {...props}
      data-tone={tone}
      style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, ...style }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          flex: "none",
          borderRadius: 999,
          background: toneColor[tone],
          boxShadow: `0 0 0 3px color-mix(in oklab, ${toneColor[tone]} 18%, transparent)`,
        }}
      />
      <span style={{ fontWeight: 500, color: "var(--uai-muted)" }}>{children}</span>
    </p>
  );
}

/** Quantity control for the purchase form. Compose QuantityPicker parts inside. */
export function ProductDetailQuantity(props: Omit<QuantityPickerProps, "variant">) {
  const { variant } = useDetail("ProductDetailQuantity");
  return <QuantityPicker {...props} variant={quantityVariants[variant]} />;
}

export function ProductDetailActions({ style, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 8, ...style }}
    />
  );
}

export type ProductDetailAddToCartProps = ComponentProps<"button"> & {
  /** Label while onAddToCart is pending. */
  pendingLabel?: ReactNode;
};

/** Submits the purchase form as the block's single accent-filled action. */
export function ProductDetailAddToCart({
  pendingLabel = "Adding…",
  children = "Add to cart",
  disabled,
  style,
  ...props
}: ProductDetailAddToCartProps) {
  const context = useDetail("ProductDetailAddToCart");
  const compact = context.variant === "compact";
  const blocked = disabled || context.pending;
  return (
    <button
      {...props}
      type="submit"
      disabled={blocked}
      aria-busy={context.pending || undefined}
      className={joinClass("uai-product-detail-button", props.className)}
      data-kind="primary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flex: "1 1 160px",
        height: compact ? 32 : 40,
        padding: "0 18px",
        border: 0,
        borderRadius: 999,
        background: blocked
          ? "color-mix(in oklab, var(--uai-accent) 55%, var(--uai-surface))"
          : "var(--uai-accent)",
        color: "var(--uai-accent-foreground)",
        fontSize: 13,
        fontWeight: 500,
        cursor: blocked ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {context.pending ? (
        <>
          <LoaderCircle size={14} aria-hidden="true" className="uai-product-detail-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** A secondary action, such as saving the product for later. */
export function ProductDetailSecondaryAction({ style, ...props }: ComponentProps<"button">) {
  const { variant } = useDetail("ProductDetailSecondaryAction");
  return (
    <button
      type="button"
      {...props}
      className={joinClass("uai-product-detail-button", props.className)}
      data-kind="secondary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: variant === "compact" ? 32 : 40,
        padding: "0 16px",
        border: 0,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    />
  );
}

/** Delivery and returns facts, rendered as a description list. */
export function ProductDetailDelivery({ style, ...props }: ComponentProps<"dl">) {
  const { variant } = useDetail("ProductDetailDelivery");
  return (
    <dl
      {...props}
      style={{
        display: "grid",
        gap: 2,
        margin: 0,
        padding: 4,
        borderRadius: variant === "compact" ? 12 : 14,
        background: "var(--uai-surface)",
        ...style,
      }}
    />
  );
}

export type ProductDetailDeliveryItemProps = ComponentProps<"div"> & {
  label: ReactNode;
  icon?: ReactNode;
};

export function ProductDetailDeliveryItem({
  label,
  icon,
  children,
  style,
  ...props
}: ProductDetailDeliveryItemProps) {
  const { variant } = useDetail("ProductDetailDeliveryItem");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: icon ? "20px minmax(0, 1fr)" : "minmax(0, 1fr)",
        columnGap: 10,
        rowGap: 2,
        padding: variant === "compact" ? "8px 10px" : "10px 12px",
        borderRadius: variant === "compact" ? 8 : 10,
        ...style,
      }}
    >
      {icon ? (
        <span
          aria-hidden="true"
          style={{ gridRow: "span 2", paddingTop: 1, color: "var(--uai-muted)" }}
        >
          {icon}
        </span>
      ) : null}
      <dt style={{ fontWeight: 500 }}>{label}</dt>
      <dd style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12.5 }}>{children}</dd>
    </div>
  );
}

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

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
