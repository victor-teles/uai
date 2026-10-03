"use client";

import { cva } from "class-variance-authority";
import { ShoppingBag, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CartItem, type CartItemProps, type CartItemVariant } from "@/components/ui/uai/cart-item";
import {
  CouponField,
  type CouponFieldProps,
  type CouponFieldVariant,
} from "@/components/ui/uai/coupon-field";
import {
  PriceSummary,
  type PriceSummaryProps,
  type PriceSummaryVariant,
} from "@/components/ui/uai/price-summary";
import { QuantityPicker, type QuantityPickerProps } from "@/components/ui/uai/quantity-picker";
import { cn } from "@/lib/uai-utils";

export const CART_DRAWER_VARIANTS = ["side", "sheet", "compact"] as const;
export type CartDrawerVariant = (typeof CART_DRAWER_VARIANTS)[number];
export type CartDrawerProps = {
  variant?: CartDrawerVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

type DrawerContext = {
  id: string;
  variant: CartDrawerVariant;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  closeRef: RefObject<HTMLButtonElement | null>;
};
const Context = createContext<DrawerContext | null>(null);
function useDrawer(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CartDrawer`);
  return context;
}

const buttonBase =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,filter_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const secondaryButton =
  "cursor-pointer rounded-full border-0 bg-secondary text-[13px] font-medium text-foreground hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))]";

const itemVariants: Record<CartDrawerVariant, CartItemVariant> = {
  side: "plain",
  sheet: "plain",
  compact: "compact",
};
const couponVariants: Record<CartDrawerVariant, CouponFieldVariant> = {
  side: "rounded",
  sheet: "pill",
  compact: "compact",
};
const summaryVariants: Record<CartDrawerVariant, PriceSummaryVariant> = {
  side: "plain",
  sheet: "plain",
  compact: "compact",
};

/** Cart review in a modal drawer: items, quantities, discounts, totals, and checkout actions. */
export function CartDrawer({
  variant = "side",
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: CartDrawerProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = open ?? internal;
  const setOpen = (next: boolean) => {
    if (next === current) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  return (
    <Context.Provider value={{ id, variant, open: current, setOpen, triggerRef, closeRef }}>
      <div data-slot="cart-drawer" data-variant={variant} className="contents">
        {children}
      </div>
    </Context.Provider>
  );
}

export type CartDrawerTriggerProps = ComponentProps<"button"> & {
  /** Item count shown in the badge and included in the accessible name. */
  count?: number;
};

/** Opens the drawer. The item count is part of the button's accessible name. */
export function CartDrawerTrigger({
  count,
  children = "Cart",
  onClick,
  className,
  ...props
}: CartDrawerTriggerProps) {
  const context = useDrawer("CartDrawerTrigger");
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={`${context.id}-drawer`}
      data-slot="cart-drawer-trigger"
      className={cn(
        buttonBase,
        secondaryButton,
        "inline-flex h-8 items-center gap-2 pr-1.5 pl-3",
        className,
      )}
      {...props}
      ref={context.triggerRef}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(true);
      }}
    >
      <ShoppingBag
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className="text-muted-foreground"
      />
      {children}
      {count === undefined ? null : (
        <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11.5px] font-medium text-primary-foreground tabular-nums">
          {count}
          <span className="sr-only">{count === 1 ? " item" : " items"}</span>
        </span>
      )}
    </button>
  );
}

const cartDrawerContentVariants = cva(
  "fixed box-border max-w-full overflow-hidden border-0 bg-popover p-0 text-[13px]/[18px] text-popover-foreground duration-220 ease-out-quint fade-in-0 backdrop:bg-background/55 backdrop:backdrop-blur-[2px] open:animate-in motion-reduce:open:animate-none",
  {
    variants: {
      variant: {
        side: "m-0 ml-auto h-full max-h-dvh w-[min(100%,420px)] rounded-none shadow-[0_0_0_1px_var(--border),-12px_0_32px_-16px_oklch(0_0_0/0.24)] slide-in-from-right-6",
        sheet:
          "mx-auto mt-auto mb-0 h-auto max-h-[min(88dvh,720px)] w-[min(100%,640px)] rounded-t-3xl rounded-b-none shadow-[0_0_0_1px_var(--border),0_-12px_32px_-16px_oklch(0_0_0/0.24)] slide-in-from-bottom-6",
        compact:
          "m-0 ml-auto h-full max-h-dvh w-[min(100%,360px)] rounded-none shadow-[0_0_0_1px_var(--border),-12px_0_32px_-16px_oklch(0_0_0/0.24)] slide-in-from-right-6",
      },
    },
  },
);

/**
 * The drawer: a native modal dialog. Focus moves to the close button (or an element marked
 * autofocus) when it opens and returns to the trigger when it closes. Escape and the backdrop close it.
 */
export function CartDrawerContent({
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}: Omit<ComponentProps<"dialog">, "open">) {
  const context = useDrawer("CartDrawerContent");
  const ref = useRef<HTMLDialogElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const { open, closeRef, triggerRef, variant } = context;
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const active = document.activeElement;
      returnRef.current =
        active instanceof HTMLElement && active !== document.body ? active : triggerRef.current;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      const preferred = dialog.querySelector<HTMLElement>("[autofocus], [data-autofocus]");
      (preferred ?? closeRef.current)?.focus();
    }
    if (!open && dialog.open) {
      dialog.close();
      (returnRef.current ?? triggerRef.current)?.focus();
    }
  }, [open, closeRef, triggerRef]);
  return (
    <dialog
      aria-labelledby={`${context.id}-title`}
      data-slot="cart-drawer-content"
      className={cn(cartDrawerContentVariants({ variant }), className)}
      {...props}
      id={`${context.id}-drawer`}
      ref={ref}
      data-variant={variant}
      onCancel={(event) => {
        event.preventDefault();
        context.setOpen(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && event.target === event.currentTarget) {
          context.setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape") {
          event.preventDefault();
          context.setOpen(false);
        }
      }}
    >
      {open ? <div className="flex h-full max-h-[inherit] min-h-0 flex-col">{children}</div> : null}
    </dialog>
  );
}

export function CartDrawerHeader({ children, className, ...props }: ComponentProps<"header">) {
  const context = useDrawer("CartDrawerHeader");
  return (
    <header
      data-slot="cart-drawer-header"
      className={cn(
        "flex flex-none items-center justify-between gap-3",
        context.variant === "compact" ? "py-2.5 pr-1.5 pl-3.5" : "py-4 pr-3 pl-5",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export function CartDrawerTitle({ className, ...props }: ComponentProps<"h2">) {
  const context = useDrawer("CartDrawerTitle");
  return (
    <h2
      data-slot="cart-drawer-title"
      className={cn("m-0 text-[15px]/5 font-semibold tracking-[-0.01em]", className)}
      {...props}
      id={`${context.id}-title`}
    />
  );
}

/** Closes the drawer. Receives focus when the drawer opens. */
export function CartDrawerClose({
  "aria-label": ariaLabel = "Close cart",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useDrawer("CartDrawerClose");
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-slot="cart-drawer-close"
      className={cn(
        buttonBase,
        "grid size-7 flex-none cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
      {...props}
      ref={context.closeRef}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    >
      <X size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/** Scrollable region that holds the cart lines and the empty state. */
export function CartDrawerBody({ className, ...props }: ComponentProps<"div">) {
  const context = useDrawer("CartDrawerBody");
  return (
    <div
      data-slot="cart-drawer-body"
      className={cn(
        "grid min-h-0 flex-[1_1_auto] content-start gap-4 overflow-y-auto overscroll-contain",
        context.variant === "compact" ? "p-3.5" : "p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CartDrawerItems({
  "aria-label": ariaLabel = "Items in your cart",
  className,
  ...props
}: ComponentProps<"ul">) {
  const context = useDrawer("CartDrawerItems");
  return (
    <ul
      aria-label={ariaLabel}
      data-slot="cart-drawer-items"
      className={cn(
        "m-0 grid list-none p-0",
        context.variant === "compact" ? "gap-2" : "gap-4.5",
        className,
      )}
      {...props}
    />
  );
}

/** One cart line. Compose CartItem parts inside; the block picks the cart item style. */
export function CartDrawerItem(props: Omit<CartItemProps, "variant">) {
  const context = useDrawer("CartDrawerItem");
  return (
    <li data-slot="cart-drawer-item" className="min-w-0">
      <CartItem {...props} variant={itemVariants[context.variant]} />
    </li>
  );
}

/** Quantity control for a cart line. Compose QuantityPicker parts inside. */
export function CartDrawerQuantity(props: Omit<QuantityPickerProps, "variant">) {
  useDrawer("CartDrawerQuantity");
  return <QuantityPicker {...props} variant="compact" />;
}

/** Pinned footer with the discount field, totals, and checkout actions. */
export function CartDrawerFooter({ className, ...props }: ComponentProps<"footer">) {
  const context = useDrawer("CartDrawerFooter");
  const compact = context.variant === "compact";
  return (
    <footer
      data-slot="cart-drawer-footer"
      className={cn(
        "grid flex-none border-t bg-[color-mix(in_oklab,var(--background)_35%,var(--card))]",
        compact
          ? "gap-2.5 p-3.5 pb-[max(14px,env(safe-area-inset-bottom))]"
          : "gap-3.5 p-5 pb-[max(20px,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  );
}

/** Discount code. Compose CouponField parts inside; the block picks the field style. */
export function CartDrawerDiscount(props: Omit<CouponFieldProps, "variant">) {
  const context = useDrawer("CartDrawerDiscount");
  return <CouponField {...props} variant={couponVariants[context.variant]} />;
}

/** Totals. Compose PriceSummary parts inside; the block picks the summary style. */
export function CartDrawerSummary(props: Omit<PriceSummaryProps, "variant">) {
  const context = useDrawer("CartDrawerSummary");
  return <PriceSummary {...props} variant={summaryVariants[context.variant]} />;
}

export function CartDrawerActions({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="cart-drawer-actions" className={cn("grid gap-2", className)} {...props} />;
}

/** The primary checkout link, filled with the accent color. */
export function CartDrawerCheckout({ className, ...props }: ComponentProps<"a">) {
  const context = useDrawer("CartDrawerCheckout");
  return (
    <a
      data-slot="cart-drawer-checkout"
      className={cn(
        buttonBase,
        "inline-flex items-center justify-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground no-underline hover:brightness-108",
        context.variant === "compact" ? "h-8" : "h-10",
        className,
      )}
      {...props}
    />
  );
}

/** Closes the drawer and returns the shopper to the page. */
export function CartDrawerContinue({
  children = "Continue shopping",
  onClick,
  className,
  ...props
}: ComponentProps<"button">) {
  const context = useDrawer("CartDrawerContinue");
  return (
    <button
      type="button"
      data-slot="cart-drawer-continue"
      className={cn(
        buttonBase,
        secondaryButton,
        "px-4",
        context.variant === "compact" ? "h-8" : "h-10",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
