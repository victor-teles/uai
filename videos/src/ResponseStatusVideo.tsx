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
      <Sequence durationInFrames={270} name="Ciclo de vida">
        <LifecycleScene />
      </Sequence>
      <Sequence from={258} durationInFrames={124} name="Variantes">
        <VariantsScene />
      </Sequence>
      <Sequence from={372} durationInFrames={84} name="Assinatura Uai">
        <LogoScene />
      </Sequence>
    </AbsoluteFill>
  );
};
