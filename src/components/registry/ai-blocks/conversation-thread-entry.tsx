import {
  CONVERSATION_THREAD_VARIANTS,
  type ConversationThreadVariant,
} from "@/components/uai/conversation-thread";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { ConversationThreadPreview } from "./conversation-thread-preview";

export const entry: PreviewEntry = {
  control: variantControl("conversation thread layout", CONVERSATION_THREAD_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI" maxWidth={960}>
      <ConversationThreadPreview key={selection} variant={selection as ConversationThreadVariant} />
    </SpecimenStage>
  ),
};
