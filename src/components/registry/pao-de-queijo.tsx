"use client";

import { useEffect, useRef, useState } from "react";

const crustGradientId = "uai-pdq-crust";

/**
 * A golden cheese bread: a domed bun with a cracked crust and melted cheese
 * spots. The crust gradient is defined once by `PaoDeQueijoBurst`.
 */
function PaoDeQueijoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="35" rx="13" ry="2.4" fill="black" opacity="0.18" />
      <path
        d="M4.5 24.5C4.5 14 11.5 6.5 20 6.5S35.5 14 35.5 24.5c0 6-6.5 9.5-15.5 9.5S4.5 30.5 4.5 24.5Z"
        fill={`url(#${crustGradientId})`}
      />
      <path
        d="M11 15.5c2.5-1.2 4.2-.6 5.4 1M22.5 12.5c2-.4 3.6.4 4.4 2M14 24c1.8.8 3.6.6 5-.6M25 21.5c1.6 1 2.2 2.6 2 4.2"
        fill="none"
        stroke="#b8731c"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="18" cy="19.5" r="1.6" fill="#fff1c4" />
      <circle cx="28.5" cy="17" r="1.1" fill="#fff1c4" />
      <circle cx="10.5" cy="22" r="1.1" fill="#fff1c4" />
      <ellipse cx="14" cy="11.5" rx="3.2" ry="1.6" fill="white" opacity="0.45" />
    </svg>
  );
}

type Point = { x: number; y: number };

type Flight = {
  id: number;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

const breadCount = 16;
const gravity = 2200; // px/s²
const samples = 12;

/** A ballistic arc from `origin`, sampled into keyframes. */
function createFlight(id: number, origin: Point): Flight {
  // Fan out to the lower right, away from the corner the logo sits in.
  const angle = (-75 + Math.random() * 150) * (Math.PI / 180);
  const speed = 520 + Math.random() * 640;
  const vx = Math.cos(angle) * speed * 0.9 + 220;
  const vy = Math.sin(angle) * speed - 380;
  const spin = (Math.random() - 0.5) * 900;
  const scale = 0.6 + Math.random() * 0.7;
  const duration = 1500 + Math.random() * 700;

  const keyframes = Array.from({ length: samples + 1 }, (_, step) => {
    const t = (step / samples) * (duration / 1000);
    const x = origin.x + vx * t - 20;
    const y = origin.y + vy * t + (gravity * t * t) / 2 - 20;
    return {
      transform: `translate(${x}px, ${y}px) rotate(${spin * t}deg) scale(${step === 0 ? 0.2 : scale})`,
      opacity: step === samples ? 0 : 1,
    };
  });

  return { id, keyframes, options: { duration, delay: id * 18, easing: "linear", fill: "both" } };
}

function FlyingBread({ flight }: { flight: Flight }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = ref.current?.animate(flight.keyframes, flight.options);
    return () => animation?.cancel();
  }, [flight]);

  return (
    <span ref={ref} className="uai-pdq__bread">
      <PaoDeQueijoIcon />
    </span>
  );
}

const captionFrames: Keyframe[] = [
  { opacity: 0, transform: "translateY(6px) scale(0.96)" },
  { opacity: 1, transform: "translateY(0) scale(1)", offset: 0.12 },
  { opacity: 1, transform: "translateY(0) scale(1)", offset: 0.85 },
  { opacity: 0, transform: "translateY(-4px) scale(1)" },
];

const burstDuration = 2600;

/**
 * Throws a handful of pães de queijo out of `origin` and shows a caption.
 * Each new `burst` value plays once. Reduced motion keeps only the caption.
 */
export function PaoDeQueijoBurst({ burst, origin }: { burst: number; origin: Point | null }) {
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    const caption = captionRef.current;
    if (!burst || !caption || !origin) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFlights(
      reduceMotion ? [] : Array.from({ length: breadCount }, (_, id) => createFlight(id, origin)),
    );
    const animation = caption.animate(captionFrames, {
      duration: burstDuration,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      fill: "both",
    });
    const cleanup = window.setTimeout(() => setFlights([]), burstDuration);

    return () => {
      animation.cancel();
      window.clearTimeout(cleanup);
    };
  }, [burst, origin]);

  return (
    <div className="uai-pdq">
      <svg width="0" height="0" aria-hidden="true" className="uai-pdq__defs">
        <defs>
          <radialGradient id={crustGradientId} cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#ffe7a3" />
            <stop offset="45%" stopColor="#f2bf55" />
            <stop offset="85%" stopColor="#d48f2a" />
            <stop offset="100%" stopColor="#b8731c" />
          </radialGradient>
        </defs>
      </svg>
      {flights.map((flight) => (
        <FlyingBread key={`${burst}-${flight.id}`} flight={flight} />
      ))}
      <p
        ref={captionRef}
        className="uai-pdq__caption"
        role="status"
        style={origin ? { left: origin.x - 12, top: origin.y + 28 } : undefined}
      >
        {burst ? (
          <>
            <PaoDeQueijoIcon size={18} />
            Pão de queijo quentinho, sô!
          </>
        ) : null}
      </p>
    </div>
  );
}
