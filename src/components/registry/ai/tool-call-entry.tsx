import { TOOL_CALL_VARIANTS, type ToolCallVariant } from "@/components/ui/uai/tool-call";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ToolCallPreview } from "./tool-call-preview";

export const entry: PreviewEntry = {
  control: variantControl("tool call variant", TOOL_CALL_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <ToolCallPreview variant={selection as ToolCallVariant} />
    </SpecimenStage>
  ),
};
