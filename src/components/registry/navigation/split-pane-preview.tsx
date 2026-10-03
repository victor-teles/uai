"use client";

import { useState } from "react";
import {
  SplitPane,
  SplitPaneHandle,
  SplitPanePrimary,
  SplitPaneSecondary,
  type SplitPaneVariant,
} from "@/components/ui/uai/split-pane";

export function SplitPanePreview({ variant = "card" }: { variant?: SplitPaneVariant }) {
  const [size, setSize] = useState(38);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <SplitPane
        variant={variant}
        value={size}
        onValueChange={setSize}
        min={25}
        max={70}
        storageKey="uai-preview-split-pane"
        style={{ height: 280 }}
      >
        <SplitPanePrimary>
          <ul style={{ margin: 0, padding: 12, listStyle: "none", display: "grid", gap: 4 }}>
            <li style={{ fontWeight: 550 }}>Refund request #4821</li>
            <li style={{ color: "var(--uai-muted)" }}>Shipping delay #4819</li>
            <li style={{ color: "var(--uai-muted)" }}>Invoice copy #4816</li>
          </ul>
        </SplitPanePrimary>
        <SplitPaneHandle aria-label="Resize inbox and conversation" />
        <SplitPaneSecondary>
          <div style={{ padding: 16, display: "grid", gap: 8 }}>
            <strong>Refund request #4821</strong>
            <p style={{ margin: 0, color: "var(--uai-muted)" }}>
              The order arrived after the event date. The customer asks for a refund to the original
              card.
            </p>
          </div>
        </SplitPaneSecondary>
      </SplitPane>
      <p style={{ margin: 0, color: "var(--uai-muted)", fontSize: 12 }}>
        List width: {Math.round(size)}%. Use the arrow keys, Home, End, or Enter on the divider.
      </p>
    </div>
  );
}
