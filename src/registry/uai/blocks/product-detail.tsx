"use client";

import { cva } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import {
  type ComponentProps,
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
import { cn } from "@/lib/uai-utils";

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
const toneDot: Record<ProductDetailAvailabilityTone, string> = {
  available: "bg-success ring-success/18",
  low: "bg-warning ring-warning/18",
  unavailable: "bg-destructive ring-destructive/18",
};
const buttonClass =
  "inline-flex items-center justify-center rounded-full border-0 text-[13px] font-medium transition-[filter,background-color,transform] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:enabled:active:scale-100";

const productDetailVariants = cva(
  "@container box-border min-w-0 text-[13px]/[18px] text-foreground",
  {
    variants: {
      variant: {
        split: "",
        stacked: "mx-auto my-0 max-w-[640px]",
        compact: "",
      },
    },
  },
);
const layoutVariants = cva("grid min-w-0 items-start", {
  variants: {
    variant: {
      split: "gap-6 @min-[720px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @min-[720px]:gap-x-10",
      stacked: "gap-6",
      compact: "gap-4 @min-[560px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] @min-[560px]:gap-x-5",
    },
  },
});

/** Gallery, options, availability, price, delivery, and purchase actions for one product. */
export function ProductDetail({
  variant = "split",
  onAddToCart,
  children,
  className,
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
        data-slot="product-detail"
        data-variant={variant}
        className={cn(productDetailVariants({ variant }), className)}
        {...props}
      >
        <div className={layoutVariants({ variant })}>{children}</div>
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
      data-slot="product-detail-gallery"
      {...props}
      variant={galleryVariants[variant]}
    />
  );
}

export function ProductDetailInfo({ className, ...props }: ComponentProps<"div">) {
  const { variant } = useDetail("ProductDetailInfo");
  return (
    <div
      data-slot="product-detail-info"
      className={cn("grid min-w-0", variant === "compact" ? "gap-3.5" : "gap-5", className)}
      {...props}
    />
  );
}

export function ProductDetailHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="product-detail-header"
      className={cn("grid min-w-0 gap-1.5", className)}
      {...props}
    />
  );
}

export function ProductDetailEyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="product-detail-eyebrow"
      className={cn("m-0 text-xs/4 text-subtle-foreground", className)}
      {...props}
    />
  );
}

export function ProductDetailTitle({ className, ...props }: ComponentProps<"h2">) {
  const { id, variant } = useDetail("ProductDetailTitle");
  return (
    <h2
      data-slot="product-detail-title"
      className={cn(
        "m-0 font-semibold tracking-[-0.015em] text-balance",
        variant === "compact"
          ? "text-[18px]/[1.2]"
          : "text-[length:clamp(20px,2cqi_+_12px,26px)]/[1.2]",
        className,
      )}
      {...props}
      id={`${id}-title`}
    />
  );
}

/** Current price, with an optional compare-at price inside ProductDetailComparePrice. */
export function ProductDetailPrice({ className, ...props }: ComponentProps<"p">) {
  const { variant } = useDetail("ProductDetailPrice");
  return (
    <p
      data-slot="product-detail-price"
      className={cn(
        "m-0 flex flex-wrap items-baseline gap-2 font-medium tabular-nums",
        variant === "compact" ? "text-[16px]/[1.2]" : "text-[20px]/[1.2]",
        className,
      )}
      {...props}
    />
  );
}

export function ProductDetailComparePrice({ children, className, ...props }: ComponentProps<"s">) {
  return (
    <s
      data-slot="product-detail-compare-price"
      className={cn("text-[13px] font-normal text-subtle-foreground", className)}
      {...props}
    >
      <span className="sr-only">Was </span>
      {children}
    </s>
  );
}

export function ProductDetailDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="product-detail-description"
      className={cn("m-0 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The purchase form. Options and quantity inside it are submitted to onAddToCart. */
export function ProductDetailPurchase({ className, onSubmit, ...props }: ComponentProps<"form">) {
  const context = useDetail("ProductDetailPurchase");
  return (
    <form
      data-slot="product-detail-purchase"
      className={cn("grid min-w-0", context.variant === "compact" ? "gap-3" : "gap-4", className)}
      {...props}
      aria-busy={context.pending || undefined}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (!event.defaultPrevented) context.submit(event);
        else event.preventDefault();
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
  className,
  ...props
}: ProductDetailOptionProps) {
  useDetail("ProductDetailOption");
  const legendId = useId();
  return (
    <OptionContext.Provider value={{ name, legendId }}>
      <fieldset
        data-slot="product-detail-option"
        className={cn("m-0 grid min-w-0 gap-2 border-0 p-0", className)}
        {...props}
        onChange={(event) => {
          const target = event.target;
          if (target instanceof HTMLInputElement && target.name === name) {
            onValueChange?.(target.value);
          }
        }}
      >
        <legend id={legendId} className="mb-1.5 flex gap-1.5 p-0 font-medium">
          {label}
          {selection ? (
            <span className="font-normal text-subtle-foreground">{selection}</span>
          ) : null}
        </legend>
        <div className="flex flex-wrap gap-2">{children}</div>
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
  className,
  ...props
}: ProductDetailOptionValueProps) {
  const option = useOption("ProductDetailOptionValue");
  return (
    <label
      data-slot="product-detail-option-value"
      className={cn(
        "relative inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-full bg-secondary text-[13px] font-medium text-muted-foreground",
        "transition-[background-color,box-shadow,color] duration-120 ease-out hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] motion-reduce:transition-none",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
        "has-[input:checked]:bg-card has-[input:checked]:text-foreground has-[input:checked]:shadow-[inset_0_0_0_1.5px_var(--foreground)]",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-secondary has-[input:disabled]:line-through has-[input:disabled]:opacity-45",
        swatch ? "py-0 pr-3 pl-1.5" : "px-3 py-0",
        className,
      )}
    >
      <input
        {...props}
        type="radio"
        name={option.name}
        value={value}
        required
        className="absolute inset-0 m-0 cursor-[inherit] opacity-0"
      />
      {swatch ? (
        <span
          aria-hidden="true"
          className="size-5 rounded-full shadow-[0_0_0_1px_oklch(1_0_0/0.08),inset_0_0_0_1px_oklch(0_0_0/0.12)]"
          style={{ background: swatch }}
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
  className,
  ...props
}: ProductDetailAvailabilityProps) {
  return (
    <p
      role="status"
      data-slot="product-detail-availability"
      className={cn("m-0 flex items-center gap-2", className)}
      {...props}
      data-tone={tone}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 flex-none rounded-full ring-3", toneDot[tone])}
      />
      <span className="font-medium text-muted-foreground">{children}</span>
    </p>
  );
}

/** Quantity control for the purchase form. Compose QuantityPicker parts inside. */
export function ProductDetailQuantity(props: Omit<QuantityPickerProps, "variant">) {
  const { variant } = useDetail("ProductDetailQuantity");
  return (
    <QuantityPicker
      data-slot="product-detail-quantity"
      {...props}
      variant={quantityVariants[variant]}
    />
  );
}

export function ProductDetailActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="product-detail-actions"
      className={cn("flex flex-wrap items-end gap-2", className)}
      {...props}
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
  className,
  ...props
}: ProductDetailAddToCartProps) {
  const context = useDetail("ProductDetailAddToCart");
  const blocked = disabled || context.pending;
  return (
    <button
      data-slot="product-detail-add-to-cart"
      className={cn(
        buttonClass,
        "flex-[1_1_160px] gap-2 px-4.5 text-primary-foreground",
        context.variant === "compact" ? "h-8" : "h-10",
        blocked
          ? "cursor-not-allowed bg-[color-mix(in_oklab,var(--primary)_55%,var(--card))]"
          : "cursor-pointer bg-primary enabled:hover:brightness-108",
        className,
      )}
      {...props}
      type="submit"
      disabled={blocked}
      aria-busy={context.pending || undefined}
      data-kind="primary"
    >
      {context.pending ? (
        <>
          <LoaderCircle
            size={14}
            aria-hidden="true"
            className="animate-[spin_900ms_linear_infinite] motion-reduce:animate-none"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** A secondary action, such as saving the product for later. */
export function ProductDetailSecondaryAction({ className, ...props }: ComponentProps<"button">) {
  const { variant } = useDetail("ProductDetailSecondaryAction");
  return (
    <button
      type="button"
      data-slot="product-detail-secondary-action"
      className={cn(
        buttonClass,
        "cursor-pointer gap-1.5 bg-secondary px-4 text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]",
        variant === "compact" ? "h-8" : "h-10",
        className,
      )}
      {...props}
      data-kind="secondary"
    />
  );
}

/** Delivery and returns facts, rendered as a description list. */
export function ProductDetailDelivery({ className, ...props }: ComponentProps<"dl">) {
  const { variant } = useDetail("ProductDetailDelivery");
  return (
    <dl
      data-slot="product-detail-delivery"
      className={cn(
        "m-0 grid gap-0.5 bg-card p-1",
        variant === "compact" ? "rounded-xl" : "rounded-[14px]",
        className,
      )}
      {...props}
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
  className,
  ...props
}: ProductDetailDeliveryItemProps) {
  const { variant } = useDetail("ProductDetailDeliveryItem");
  return (
    <div
      data-slot="product-detail-delivery-item"
      className={cn(
        "grid gap-x-2.5 gap-y-0.5",
        icon ? "grid-cols-[20px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)]",
        variant === "compact" ? "rounded-lg px-2.5 py-2" : "rounded-[10px] px-3 py-2.5",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="row-span-2 pt-px text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <dt className="font-medium">{label}</dt>
      <dd className="m-0 text-[12.5px] text-muted-foreground">{children}</dd>
    </div>
  );
}
