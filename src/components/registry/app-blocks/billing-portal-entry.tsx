import {
  BILLING_PORTAL_VARIANTS,
  type BillingPortalVariant,
} from "@/components/uai/billing-portal";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { BillingPortalPreview } from "./billing-portal-preview";

export const entry: PreviewEntry = {
  control: variantControl("billing portal layout", BILLING_PORTAL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={880}>
      <BillingPortalPreview variant={selection as BillingPortalVariant} />
    </SpecimenStage>
  ),
};
