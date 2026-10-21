import {
  RESOURCE_MANAGER_VARIANTS,
  type ResourceManagerVariant,
} from "@/components/uai/resource-manager";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ResourceManagerPreview } from "./resource-manager-preview";

export const entry: PreviewEntry = {
  control: variantControl("resource manager layout", RESOURCE_MANAGER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Operations" maxWidth={960}>
      <ResourceManagerPreview variant={selection as ResourceManagerVariant} />
    </SpecimenStage>
  ),
};
