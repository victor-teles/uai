import { Composition } from "remotion";

import { ThinkingVideo } from "./ThinkingVideo";

export const ThinkingComposition = () => {
  return (
    <Composition
      id="Thinking"
      component={ThinkingVideo}
      durationInFrames={420}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
