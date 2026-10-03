"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

type SizeBounds = { defaultValue: number; min: number; max: number };

function clamp(value: number, { min, max }: SizeBounds) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * A pane size in pixels that survives reloads. The stored value loads after
 * mount, so the server render and first client render agree on the default.
 */
export function usePersistentSize(storageKey: string, bounds: SizeBounds) {
  const [size, setSize] = useState(bounds.defaultValue);
  const loaded = useRef(false);
  const { defaultValue, min, max } = bounds;

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey));
    if (stored) setSize(clamp(stored, { defaultValue, min, max }));
    loaded.current = true;
  }, [storageKey, defaultValue, min, max]);

  useEffect(() => {
    if (!loaded.current) return;
    if (size === defaultValue) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, String(size));
  }, [storageKey, size, defaultValue]);

  return {
    size,
    setSize: (value: number) => setSize(clamp(value, bounds)),
    reset: () => setSize(defaultValue),
  };
}

const keyboardStep = 16;

/**
 * A pointer- and keyboard-operable splitter. `axis` is the drag axis: "x" sits
 * between columns, "y" between rows. `grow` says which drag direction makes the
 * pane larger, because panes on the right or bottom grow toward the start.
 */
export function ResizeHandle({
  label,
  axis,
  grow,
  size,
  bounds,
  onResize,
  onReset,
  className,
}: {
  label: string;
  axis: "x" | "y";
  grow: "forward" | "backward";
  size: number;
  bounds: SizeBounds;
  onResize: (size: number) => void;
  onReset: () => void;
  className?: string;
}) {
  const drag = useRef<{ start: number; size: number } | null>(null);
  const sign = grow === "forward" ? 1 : -1;
  const position = (event: PointerEvent) => (axis === "x" ? event.clientX : event.clientY);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { start: position(event), size };
    document.documentElement.dataset.uaiResizing = axis;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    onResize(drag.current.size + (position(event) - drag.current.start) * sign);
  };

  const endDrag = () => {
    drag.current = null;
    delete document.documentElement.dataset.uaiResizing;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? keyboardStep * 4 : keyboardStep;
    const towardStart = axis === "x" ? "ArrowLeft" : "ArrowUp";
    const towardEnd = axis === "x" ? "ArrowRight" : "ArrowDown";
    if (event.key === towardEnd) onResize(size + step * sign);
    else if (event.key === towardStart) onResize(size - step * sign);
    else if (event.key === "Home") onResize(bounds.min);
    else if (event.key === "End") onResize(bounds.max);
    else if (event.key === "Enter") onReset();
    else return;
    event.preventDefault();
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: an <hr> cannot be focused or dragged; a focusable separator is the ARIA splitter pattern.
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
      aria-valuenow={size}
      aria-valuemin={bounds.min}
      aria-valuemax={bounds.max}
      title="Drag to resize. Double-click to reset."
      className={["uai-resize-handle", className].filter(Boolean).join(" ")}
      data-axis={axis}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onDoubleClick={onReset}
      onKeyDown={onKeyDown}
    />
  );
}
