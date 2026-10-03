"use client";

import { Search } from "lucide-react";
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

export const COMMAND_MENU_VARIANTS = ["panel", "floating", "compact"] as const;
export type CommandMenuVariant = (typeof COMMAND_MENU_VARIANTS)[number];
export type CommandMenuProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  variant?: CommandMenuVariant;
  /** The search query. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called when Escape is pressed with an empty query, for closing a surrounding dialog. */
  onDismiss?: () => void;
  /** Label for the result listbox. */
  label?: string;
};
type MenuContext = {
  id: string;
  query: string;
  setQuery: (value: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  empty: boolean;
  label: string;
  variant: CommandMenuVariant;
  listRef: React.RefObject<HTMLDivElement | null>;
  onDismiss?: () => void;
};
const Context = createContext<MenuContext | null>(null);
function useMenu(part: string) {
  const context = useContext(Context);
  if (!context) throw new Error(`${part} must be used within CommandMenu`);
  return context;
}
const GroupContext = createContext<string | null>(null);
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function matches(query: string, text: string) {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}
function options(list: HTMLElement | null) {
  return Array.from(
    list?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [],
  );
}

export function CommandMenu({
  variant = "panel",
  value,
  defaultValue = "",
  onValueChange,
  onDismiss,
  label = "Commands",
  children,
  style,
  ...props
}: CommandMenuProps) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const query = value ?? internal;
  // Keep the active option valid after filtering and when the result set changes.
  useIsomorphicLayoutEffect(() => {
    const visible = options(listRef.current);
    const nextEmpty = !listRef.current?.querySelector('[role="option"]');
    if (nextEmpty !== empty) setEmpty(nextEmpty);
    if (!visible.some((option) => option.id === activeId)) setActiveId(visible[0]?.id ?? null);
  });
  const lastQuery = useRef(query);
  useIsomorphicLayoutEffect(() => {
    if (lastQuery.current === query) return;
    lastQuery.current = query;
    setActiveId(options(listRef.current)[0]?.id ?? null);
  }, [query]);
  const floating = variant === "floating";
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!floating || reduceMotion.current) return;
    rootRef.current?.animate?.(
      [
        { opacity: 0, transform: "scale(0.96)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [floating]);
  return (
    <Context.Provider
      value={{
        id,
        query,
        setQuery: (next) => {
          if (value === undefined) setInternal(next);
          onValueChange?.(next);
        },
        activeId,
        setActiveId,
        empty,
        label,
        variant,
        listRef,
        onDismiss,
      }}
    >
      <div
        {...props}
        ref={rootRef}
        data-variant={variant}
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
          padding: floating ? 4 : 0,
          border: floating ? 0 : "1px solid var(--uai-border)",
          borderRadius: variant === "compact" ? 12 : 14,
          background: "var(--uai-surface)",
          boxShadow: floating
            ? "0 0 0 1px var(--uai-border-strong), 0 16px 32px -12px oklch(0 0 0 / 0.32), 0 4px 8px -4px oklch(0 0 0 / 0.12)"
            : undefined,
          transformOrigin: "top center",
          color: "var(--uai-text)",
          fontSize: 13,
          lineHeight: "18px",
          ...style,
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function CommandMenuInput({
  style,
  onChange,
  onKeyDown,
  placeholder = "Search commands…",
  ...props
}: Omit<ComponentProps<"input">, "value" | "defaultValue">) {
  const context = useMenu("CommandMenuInput");
  const compact = context.variant === "compact";
  const move = (event: KeyboardEvent<HTMLInputElement>) => {
    const list = options(context.listRef.current);
    const index = list.findIndex((option) => option.id === context.activeId);
    let target: HTMLElement | undefined;
    if (event.key === "ArrowDown") target = list[(index + 1) % list.length];
    else if (event.key === "ArrowUp") target = list[(index - 1 + list.length) % list.length];
    else if (event.key === "Home") target = list[0];
    else if (event.key === "End") target = list[list.length - 1];
    else if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) return;
      event.preventDefault();
      list[index]?.click();
      return;
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (context.query) context.setQuery("");
      else context.onDismiss?.();
      return;
    } else return;
    event.preventDefault();
    if (!target) return;
    context.setActiveId(target.id);
    target.scrollIntoView?.({ block: "nearest" });
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 10,
        padding: compact ? "6px 10px" : context.variant === "floating" ? "8px 10px" : "10px 14px",
        borderBottom: "1px solid var(--uai-border)",
        color: "var(--uai-subtle)",
      }}
    >
      <Search size={compact ? 14 : 16} strokeWidth={1.75} aria-hidden="true" />
      <input
        type="text"
        role="combobox"
        aria-label={context.label}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        {...props}
        value={context.query}
        aria-expanded={!context.empty}
        aria-controls={`${context.id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={context.activeId ?? undefined}
        onChange={(event) => {
          onChange?.(event);
          if (!event.defaultPrevented) context.setQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) move(event);
        }}
        className={["placeholder:text-[var(--uai-subtle)]", props.className]
          .filter(Boolean)
          .join(" ")}
        style={{
          flex: 1,
          minWidth: 0,
          height: compact ? 24 : 28,
          border: 0,
          outline: "none",
          background: "transparent",
          color: "var(--uai-text)",
          font: "inherit",
          fontSize: compact ? 12.5 : 13,
          lineHeight: "18px",
          ...style,
        }}
      />
    </div>
  );
}

export function CommandMenuList({ style, ...props }: ComponentProps<"div">) {
  const context = useMenu("CommandMenuList");
  return (
    <div
      role="listbox"
      aria-label={context.label}
      {...props}
      ref={context.listRef}
      id={`${context.id}-list`}
      style={{
        maxHeight: 320,
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: 4,
        scrollPaddingBlock: 4,
        ...style,
      }}
    />
  );
}

export function CommandMenuGroup({ style, children, ...props }: ComponentProps<"div">) {
  useMenu("CommandMenuGroup");
  const labelId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const next = !ref.current?.querySelector('[role="option"]');
    if (next !== hidden) setHidden(next);
  });
  return (
    <GroupContext.Provider value={labelId}>
      {/* biome-ignore lint/a11y/useSemanticElements: APG listbox groups use role="group"; a fieldset is not allowed in a listbox. */}
      <div
        role="group"
        aria-labelledby={labelId}
        {...props}
        ref={ref}
        hidden={hidden}
        style={{ display: hidden ? "none" : "grid", gap: 1, paddingBottom: 2, ...style }}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

export function CommandMenuGroupLabel({ style, ...props }: ComponentProps<"div">) {
  const labelId = useContext(GroupContext);
  if (!labelId) throw new Error("CommandMenuGroupLabel must be used within CommandMenuGroup");
  return (
    <div
      {...props}
      id={labelId}
      style={{
        padding: "8px 10px 4px",
        color: "var(--uai-subtle)",
        fontSize: 11.5,
        lineHeight: "16px",
        fontWeight: 400,
        ...style,
      }}
    />
  );
}

export type CommandMenuItemProps = Omit<ComponentProps<"div">, "onSelect"> & {
  /** Text matched against the query. */
  value: string;
  /** Extra search terms, such as synonyms. */
  keywords?: readonly string[];
  disabled?: boolean;
  onSelect?: () => void;
};

export function CommandMenuItem({
  value,
  keywords = [],
  disabled = false,
  onSelect,
  onClick,
  onPointerMove,
  style,
  className,
  ...props
}: CommandMenuItemProps) {
  const context = useMenu("CommandMenuItem");
  const id = useId();
  if (!matches(context.query, [value, ...keywords].join(" "))) return null;
  const active = context.activeId === id;
  const compact = context.variant === "compact";
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: options are navigated with aria-activedescendant from the combobox input.
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection is handled by the combobox input.
    <div
      role="option"
      {...props}
      id={id}
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      className={[
        "[&>svg]:shrink-0 [&>svg]:text-[var(--uai-muted)] data-[active]:[&>svg]:text-[var(--uai-text)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && !active) context.setActiveId(id);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled && !event.defaultPrevented) onSelect?.();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 10,
        minHeight: compact ? 28 : 32,
        padding: compact ? "0 8px" : "0 10px",
        borderRadius: compact ? 7 : 8,
        background: active ? "var(--uai-surface-raised)" : "transparent",
        color: disabled ? "var(--uai-muted)" : "var(--uai-text)",
        fontSize: compact ? 12.5 : 13,
        fontWeight: 500,
        opacity: disabled ? 0.45 : 1,
        transition: "background-color 120ms ease-out",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        ...style,
      }}
    />
  );
}

export function CommandMenuShortcut({ style, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      {...props}
      style={{
        marginLeft: "auto",
        minWidth: 20,
        padding: "0 5px",
        borderRadius: 6,
        background: "color-mix(in oklab, var(--uai-text) 6%, transparent)",
        color: "var(--uai-subtle)",
        fontFamily: "inherit",
        fontSize: 11,
        lineHeight: "18px",
        fontWeight: 500,
        textAlign: "center",
        letterSpacing: "0.02em",
        ...style,
      }}
    />
  );
}

export function CommandMenuEmpty({ style, children, ...props }: ComponentProps<"div">) {
  const context = useMenu("CommandMenuEmpty");
  return (
    <div
      role="status"
      {...props}
      style={{
        display: context.empty ? "block" : "none",
        padding: "24px 12px",
        color: "var(--uai-subtle)",
        fontSize: 12.5,
        textAlign: "center",
        ...style,
      }}
    >
      {context.empty ? (children ?? `No results for “${context.query}”.`) : null}
    </div>
  );
}
