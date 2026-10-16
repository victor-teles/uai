import { ThemingGuide } from "@/components/registry/theming-guide";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Theming",
  description: "Install the Uai theme, set it up by hand, and customize the shadcn tokens.",
  path: "/theming",
});

export default function ThemingPage() {
  return <ThemingGuide />;
}
