"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type SegmentedOption = {
  id: string;
  label: string;
};

function useSegmentThumb(value: string) {
  const rootNode = useRef<HTMLElement | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [thumb, setThumb] = useState({ x: 0, width: 0 });

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
      width: activeBox.width,
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

function SegmentThumb({ x, width }: { x: number; width: number }) {
  return (
    <span
      className="uai-segmented__thumb"
      aria-hidden="true"
      style={{
        width: width || undefined,
        transform: `translateX(${x}px)`,
      }}
    />
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  role = "group",
}: {
  options: readonly SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  role?: "tablist" | "group";
}) {
  const { setRootRef, thumb, setButtonRef } = useSegmentThumb(value);

  if (role === "tablist") {
    return (
      <div ref={setRootRef} className="uai-segmented" role="tablist" aria-label={ariaLabel}>
        <SegmentThumb x={thumb.x} width={thumb.width} />
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              ref={(node) => setButtonRef(option.id, node)}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <fieldset ref={setRootRef} className="uai-segmented">
      <legend className="sr-only">{ariaLabel}</legend>
      <SegmentThumb x={thumb.x} width={thumb.width} />
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
  switcher,
  label,
  status,
  className,
  contentClassName,
  swapping = false,
}: {
  children: ReactNode;
  switcher?: ReactNode;
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
      {switcher}
    </div>
  );
}
