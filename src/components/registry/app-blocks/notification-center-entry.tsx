import {
  NOTIFICATION_CENTER_VARIANTS,
  type NotificationCenterVariant,
} from "@/components/uai/notification-center";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { NotificationCenterPreview } from "./notification-center-preview";

export const entry: PreviewEntry = {
  control: variantControl("notification center layout", NOTIFICATION_CENTER_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="Application surfaces" maxWidth={560}>
      <NotificationCenterPreview variant={selection as NotificationCenterVariant} />
    </SpecimenStage>
  ),
};
