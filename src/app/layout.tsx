import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./global.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Uai — Open code for AI products",
    template: "%s — Uai",
  },
  description:
    "Open-code React patterns for AI-native products, distributed through the shadcn CLI.",
};

const designContract = `<!--
THESIS: Uai is a working registry browser; it refuses the marketing hero and disconnected showcase grid.
OWN-WORLD: A graphite application shell, dotted hairlines, dense catalog navigation, graphite pill selection, and 16px preview stages.
STORY: Developers filter real components, inspect their states and highlighted source, then install from a persistent bottom dock.
FIRST VIEWPORT: A persistent catalog sits left; the selected preview fills the workbench while a fixed install dock reveals usage and accessibility on demand.
FORM: Approved Registry Browser direction; seed uai-registry-browser-v1.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

const designContractMarkup = {
  dangerouslySetInnerHTML: { __html: designContract },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div
          hidden
          aria-hidden="true"
          data-design-contract="uai-registry-browser-v1"
          {...designContractMarkup}
        />
        <RootProvider theme={{ defaultTheme: "dark" }}>{children}</RootProvider>
      </body>
    </html>
  );
}
