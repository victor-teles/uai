import { useEffect, useLayoutEffect, useRef } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";

const firstSeen = new WeakMap<Animation, number>();

// Registry components animate with CSS keyframes, CSS transitions, and WAAPI,
// which run on wall-clock time. This pauses every document animation and seeks it
// to the current frame so the real components render deterministically.
// Looping animations follow the global frame; finite ones start where they first
// appeared.
export const useFrameSyncedAnimations = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const handle = useRef<number | null>(null);

  // Hold the frame until child effects (which create WAAPI animations) have run.
  useLayoutEffect(() => {
    handle.current = delayRender("Syncing component animations");
  }, [frame]);

  useEffect(() => {
    for (const animation of document.getAnimations()) {
      if (!firstSeen.has(animation)) firstSeen.set(animation, frame);
      const looping = animation.effect?.getTiming().iterations === Number.POSITIVE_INFINITY;
      const elapsed = looping ? frame : frame - (firstSeen.get(animation) ?? frame);
      animation.pause();
      animation.currentTime = (elapsed / fps) * 1000;
    }
    if (handle.current !== null) continueRender(handle.current);
    handle.current = null;
  }, [frame, fps]);
};
