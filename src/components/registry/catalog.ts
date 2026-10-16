import type { LucideIcon } from "lucide-react";
import { type AiItemId, aiCatalog } from "./ai/catalog";
import { type AiBlocksItemId, aiBlocksCatalog } from "./ai-blocks/catalog";
import { type AppBlocksItemId, appBlocksCatalog } from "./app-blocks/catalog";
import { type BrazilItemId, brazilCatalog } from "./brazil/catalog";
import { type CommerceBlocksItemId, commerceBlocksCatalog } from "./commerce-blocks/catalog";
import { type CommunityItemId, communityCatalog } from "./community/catalog";
import { type CommunityBlocksItemId, communityBlocksCatalog } from "./community-blocks/catalog";
import { type CoreItemId, coreCatalog } from "./core/catalog";
import { type DataDisplayItemId, dataDisplayCatalog } from "./data-display/catalog";
import { type FeedbackItemId, feedbackCatalog } from "./feedback/catalog";
import { formsCatalog } from "./forms/catalog";
import { type MapsItemId, mapsCatalog } from "./maps/catalog";
import { type MarketingItemId, marketingCatalog } from "./marketing/catalog";
import { type MarketingBlocksItemId, marketingBlocksCatalog } from "./marketing-blocks/catalog";
import { type NavigationItemId, navigationCatalog } from "./navigation/catalog";
import { type OnboardingBlocksItemId, onboardingBlocksCatalog } from "./onboarding-blocks/catalog";
import { type OperationsBlocksItemId, operationsBlocksCatalog } from "./operations-blocks/catalog";

export type RegistryItemId =
  | CoreItemId
  | "form-field"
  | "search-field"
  | "filter-bar"
  | "file-upload"
  | "date-range-picker"
  | "form-error-summary"
  | "unsaved-changes-bar"
  | "step-indicator"
  | NavigationItemId
  | FeedbackItemId
  | DataDisplayItemId
  | MarketingItemId
  | CommunityItemId
  | AiItemId
  | MapsItemId
  | MarketingBlocksItemId
  | OnboardingBlocksItemId
  | AppBlocksItemId
  | OperationsBlocksItemId
  | CommerceBlocksItemId
  | CommunityBlocksItemId
  | AiBlocksItemId
  | BrazilItemId;

export type RegistryCategory =
  | "All"
  | "AI"
  | "Feedback"
  | "Forms"
  | "Data Display"
  | "Navigation"
  | "Authentication"
  | "Commerce"
  | "Marketing"
  | "Content"
  | "Maps"
  | "Application"
  | "Operations"
  | "Brazil";

export type RegistryCatalogItem = {
  id: RegistryItemId;
  name: string;
  category: Exclude<RegistryCategory, "All">;
  description: string;
  icon: LucideIcon;
  usage: string;
  accessibility: readonly string[];
};

export const registryCatalog: readonly RegistryCatalogItem[] = [
  ...coreCatalog,
  ...formsCatalog,
  ...navigationCatalog,
  ...feedbackCatalog,
  ...dataDisplayCatalog,
  ...marketingCatalog,
  ...communityCatalog,
  ...aiCatalog,
  ...mapsCatalog,
  ...marketingBlocksCatalog,
  ...onboardingBlocksCatalog,
  ...appBlocksCatalog,
  ...operationsBlocksCatalog,
  ...commerceBlocksCatalog,
  ...communityBlocksCatalog,
  ...aiBlocksCatalog,
  ...brazilCatalog,
] as const;

export const registryCategories: readonly RegistryCategory[] = [
  "All",
  "AI",
  "Feedback",
  "Forms",
  "Data Display",
  "Navigation",
  "Authentication",
  "Commerce",
  "Marketing",
  "Content",
  "Maps",
  "Application",
  "Operations",
  "Brazil",
] as const;

const registryBlockIds: ReadonlySet<RegistryItemId> = new Set(
  [
    ...marketingBlocksCatalog,
    ...onboardingBlocksCatalog,
    ...appBlocksCatalog,
    ...operationsBlocksCatalog,
    ...commerceBlocksCatalog,
    ...communityBlocksCatalog,
    ...aiBlocksCatalog,
  ].map((item) => item.id),
);

export type RegistryItemKind = "component" | "block";

export function getRegistryItemKind(id: RegistryItemId): RegistryItemKind {
  return registryBlockIds.has(id) ? "block" : "component";
}

export type RegistryGroup = {
  category: Exclude<RegistryCategory, "All">;
  items: readonly RegistryCatalogItem[];
};

/** Catalog grouped by category; components precede blocks inside each group. */
export const registryGroups: readonly RegistryGroup[] = registryCategories
  .filter((category): category is RegistryGroup["category"] => category !== "All")
  .map((category) => {
    const items = registryCatalog.filter((item) => item.category === category);
    return {
      category,
      items: [
        ...items.filter((item) => getRegistryItemKind(item.id) === "component"),
        ...items.filter((item) => getRegistryItemKind(item.id) === "block"),
      ],
    };
  })
  .filter((group) => group.items.length > 0);

/** Reading order used for numbering and previous/next navigation. */
export const registryReadingOrder: readonly RegistryCatalogItem[] = registryGroups.flatMap(
  (group) => group.items,
);

export function findRegistryItem(id: string) {
  return registryCatalog.find((entry) => entry.id === id);
}

export function getRegistryItem(id: RegistryItemId) {
  const item = findRegistryItem(id);
  if (item) return item;

  const fallback = registryCatalog.at(0);
  if (!fallback) throw new Error("The Uai registry catalog is empty.");
  return fallback;
}

export function getRegistryPosition(id: RegistryItemId) {
  const index = registryReadingOrder.findIndex((item) => item.id === id);
  return {
    number: String(index + 1).padStart(2, "0"),
    previous: index > 0 ? registryReadingOrder[index - 1] : undefined,
    next: index >= 0 ? registryReadingOrder[index + 1] : undefined,
  };
}
