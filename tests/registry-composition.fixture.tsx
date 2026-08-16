import { TaskFlow, TaskFlowStep } from "@/registry/uai/blocks/task-flow";
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardApprove,
  ApprovalCardHeader,
  ApprovalCardReject,
} from "@/registry/uai/components/approval-card";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/registry/uai/components/prompt-composer";
import { TaskList, TaskListItem, TaskListTitle } from "@/registry/uai/components/task-list";
import {
  Thinking,
  ThinkingActivity,
  ThinkingContent,
  ThinkingTrigger,
} from "@/registry/uai/components/thinking";

export function RegistryCompositionFixture() {
  return (
    <TaskFlow>
      <TaskFlowStep label="Thinking" icon={<span aria-hidden="true">1</span>} active>
        <Thinking>
          <ThinkingTrigger summary="Checking the interface." />
          <ThinkingContent>
            <ThinkingActivity type="progress">Started the review</ThinkingActivity>
          </ThinkingContent>
        </Thinking>
      </TaskFlowStep>
      <TaskFlowStep label="Approval" icon={<span aria-hidden="true">2</span>}>
        <ApprovalCard>
          <ApprovalCardHeader title="Publish this change?" />
          <ApprovalCardActions>
            <ApprovalCardReject />
            <ApprovalCardApprove />
          </ApprovalCardActions>
        </ApprovalCard>
      </TaskFlowStep>
      <TaskFlowStep label="Tasks" icon={<span aria-hidden="true">3</span>}>
        <TaskList>
          <TaskListItem status="active">
            <TaskListTitle>Validate the registry</TaskListTitle>
          </TaskListItem>
        </TaskList>
      </TaskFlowStep>
      <TaskFlowStep label="Prompt" icon={<span aria-hidden="true">4</span>}>
        <PromptComposer>
          <PromptComposerAdd>
            <PromptComposerFileItem />
          </PromptComposerAdd>
          <PromptComposerInput />
          <PromptComposerActions>
            <PromptComposerSubmit />
          </PromptComposerActions>
        </PromptComposer>
      </TaskFlowStep>
    </TaskFlow>
  );
}
