"use client";

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

const drawerCss = `
.uai-cart-drawer{position:fixed;max-height:none;overflow:hidden}
.uai-cart-drawer::backdrop{background:color-mix(in oklab,var(--uai-canvas) 55%,transparent);backdrop-filter:blur(2px)}
.uai-cart-drawer[data-variant=side][open],.uai-cart-drawer[data-variant=compact][open]{animation:uai-cart-drawer-side 220ms cubic-bezier(0.23,1,0.32,1)}
.uai-cart-drawer[data-variant=sheet][open]{animation:uai-cart-drawer-sheet 220ms cubic-bezier(0.23,1,0.32,1)}
@keyframes uai-cart-drawer-side{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes uai-cart-drawer-sheet{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.uai-cart-drawer-button{transition:background-color 120ms ease-out,color 120ms ease-out,filter 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-cart-drawer-button:focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
.uai-cart-drawer-button:active{transform:scale(0.97)}
.uai-cart-drawer-button[data-kind=primary]:hover{filter:brightness(1.08)}
.uai-cart-drawer-button[data-kind=secondary]:hover{background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text))}
.uai-cart-drawer-button[data-kind=ghost]:hover{background:var(--uai-surface-raised);color:var(--uai-text)}
@media (prefers-reduced-motion: reduce){.uai-cart-drawer[open]{animation:none}.uai-cart-drawer-button{transition:none}.uai-cart-drawer-button:active{transform:none}}
`;

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
      <div data-variant={variant} style={{ display: "contents" }}>
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
  style,
  ...props
}: CartDrawerTriggerProps) {
  const context = useDrawer("CartDrawerTrigger");
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={`${context.id}-drawer`}
      {...props}
      ref={context.triggerRef}
      className={joinClass("uai-cart-drawer-button", props.className)}
      data-kind="secondary"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(true);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 32,
        padding: "0 6px 0 12px",
        border: 0,
        borderRadius: 999,
        background: "var(--uai-surface-raised)",
        color: "var(--uai-text)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        ...style,
      }}
    >
      <ShoppingBag size={14} strokeWidth={1.75} aria-hidden="true" color="var(--uai-muted)" />
      {children}
      {count === undefined ? null : (
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            minWidth: 20,
            height: 20,
            padding: "0 6px",
            borderRadius: 999,
            background: "var(--uai-accent)",
            color: "var(--uai-accent-foreground)",
            fontSize: 11.5,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
          <span style={visuallyHidden}>{count === 1 ? " item" : " items"}</span>
        </span>
      )}
    </button>
  );
}

/**
 * The drawer: a native modal dialog. Focus moves to the close button (or an element marked
 * autofocus) when it opens and returns to the trigger when it closes. Escape and the backdrop close it.
 */
export function CartDrawerContent({
  children,
  style,
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
  const sheet = variant === "sheet";
  const compact = variant === "compact";
  return (
    <dialog
      aria-labelledby={`${context.id}-title`}
      {...props}
      id={`${context.id}-drawer`}
      ref={ref}
      data-variant={variant}
      className={["uai-cart-drawer", className].filter(Boolean).join(" ")}
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
      style={{
        boxSizing: "border-box",
        width: sheet ? "min(100%, 640px)" : compact ? "min(100%, 360px)" : "min(100%, 420px)",
        maxWidth: "100%",
        height: sheet ? "auto" : "100%",
        maxHeight: sheet ? "min(88dvh, 720px)" : "100dvh",
        margin: sheet ? "auto auto 0" : "0 0 0 auto",
        padding: 0,
        border: 0,
        borderRadius: sheet ? "24px 24px 0 0" : 0,
        background: "var(--uai-surface)",
        color: "var(--uai-text)",
        boxShadow: sheet
          ? "0 0 0 1px var(--uai-border), 0 -12px 32px -16px oklch(0 0 0 / 0.24)"
          : "0 0 0 1px var(--uai-border), -12px 0 32px -16px oklch(0 0 0 / 0.24)",
        fontSize: 13,
        lineHeight: "18px",
        ...style,
      }}
    >
      <style>{drawerCss}</style>
      {open ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            maxHeight: "inherit",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

function padding(variant: CartDrawerVariant) {
  return variant === "compact" ? 14 : 20;
}

export function CartDrawerHeader({ children, style, ...props }: ComponentProps<"header">) {
  const context = useDrawer("CartDrawerHeader");
  return (
    <header
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flex: "none",
        padding: `${padding(context.variant) - 4}px ${padding(context.variant) - 8}px ${padding(context.variant) - 4}px ${padding(context.variant)}px`,
        ...style,
      }}
    >
      {children}
    </header>
  );
}

export function CartDrawerTitle({ style, ...props }: ComponentProps<"h2">) {
  const context = useDrawer("CartDrawerTitle");
  return (
    <h2
      {...props}
      id={`${context.id}-title`}
      style={{
        margin: 0,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: "20px",
        letterSpacing: "-0.01em",
        ...style,
      }}
    />
  );
}

/** Closes the drawer. Receives focus when the drawer opens. */
export function CartDrawerClose({
  "aria-label": ariaLabel = "Close cart",
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useDrawer("CartDrawerClose");
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      {...props}
      ref={context.closeRef}
      className={joinClass("uai-cart-drawer-button", props.className)}
      data-kind="ghost"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
      style={{
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        flex: "none",
        border: 0,
        borderRadius: 8,
        background: "transparent",
        color: "var(--uai-muted)",
        cursor: "pointer",
        ...style,
      }}
    >
      <X size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/** Scrollable region that holds the cart lines and the empty state. */
export function CartDrawerBody({ style, ...props }: ComponentProps<"div">) {
  const context = useDrawer("CartDrawerBody");
  return (
    <div
      {...props}
      style={{
        display: "grid",
        alignContent: "start",
        gap: 16,
        flex: "1 1 auto",
        minHeight: 0,
        padding: padding(context.variant),
        overflowY: "auto",
        overscrollBehavior: "contain",
        ...style,
      }}
    />
  );
}

export function CartDrawerItems({
  "aria-label": ariaLabel = "Items in your cart",
  style,
  ...props
}: ComponentProps<"ul">) {
  const context = useDrawer("CartDrawerItems");
  return (
    <ul
      aria-label={ariaLabel}
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 8 : 18,
        margin: 0,
        padding: 0,
        listStyle: "none",
        ...style,
      }}
    />
  );
}

/** One cart line. Compose CartItem parts inside; the block picks the cart item style. */
export function CartDrawerItem({ style, ...props }: Omit<CartItemProps, "variant">) {
  const context = useDrawer("CartDrawerItem");
  return (
    <li style={{ minWidth: 0 }}>
      <CartItem {...props} variant={itemVariants[context.variant]} style={style} />
    </li>
  );
}

/** Quantity control for a cart line. Compose QuantityPicker parts inside. */
export function CartDrawerQuantity(props: Omit<QuantityPickerProps, "variant">) {
  useDrawer("CartDrawerQuantity");
  return <QuantityPicker {...props} variant="compact" />;
}

/** Pinned footer with the discount field, totals, and checkout actions. */
export function CartDrawerFooter({ style, ...props }: ComponentProps<"footer">) {
  const context = useDrawer("CartDrawerFooter");
  return (
    <footer
      {...props}
      style={{
        display: "grid",
        gap: context.variant === "compact" ? 10 : 14,
        flex: "none",
        padding: padding(context.variant),
        paddingBottom: `max(${padding(context.variant)}px, env(safe-area-inset-bottom))`,
        borderTop: "1px solid var(--uai-border)",
        background: "color-mix(in oklab, var(--uai-canvas) 35%, var(--uai-surface))",
        ...style,
      }}
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

export function CartDrawerActions({ style, ...props }: ComponentProps<"div">) {
  return <div {...props} style={{ display: "grid", gap: 8, ...style }} />;
}

/** The primary checkout link, filled with the accent color. */
export function CartDrawerCheckout({ style, className, ...props }: ComponentProps<"a">) {
  const context = useDrawer("CartDrawerCheckout");
  return (
    <a
      {...props}
      className={joinClass("uai-cart-drawer-button", className)}
      data-kind="primary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: context.variant === "compact" ? 32 : 40,
        padding: "0 16px",
        borderRadius: 999,
        background: "var(--uai-accent)",
        color: "var(--uai-accent-foreground)",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        ...style,
      }}
    />
  );
}

/** Closes the drawer and returns the shopper to the page. */
export function CartDrawerContinue({
  children = "Continue shopping",
  onClick,
  style,
  ...props
}: ComponentProps<"button">) {
  const context = useDrawer("CartDrawerContinue");
  return (
    <button
      type="button"
      {...props}
      className={joinClass("uai-cart-drawer-button", props.className)}
      data-kind="secondary"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
      style={{
        height: context.variant === "compact" ? 32 : 40,
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
    >
      {children}
    </button>
  );
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function joinClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}
