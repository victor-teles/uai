import type { Metadata } from "next";

import { ThemingGuide } from "@/components/registry/theming-guide";

export const metadata: Metadata = {
  title: "Theming",
  description: "Install the Uai theme, set it up by hand, and customize the shadcn tokens.",
};

export default function ThemingPage() {
  return <ThemingGuide />;
}
