import { RegistryOverview } from "@/components/registry/registry-overview";
import { pageMetadata } from "@/lib/metadata";
import { siteDescription, siteTitle } from "@/lib/site";

export const metadata = pageMetadata({
  title: siteTitle,
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return <RegistryOverview />;
}
