"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const EASE_OUT_QUINT = "cubic-bezier(0.23, 1, 0.32, 1)";

export type NumberTickDirection = "up" | "down";
export type NumberTickProps = {
  /** The formatted value, for example "$48,290" or "R$ 1.234,56". */
  value: string;
  /** Which way changed characters move. Defaults to the sign of the change in the digits. */
  direction?: NumberTickDirection;
};

type Tick = { from: string; to: string; direction: NumberTickDirection; id: number };

function digits(value: string) {
  const only = value.replace(/[^\d]/g, "");
  return only ? Number(only) * (/^[\s\p{Sc}]*[-−]/u.test(value) ? -1 : 1) : 0;
}

/** Aligns two strings on the right, so units and decimals line up when the length changes. */
function cells(from: string, to: string) {
  const length = Math.max(from.length, to.length);
  const a = from.padStart(length, "\u0000");
  const b = to.padStart(length, "\u0000");
  return Array.from({ length }, (_, index) => {
    const before = a[index] === "\u0000" ? "" : (a[index] ?? "");
    const after = b[index] === "\u0000" ? "" : (b[index] ?? "");
    return { before, after, changed: before !== after };
  });
}

/**
 * Renders a formatted number and, when it changes, moves only the characters that changed:
 * the old one leaves 3px one way while the new one arrives from 3px the other way, in 200ms
 * quint, both in one grid cell so the width never jumps. Reduced motion crossfades in 120ms.
 * At rest it renders the plain string, and the animated copy is hidden from assistive tech.
 */
export function NumberTick({ value, direction }: NumberTickProps) {
  const [tick, setTick] = useState<Tick | null>(null);
  const [current, setCurrent] = useState(value);
  if (current !== value) {
    setCurrent(value);
    const delta = digits(value) - digits(current);
    setTick({
      from: current,
      to: value,
      direction: direction ?? (delta < 0 ? "down" : "up"),
      id: (tick?.id ?? 0) + 1,
    });
  }
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!tick) return;
    const root = ref.current;
    if (!root || typeof root.animate !== "function") return setTick(null);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const sign = tick.direction === "up" ? 1 : -1;
    const options = { duration: reduce ? 120 : 200, easing: reduce ? "ease-out" : EASE_OUT_QUINT };
    const animations = [
      ...Array.from(root.querySelectorAll<HTMLElement>("[data-tick=out]"), (element) =>
        element.animate(
          reduce
            ? [{ opacity: 1 }, { opacity: 0 }]
            : [
                { opacity: 1, translate: "0 0" },
                { opacity: 0, translate: `0 ${-3 * sign}px` },
              ],
          { ...options, fill: "forwards" },
        ),
      ),
      ...Array.from(root.querySelectorAll<HTMLElement>("[data-tick=in]"), (element) =>
        element.animate(
          reduce
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [
                { opacity: 0, translate: `0 ${3 * sign}px` },
                { opacity: 1, translate: "0 0" },
              ],
          options,
        ),
      ),
    ];
    const id = tick.id;
    Promise.all(animations.map((animation) => animation.finished))
      .then(() => setTick((now) => (now?.id === id ? null : now)))
      .catch(() => {});
  }, [tick]);

  if (!tick) return value;
  return (
    <span ref={ref} data-slot="number-tick" className="inline-flex tabular-nums">
      <span className="sr-only">{tick.to}</span>
      <span aria-hidden="true" className="inline-flex whitespace-pre">
        {cells(tick.from, tick.to).map((cell, index) =>
          cell.changed ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional by design.
            <span key={`${tick.id}-${index}`} className="inline-grid">
              <span data-tick="out" className="[grid-area:1/1]">
                {cell.before}
              </span>
              <span data-tick="in" className="[grid-area:1/1]">
                {cell.after}
              </span>
            </span>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional by design.
            <span key={index}>{cell.after}</span>
          ),
        )}
      </span>
    </span>
  );
}
