import type { ReactNode } from "react";

import { SiteShell } from "@/components/registry/site-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
