import { AbsoluteFill, Sequence } from "remotion";

import { LogoScene } from "./thinking-v2/LogoScene";
import { WorkbenchScene } from "./thinking-v2/WorkbenchScene";

export const ThinkingReferenceVideo = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "#fbfbfa",
        fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <Sequence durationInFrames={410} name="Demonstração interativa">
        <WorkbenchScene />
      </Sequence>
      <Sequence from={390} durationInFrames={210} name="Assinatura Uai">
        <LogoScene />
      </Sequence>
    </AbsoluteFill>
  );
};
