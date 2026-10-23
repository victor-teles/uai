import { KANBAN_BOARD_VARIANTS, type KanbanBoardVariant } from "@/components/ui/uai/kanban-board";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { KanbanBoardPreview } from "./kanban-board-preview";

export const entry: PreviewEntry = {
  control: variantControl("kanban board variant", KANBAN_BOARD_VARIANTS, ["loading"]),
  render: (selection) => (
    <SpecimenStage label="Data display" maxWidth={860}>
      <KanbanBoardPreview
        variant={selection === "loading" ? "board" : (selection as KanbanBoardVariant)}
        loading={selection === "loading"}
      />
    </SpecimenStage>
  ),
};
