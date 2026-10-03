import { expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CitationPopover, CitationTitle, CitationTrigger } from "@/components/ui/uai/citation";
import { MessageBody, MessageContent } from "@/components/ui/uai/message";
import {
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";
import { ResponseStatusLabel } from "@/components/ui/uai/response-status";
import {
  CONVERSATION_THREAD_VARIANTS,
  ConversationThread,
  ConversationThreadCitation,
  ConversationThreadComposer,
  ConversationThreadHeader,
  ConversationThreadLog,
  ConversationThreadMain,
  ConversationThreadMessage,
  ConversationThreadSource,
  ConversationThreadSourceLink,
  ConversationThreadSourceList,
  ConversationThreadSources,
  ConversationThreadSourcesTitle,
  ConversationThreadStatus,
  ConversationThreadTitle,
  type ConversationThreadVariant,
} from "@/registry/uai/blocks/conversation-thread";

function Fixture({
  variant,
  onSubmit,
}: {
  variant?: ConversationThreadVariant;
  onSubmit?: (prompt: string, files: File[]) => void;
}) {
  return (
    <ConversationThread variant={variant}>
      <ConversationThreadHeader>
        <ConversationThreadTitle>Support volume</ConversationThreadTitle>
      </ConversationThreadHeader>
      <ConversationThreadMain>
        <ConversationThreadLog>
          <ConversationThreadMessage from="user">
            <MessageBody>
              <MessageContent>Why did tickets rise?</MessageContent>
            </MessageBody>
          </ConversationThreadMessage>
          <ConversationThreadMessage from="assistant">
            <MessageBody>
              <MessageContent>
                Exports changed currency
                <ConversationThreadCitation index={1}>
                  <CitationTrigger />
                  <CitationPopover>
                    <CitationTitle>Invoice export changelog</CitationTitle>
                  </CitationPopover>
                </ConversationThreadCitation>
              </MessageContent>
            </MessageBody>
          </ConversationThreadMessage>
        </ConversationThreadLog>
        <ConversationThreadStatus status="complete">
          <ResponseStatusLabel />
        </ConversationThreadStatus>
        <ConversationThreadComposer onSubmit={onSubmit}>
          <PromptComposerInput />
          <PromptComposerActions>
            <PromptComposerSubmit />
          </PromptComposerActions>
        </ConversationThreadComposer>
      </ConversationThreadMain>
      <ConversationThreadSources>
        <ConversationThreadSourcesTitle>Sources</ConversationThreadSourcesTitle>
        <ConversationThreadSourceList>
          <ConversationThreadSource index={1}>
            <ConversationThreadSourceLink href="#a">
              Invoice export changelog
            </ConversationThreadSourceLink>
          </ConversationThreadSource>
        </ConversationThreadSourceList>
      </ConversationThreadSources>
    </ConversationThread>
  );
}

test("labels the thread, its log, and its sources", () => {
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Support volume" })).toBeTruthy();
  const log = screen.getByRole("log", { name: "Support volume" });
  expect(log.getAttribute("aria-live")).toBe("polite");
  expect(log.getAttribute("tabindex")).toBe("0");
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByRole("complementary", { name: "Sources" })).toBeTruthy();
  expect(screen.getByRole("list", { name: "Sources" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("Response complete");
});

test("submits a follow-up with the keyboard", async () => {
  const user = userEvent.setup();
  const submit = mock((_prompt: string, _files: File[]) => {});
  render(<Fixture onSubmit={submit} />);
  await user.click(screen.getByRole("textbox", { name: "Prompt" }));
  await user.keyboard("Which regions?{Enter}");
  expect(submit).toHaveBeenCalledWith("Which regions?", []);
});

test("opens a cited source on focus and closes it with Escape", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const marker = screen.getByRole("button", { name: "Source 1" });
  act(() => marker.focus());
  expect(marker.getAttribute("aria-expanded")).toBe("true");
  await user.keyboard("{Escape}");
  expect(marker.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(marker);
});

test("maps each layout onto its parts and guards them", () => {
  const messages = { chat: "bubble", document: "plain", compact: "compact" } as const;
  for (const variant of CONVERSATION_THREAD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    expect(screen.getAllByRole("article")[0]?.getAttribute("data-variant")).toBe(messages[variant]);
    view.unmount();
  }
  expect(() => render(<ConversationThreadLog />)).toThrow(
    "ConversationThreadLog must be used within ConversationThread",
  );
  expect(() =>
    render(<ConversationThreadSourcesTitle>Sources</ConversationThreadSourcesTitle>),
  ).toThrow("ConversationThreadSourcesTitle must be used within ConversationThreadSources");
});
