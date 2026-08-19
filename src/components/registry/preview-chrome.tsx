"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
