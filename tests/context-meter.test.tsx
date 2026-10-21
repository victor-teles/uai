import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import {
  CONTEXT_METER_VARIANTS,
  ContextMeter,
  ContextMeterActions,
  ContextMeterBar,
  ContextMeterCompactAction,
  ContextMeterContent,
  ContextMeterFreed,
  ContextMeterHint,
  ContextMeterLegend,
  type ContextMeterProps,
  ContextMeterStatus,
  ContextMeterSummary,
  ContextMeterTitle,
  ContextMeterTrigger,
  ContextMeterUndoAction,
  formatTokenCount,
} from "@/registry/uai/components/context-meter";

const segments = [
  { id: "system", label: "System prompt", tokens: 3_200 },
  { id: "tools", label: "Tools", tokens: 9_800 },
  { id: "files", label: "Files", tokens: 18_700 },
  { id: "conversation", label: "Conversation", tokens: 44_700 },
];

function Meter(props: Partial<ContextMeterProps> & { children?: ReactNode }) {
  return (
    <ContextMeter used={76_400} limit={200_000} segments={segments} {...props}>
      {props.children ?? (
        <>
          <ContextMeterTrigger />
          <ContextMeterContent>
            <ContextMeterTitle />
            <ContextMeterStatus />
            <ContextMeterSummary />
            <ContextMeterBar />
            <ContextMeterLegend />
            <ContextMeterActions>
              <ContextMeterHint />
              <ContextMeterFreed>38 turns → 1 summary</ContextMeterFreed>
              <ContextMeterCompactAction />
              <ContextMeterUndoAction />
            </ContextMeterActions>
          </ContextMeterContent>
        </>
      )}
    </ContextMeter>
  );
}

test("formats tokens in compact English", () => {
  expect(formatTokenCount(980)).toBe("980");
  expect(formatTokenCount(76_400)).toBe("76.4k");
  expect(formatTokenCount(200_000)).toBe("200k");
  expect(formatTokenCount(1_200_000)).toBe("1.2M");
});

test("every variant exposes one meter with full numbers in the value text", () => {
  for (const variant of CONTEXT_METER_VARIANTS) {
    const view = render(<Meter variant={variant} />);
    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(1);
    const meter = meters[0] as HTMLElement;
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("200000");
    expect(meter.getAttribute("aria-valuenow")).toBe("76400");
    expect(meter.getAttribute("aria-valuetext")).toBe("76,400 of 200,000 tokens, 38 percent");
    if (variant !== "bar") {
      expect(screen.getByRole("button", { name: "Context: 38% used" })).toBeTruthy();
    }
    view.unmount();
  }
});

test("the ring trigger opens the breakdown and Escape returns focus", async () => {
  const user = userEvent.setup();
  render(<Meter variant="ring" autoCompactAt={0.9} />);
  const trigger = screen.getByRole("button", { name: "Context: 38% used" });
  await user.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("heading", { name: "Context window" })).toBeTruthy();
  expect(screen.getByText("Older turns are summarized automatically at 90%.")).toBeTruthy();
  expect(screen.getByText("Files, 18,700 tokens, 9 percent")).toBeTruthy();
  expect(screen.getByText("Free, 123,600 tokens, 62 percent")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});

test("segments animate with transform only, never width", () => {
  const { container } = render(<Meter variant="bar" />);
  const layers = Array.from(container.querySelectorAll<HTMLElement>("[data-segment]"));
  expect(layers).toHaveLength(4);
  expect(layers.map((layer) => layer.style.transform)).toEqual([
    "scaleX(0.016)",
    "scaleX(0.065)",
    "scaleX(0.1585)",
    "scaleX(0.382)",
  ]);
  for (const layer of layers) {
    expect(layer.style.width).toBe("");
    expect(layer.className).toContain("[transition:transform_300ms");
    expect(layer.className).not.toMatch(/transition-\[?width|transition-all/);
    expect(layer.className).toContain("motion-reduce:transition-none");
  }
});

test("announces each upward crossing once and stays quiet on the way down", () => {
  const view = render(<Meter variant="bar" used={76_400} autoCompactAt={0.9} />);
  const status = () => screen.getByRole("status").textContent;
  expect(status()).toBe("");
  view.rerender(<Meter variant="bar" used={168_200} autoCompactAt={0.9} />);
  expect(status()).toBe("Context 84% full. Older turns will be summarized at 90%.");
  expect(screen.getByText("Nearing limit")).toBeTruthy();
  view.rerender(<Meter variant="bar" used={170_000} autoCompactAt={0.9} />);
  expect(status()).toBe("Context 84% full. Older turns will be summarized at 90%.");
  view.rerender(<Meter variant="bar" used={192_600} autoCompactAt={0.9} />);
  expect(status()).toBe("Context 96% full. Older turns will be summarized at 90%.");
  view.rerender(<Meter variant="bar" used={100_000} autoCompactAt={0.9} />);
  expect(status()).toBe("Context 96% full. Older turns will be summarized at 90%.");
  view.rerender(<Meter variant="bar" used={100_000} status="compacting" />);
  expect(status()).toBe("Compacting conversation");
  view.rerender(<Meter variant="bar" used={100_000} status="compacted" freed={61_800} />);
  expect(status()).toBe("Compacted. Freed 61,800 tokens.");
});

test("compacted draws the freed region in proportion and Undo needs its handler", async () => {
  const user = userEvent.setup();
  const view = render(<Meter variant="bar" used={106_400} status="compacted" freed={61_800} />);
  const region = view.container.querySelector<HTMLElement>(
    "[data-slot=context-meter-freed-region]",
  );
  expect(region?.style.left).toBe("53.2%");
  expect(region?.style.width).toBe("30.9%");
  expect(screen.getByText("Compacted")).toBeTruthy();
  expect(view.container.textContent).toContain("Freed 61.8k tokens · 38 turns → 1 summary");
  expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();

  const undo = mock(() => {});
  view.rerender(
    <Meter variant="bar" used={106_400} status="compacted" freed={61_800} onUndoCompact={undo} />,
  );
  await user.click(screen.getByRole("button", { name: "Undo" }));
  expect(undo).toHaveBeenCalledTimes(1);
});

test("Compact now calls the consumer and hides while compacting", async () => {
  const user = userEvent.setup();
  const compact = mock(() => {});
  const view = render(<Meter variant="bar" used={168_200} onCompact={compact} />);
  await user.click(screen.getByRole("button", { name: "Compact now" }));
  expect(compact).toHaveBeenCalledTimes(1);
  view.rerender(<Meter variant="bar" used={168_200} onCompact={compact} status="compacting" />);
  expect(screen.queryByRole("button", { name: "Compact now" })).toBeNull();
  expect(screen.getByText("Compacting")).toBeTruthy();
});

test("empty shows the track only and the empty legend", () => {
  const { container } = render(<Meter variant="bar" used={0} segments={[]} />);
  expect(screen.getByText("Nothing in context yet")).toBeTruthy();
  expect(container.querySelectorAll("[data-segment]")).toHaveLength(0);
});

test("compact tints the pill by state and the ring stroke follows", () => {
  const view = render(<Meter variant="compact" used={192_600} />);
  const trigger = screen.getByRole("button", { name: "Context: 96% used" });
  expect(trigger.className).toContain("bg-destructive/14");
  expect(trigger.textContent).toContain("96% · Full");
  expect(view.container.querySelector(".stroke-destructive")).toBeTruthy();
});

test("reduced motion: no transforms in transit, no shimmer, no pulse", () => {
  const { container } = render(<Meter variant="bar" used={168_200} status="compacting" />);
  const html = container.innerHTML;
  expect(html).toContain("motion-reduce:transition-none");
  expect(html).not.toMatch(/(?<!motion-safe:)animate-shimmer/);
  expect(html).not.toMatch(/(?<!motion-safe:)animate-ring-pulse/);
});

test("parts throw outside the root", () => {
  const spy = console.error;
  console.error = () => {};
  expect(() => render(<ContextMeterBar />)).toThrow(
    "ContextMeterBar must be used within ContextMeter",
  );
  console.error = spy;
});
