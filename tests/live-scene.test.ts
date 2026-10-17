import { describe, expect, test } from "bun:test";
import {
  deriveFrame,
  SCENE,
  SCENE_CHAPTERS,
  SCENE_PROMPT,
} from "@/components/showcase/scene-timeline";

/** One 60fps frame: each beat must land within ±1 frame of SPEC.md §C.2. */
const FRAME = 1000 / 60;
const before = (t: number) => deriveFrame(t - FRAME);
const after = (t: number) => deriveFrame(t + FRAME);

describe("live scene timeline (SPEC §C.2)", () => {
  test("matches the spec's beat table", () => {
    expect(SCENE).toMatchObject({
      duration: 10_000,
      typeStart: 400,
      msPerChar: 34,
      submitPress: 1_960,
      submit: 2_100,
      thinkingIn: 2_260,
      activities: [2_620, 3_340],
      thinkingDone: 4_060,
      approvalIn: 4_360,
      approvePress: 5_320,
      approveSubmit: 5_460,
      approved: 6_360,
      pixIn: 6_660,
      paid: 8_200,
      exit: 9_300,
      reset: 9_620,
      rest: 9_000,
    });
  });

  test("starts empty on chapter 1", () => {
    expect(deriveFrame(0)).toEqual({
      chapter: "1",
      prompt: "",
      submitPressed: false,
      busy: false,
      thinking: false,
      activities: 0,
      thinkingStatus: "thinking",
      approval: false,
      approvalStatus: "ready",
      approvePressed: false,
      pix: false,
      pixStatus: "pending",
      shifted: false,
      leaving: false,
    });
  });

  test("types the prompt from 400ms at 34ms a character", () => {
    expect(SCENE_PROMPT).toHaveLength(43);
    expect(before(400).prompt).toBe("");
    expect(deriveFrame(400 + 34).prompt).toBe("C");
    const done = 400 + 34 * SCENE_PROMPT.length;
    expect(before(done).prompt).toBe(SCENE_PROMPT.slice(0, -1));
    expect(deriveFrame(done).prompt).toBe(SCENE_PROMPT);
    expect(deriveFrame(1_960).prompt).toBe(SCENE_PROMPT);
  });

  test("presses send for 140ms, then the composer is busy until checkout", () => {
    expect(before(1_960).submitPressed).toBe(false);
    expect(after(1_960).submitPressed).toBe(true);
    expect(after(2_100).submitPressed).toBe(false);
    expect(before(2_100).busy).toBe(false);
    expect(after(2_100).busy).toBe(true);
    expect(before(6_660).busy).toBe(true);
    expect(after(6_660).busy).toBe(false);
  });

  test("thinking grows in, logs two activities, and completes at 4060ms", () => {
    expect(before(2_260).thinking).toBe(false);
    expect(after(2_260).thinking).toBe(true);
    expect(before(2_620).activities).toBe(0);
    expect(after(2_620).activities).toBe(1);
    expect(before(3_340).activities).toBe(1);
    expect(after(3_340).activities).toBe(2);
    expect(before(4_060).thinkingStatus).toBe("thinking");
    expect(after(4_060).thinkingStatus).toBe("complete");
  });

  test("the approval goes ready, pressed, submitting, approved", () => {
    expect(before(4_360).approval).toBe(false);
    expect(after(4_360)).toMatchObject({ approval: true, approvalStatus: "ready" });
    expect(after(5_320).approvePressed).toBe(true);
    expect(before(5_460).approvalStatus).toBe("ready");
    expect(after(5_460)).toMatchObject({ approvalStatus: "submitting", approvePressed: false });
    expect(before(6_360).approvalStatus).toBe("submitting");
    expect(after(6_360).approvalStatus).toBe("approved");
  });

  test("checkout arrives at 6660ms and is paid at 8200ms", () => {
    expect(before(6_660)).toMatchObject({ pix: false, shifted: false, chapter: "3" });
    expect(after(6_660)).toMatchObject({ pix: true, shifted: true, chapter: "4" });
    expect(before(8_200).pixStatus).toBe("pending");
    expect(after(8_200).pixStatus).toBe("paid");
  });

  test("the rest frame is approved and paid", () => {
    expect(deriveFrame(SCENE.rest)).toMatchObject({
      chapter: "4",
      prompt: SCENE_PROMPT,
      busy: false,
      thinking: true,
      thinkingStatus: "complete",
      activities: 2,
      approval: true,
      approvalStatus: "approved",
      pix: true,
      pixStatus: "paid",
      shifted: true,
      leaving: false,
    });
  });

  test("exits at 9300ms and is empty from 9620ms", () => {
    expect(before(9_300).leaving).toBe(false);
    expect(after(9_300)).toMatchObject({ leaving: true, shifted: false });
    expect(after(9_620)).toMatchObject({
      leaving: false,
      prompt: "",
      thinking: false,
      approval: false,
      pix: false,
    });
  });

  test("chapters follow the beats", () => {
    expect(before(2_100).chapter).toBe("1");
    expect(after(2_100).chapter).toBe("2");
    expect(before(4_360).chapter).toBe("2");
    expect(after(4_360).chapter).toBe("3");
    for (const chapter of SCENE_CHAPTERS) {
      expect(deriveFrame(chapter.still).chapter).toBe(chapter.id);
      // Seeking lands just before the chapter's first beat, in the previous chapter or the first.
      expect(chapter.at).toBeLessThan(chapter.still);
    }
  });
});
