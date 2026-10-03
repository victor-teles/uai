import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "./global.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Uai — Open code for web products",
    template: "%s — Uai",
  },
  description:
    "Open-code React patterns for websites and web applications, distributed through the shadcn CLI.",
};

const designContract = `<!--
THESIS: Uai is a calm, browsable registry; every component reads like a specimen on a quiet page.
OWN-WORLD: Warm graphite canvas in a ruled frame, dashed hairlines, numbered specimens, raised pill selection.
STORY: Developers scan a grouped sidebar or press Cmd+K, open a component at its own URL, switch variants inside the stage, then copy usage or install.
FIRST VIEWPORT: Sidebar with brand, tagline, search, and grouped navigation; the main column shows the numbered specimen with an in-stage variant pill.
FORM: Beautiful UI direction; seed uai-registry-docs-v2.
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
          data-design-contract="uai-registry-docs-v2"
          {...designContractMarkup}
        />
        <RootProvider theme={{ defaultTheme: "dark" }} search={{ enabled: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
