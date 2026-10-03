import { AbsoluteFill, Sequence } from "remotion";

import { useFrameSyncedAnimations } from "./response-status/useFrameSyncedAnimations";
import { LifecycleScene } from "./response-status/LifecycleScene";
import { VariantsScene } from "./response-status/VariantsScene";
import { LogoScene } from "./thinking-v2/LogoScene";

export const ResponseStatusVideo = () => {
  useFrameSyncedAnimations();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "#fbfbfa",
        fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <Sequence durationInFrames={410} name="Ciclo de vida">
        <LifecycleScene />
      </Sequence>
      <Sequence from={396} durationInFrames={156} name="Variantes">
        <VariantsScene />
      </Sequence>
      <Sequence from={538} durationInFrames={210} name="Assinatura Uai">
        <LogoScene />
      </Sequence>
    </AbsoluteFill>
  );
};
