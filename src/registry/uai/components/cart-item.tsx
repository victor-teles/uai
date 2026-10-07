"use client";

import { cva } from "class-variance-authority";
import { LoaderCircle, Trash2 } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/uai-utils";

export const CART_ITEM_VARIANTS = ["card", "plain", "compact"] as const;
export const CART_ITEM_AVAILABILITY_TONES = ["available", "low", "unavailable"] as const;

export type CartItemVariant = (typeof CART_ITEM_VARIANTS)[number];
export type CartItemAvailabilityTone = (typeof CART_ITEM_AVAILABILITY_TONES)[number];

export type CartItemProps = ComponentProps<"article"> & {
  variant?: CartItemVariant;
};

// The line dims and stops taking input while its remove action is in flight.
const cartItemVariants = cva(
  "grid w-full items-start border-border/60 text-foreground transition-opacity duration-200 ease-out has-[[data-slot=cart-item-remove][aria-busy=true]]:pointer-events-none has-[[data-slot=cart-item-remove][aria-busy=true]]:opacity-55 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        card: "grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-[14px] border bg-card p-4 max-[420px]:grid-cols-[76px_minmax(0,1fr)]",
        plain:
          "grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-none border-b bg-transparent pb-4.5 max-[420px]:grid-cols-[76px_minmax(0,1fr)]",
        compact:
          "grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border bg-card p-3 max-[420px]:grid-cols-[68px_minmax(0,1fr)]",
      },
    },
  },
);

function cartItemChrome(variant: CartItemVariant) {
  const compact = variant === "compact";

  return {
    mediaClass: compact ? "rounded-lg" : "rounded-[10px]",
    titleClass: compact ? "text-[13px]/[18px]" : "text-sm/5",
    descriptionClass: compact ? "mt-0.5 text-[11.5px]/4" : "mt-0.5 text-[12.5px]/[18px]",
    priceClass: compact ? "text-[13px]/[18px]" : "text-sm/5",
    optionsClass: compact ? "mt-2 gap-1" : "mt-2.5 gap-1.5",
    optionClass: compact ? "h-5 px-1.5 text-[11px]" : "h-5.5 px-2 text-[11.5px]",
    availabilityClass: compact ? "mt-2 px-1.5 text-[11px]/4" : "mt-2.5 px-2 text-[11.5px]/4",
    actionsClass: compact ? "mt-3 gap-2.5" : "mt-4 gap-3",
    removeClass: compact
      ? "h-7 px-2.5 text-[12px] has-[>svg]:px-2.5"
      : "h-8 px-3 text-[12.5px] has-[>svg]:px-3",
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
  "aria-labelledby": ariaLabelledby,
  ...props
}: CartItemProps) {
  const titleId = useId();
  const chrome = cartItemChrome(variant);

  return (
    <CartItemContext.Provider value={{ titleId, chrome }}>
      <article
        data-slot="cart-item"
        data-variant={variant}
        className={cn(cartItemVariants({ variant }), className)}
        {...props}
        aria-labelledby={ariaLabelledby ?? titleId}
      >
        {children}
      </article>
    </CartItemContext.Provider>
  );
}

export type CartItemMediaProps = ComponentProps<"div">;

export function CartItemMedia({ children, className, ...props }: CartItemMediaProps) {
  const context = useCartItem("CartItemMedia");

  return (
    <div
      data-slot="cart-item-media"
      className={cn(
        "relative aspect-square min-w-0 overflow-hidden bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_8%,transparent)] after:content-[''] [&>img]:size-full [&>img]:object-cover",
        context.chrome.mediaClass,
        className,
      )}
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
    <div data-slot="cart-item-content" className={cn("min-w-0", className)} {...props}>
      {children}
    </div>
  );
}

export type CartItemHeaderProps = ComponentProps<"header">;

export function CartItemHeader({ children, className, ...props }: CartItemHeaderProps) {
  useCartItem("CartItemHeader");

  return (
    <header
      data-slot="cart-item-header"
      className={cn("flex min-w-0 items-start justify-between gap-3", className)}
      {...props}
    >
      {children}
    </header>
  );
}

export type CartItemTitleProps = ComponentProps<"h2">;

export function CartItemTitle({ children, className, ...props }: CartItemTitleProps) {
  const context = useCartItem("CartItemTitle");

  return (
    <h2
      data-slot="cart-item-title"
      className={cn(
        "font-medium tracking-[-0.01em] wrap-anywhere",
        context.chrome.titleClass,
        className,
      )}
      {...props}
      id={context.titleId}
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
      data-slot="cart-item-description"
      className={cn(
        "text-muted-foreground wrap-anywhere",
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
      data-slot="cart-item-price"
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
      data-slot="cart-item-options"
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
      data-slot="cart-item-option"
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-[6px] bg-muted",
        context.chrome.optionClass,
        className,
      )}
      {...props}
    >
      <dt className="text-subtle-foreground">{label}</dt>
      <dd className="min-w-0 font-medium text-foreground wrap-anywhere">{children}</dd>
    </div>
  );
}

export type CartItemAvailabilityProps = ComponentProps<"p"> & {
  tone?: CartItemAvailabilityTone;
};

const availabilityToneClass: Record<CartItemAvailabilityTone, string> = {
  available: "bg-success/14 text-success",
  low: "bg-warning/14 text-warning",
  unavailable: "bg-destructive/14 text-destructive",
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
      data-slot="cart-item-availability"
      className={cn(
        "flex w-fit max-w-full items-center gap-1.5 rounded-full py-0.5 font-medium wrap-anywhere before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
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
      data-slot="cart-item-actions"
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
    <Button
      data-slot="cart-item-remove"
      variant="ghost"
      size="sm"
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium text-muted-foreground transition-[scale,color,background-color] duration-140 ease-out-quint hover:bg-destructive/12 hover:text-destructive focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-destructive/12",
        context.chrome.removeClass,
        className,
      )}
      {...props}
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
    </Button>
  );
}
