import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CommentAuthor,
  CommentBody,
  CommentHeader,
  type CommentModeration,
  CommentReplies,
} from "@/components/ui/uai/comment";
import { ReactionBarItem } from "@/components/ui/uai/reaction-bar";
import {
  COMMENT_THREAD_VARIANTS,
  CommentThread,
  CommentThreadComment,
  CommentThreadComposer,
  CommentThreadList,
  type CommentThreadProps,
  CommentThreadReactions,
  CommentThreadSort,
  CommentThreadSortOption,
  CommentThreadTitle,
} from "@/registry/uai/blocks/comment-thread";

function Fixture({
  onSubmit = () => {},
  moderation = "visible",
  ...props
}: Omit<CommentThreadProps, "children" | "onSubmit"> & {
  onSubmit?: (value: string) => void;
  moderation?: CommentModeration;
}) {
  return (
    <CommentThread defaultSort="top" {...props}>
      <CommentThreadTitle>Discussion</CommentThreadTitle>
      <CommentThreadSort>
        <CommentThreadSortOption value="top">Top</CommentThreadSortOption>
        <CommentThreadSortOption value="newest">Newest</CommentThreadSortOption>
      </CommentThreadSort>
      <CommentThreadComposer onSubmit={onSubmit} />
      <CommentThreadList>
        <CommentThreadComment moderation={moderation}>
          <CommentHeader>
            <CommentAuthor>Tomás Rivera</CommentAuthor>
          </CommentHeader>
          <CommentBody>Is there a way to see rebuilt pages?</CommentBody>
          <CommentThreadReactions>
            <ReactionBarItem value="up" emoji="👍" label="Thumbs up" count={4} />
          </CommentThreadReactions>
          <CommentReplies>
            <CommentThreadComment>
              <CommentHeader>
                <CommentAuthor>Ines Moreau</CommentAuthor>
              </CommentHeader>
              <CommentBody>Run kiln build --explain.</CommentBody>
            </CommentThreadComment>
          </CommentReplies>
        </CommentThreadComment>
      </CommentThreadList>
    </CommentThread>
  );
}

test("names the thread, nests replies, and toggles reactions", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Discussion" })).toBeTruthy();
  const comment = screen.getByRole("article", { name: "Tomás Rivera" });
  const replies = within(comment).getByRole("region", { name: "Replies" });
  expect(within(replies).getByRole("article", { name: "Ines Moreau" })).toBeTruthy();
  const reaction = screen.getByRole("button", { name: "Thumbs up, 4 reactions" });
  await user.click(reaction);
  expect(reaction.getAttribute("aria-pressed")).toBe("true");
});

test("changes the sort order with arrow keys", async () => {
  const user = userEvent.setup();
  const onSortChange = mock();
  render(<Fixture onSortChange={onSortChange} />);
  const group = screen.getByRole("radiogroup", { name: "Sort comments" });
  within(group).getByRole("radio", { name: "Top" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(onSortChange).toHaveBeenCalledWith("newest");
  const newest = within(group).getByRole("radio", { name: "Newest" });
  expect(newest.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(newest);
});

test("submits trimmed comments with the keyboard and clears the field", async () => {
  const user = userEvent.setup();
  const onSubmit = mock();
  render(<Fixture onSubmit={onSubmit} />);
  const send = screen.getByRole("button", { name: "Post comment" }) as HTMLButtonElement;
  expect(send.disabled).toBe(true);
  const field = screen.getByRole("textbox", { name: "Add a comment" });
  await user.type(field, "  Thanks for the tip  ");
  expect(send.disabled).toBe(false);
  await user.keyboard("{Control>}{Enter}{/Control}");
  expect(onSubmit).toHaveBeenCalledWith("Thanks for the tip");
  expect((field as HTMLTextAreaElement).value).toBe("");
});

test("shows moderation states in text", () => {
  render(<Fixture moderation="removed" />);
  expect(screen.getByText("This comment was removed by a moderator.")).toBeTruthy();
});

test("renders every variant and guards its parts", () => {
  for (const variant of COMMENT_THREAD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CommentThreadComment />)).toThrow(
    "CommentThreadComment must be used within CommentThread",
  );
  expect(() => render(<CommentThreadComposer onSubmit={() => {}} />)).toThrow(
    "CommentThreadComposer must be used within CommentThread",
  );
});
