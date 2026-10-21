import { APP_HEADER_VARIANTS, type AppHeaderVariant } from "@/components/ui/uai/app-header";
import type { PreviewEntry } from "../preview-chrome";
import { AppHeaderPreview } from "./app-header-preview";
import { coreEntry, options } from "./stage";

export const entry: PreviewEntry = coreEntry({
  ariaLabel: "App header variant",
  defaultValue: "bar",
  options: options(APP_HEADER_VARIANTS, {
    bar: { label: "Bar", scene: "Application shell" },
    floating: { label: "Floating", scene: "Inset workspace" },
    compact: { label: "Compact", scene: "Operations console" },
  }),
  render: (selection) => <AppHeaderPreview variant={selection as AppHeaderVariant} />,
});
