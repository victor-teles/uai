/**
 * The live scene's timeline (uai-design/showcase/final/SPEC.md §C.2). Pure data and a pure
 * `deriveFrame(t)`, kept apart from the component so the timing can be unit-tested.
 */

/** Every beat of the scene, in ms from the start of a cycle. */
export const SCENE = {
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
  /** The frame the site rests on after its last cycle, and the reduced-motion still. */
  rest: 9_000,
} as const;

/** Cycles the site plays before it rests on `SCENE.rest`. */
export const SCENE_CYCLES = 2;

export const SCENE_PROMPT = "Charge order #4821 to Casa Aroeira with Pix";

export type SceneChapterId = "1" | "2" | "3" | "4";

/** `at`: where a chapter click seeks to. `still`: the reduced-motion frame for that chapter. */
export const SCENE_CHAPTERS: readonly {
  id: SceneChapterId;
  label: string;
  at: number;
  still: number;
}[] = [
  { id: "1", label: "Prompt", at: 0, still: 1_960 },
  { id: "2", label: "Think", at: SCENE.thinkingIn - 160, still: 4_200 },
  { id: "3", label: "Approve", at: SCENE.approvalIn - 160, still: 5_000 },
  { id: "4", label: "Pay", at: SCENE.pixIn - 160, still: SCENE.rest },
];

export type SceneFrame = {
  chapter: SceneChapterId;
  prompt: string;
  submitPressed: boolean;
  busy: boolean;
  thinking: boolean;
  activities: number;
  thinkingStatus: "thinking" | "complete";
  approval: boolean;
  approvalStatus: "ready" | "submitting" | "approved";
  approvePressed: boolean;
  pix: boolean;
  pixStatus: "pending" | "paid";
  shifted: boolean;
  leaving: boolean;
};

/** The whole scene at time `t` (ms into a cycle). */
export function deriveFrame(t: number): SceneFrame {
  const S = SCENE;
  const typed =
    t >= S.reset
      ? 0
      : Math.max(0, Math.min(SCENE_PROMPT.length, Math.floor((t - S.typeStart) / S.msPerChar)));
  return {
    chapter: t < S.submit ? "1" : t < S.approvalIn ? "2" : t < S.pixIn ? "3" : "4",
    prompt: SCENE_PROMPT.slice(0, typed),
    submitPressed: t >= S.submitPress && t < S.submit,
    busy: t >= S.submit && t < S.pixIn,
    thinking: t >= S.thinkingIn && t < S.reset,
    activities: S.activities.filter((at) => t >= at).length,
    thinkingStatus: t >= S.thinkingDone ? "complete" : "thinking",
    approval: t >= S.approvalIn && t < S.reset,
    approvalStatus: t < S.approveSubmit ? "ready" : t < S.approved ? "submitting" : "approved",
    approvePressed: t >= S.approvePress && t < S.approveSubmit,
    pix: t >= S.pixIn && t < S.reset,
    pixStatus: t >= S.paid ? "paid" : "pending",
    shifted: t >= S.pixIn && t < S.exit,
    leaving: t >= S.exit && t < S.reset,
  };
}
