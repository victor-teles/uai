"use client";

import { LocateFixed, Maximize, Minus, Plus } from "lucide-react";
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

/**
 * Pan offset in viewport pixels and zoom factor. `resting` is true while the
 * view sits where `centeredView` put it, so the recenter control can hide.
 */
type View = { x: number; y: number; z: number; resting: boolean };

const minZoom = 0.25;
const maxZoom = 4;
const zoomSteps = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const dragThreshold = 4;
const keyboardStep = 40;
const gridUnit = 24;
const lineHeightPx = 16;

// Pointer-downs on these keep their own behavior instead of starting a pan.
const interactiveSelector =
  "a, button, input, textarea, select, label, summary, [role='button'], [role='menuitem'], [role='option'], [role='slider'], [role='tab'], [contenteditable='true']";

const clampZoom = (z: number) => Math.min(maxZoom, Math.max(minZoom, z));

/** Grid spacing on screen: the 24px world grid, halved or doubled to stay 12–48px apart. */
function gridSpacing(z: number) {
  let spacing = gridUnit * z;
  while (spacing < 12) spacing *= 2;
  while (spacing > 48) spacing /= 2;
  return spacing;
}

/** Wheel deltas in pixels; Firefox can report lines instead. */
function wheelDelta(event: WheelEvent) {
  const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? lineHeightPx : 1;
  return { dx: event.deltaX * scale, dy: event.deltaY * scale };
}

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

/** Safari reports trackpad pinches as gesture events instead of ctrl+wheel. */
type GestureEvent = UIEvent & { scale: number; clientX: number; clientY: number };

/**
 * A canvas that pans and zooms like a design tool.
 *
 * Pan: drag empty or non-interactive areas, scroll with a wheel or trackpad, or
 * use the arrow keys while the canvas has focus. Zoom: ⌘/Ctrl + wheel, pinch,
 * the floating controls, or +, -, 0 (100%), and 1 (fit) on the keyboard. Zoom
 * keeps the point under the pointer still. Focus moving to an offscreen control
 * pans it into view. `resetKey` recenters at the current zoom when the content
 * changes.
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
  const drag = useRef<{ pointerId: number; startX: number; startY: number; from: View } | null>(
    null,
  );
  const [view, setView] = useState<View>({ x: 0, y: 0, z: 1, resting: true });
  const [panning, setPanning] = useState(false);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  });

  /** World size in unscaled pixels, including content that overflows it. */
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const world = worldRef.current;
    if (!viewport || !world) return null;
    return {
      width: viewport.clientWidth,
      height: viewport.clientHeight,
      worldWidth: world.scrollWidth,
      worldHeight: world.scrollHeight,
    };
  }, []);

  /** Clamps zoom, and pan so at least 40% of the viewport still overlaps the world. */
  const constrain = useCallback(
    (next: View): View => {
      const z = clampZoom(next.z);
      const size = measure();
      if (!size) return { ...next, z };
      const spanX = size.width - size.worldWidth * z;
      const spanY = size.height - size.worldHeight * z;
      const slackX = size.width * 0.6;
      const slackY = size.height * 0.6;
      return {
        x: Math.round(
          Math.min(Math.max(0, spanX) + slackX, Math.max(Math.min(0, spanX) - slackX, next.x)),
        ),
        y: Math.round(
          Math.min(Math.max(0, spanY) + slackY, Math.max(Math.min(0, spanY) - slackY, next.y)),
        ),
        z,
        resting: next.resting,
      };
    },
    [measure],
  );

  /** Centers the world; content taller than the viewport at 100% starts at its top edge. */
  const centeredView = useCallback(
    (zoom: number): View => {
      const z = clampZoom(zoom);
      const size = measure();
      if (!size) return { x: 0, y: 0, z, resting: true };
      const width = size.worldWidth * z;
      const height = size.worldHeight * z;
      return {
        x: Math.round((size.width - width) / 2),
        // Content taller than the viewport at 100% starts at its top edge;
        // anything else centers, including content that is only tall when zoomed.
        y: Math.round(
          size.worldHeight > size.height && height > size.height ? 0 : (size.height - height) / 2,
        ),
        z,
        resting: true,
      };
    },
    [measure],
  );

  const panBy = useCallback(
    (dx: number, dy: number) =>
      setView((current) =>
        constrain({ ...current, x: current.x + dx, y: current.y + dy, resting: false }),
      ),
    [constrain],
  );

  /** Zooms while keeping the viewport point (px, py) fixed; defaults to the center. */
  const zoomAt = useCallback(
    (nextZoom: (z: number) => number, px?: number, py?: number) =>
      setView((current) => {
        const z = clampZoom(nextZoom(current.z));
        if (z === current.z) return current;
        const size = measure();
        const x = px ?? (size ? size.width / 2 : 0);
        const y = py ?? (size ? size.height / 2 : 0);
        const ratio = z / current.z;
        const next = constrain({
          x: x - (x - current.x) * ratio,
          y: y - (y - current.y) * ratio,
          z,
          resting: false,
        });
        // Zooming a centered view about its center leaves it centered.
        const centered = centeredView(z);
        const resting = Math.abs(next.x - centered.x) <= 1 && Math.abs(next.y - centered.y) <= 1;
        return { ...next, resting };
      }),
    [centeredView, constrain, measure],
  );

  const zoomIn = () => zoomAt((z) => zoomSteps.find((step) => step > z + 0.001) ?? maxZoom);
  const zoomOut = () => zoomAt((z) => zoomSteps.findLast((step) => step < z - 0.001) ?? minZoom);
  const resetZoom = () => setView(centeredView(1));
  const recenter = () => setView((current) => centeredView(current.z));
  const fit = () => {
    const size = measure();
    if (!size) return;
    const zoom = Math.min(size.width / size.worldWidth, size.height / size.worldHeight);
    setView(centeredView(zoom));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: recenter whenever the content changes.
  useEffect(() => {
    setView((current) => centeredView(current.z));
  }, [resetKey, centeredView]);

  // Wheel, trackpad, and pinch input. The listeners are not passive so they can
  // stop the page from scrolling or zooming. Plain scrolling yields to scroll
  // areas inside the component until they reach their edge.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const local = (clientX: number, clientY: number) => {
      const bounds = viewport.getBoundingClientRect();
      return [clientX - bounds.left, clientY - bounds.top] as const;
    };

    const onWheel = (event: WheelEvent) => {
      const { dx: rawX, dy: rawY } = wheelDelta(event);
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const step = Math.max(-30, Math.min(30, rawY));
        zoomAt((z) => z * Math.exp(-step * 0.008), ...local(event.clientX, event.clientY));
        return;
      }
      const horizontal = event.shiftKey && rawX === 0;
      const dx = horizontal ? rawY : rawX;
      const dy = horizontal ? 0 : rawY;
      if (
        event.target instanceof Element &&
        hasScrollableAncestor(event.target, viewport, dx, dy)
      ) {
        return;
      }
      event.preventDefault();
      panBy(-dx, -dy);
    };

    let gestureStartZoom = 1;
    const onGestureStart = (event: Event) => {
      event.preventDefault();
      gestureStartZoom = viewRef.current.z;
    };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as GestureEvent;
      zoomAt(() => gestureStartZoom * gesture.scale, ...local(gesture.clientX, gesture.clientY));
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("gesturestart", onGestureStart, { passive: false });
    viewport.addEventListener("gesturechange", onGestureChange, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("gesturestart", onGestureStart);
      viewport.removeEventListener("gesturechange", onGestureChange);
    };
  }, [panBy, zoomAt]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    const middle = event.button === 1;
    if (event.button !== 0 && !middle) return;
    const target = event.target as Element;
    if (
      !middle &&
      (target.closest(interactiveSelector) || target.closest(".uai-canvas-controls"))
    ) {
      return;
    }
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: view,
    };
    if (middle) event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    // Small movements stay clicks, so the component's own handlers still run.
    if (!panning) {
      if (Math.hypot(dx, dy) < dragThreshold) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      window.getSelection()?.removeAllRanges();
      setPanning(true);
    }
    setView(
      constrain({
        ...current.from,
        x: current.from.x + dx,
        y: current.from.y + dy,
        resting: false,
      }),
    );
  };

  const endPan = () => {
    drag.current = null;
    setPanning(false);
  };

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as Element;
    if (target.closest(interactiveSelector) || target.closest(".uai-canvas-controls")) return;
    recenter();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const step = event.shiftKey ? keyboardStep * 4 : keyboardStep;
    const { key } = event;
    if (key === "ArrowLeft") panBy(step, 0);
    else if (key === "ArrowRight") panBy(-step, 0);
    else if (key === "ArrowUp") panBy(0, step);
    else if (key === "ArrowDown") panBy(0, -step);
    else if (key === "Home") recenter();
    else if (key === "+" || key === "=") zoomIn();
    else if (key === "-" || key === "_") zoomOut();
    else if (key === "0") resetZoom();
    else if (key === "1") fit();
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

  const percent = Math.round(view.z * 100);
  const viewStyle = {
    "--uai-pan-x": `${view.x}px`,
    "--uai-pan-y": `${view.y}px`,
    "--uai-zoom": view.z,
    "--uai-grid-size": `${gridSpacing(view.z)}px`,
  } as CSSProperties;

  return (
    <section
      ref={viewportRef}
      className={["uai-registry-specimen", className].filter(Boolean).join(" ")}
      style={viewStyle}
      data-panning={panning || undefined}
      aria-label="Canvas. Drag or scroll to pan, arrow keys to pan, plus and minus to zoom."
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the canvas pans and zooms from the keyboard, so it takes focus like a scroll area.
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

      <div className="uai-canvas-controls" role="toolbar" aria-label="Canvas view">
        {view.resting ? null : (
          <button
            type="button"
            onClick={recenter}
            aria-label="Recenter canvas"
            title="Recenter (Home)"
          >
            <LocateFixed aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={zoomOut}
          disabled={view.z <= minZoom}
          aria-label="Zoom out"
          title="Zoom out (−)"
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          className="uai-canvas-controls__zoom"
          onClick={resetZoom}
          aria-label={`Zoom ${percent}%. Reset to 100%`}
          title="Reset to 100% (0)"
        >
          {percent}%
        </button>
        <button
          type="button"
          onClick={zoomIn}
          disabled={view.z >= maxZoom}
          aria-label="Zoom in"
          title="Zoom in (+)"
        >
          <Plus aria-hidden="true" />
        </button>
        <button type="button" onClick={fit} aria-label="Zoom to fit" title="Zoom to fit (1)">
          <Maximize aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
