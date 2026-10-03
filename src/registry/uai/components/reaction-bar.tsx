"use client";

import { cva } from "class-variance-authority";
import { SmilePlus } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/uai-utils";

export const REACTION_BAR_VARIANTS = ["pill", "outlined", "compact"] as const;
export type ReactionBarVariant = (typeof REACTION_BAR_VARIANTS)[number];
export type ReactionBarProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: ReactionBarVariant;
  /** Reactions selected by the current person. */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
};
type ReactionContext = {
  id: string;
  variant: ReactionBarVariant;
  selected: readonly string[];
  disabled: boolean;
  toggle: (value: string) => void;
};
const Context = createContext<ReactionContext | null>(null);
function useReactions(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within ReactionBar`);
  return context;
}
type PickerContext = { close: (restoreFocus: boolean) => void };
const PickerContextValue = createContext<PickerContext | null>(null);
function usePicker(part: string) {
  const context = useContext(PickerContextValue);
  if (!context) throw new Error(`${part} must be used within ReactionBarPicker`);
  return context;
}
const transitionChip =
  "[transition:background-color_120ms_ease-out,color_120ms_ease-out,box-shadow_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";

const reactionBarVariants = cva(
  "flex min-w-0 flex-wrap items-center text-[13px]/[18px] text-foreground",
  { variants: { variant: { pill: "gap-1.5", outlined: "gap-1.5", compact: "gap-1" } } },
);

const reactionBarItemVariants = cva(
  `group/reaction-item inline-flex cursor-pointer items-center rounded-full border-0 bg-secondary font-medium text-muted-foreground tabular-nums shadow-none ${transitionChip} enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] enabled:hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:enabled:active:scale-100 aria-pressed:bg-primary/14 aria-pressed:text-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] aria-pressed:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_42%,transparent)] aria-pressed:enabled:hover:bg-primary/20 aria-pressed:enabled:hover:text-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] aria-pressed:enabled:hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_55%,transparent)]`,
  {
    variants: {
      variant: {
        pill: "h-7 gap-1.5 px-2.5 text-[12.5px]",
        outlined:
          "h-7 gap-1.5 bg-transparent px-2.5 text-[12.5px] shadow-[inset_0_0_0_1px_var(--border)] enabled:hover:bg-accent enabled:hover:shadow-[inset_0_0_0_1px_var(--border-strong)]",
        compact: "h-5.5 gap-1 px-[7px] text-[11.5px]",
      },
    },
  },
);

function reducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ReactionBar({
  variant = "pill",
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
  "aria-label": label = "Reactions",
  className,
  children,
  ...props
}: ReactionBarProps) {
  const id = useId();
  const [internal, setInternal] = useState<readonly string[]>(defaultValue);
  const selected = value ?? internal;
  const toggle = (reaction: string) => {
    if (disabled) return;
    const updated = selected.includes(reaction)
      ? selected.filter((item) => item !== reaction)
      : [...selected, reaction];
    if (value === undefined) setInternal(updated);
    onValueChange?.(updated);
  };
  return (
    <Context.Provider value={{ id, variant, selected, disabled, toggle }}>
      {/* biome-ignore lint/a11y/useSemanticElements: a labelled group of toggle buttons, not a fieldset. */}
      <div
        data-slot="reaction-bar"
        role="group"
        aria-label={label}
        className={cn(reactionBarVariants({ variant }), className)}
        {...props}
        data-variant={variant}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export type ReactionBarItemProps = Omit<ComponentProps<"button">, "value" | "children"> & {
  value: string;
  /** The emoji or icon shown in the button. */
  emoji: React.ReactNode;
  /** Spoken name, for example "Thumbs up". */
  label: string;
  /** Total count, including the current person's reaction. */
  count: number;
};
export function ReactionBarItem({
  value,
  emoji,
  label,
  count,
  onClick,
  className,
  ...props
}: ReactionBarItemProps) {
  const context = useReactions("ReactionBarItem");
  const pressed = context.selected.includes(value);
  const compact = context.variant === "compact";
  return (
    <button
      data-slot="reaction-bar-item"
      type="button"
      className={cn(reactionBarItemVariants({ variant: context.variant }), className)}
      {...props}
      aria-pressed={pressed}
      aria-label={`${label}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
      disabled={context.disabled || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggle(value);
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block group-aria-pressed/reaction-item:animate-in group-aria-pressed/reaction-item:zoom-in-70 group-aria-pressed/reaction-item:duration-260 group-aria-pressed/reaction-item:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none!",
          compact ? "text-[12px]/none" : "text-[14px]/none",
        )}
      >
        {emoji}
      </span>
      <span aria-hidden="true">{count}</span>
    </button>
  );
}

function menuItems(menu: HTMLElement | null) {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [],
  );
}

export function ReactionBarPicker({
  "aria-label": label = "Add reaction",
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  const context = useReactions("ReactionBarPicker");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<"first" | "last">("first");
  const compact = context.variant === "compact";
  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const items = menuItems(menuRef.current);
    (focusTarget.current === "last" ? items.at(-1) : items[0])?.focus();
    if (!reducedMotion())
      menuRef.current?.animate?.(
        [
          { opacity: 0, transform: "scale(0.96)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);
  const openMenu = (target: "first" | "last") => {
    focusTarget.current = target;
    setOpen(true);
  };
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems(menuRef.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (next: number) => {
      event.preventDefault();
      items[(next + items.length) % items.length]?.focus();
    };
    if (event.key === "ArrowDown" || event.key === "ArrowRight") move(index + 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
    else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") close(false);
  };
  return (
    <PickerContextValue.Provider value={{ close }}>
      <div
        ref={rootRef}
        data-slot="reaction-bar-picker"
        className={cn("relative inline-flex", className)}
        {...props}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? `${context.id}-picker` : undefined}
          disabled={context.disabled}
          onClick={() => (open ? close(false) : openMenu("first"))}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openMenu(event.key === "ArrowUp" ? "last" : "first");
            }
          }}
          className={cn(
            "grid cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-muted-foreground [transition:background-color_120ms_ease-out,color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] enabled:hover:bg-accent enabled:hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.94] aria-expanded:bg-accent aria-expanded:text-accent-foreground motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
            compact ? "size-5.5" : "size-7",
          )}
        >
          <SmilePlus size={compact ? 13 : 15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        {open && (
          <div
            ref={menuRef}
            id={`${context.id}-picker`}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            className="absolute start-0 top-[calc(100%+6px)] z-20 flex origin-top-left gap-0.5 rounded-[14px] bg-popover p-1 text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)]"
          >
            {children}
          </div>
        )}
      </div>
    </PickerContextValue.Provider>
  );
}

export type ReactionBarPickerOptionProps = Omit<ComponentProps<"button">, "value" | "children"> & {
  value: string;
  emoji: React.ReactNode;
  label: string;
};
export function ReactionBarPickerOption({
  value,
  emoji,
  label,
  onClick,
  className,
  ...props
}: ReactionBarPickerOptionProps) {
  const context = useReactions("ReactionBarPickerOption");
  const picker = usePicker("ReactionBarPickerOption");
  const checked = context.selected.includes(value);
  return (
    <button
      data-slot="reaction-bar-picker-option"
      type="button"
      className={cn(
        "group/reaction-option grid size-8 cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent p-0 text-[16px]/none [transition:background-color_120ms_ease-out,scale_140ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-accent focus-visible:bg-accent focus-visible:outline-none enabled:active:scale-[0.94] aria-checked:bg-primary/16 motion-reduce:transition-none motion-reduce:enabled:active:scale-100",
        className,
      )}
      {...props}
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        context.toggle(value);
        picker.close(true);
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block transition-[scale] duration-140 ease-out-quint group-hover/reaction-option:scale-[1.12] motion-reduce:transition-none motion-reduce:group-hover/reaction-option:scale-100"
      >
        {emoji}
      </span>
    </button>
  );
}
