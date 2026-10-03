"use client";

import { LocateFixed } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Offset = { x: number; y: number };

const origin: Offset = { x: 0, y: 0 };
const dragThreshold = 4;
const keyboardStep = 40;

// Pointer-downs on these keep their own behavior instead of starting a pan.
const interactiveSelector =
  "a, button, input, textarea, select, label, summary, [role='button'], [role='menuitem'], [role='option'], [role='slider'], [role='tab'], [contenteditable='true']";

/** Whether an element between `target` and `boundary` can still scroll by this delta. */
function hasScrollableAncestor(target: Element, boundary: Element, dx: number, dy: number) {
  for (let node: Element | null = target; node && node !== boundary; node = node.parentElement) {
    const style = window.getComputedStyle(node);
    const scrollsY = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
    const scrollsX = /(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth;
    if (scrollsY && dy !== 0) {
      const atEdge =
        dy < 0 ? node.scrollTop <= 0 : node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if (!atEdge) return true;
    }
    if (scrollsX && dx !== 0) {
      const atEdge =
        dx < 0 ? node.scrollLeft <= 0 : node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
      if (!atEdge) return true;
    }
  }
  return false;
}

/**
 * A canvas that pans like a design tool. Drag empty or non-interactive areas,
 * scroll with a wheel or trackpad, or use the arrow keys while it has focus.
 * Focus moving to an offscreen control pans it into view. `resetKey` recenters
 * the view whenever the content changes.
 */
export function PannableCanvas({
  children,
  resetKey,
  className,
}: {
  children: ReactNode;
  resetKey?: string;
  className?: string;
}) {
  const viewportRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; start: Offset; from: Offset; panning: boolean } | null>(
    null,
  );
  const [offset, setOffset] = useState<Offset>(origin);
  const [panning, setPanning] = useState(false);

  /** Keeps at least 40% of the viewport over the content in each axis. */
  const clampOffset = useCallback(({ x, y }: Offset): Offset => {
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!viewport || !world) return { x, y };
    const slackX = viewport.clientWidth * 0.6;
    const slackY = viewport.clientHeight * 0.6;
    const overflowX = Math.max(0, world.scrollWidth - viewport.clientWidth);
    const overflowY = Math.max(0, world.scrollHeight - viewport.clientHeight);
    return {
      x: Math.round(Math.min(slackX, Math.max(-overflowX - slackX, x))),
      y: Math.round(Math.min(slackY, Math.max(-overflowY - slackY, y))),
    };
  }, []);

  const panBy = useCallback(
    (dx: number, dy: number) =>
      setOffset((current) => clampOffset({ x: current.x + dx, y: current.y + dy })),
    [clampOffset],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: recenter whenever the content changes.
  useEffect(() => setOffset(origin), [resetKey]);

  // Wheel and trackpad scrolling pan the canvas. The listener is not passive so
  // it can stop the page from scrolling, and it yields to scroll areas inside
  // the component until they reach their edge.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const dx = event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
      const dy = event.shiftKey && event.deltaX === 0 ? 0 : event.deltaY;
      if (
        event.target instanceof Element &&
        hasScrollableAncestor(event.target, viewport, dx, dy)
      ) {
        return;
      }
      event.preventDefault();
      panBy(-dx, -dy);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [panBy]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const middle = event.button === 1;
    if (event.button !== 0 && !middle) return;
    if (!middle && (event.target as Element).closest(interactiveSelector)) return;
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      from: offset,
      panning: false,
    };
    if (middle) event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.start.x;
    const dy = event.clientY - current.start.y;
    // Small movements stay clicks, so the component's own handlers still run.
    if (!current.panning) {
      if (Math.hypot(dx, dy) < dragThreshold) return;
      current.panning = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      window.getSelection()?.removeAllRanges();
      setPanning(true);
    }
    setOffset(clampOffset({ x: current.from.x + dx, y: current.from.y + dy }));
  };

  const endPan = () => {
    drag.current = null;
    setPanning(false);
  };

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest(interactiveSelector)) return;
    setOffset(origin);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const step = event.shiftKey ? keyboardStep * 4 : keyboardStep;
    if (event.key === "ArrowLeft") panBy(step, 0);
    else if (event.key === "ArrowRight") panBy(-step, 0);
    else if (event.key === "ArrowUp") panBy(0, step);
    else if (event.key === "ArrowDown") panBy(0, -step);
    else if (event.key === "Home") setOffset(origin);
    else return;
    event.preventDefault();
  };

  // Browsers scroll even overflow-hidden boxes to reveal a focused control or a
  // find-in-page match. Turn that native scroll into pan offset instead.
  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || (viewport.scrollLeft === 0 && viewport.scrollTop === 0)) return;
    panBy(-viewport.scrollLeft, -viewport.scrollTop);
    viewport.scrollTo(0, 0);
  };

  const moved = offset.x !== 0 || offset.y !== 0;

  return (
    <section
      ref={viewportRef}
      className={["uai-registry-specimen", className].filter(Boolean).join(" ")}
      style={{ "--uai-pan-x": `${offset.x}px`, "--uai-pan-y": `${offset.y}px` } as CSSProperties}
      data-panning={panning || undefined}
      aria-label="Canvas. Drag, scroll, or use the arrow keys to pan."
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the canvas pans with the arrow keys, so it takes focus like a scroll area.
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      onScroll={onScroll}
    >
      <div ref={worldRef} className="uai-registry-specimen__world">
        <div className="uai-registry-specimen__marks" aria-hidden="true" />
        {children}
      </div>
      {moved ? (
        <button
          type="button"
          className="uai-registry-specimen__recenter"
          onClick={() => setOffset(origin)}
          aria-label="Recenter canvas"
        >
          <LocateFixed aria-hidden="true" />
          <span aria-hidden="true">
            {-offset.x}, {-offset.y}
          </span>
        </button>
      ) : null}
    </section>
  );
}
