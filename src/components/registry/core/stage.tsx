"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { type PreviewEntry, PreviewStage } from "../preview-chrome";

type Option = { label: string; scene: string };

/**
 * Site chrome for the original registry items: the variant control on the canvas,
 * the scene label, and the stage size. The specimen itself lives in `<id>-preview.tsx`,
 * which is also the item's catalog usage.
 */
type CoreItem = {
  ariaLabel: string;
  options: Record<string, Option>;
  defaultValue: string;
  stageClassName?: string | ((selection: string) => string | undefined);
  contentClassName?: string | ((selection: string) => string | undefined);
  render: (selection: string) => ReactNode;
};

export function options<T extends string>(
  ids: readonly T[],
  copy: Record<T, Option>,
): Record<string, Option> {
  return Object.fromEntries(ids.map((id) => [id, copy[id]]));
}

function resolve(value: CoreItem["stageClassName"], selection: string) {
  return typeof value === "function" ? value(selection) : value;
}

function useSwapFlag(token: string) {
  const [swapping, setSwapping] = useState(false);
  const previousToken = useRef(token);

  useEffect(() => {
    if (previousToken.current === token) return;
    previousToken.current = token;
    setSwapping(true);
    const timer = window.setTimeout(() => setSwapping(false), 160);
    return () => window.clearTimeout(timer);
  }, [token]);

  return swapping;
}

function CoreStage({ item, selection }: { item: CoreItem; selection: string }) {
  const swapping = useSwapFlag(selection);
  return (
    <PreviewStage
      className={resolve(item.stageClassName, selection)}
      contentClassName={resolve(item.contentClassName, selection)}
      label={item.options[selection]?.scene}
      swapping={swapping}
    >
      {item.render(selection)}
    </PreviewStage>
  );
}

export function coreEntry(item: CoreItem): PreviewEntry {
  return {
    control: {
      ariaLabel: item.ariaLabel,
      defaultValue: item.defaultValue,
      options: Object.entries(item.options).map(([id, option]) => ({ id, label: option.label })),
    },
    render: (selection) => <CoreStage item={item} selection={selection} />,
  };
}
