import { Composition } from "remotion";

import { ResponseStatusVideo } from "./ResponseStatusVideo";
import { ThinkingReferenceVideo } from "./ThinkingReferenceVideo";
import { ThinkingVideo } from "./ThinkingVideo";

export const ThinkingCompositions = () => {
  return (
    <>
      <Composition
        id="Thinking"
        component={ThinkingVideo}
        durationInFrames={420}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ThinkingV2"
        component={ThinkingReferenceVideo}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ResponseStatus"
        component={ResponseStatusVideo}
        durationInFrames={456}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
