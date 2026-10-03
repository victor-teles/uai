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
THESIS: Uai is a component workbench; every component sits on a ruled canvas beside an inspector.
OWN-WORLD: Graphite surfaces, solid hairlines, Geist Mono chrome, crop-marked canvas, a site-only lime signal.
STORY: Developers browse the file tree or press Cmd+K, open a component at its own URL, switch variants from the pill floating on the canvas, then copy usage or install.
FIRST VIEWPORT: Top bar with brand tile, breadcrumb, and search; file tree; the canvas with the live specimen and floating variant pill; the inspector with title, install, anatomy, and accessibility.
FORM: Workbench direction; seed uai-registry-docs-v3.
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
          data-design-contract="uai-registry-docs-v3"
          {...designContractMarkup}
        />
        <RootProvider theme={{ defaultTheme: "dark" }} search={{ enabled: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
