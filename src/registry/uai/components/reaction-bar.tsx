"use client";

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
const floatingShadow =
  "0 0 0 1px var(--uai-border-strong), 0 12px 28px -10px oklch(0 0 0 / 0.32), 0 2px 6px -2px oklch(0 0 0 / 0.12)";
const reactionCss = `
.uai-reaction-item{background:var(--uai-surface-raised);box-shadow:none;color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,box-shadow 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-reaction-item:hover:not(:disabled){background:color-mix(in oklab,var(--uai-surface-raised) 85%,var(--uai-text));color:var(--uai-text)}
.uai-reaction-bar[data-variant=outlined] .uai-reaction-item{background:transparent;box-shadow:inset 0 0 0 1px var(--uai-border)}
.uai-reaction-bar[data-variant=outlined] .uai-reaction-item:hover:not(:disabled){background:var(--uai-surface-raised);box-shadow:inset 0 0 0 1px var(--uai-border-strong)}
.uai-reaction-item[aria-pressed=true],.uai-reaction-bar[data-variant] .uai-reaction-item[aria-pressed=true]{background:color-mix(in oklab,var(--uai-accent) 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--uai-accent) 42%,transparent);color:color-mix(in oklab,var(--uai-accent) 55%,var(--uai-text))}
.uai-reaction-item[aria-pressed=true]:hover:not(:disabled),.uai-reaction-bar[data-variant] .uai-reaction-item[aria-pressed=true]:hover:not(:disabled){background:color-mix(in oklab,var(--uai-accent) 20%,transparent);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--uai-accent) 55%,transparent)}
.uai-reaction-item[aria-pressed=true] .uai-reaction-emoji{animation:uai-reaction-pop 260ms cubic-bezier(0.16,1,0.3,1)}
.uai-reaction-item:disabled{opacity:0.5;cursor:not-allowed}
.uai-reaction-trigger{background:transparent;color:var(--uai-muted);transition:background-color 120ms ease-out,color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-reaction-trigger:hover:not(:disabled),.uai-reaction-trigger[aria-expanded=true]{background:var(--uai-surface-raised);color:var(--uai-text)}
.uai-reaction-option{background:transparent;transition:background-color 120ms ease-out,transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-reaction-option:hover,.uai-reaction-option:focus-visible{background:var(--uai-surface-raised);outline:none}
.uai-reaction-option[aria-checked=true]{background:color-mix(in oklab,var(--uai-accent) 16%,transparent)}
.uai-reaction-option span{transition:transform 140ms cubic-bezier(0.23,1,0.32,1)}
.uai-reaction-option:hover span{transform:scale(1.12)}
:is(.uai-reaction-item,.uai-reaction-trigger,.uai-reaction-option):active:not(:disabled){transform:scale(0.94)}
:is(.uai-reaction-item,.uai-reaction-trigger):focus-visible{outline:2px solid var(--uai-accent);outline-offset:2px}
@keyframes uai-reaction-pop{from{transform:scale(0.7)}to{transform:none}}
@media (prefers-reduced-motion: reduce){
.uai-reaction-item,.uai-reaction-trigger,.uai-reaction-option,.uai-reaction-option span{transition:none}
.uai-reaction-item[aria-pressed=true] .uai-reaction-emoji{animation:none}
.uai-reaction-option:hover span,:is(.uai-reaction-item,.uai-reaction-trigger,.uai-reaction-option):active:not(:disabled){transform:none}
}
`;
function cx(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(" ");
}
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
  style,
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
        role="group"
        aria-label={label}
        {...props}
        data-variant={variant}
        className={cx("uai-reaction-bar", className)}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: variant === "compact" ? 4 : 6,
          minWidth: 0,
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        <style>{reactionCss}</style>
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
  style,
  ...props
}: ReactionBarItemProps) {
  const context = useReactions("ReactionBarItem");
  const pressed = context.selected.includes(value);
  const compact = context.variant === "compact";
  return (
    <button
      {...props}
      type="button"
      aria-pressed={pressed}
      aria-label={`${label}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
      disabled={context.disabled || props.disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggle(value);
      }}
      className={cx("uai-reaction-item", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 6,
        height: compact ? 22 : 28,
        padding: compact ? "0 7px" : "0 10px",
        border: 0,
        borderRadius: 999,
        fontSize: compact ? 11.5 : 12.5,
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        cursor: "pointer",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        className="uai-reaction-emoji"
        style={{ display: "inline-block", fontSize: compact ? 12 : 14, lineHeight: 1 }}
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
  style,
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
        {...props}
        style={{ position: "relative", display: "inline-flex", ...style }}
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
          className="uai-reaction-trigger"
          style={{
            display: "grid",
            placeItems: "center",
            width: compact ? 22 : 28,
            height: compact ? 22 : 28,
            padding: 0,
            border: 0,
            borderRadius: 999,
            cursor: "pointer",
          }}
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
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              insetInlineStart: 0,
              zIndex: 20,
              display: "flex",
              gap: 2,
              padding: 4,
              borderRadius: 14,
              background: "var(--uai-surface)",
              boxShadow: floatingShadow,
              transformOrigin: "top left",
            }}
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
  style,
  ...props
}: ReactionBarPickerOptionProps) {
  const context = useReactions("ReactionBarPickerOption");
  const picker = usePicker("ReactionBarPickerOption");
  const checked = context.selected.includes(value);
  return (
    <button
      {...props}
      type="button"
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
      className={cx("uai-reaction-option", className)}
      style={{
        display: "grid",
        placeItems: "center",
        width: 32,
        height: 32,
        padding: 0,
        border: 0,
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 1,
        cursor: "pointer",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-block" }}>
        {emoji}
      </span>
    </button>
  );
}
