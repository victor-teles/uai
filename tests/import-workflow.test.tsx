import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { StatusBannerContent, StatusBannerTitle } from "@/components/ui/uai/status-banner";
import { StepIndicatorTitle } from "@/components/ui/uai/step-indicator";
import {
  IMPORT_WORKFLOW_VARIANTS,
  ImportWorkflow,
  ImportWorkflowAction,
  ImportWorkflowBody,
  ImportWorkflowCell,
  ImportWorkflowFooter,
  ImportWorkflowIssues,
  ImportWorkflowMapping,
  ImportWorkflowMappingRow,
  ImportWorkflowMappingSample,
  ImportWorkflowMappingSource,
  ImportWorkflowMappingTarget,
  ImportWorkflowPanel,
  ImportWorkflowPanelTitle,
  ImportWorkflowStep,
  ImportWorkflowSteps,
  ImportWorkflowTable,
  ImportWorkflowTitle,
  type ImportWorkflowVariant,
} from "@/registry/uai/blocks/import-workflow";

const order = ["mapping", "review"];

function Fixture({
  variant,
  onMap,
}: {
  variant?: ImportWorkflowVariant;
  onMap?: (value: string) => void;
}) {
  const [step, setStep] = useState("mapping");
  return (
    <ImportWorkflow variant={variant} value={step} onValueChange={setStep}>
      <ImportWorkflowTitle>Import contacts</ImportWorkflowTitle>
      <ImportWorkflowBody>
        <ImportWorkflowSteps>
          {order.map((value, index) => (
            <ImportWorkflowStep
              key={value}
              value={value}
              status={index < order.indexOf(step) ? "complete" : "upcoming"}
            >
              <StepIndicatorTitle>
                {value === "mapping" ? "Map columns" : "Review"}
              </StepIndicatorTitle>
            </ImportWorkflowStep>
          ))}
        </ImportWorkflowSteps>
        <ImportWorkflowPanel value="mapping">
          <ImportWorkflowPanelTitle>Map columns</ImportWorkflowPanelTitle>
          <ImportWorkflowMapping>
            <ImportWorkflowMappingRow>
              <ImportWorkflowMappingSource>
                email_address
                <ImportWorkflowMappingSample>ana@fieldnote.io</ImportWorkflowMappingSample>
              </ImportWorkflowMappingSource>
              <ImportWorkflowMappingTarget
                defaultValue=""
                onChange={(event) => onMap?.(event.target.value)}
              >
                <option value="">Skip this column</option>
                <option value="email">Email</option>
              </ImportWorkflowMappingTarget>
            </ImportWorkflowMappingRow>
          </ImportWorkflowMapping>
        </ImportWorkflowPanel>
        <ImportWorkflowPanel value="review">
          <ImportWorkflowPanelTitle>Review</ImportWorkflowPanelTitle>
          <ImportWorkflowIssues tone="warning">
            <StatusBannerContent>
              <StatusBannerTitle>1 row will be skipped</StatusBannerTitle>
            </StatusBannerContent>
          </ImportWorkflowIssues>
          <ImportWorkflowTable>
            <tbody>
              <tr>
                <ImportWorkflowCell tone="error">jonas.orbit · Missing @</ImportWorkflowCell>
              </tr>
            </tbody>
          </ImportWorkflowTable>
        </ImportWorkflowPanel>
      </ImportWorkflowBody>
      <ImportWorkflowFooter>
        <ImportWorkflowAction emphasis="primary" onClick={() => setStep("review")}>
          Continue
        </ImportWorkflowAction>
      </ImportWorkflowFooter>
    </ImportWorkflow>
  );
}

test("renders only the current step and marks it in the step list", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("list", { name: "Import progress" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "Map columns" })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "Review" })).toBeNull();
  const steps = screen.getAllByRole("listitem");
  expect(steps[0]?.getAttribute("aria-current")).toBe("step");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.queryByRole("region", { name: "Map columns" })).toBeNull();
  expect(screen.getByRole("region", { name: "Review" })).toBeTruthy();
  expect(steps[0]?.getAttribute("data-status")).toBe("complete");
  expect(steps[1]?.getAttribute("aria-current")).toBe("step");
  expect(screen.getByRole("alert").textContent).toContain("1 row will be skipped");
  expect(screen.getByRole("cell").getAttribute("data-tone")).toBe("error");
  expect(screen.getByRole("region", { name: "Import preview" }).getAttribute("tabindex")).toBe("0");
});

test("labels each mapping select by its source column and supports keyboard selection", async () => {
  const user = userEvent.setup();
  const map = mock((_value: string) => {});
  render(<Fixture onMap={map} />);
  const select = screen.getByLabelText(/email_address/) as HTMLSelectElement;
  expect(select.tagName).toBe("SELECT");
  await user.selectOptions(select, "email");
  expect(map).toHaveBeenCalledWith("email");
  expect(select.value).toBe("email");
});

test("maps each layout variant onto the step indicator and guards its parts", () => {
  const steps = { wizard: "horizontal", sidebar: "vertical", compact: "compact" } as const;
  for (const variant of IMPORT_WORKFLOW_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(view.container.querySelector("ol")?.getAttribute("data-variant")).toBe(steps[variant]);
    view.unmount();
  }
  expect(() => render(<ImportWorkflowStep value="file" />)).toThrow(
    "ImportWorkflowStep must be used within ImportWorkflow",
  );
  expect(() =>
    render(
      <ImportWorkflow>
        <ImportWorkflowMappingTarget />
      </ImportWorkflow>,
    ),
  ).toThrow("ImportWorkflowMappingTarget must be used within ImportWorkflowMappingRow");
});
