"use client";

import { cva } from "class-variance-authority";
import { SmilePlus } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type FocusEvent,
  type KeyboardEvent,
  useContext,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
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
type PickerContext = { close: () => void };
const PickerContextValue = createContext<PickerContext | null>(null);
function usePicker(part: string) {
  const context = useContext(PickerContextValue);
  if (!context) throw new Error(`${part} must be used within ReactionBarPicker`);
  return context;
}
const transitionChip =
  "transition-[background-color,color,box-shadow,scale] duration-[120ms,120ms,120ms,140ms] ease-[ease-out,ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";

const reactionBarVariants = cva(
  "flex min-w-0 flex-wrap items-center text-[13px]/[18px] text-foreground",
  { variants: { variant: { pill: "gap-1.5", outlined: "gap-1.5", compact: "gap-1" } } },
);

const reactionBarItemVariants = cva(
  `group/reaction-item inline-flex min-w-0 cursor-pointer items-center rounded-full border-0 bg-secondary font-medium text-muted-foreground tabular-nums shadow-none ${transitionChip} enabled:hover:bg-[color-mix(in_oklab,var(--secondary)_85%,var(--foreground))] enabled:hover:text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:enabled:active:scale-100 data-[state=on]:bg-primary/14 data-[state=on]:text-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] data-[state=on]:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_42%,transparent)] data-[state=on]:enabled:hover:bg-primary/20 data-[state=on]:enabled:hover:text-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] data-[state=on]:enabled:hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_55%,transparent)]`,
  {
    variants: {
      variant: {
        pill: "h-7 gap-1.5 px-2.5 text-[12.5px]",
        outlined:
          "h-7 gap-1.5 bg-transparent px-2.5 text-[12.5px] shadow-[inset_0_0_0_1px_var(--border)] enabled:hover:bg-accent enabled:hover:shadow-[inset_0_0_0_1px_var(--border-strong)]",
        compact:
          "relative h-5.5 gap-1 px-[7px] text-[11.5px] after:absolute after:-inset-x-0.5 after:-inset-y-1 after:content-['']",
      },
    },
  },
);

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
    <Context.Provider value={{ variant, selected, disabled, toggle }}>
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
  // Pop only after the person toggles, not for reactions that load preselected.
  const [toggled, setToggled] = useState(false);
  return (
    <Toggle
      data-slot="reaction-bar-item"
      type="button"
      className={cn(reactionBarItemVariants({ variant: context.variant }), className)}
      {...props}
      pressed={pressed}
      onPressedChange={() => {
        setToggled(true);
        context.toggle(value);
      }}
      aria-label={`${label}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
      disabled={context.disabled || props.disabled}
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block",
          toggled &&
            pressed &&
            "animate-in duration-260 ease-[cubic-bezier(0.16,1,0.3,1)] zoom-in-70 motion-reduce:animate-none",
          compact ? "text-[12px]/none" : "text-[14px]/none",
        )}
      >
        {emoji}
      </span>
      <span
        key={count}
        aria-hidden="true"
        className="inline-block animate-in duration-200 ease-out-quint fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
      >
        {count}
      </span>
    </Toggle>
  );
}

function menuItems(menu: HTMLElement | null) {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([data-disabled])') ?? [],
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
  const focusTarget = useRef<"first" | "last">("first");
  const compact = context.variant === "compact";
  const close = () => setOpen(false);
  // ArrowUp on the trigger opens the menu on its last option.
  const onMenuFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const target = focusTarget.current;
    focusTarget.current = "first";
    if (target !== "last") return;
    event.preventDefault();
    menuItems(event.currentTarget).at(-1)?.focus();
  };
  // The picker is a horizontal row, so Left/Right rove like Up/Down.
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const items = menuItems(event.currentTarget);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = index + (event.key === "ArrowRight" ? 1 : -1);
    event.preventDefault();
    items[(next + items.length) % items.length]?.focus();
  };
  return (
    <PickerContextValue.Provider value={{ close }}>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <div
          data-slot="reaction-bar-picker"
          className={cn("relative inline-flex", className)}
          {...props}
        >
          <DropdownMenuTrigger
            asChild
            disabled={context.disabled}
            onKeyDown={(event) => {
              focusTarget.current = event.key === "ArrowUp" ? "last" : "first";
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={label}
              className={cn(
                "rounded-full border-0 bg-transparent p-0 text-muted-foreground transition-[background-color,color,scale] duration-[120ms,120ms,140ms] ease-[ease-out,ease-out,cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring enabled:hover:bg-accent enabled:hover:text-accent-foreground enabled:active:scale-[0.94] aria-expanded:bg-accent aria-expanded:text-accent-foreground motion-reduce:transition-none motion-reduce:enabled:active:scale-100 dark:hover:bg-accent",
                compact
                  ? "relative size-5.5 after:absolute after:-inset-x-0.5 after:-inset-y-1 after:content-[''] [&_svg:not([class*='size-'])]:size-[13px]"
                  : "size-7 [&_svg:not([class*='size-'])]:size-[15px]",
              )}
            >
              <SmilePlus strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            aria-label={label}
            align="start"
            sideOffset={6}
            loop
            onKeyDown={onMenuKeyDown}
            onFocus={onMenuFocus}
            className="z-20 flex min-w-0 gap-0.5 rounded-[14px] border-0 bg-popover p-1 text-popover-foreground shadow-[0_0_0_1px_var(--border-strong),0_12px_28px_-10px_oklch(0_0_0/0.32),0_2px_6px_-2px_oklch(0_0_0/0.12)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[state=open]:[--tw-enter-translate-x:0]! data-[state=open]:[--tw-enter-translate-y:0]! motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none"
          >
            {children}
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </PickerContextValue.Provider>
  );
}

export type ReactionBarPickerOptionProps = Omit<
  ComponentProps<typeof DropdownMenuCheckboxItem>,
  "value" | "children" | "checked" | "onCheckedChange"
> & {
  value: string;
  emoji: React.ReactNode;
  label: string;
};
export function ReactionBarPickerOption({
  value,
  emoji,
  label,
  className,
  ...props
}: ReactionBarPickerOptionProps) {
  const context = useReactions("ReactionBarPickerOption");
  usePicker("ReactionBarPickerOption");
  const checked = context.selected.includes(value);
  return (
    <DropdownMenuCheckboxItem
      data-slot="reaction-bar-picker-option"
      className={cn(
        "group/reaction-option grid size-8 cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent p-0 text-[16px]/none transition-[background-color,scale] duration-[120ms,140ms] ease-[ease-out,cubic-bezier(0.23,1,0.32,1)] focus:bg-accent focus:outline-none active:scale-[0.94] aria-checked:bg-primary/16 motion-reduce:transition-none motion-reduce:active:scale-100 [&>span:first-child]:hidden",
        className,
      )}
      {...props}
      checked={checked}
      onCheckedChange={() => context.toggle(value)}
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className="inline-block transition-[scale] duration-140 ease-out-quint group-hover/reaction-option:scale-[1.12] motion-reduce:transition-none motion-reduce:group-hover/reaction-option:scale-100"
      >
        {emoji}
      </span>
    </DropdownMenuCheckboxItem>
  );
}
