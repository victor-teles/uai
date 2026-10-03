import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  COMMENT_VARIANTS,
  Comment,
  CommentAction,
  CommentActions,
  CommentAuthor,
  CommentAvatar,
  CommentBody,
  CommentEditor,
  CommentEditTrigger,
  CommentHeader,
  type CommentProps,
  CommentReplies,
  CommentTime,
} from "@/registry/uai/components/comment";

function Fixture({ onSave, ...props }: CommentProps & { onSave?: (value: string) => void }) {
  const [text, setText] = useState("Original text");
  return (
    <Comment {...props}>
      <CommentHeader>
        <CommentAvatar name="Jonas Weber" />
        <CommentAuthor>Jonas Weber</CommentAuthor>
        <CommentTime dateTime="2026-09-29T14:12">2 hours ago</CommentTime>
      </CommentHeader>
      <CommentBody>{text}</CommentBody>
      <CommentEditor
        defaultValue={text}
        onSave={(next) => {
          setText(next);
          onSave?.(next);
        }}
      />
      <CommentActions>
        <CommentAction>Reply</CommentAction>
        <CommentEditTrigger />
      </CommentActions>
      <CommentReplies>
        <Comment>
          <CommentHeader>
            <CommentAuthor>Priya Raman</CommentAuthor>
          </CommentHeader>
          <CommentBody>Reply text</CommentBody>
        </Comment>
      </CommentReplies>
    </Comment>
  );
}

test("labels comments by author, nests replies, and uses time elements", () => {
  render(<Fixture />);
  expect(screen.getByRole("article", { name: "Jonas Weber" })).toBeTruthy();
  const replies = screen.getByRole("region", { name: "Replies" });
  expect(replies.querySelector("article")?.textContent).toContain("Reply text");
  expect(document.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-29T14:12");
  expect(screen.getByRole("group", { name: "Comment actions" })).toBeTruthy();
});

test("edits inline, saves with the keyboard, and restores focus", async () => {
  const user = userEvent.setup();
  const save = mock((_value: string) => {});
  render(<Fixture onSave={save} />);
  await user.click(screen.getByRole("button", { name: "Edit" }));
  const editor = screen.getByRole("textbox", { name: "Edit comment" }) as HTMLTextAreaElement;
  expect(document.activeElement).toBe(editor);
  expect(screen.queryByRole("group", { name: "Comment actions" })).toBeNull();
  await user.clear(editor);
  await user.type(editor, "Updated text");
  await user.keyboard("{Control>}{Enter}{/Control}");
  expect(save).toHaveBeenCalledWith("Updated text");
  expect(screen.getByText("Updated text")).toBeTruthy();
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" })),
  );
});

test("cancels with Escape and blocks empty saves", async () => {
  const user = userEvent.setup();
  const save = mock((_value: string) => {});
  render(<Fixture onSave={save} />);
  await user.click(screen.getByRole("button", { name: "Edit" }));
  const editor = screen.getByRole("textbox", { name: "Edit comment" });
  await user.clear(editor);
  expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  await user.keyboard("{Escape}");
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText("Original text")).toBeTruthy();
});

test("represents hidden, flagged, and removed moderation states in text", async () => {
  const user = userEvent.setup();
  const view = render(<Fixture moderation="hidden" />);
  expect(screen.queryByText("Original text")).toBeNull();
  const show = screen.getByRole("button", { name: "Show" });
  expect(show.getAttribute("aria-expanded")).toBe("false");
  await user.click(show);
  expect(screen.getByText("Original text")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Hide" }).getAttribute("aria-expanded")).toBe("true");
  view.rerender(<Fixture moderation="flagged" />);
  expect(screen.getByText("Flagged for review")).toBeTruthy();
  view.rerender(<Fixture moderation="removed" />);
  expect(screen.queryByText("Original text")).toBeNull();
  expect(screen.getByText("This comment was removed by a moderator.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
});

test("supports controlled editing", async () => {
  const user = userEvent.setup();
  const change = mock((_editing: boolean) => {});
  render(<Fixture editing={false} onEditingChange={change} />);
  await user.click(screen.getByRole("button", { name: "Edit" }));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.queryByRole("textbox")).toBeNull();
});

test("renders every variant and guards compound children", () => {
  for (const variant of COMMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CommentBody>Orphan</CommentBody>)).toThrow(
    "CommentBody must be used within Comment",
  );
});
