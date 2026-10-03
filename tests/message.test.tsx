import { expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MESSAGE_VARIANTS,
  Message,
  MessageAction,
  MessageActions,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageCopy,
  MessageHeader,
  type MessageProps,
} from "@/registry/uai/components/message";

function Fixture(props: MessageProps) {
  return (
    <Message {...props}>
      <MessageAvatar />
      <MessageBody>
        <MessageHeader>
          <MessageAuthor />
        </MessageHeader>
        <MessageContent>Your plan renews on October 14.</MessageContent>
        <MessageActions>
          <MessageCopy />
          <MessageAction label="Good response">+</MessageAction>
        </MessageActions>
      </MessageBody>
    </Message>
  );
}

test("names the article by role and exposes the default author", () => {
  const view = render(<Fixture from="user" />);
  expect(screen.getByRole("article", { name: "You message" }).getAttribute("data-role")).toBe(
    "user",
  );
  expect(screen.getByText("You")).toBeTruthy();
  view.rerender(<Fixture from="tool" aria-label="search_docs result" />);
  expect(screen.getByRole("article", { name: "search_docs result" })).toBeTruthy();
});

test("marks streaming messages busy and hides actions until complete", () => {
  const view = render(<Fixture streaming />);
  const article = screen.getByRole("article");
  expect(article.getAttribute("aria-busy")).toBe("true");
  expect(article.querySelector("[data-message-caret]")).toBeTruthy();
  expect(screen.queryByRole("group", { name: "Message actions" })).toBeNull();
  view.rerender(<Fixture />);
  expect(article.getAttribute("aria-busy")).toBeNull();
  expect(screen.getByRole("group", { name: "Message actions" })).toBeTruthy();
});

test("copies the content text from the keyboard and announces it", async () => {
  const user = userEvent.setup();
  const writeText = mock(async (_text: string) => {});
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(<Fixture />);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Copy message" }));
  await user.keyboard("{Enter}");
  expect(writeText).toHaveBeenCalledWith("Your plan renews on October 14.");
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Copied to clipboard"));
  expect(screen.getByRole("button", { name: "Good response" })).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of MESSAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<MessageContent>Orphan</MessageContent>)).toThrow(
    "MessageContent must be used within Message",
  );
});
