import { VOICE_INPUT_VARIANTS, type VoiceInputVariant } from "@/components/ui/uai/voice-input";
import { type PreviewEntry, SpecimenStage, variantControl } from "../preview-chrome";
import { VoiceInputPreview } from "./voice-input-preview";

export const entry: PreviewEntry = {
  control: variantControl("voice input variant", VOICE_INPUT_VARIANTS),
  render: (selection) => (
    <SpecimenStage label="AI and automation" maxWidth={540}>
      <VoiceInputPreview variant={selection as VoiceInputVariant} />
    </SpecimenStage>
  ),
};
