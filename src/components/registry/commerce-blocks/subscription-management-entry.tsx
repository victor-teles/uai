import {
  SUBSCRIPTION_MANAGEMENT_VARIANTS,
  type SubscriptionManagementVariant,
} from "@/components/uai/subscription-management";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { SubscriptionManagementPreview } from "./subscription-management-preview";

export const entry: PreviewEntry = {
  control: variantControl("subscription management variant", SUBSCRIPTION_MANAGEMENT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Commerce" maxWidth={960}>
      <SubscriptionManagementPreview variant={selection as SubscriptionManagementVariant} />
    </SpecimenStage>
  ),
};
