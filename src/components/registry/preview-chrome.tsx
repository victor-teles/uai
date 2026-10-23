"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type PreviewControl = {
  ariaLabel: string;
  defaultValue: string;
  options: readonly { id: string; label: string }[];
};

/**
 * One item's preview on the site: its variant control and the specimen it stages.
 * Each item keeps its own in `<group>/<id>-entry.tsx`; `scripts/registry-index.ts`
 * collects them into `preview-entries.generated.ts`.
 */
export type PreviewEntry = {
  control: PreviewControl;
  render: (selection: string) => ReactNode;
};

/**
 * A control over a component's `*_VARIANTS`, labelled by capitalized id, followed by
 * any preview-only states (rubric L1/L2), which are not component variants.
 */
export function variantControl(
  ariaLabel: string,
  variants: readonly string[],
  states: readonly (string | { id: string; label: string })[] = [],
): PreviewControl {
  const option = (id: string) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) });
  return {
    ariaLabel,
    defaultValue: variants[0] ?? "",
    options: [
      ...variants.map(option),
      ...states.map((state) => (typeof state === "string" ? option(state) : state)),
    ],
  };
}

type SegmentedOption = {
  id: string;
  label: string;
};

function useSegmentThumb(value: string) {
  const rootNode = useRef<HTMLElement | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [thumb, setThumb] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const setRootRef = useCallback((node: HTMLElement | null) => {
    rootNode.current = node;
  }, []);

  const measure = useCallback(() => {
    const root = rootNode.current;
    const active = buttonRefs.current.get(value);
    if (!root || !active) return;
    const rootBox = root.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    setThumb({
      x: activeBox.left - rootBox.left,
      y: activeBox.top - rootBox.top,
      width: activeBox.width,
      height: activeBox.height,
    });
  }, [value]);

  useLayoutEffect(() => {
    measure();
    // Label widths change once the web font loads; remeasure so the thumb fits.
    let active = true;
    void document.fonts?.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
    };
  }, [measure]);

  useEffect(() => {
    const root = rootNode.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  const setButtonRef = (id: string, node: HTMLButtonElement | null) => {
    if (node) buttonRefs.current.set(id, node);
    else buttonRefs.current.delete(id);
  };

  return { setRootRef, thumb, setButtonRef };
}

function SegmentThumb({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <span
      className="uai-segmented__thumb"
      aria-hidden="true"
      style={{
        width: width || undefined,
        height: height || undefined,
        transform: `translate(${x}px, ${y}px)`,
      }}
    />
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  orientation = "horizontal",
}: {
  options: readonly SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  orientation?: "horizontal" | "vertical";
}) {
  const { setRootRef, thumb, setButtonRef } = useSegmentThumb(value);

  return (
    <fieldset ref={setRootRef} className="uai-segmented" data-orientation={orientation}>
      <legend className="sr-only">{ariaLabel}</legend>
      <SegmentThumb {...thumb} />
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            ref={(node) => setButtonRef(option.id, node)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}

export function PreviewStage({
  children,
  label,
  status,
  className,
  contentClassName,
  swapping = false,
}: {
  children: ReactNode;
  label?: string;
  status?: ReactNode;
  className?: string;
  contentClassName?: string;
  swapping?: boolean;
}) {
  return (
    <div className={["uai-preview-stage", className].filter(Boolean).join(" ")}>
      {label ? <span className="uai-preview-stage__label">{label}</span> : null}
      {status ? <span className="uai-preview-stage__status">{status}</span> : null}
      <div
        className={["uai-preview-stage__canvas", contentClassName].filter(Boolean).join(" ")}
        data-swapping={swapping || undefined}
      >
        {children}
      </div>
    </div>
  );
}

/** The stage most items share: a scene label over a width-capped specimen. */
export function SpecimenStage({
  children,
  label,
  maxWidth,
  minHeight,
  center = false,
}: {
  children: ReactNode;
  label: string;
  maxWidth: number;
  minHeight?: number;
  center?: boolean;
}) {
  const style: CSSProperties = {
    display: center ? "grid" : undefined,
    justifyItems: center ? "center" : undefined,
    width: "100%",
    maxWidth,
    minWidth: 0,
    minHeight,
    padding: "24px 0",
  };
  return (
    <PreviewStage label={label}>
      <div style={style}>{children}</div>
    </PreviewStage>
  );
}
