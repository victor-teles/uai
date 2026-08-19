import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { DemoCursor } from "./DemoCursor";
import { type ShowcaseStatus, ThinkingShowcase } from "./ThinkingShowcase";

const states: readonly { value: ShowcaseStatus; label: string }[] = [
  { value: "thinking", label: "Pensando" },
  { value: "complete", label: "Concluído" },
  { value: "error", label: "Erro" },
];

export const WorkbenchScene = () => {
  const frame = useCurrentFrame();
  const status: ShowcaseStatus = frame < 114 ? "thinking" : frame < 284 ? "complete" : "error";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fbfbfa",
        color: "#1c1c1a",
        opacity: interpolate(frame, [0, 14, 380, 408], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(frame, [372, 408], [1, 1.035], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <Interactive.Div
        name="Câmera da demonstração"
        style={{
          position: "absolute",
          inset: 0,
          scale: interpolate(
            frame,
            [0, 48, 92, 112, 138, 166, 228, 250, 276, 298, 332, 370, 408],
            [1, 1, 1.08, 1.08, 1.025, 1.07, 1.07, 1.025, 1.085, 1.085, 1.025, 1, 1],
            {
              easing: Easing.bezier(0.23, 1, 0.32, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(
            frame,
            [0, 48, 92, 112, 138, 166, 228, 250, 276, 298, 332, 370, 408],
            [
              "0px 0px",
              "0px 0px",
              "76px 62px",
              "76px 62px",
              "0px 0px",
              "-158px 18px",
              "-158px 18px",
              "0px 0px",
              "26px 62px",
              "26px 62px",
              "0px 0px",
              "0px 0px",
              "0px 0px",
            ],
            {
              easing: Easing.bezier(0.23, 1, 0.32, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <Interactive.Div
          name="Área de demonstração"
          style={{
            position: "absolute",
            top: 178,
            left: 550,
            width: 820,
          }}
          from={-47}
        >
          <div className="text-[17px] leading-6 font-medium tracking-[0.08em] text-[#97968f] uppercase">
            Selecione o estado
          </div>

          <fieldset className="mt-4 flex gap-3 border-0 p-0" aria-label="Estados do componente">
            {states.map((state) => {
              const active = state.value === status;

              return (
                <button
                  key={state.value}
                  type="button"
                  className={`h-12 rounded-full border px-6 text-[18px] leading-6 font-medium ${
                    active
                      ? "border-[#d5d5d0] bg-white text-[#1c1c1a] shadow-[0_1px_2px_rgba(20,20,18,0.05)]"
                      : "border-[#e7e7e3] bg-transparent text-[#aaa9a2]"
                  }`}
                  aria-pressed={active}
                >
                  {state.label}
                </button>
              );
            })}
          </fieldset>

          <div className="mt-12 text-[17px] leading-6 font-medium tracking-[0.08em] text-[#97968f] uppercase">
            Prévia
          </div>

          <Interactive.Div
            name="Componente Thinking"
            style={{
              marginTop: 18,
              opacity: interpolate(
                frame,
                [-47, -29, 57, 65, 71, 81, 227, 235, 241, 251],
                [0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
              translate: interpolate(
                frame,
                [-47, -27, 57, 67, 73, 83, 227, 237, 243, 253],
                [
                  "0px 10px",
                  "0px 0px",
                  "0px 0px",
                  "0px 4px",
                  "0px 4px",
                  "0px 0px",
                  "0px 0px",
                  "0px 4px",
                  "0px 4px",
                  "0px 0px",
                ],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            <ThinkingShowcase status={status} theme="light" animateDisclosure />
          </Interactive.Div>
        </Interactive.Div>
        <DemoCursor />
      </Interactive.Div>
    </div>
  );
};
