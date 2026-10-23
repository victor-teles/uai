import { COMMAND_MENU_VARIANTS, type CommandMenuVariant } from "@/components/ui/uai/command-menu";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { CommandMenuPreview } from "./command-menu-preview";

export const entry: PreviewEntry = {
  control: variantControl("command menu variant", COMMAND_MENU_VARIANTS, ["loading", "error"]),
  render: (selection) => (
    <SpecimenStage label="Navigation and layout" maxWidth={480}>
      <CommandMenuPreview
        key={selection}
        variant={
          selection === "loading" || selection === "error"
            ? "panel"
            : (selection as CommandMenuVariant)
        }
        state={selection === "loading" || selection === "error" ? selection : "ready"}
      />
    </SpecimenStage>
  ),
};
