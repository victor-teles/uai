"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";

import { cn } from "@/lib/uai-utils";

export const CART_ITEM_VARIANTS = ["card", "plain", "compact"] as const;
export const CART_ITEM_AVAILABILITY_TONES = ["available", "low", "unavailable"] as const;

export type CartItemVariant = (typeof CART_ITEM_VARIANTS)[number];
export type CartItemAvailabilityTone = (typeof CART_ITEM_AVAILABILITY_TONES)[number];

export type CartItemProps = ComponentProps<"article"> & {
  variant?: CartItemVariant;
};

function cartItemChrome(variant: CartItemVariant) {
  const compact = variant === "compact";
  const rootStyle =
    variant === "plain"
      ? { borderRadius: 0, paddingBottom: 18 }
      : { borderRadius: compact ? 12 : 14, padding: compact ? 12 : 16 };

  return {
    rootClass:
      variant === "plain"
        ? "grid-cols-[88px_minmax(0,1fr)] border-b border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] bg-transparent max-[420px]:grid-cols-[76px_minmax(0,1fr)]"
        : compact
          ? "grid-cols-[72px_minmax(0,1fr)] border border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] bg-[var(--uai-surface)] max-[420px]:grid-cols-[68px_minmax(0,1fr)]"
          : "grid-cols-[96px_minmax(0,1fr)] border border-[color-mix(in_oklab,var(--uai-border)_60%,transparent)] bg-[var(--uai-surface)] max-[420px]:grid-cols-[76px_minmax(0,1fr)]",
    rootStyle,
    gapClass: compact ? "gap-3" : "gap-4",
    mediaRadius: compact ? 8 : 10,
    titleClass: compact ? "text-[13px] leading-[18px]" : "text-[14px] leading-5",
    descriptionClass: compact
      ? "mt-0.5 text-[11.5px] leading-4"
      : "mt-0.5 text-[12.5px] leading-[18px]",
    priceClass: compact ? "text-[13px] leading-[18px]" : "text-[14px] leading-5",
    optionsClass: compact ? "mt-2 gap-1" : "mt-2.5 gap-1.5",
    optionClass: compact ? "h-5 px-1.5 text-[11px]" : "h-[22px] px-2 text-[11.5px]",
    availabilityClass: compact ? "mt-2 px-1.5 text-[11px]" : "mt-2.5 px-2 text-[11.5px]",
    actionsClass: compact ? "mt-3 gap-2.5" : "mt-4 gap-3",
    removeClass: compact ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[12.5px]",
  };
}

type CartItemContextValue = {
  titleId: string;
  chrome: ReturnType<typeof cartItemChrome>;
};

const CartItemContext = createContext<CartItemContextValue | null>(null);

function useCartItem(name: string) {
  const context = useContext(CartItemContext);
  if (!context) throw new Error(`${name} must be used within CartItem`);
  return context;
}

export function CartItem({
  variant = "card",
  children,
  className,
  style,
  "aria-labelledby": ariaLabelledby,
  ...props
}: CartItemProps) {
  const titleId = useId();
  const chrome = cartItemChrome(variant);

  return (
    <CartItemContext.Provider value={{ titleId, chrome }}>
      <article
        {...props}
        className={cn(
          "grid w-full items-start text-[var(--uai-text)]",
          chrome.rootClass,
          chrome.gapClass,
          className,
        )}
        style={{ ...chrome.rootStyle, ...style }}
        data-variant={variant}
        aria-labelledby={ariaLabelledby ?? titleId}
      >
        {children}
      </article>
    </CartItemContext.Provider>
  );
}

export type CartItemMediaProps = ComponentProps<"div">;

export function CartItemMedia({ children, className, style, ...props }: CartItemMediaProps) {
  const context = useCartItem("CartItemMedia");

  return (
    <div
      className={cn(
        "relative aspect-square min-w-0 overflow-hidden bg-[var(--uai-surface-raised)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--uai-text)_8%,transparent)] after:content-[''] [&>img]:size-full [&>img]:object-cover",
        className,
      )}
      style={{ borderRadius: context.chrome.mediaRadius, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export type CartItemContentProps = ComponentProps<"div">;

export function CartItemContent({ children, className, ...props }: CartItemContentProps) {
  useCartItem("CartItemContent");

  return (
    <div className={cn("min-w-0", className)} {...props}>
      {children}
    </div>
  );
}

export type CartItemHeaderProps = ComponentProps<"header">;

export function CartItemHeader({ children, className, ...props }: CartItemHeaderProps) {
  useCartItem("CartItemHeader");

  return (
    <header className={cn("flex min-w-0 items-start justify-between gap-3", className)} {...props}>
      {children}
    </header>
  );
}

export type CartItemTitleProps = ComponentProps<"h2">;

export function CartItemTitle({ children, className, ...props }: CartItemTitleProps) {
  const context = useCartItem("CartItemTitle");

  return (
    <h2
      id={context.titleId}
      className={cn(
        "font-medium tracking-[-0.01em] [overflow-wrap:anywhere]",
        context.chrome.titleClass,
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export type CartItemDescriptionProps = ComponentProps<"p">;

export function CartItemDescription({ children, className, ...props }: CartItemDescriptionProps) {
  const context = useCartItem("CartItemDescription");

  return (
    <p
      className={cn(
        "text-[var(--uai-muted)] [overflow-wrap:anywhere]",
        context.chrome.descriptionClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type CartItemPriceProps = ComponentProps<"p">;

export function CartItemPrice({ children, className, ...props }: CartItemPriceProps) {
  const context = useCartItem("CartItemPrice");

  return (
    <p
      className={cn(
        "shrink-0 text-right font-medium tracking-[-0.01em] tabular-nums",
        context.chrome.priceClass,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type CartItemOptionsProps = ComponentProps<"dl">;

export function CartItemOptions({ children, className, ...props }: CartItemOptionsProps) {
  const context = useCartItem("CartItemOptions");

  return (
    <dl
      className={cn("flex min-w-0 flex-wrap leading-4", context.chrome.optionsClass, className)}
      {...props}
    >
      {children}
    </dl>
  );
}

export type CartItemOptionProps = ComponentProps<"div"> & {
  label: ReactNode;
};

export function CartItemOption({ label, children, className, ...props }: CartItemOptionProps) {
  const context = useCartItem("CartItemOption");

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-[6px] bg-[var(--uai-surface-raised)]",
        context.chrome.optionClass,
        className,
      )}
      {...props}
    >
      <dt className="text-[var(--uai-subtle)]">{label}</dt>
      <dd className="min-w-0 font-medium text-[var(--uai-text)] [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

export type CartItemAvailabilityProps = ComponentProps<"p"> & {
  tone?: CartItemAvailabilityTone;
};

const availabilityToneClass: Record<CartItemAvailabilityTone, string> = {
  available:
    "bg-[color-mix(in_oklab,var(--uai-success)_14%,transparent)] text-[var(--uai-success)]",
  low: "bg-[color-mix(in_oklab,var(--uai-warning)_14%,transparent)] text-[var(--uai-warning)]",
  unavailable:
    "bg-[color-mix(in_oklab,var(--uai-danger)_14%,transparent)] text-[var(--uai-danger)]",
};

export function CartItemAvailability({
  tone = "available",
  children,
  className,
  ...props
}: CartItemAvailabilityProps) {
  const context = useCartItem("CartItemAvailability");

  return (
    <p
      className={cn(
        "flex w-fit max-w-full items-center gap-1.5 rounded-full py-0.5 leading-4 font-medium [overflow-wrap:anywhere] before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
        context.chrome.availabilityClass,
        availabilityToneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export type CartItemActionsProps = ComponentProps<"footer">;

export function CartItemActions({ children, className, ...props }: CartItemActionsProps) {
  const context = useCartItem("CartItemActions");

  return (
    <footer
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between",
        context.chrome.actionsClass,
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

export type CartItemRemoveProps = ComponentProps<"button"> & {
  removing?: boolean;
  removingLabel?: ReactNode;
};

export function CartItemRemove({
  removing = false,
  removingLabel = "Removing…",
  children = "Remove",
  className,
  disabled,
  type = "button",
  ...props
}: CartItemRemoveProps) {
  const context = useCartItem("CartItemRemove");

  return (
    <button
      {...props}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium text-[var(--uai-muted)] transition-[transform,color,background-color] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--uai-danger)_12%,transparent)] hover:text-[var(--uai-danger)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uai-accent)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
        context.chrome.removeClass,
        className,
      )}
      disabled={disabled || removing}
      aria-busy={removing || undefined}
    >
      {removing ? (
        <LoaderCircle
          className="size-3.5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      )}
      <span>{removing ? removingLabel : children}</span>
    </button>
  );
}
