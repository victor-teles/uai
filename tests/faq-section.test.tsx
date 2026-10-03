import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
} from "@/components/ui/uai/search-field";
import {
  FAQ_SECTION_VARIANTS,
  FaqSection,
  FaqSectionAnswer,
  FaqSectionEmpty,
  FaqSectionItem,
  FaqSectionList,
  FaqSectionQuestion,
  FaqSectionSearch,
  FaqSectionTitle,
  type FaqSectionVariant,
} from "@/registry/uai/blocks/faq-section";

const questions = [
  ["Can we keep our phone number?", "Forward calls or port the number."],
  ["How does billing work?", "You pay for active seats."],
  ["Where is data stored?", "In the region you choose, encrypted at rest."],
];

function Fixture({ variant }: { variant?: FaqSectionVariant }) {
  return (
    <FaqSection variant={variant}>
      <FaqSectionTitle>Questions</FaqSectionTitle>
      <FaqSectionSearch>
        <SearchFieldLabel>Search questions</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput />
        </SearchFieldControl>
        <SearchFieldMessage />
      </FaqSectionSearch>
      <FaqSectionList>
        {questions.map(([question, answer], index) => (
          <FaqSectionItem key={question} defaultOpen={index === 0}>
            <FaqSectionQuestion>{question}</FaqSectionQuestion>
            <FaqSectionAnswer>{answer}</FaqSectionAnswer>
          </FaqSectionItem>
        ))}
      </FaqSectionList>
      <FaqSectionEmpty>Nothing matches.</FaqSectionEmpty>
    </FaqSection>
  );
}

test("toggles answers with disclosure buttons from the keyboard", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const first = screen.getByRole("button", { name: "Can we keep our phone number?" });
  const second = screen.getByRole("button", { name: "How does billing work?" });
  expect(first.getAttribute("aria-expanded")).toBe("true");
  expect(second.getAttribute("aria-expanded")).toBe("false");
  const panel = document.getElementById(second.getAttribute("aria-controls") ?? "");
  expect(panel?.hidden).toBe(true);
  expect(second.parentElement?.tagName).toBe("H3");
  second.focus();
  await user.keyboard("{Enter}");
  expect(second.getAttribute("aria-expanded")).toBe("true");
  expect(panel?.hidden).toBe(false);
  await user.keyboard(" ");
  expect(second.getAttribute("aria-expanded")).toBe("false");
});

test("filters by question and answer text and announces when nothing matches", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  const input = screen.getByLabelText("Search questions");
  await user.type(input, "encrypted");
  const visible = screen.getAllByRole("listitem").map((item) => item.textContent);
  expect(visible).toHaveLength(1);
  expect(visible[0]).toContain("Where is data stored?");
  expect(screen.queryByText("Nothing matches.")).toBeNull();
  await user.clear(input);
  await user.type(input, "refund");
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  expect(screen.getByText("Nothing matches.")).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("No results found");
  await user.keyboard("{Escape}");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

test("renders every variant and guards regions", () => {
  for (const variant of FAQ_SECTION_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.dataset.variant).toBe(variant);
    view.unmount();
  }
  expect(() => render(<FaqSectionList />)).toThrow("FaqSectionList must be used within FaqSection");
  expect(() =>
    render(
      <FaqSection>
        <FaqSectionQuestion />
      </FaqSection>,
    ),
  ).toThrow("FaqSectionQuestion must be used within FaqSectionItem");
});
