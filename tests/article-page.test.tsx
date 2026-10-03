import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthorCardName } from "@/components/ui/uai/author-card";
import { ShareMenuContent, ShareMenuCopy, ShareMenuTrigger } from "@/components/ui/uai/share-menu";
import {
  ARTICLE_PAGE_VARIANTS,
  ArticlePage,
  ArticlePageAuthor,
  ArticlePageContent,
  ArticlePageHeader,
  type ArticlePageProps,
  ArticlePageRelated,
  ArticlePageRelatedItem,
  ArticlePageRelatedList,
  ArticlePageRelatedTitle,
  ArticlePageShare,
  ArticlePageTextSizeControl,
  ArticlePageTextSizeOption,
  ArticlePageTitle,
  ArticlePageToolbar,
} from "@/registry/uai/blocks/article-page";

function Fixture(props: Omit<ArticlePageProps, "children">) {
  return (
    <ArticlePage {...props}>
      <ArticlePageHeader>
        <ArticlePageTitle>Cold builds</ArticlePageTitle>
        <ArticlePageAuthor>
          <AuthorCardName>Ines Moreau</AuthorCardName>
        </ArticlePageAuthor>
        <ArticlePageToolbar>
          <ArticlePageTextSizeControl>
            <ArticlePageTextSizeOption value="small" aria-label="Small text">
              A
            </ArticlePageTextSizeOption>
            <ArticlePageTextSizeOption value="default" aria-label="Default text">
              A
            </ArticlePageTextSizeOption>
            <ArticlePageTextSizeOption value="large" aria-label="Large text">
              A
            </ArticlePageTextSizeOption>
          </ArticlePageTextSizeControl>
          <ArticlePageShare url="https://kiln.example/blog">
            <ShareMenuTrigger />
            <ShareMenuContent>
              <ShareMenuCopy />
            </ShareMenuContent>
          </ArticlePageShare>
        </ArticlePageToolbar>
      </ArticlePageHeader>
      <ArticlePageContent>
        <p>Body text</p>
      </ArticlePageContent>
      <ArticlePageRelated>
        <ArticlePageRelatedTitle>Related reading</ArticlePageRelatedTitle>
        <ArticlePageRelatedList>
          <ArticlePageRelatedItem href="#cache">Sharing the cache</ArticlePageRelatedItem>
        </ArticlePageRelatedList>
      </ArticlePageRelated>
    </ArticlePage>
  );
}

test("names the article and its related reading region", () => {
  render(<Fixture />);
  expect(screen.getByRole("article", { name: "Cold builds" })).toBeTruthy();
  expect(screen.getByRole("complementary", { name: "Related reading" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Sharing the cache" })).toBeTruthy();
});

test("changes the reading size with arrow keys as a radio group", async () => {
  const user = userEvent.setup();
  const onTextSizeChange = mock();
  const view = render(<Fixture onTextSizeChange={onTextSizeChange} />);
  const content = view.container.querySelector<HTMLElement>("[data-uai-article-content]");
  expect(content?.dataset.textSize).toBe("default");
  expect(content?.style.fontSize).toBe("16px");
  const current = screen.getByRole("radio", { name: "Default text" });
  expect(current.getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("radio", { name: "Small text" }).tabIndex).toBe(-1);
  current.focus();
  await user.keyboard("{ArrowRight}");
  expect(onTextSizeChange).toHaveBeenCalledWith("large");
  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Large text" }));
  expect(content?.style.fontSize).toBe("18px");
  await user.keyboard("{Home}");
  expect(content?.dataset.textSize).toBe("small");
});

test("respects a controlled text size", async () => {
  const user = userEvent.setup();
  const onTextSizeChange = mock();
  render(<Fixture textSize="small" onTextSizeChange={onTextSizeChange} />);
  await user.click(screen.getByRole("radio", { name: "Large text" }));
  expect(onTextSizeChange).toHaveBeenCalledWith("large");
  expect(screen.getByRole("radio", { name: "Small text" }).getAttribute("aria-checked")).toBe(
    "true",
  );
});

test("opens the share menu from the toolbar", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.click(screen.getByRole("button", { name: "Share" }));
  expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
});

test("renders every variant and guards its parts", () => {
  for (const variant of ARTICLE_PAGE_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("[data-uai-article]")?.getAttribute("data-variant")).toBe(
      variant,
    );
    view.unmount();
  }
  expect(() => render(<ArticlePageTitle />)).toThrow(
    "ArticlePageTitle must be used within ArticlePage",
  );
  expect(() => render(<ArticlePageRelatedTitle />)).toThrow(
    "ArticlePageRelatedTitle must be used within ArticlePageRelated",
  );
});
