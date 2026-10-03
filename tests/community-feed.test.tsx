import { expect, mock, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthorCardName } from "@/components/ui/uai/author-card";
import { ReactionBarItem } from "@/components/ui/uai/reaction-bar";
import {
  COMMUNITY_FEED_VARIANTS,
  CommunityFeed,
  CommunityFeedFilter,
  CommunityFeedFilters,
  CommunityFeedPagination,
  CommunityFeedPost,
  CommunityFeedPostAuthor,
  CommunityFeedPostFooter,
  CommunityFeedPostHeader,
  CommunityFeedPostReactions,
  CommunityFeedPosts,
  CommunityFeedPostTag,
  CommunityFeedPostTags,
  CommunityFeedPostTitle,
  type CommunityFeedProps,
  CommunityFeedTitle,
} from "@/registry/uai/blocks/community-feed";

function Fixture({
  pageCount = 3,
  ...props
}: Omit<CommunityFeedProps, "children"> & { pageCount?: number }) {
  return (
    <CommunityFeed defaultFilter="all" {...props}>
      <CommunityFeedTitle>Community</CommunityFeedTitle>
      <CommunityFeedFilters>
        <CommunityFeedFilter value="all">All</CommunityFeedFilter>
        <CommunityFeedFilter value="question">Questions</CommunityFeedFilter>
        <CommunityFeedFilter value="show">Show and tell</CommunityFeedFilter>
      </CommunityFeedFilters>
      <CommunityFeedPosts>
        <CommunityFeedPost>
          <CommunityFeedPostHeader>
            <CommunityFeedPostAuthor>
              <AuthorCardName>Amara Okafor</AuthorCardName>
            </CommunityFeedPostAuthor>
          </CommunityFeedPostHeader>
          <CommunityFeedPostTitle href="#maps">Offline maps</CommunityFeedPostTitle>
          <CommunityFeedPostTags>
            <CommunityFeedPostTag>plugins</CommunityFeedPostTag>
          </CommunityFeedPostTags>
          <CommunityFeedPostFooter>
            <CommunityFeedPostReactions>
              <ReactionBarItem value="like" emoji="👍" label="Like" count={48} />
            </CommunityFeedPostReactions>
          </CommunityFeedPostFooter>
        </CommunityFeedPost>
      </CommunityFeedPosts>
      <CommunityFeedPagination pageCount={pageCount} />
    </CommunityFeed>
  );
}

test("lists posts as named articles with authors, tags, and reactions", async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  expect(screen.getByRole("region", { name: "Community" })).toBeTruthy();
  const post = screen.getByRole("article", { name: "Offline maps" });
  expect(within(post).getByRole("article", { name: "Amara Okafor" })).toBeTruthy();
  expect(within(post).getByRole("link", { name: "Offline maps" }).getAttribute("href")).toBe(
    "#maps",
  );
  expect(within(post).getByRole("list", { name: "Tags" }).textContent).toBe("plugins");
  const like = within(post).getByRole("button", { name: "Like, 48 reactions" });
  await user.click(like);
  expect(like.getAttribute("aria-pressed")).toBe("true");
});

test("moves the filter with arrow keys and returns to the first page", async () => {
  const user = userEvent.setup();
  const onFilterChange = mock();
  const onPageChange = mock();
  render(<Fixture onFilterChange={onFilterChange} onPageChange={onPageChange} />);
  await user.click(screen.getByRole("button", { name: "Page 2" }));
  expect(onPageChange).toHaveBeenLastCalledWith(2);
  expect(screen.getByRole("button", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
  screen.getByRole("radio", { name: "All" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(onFilterChange).toHaveBeenCalledWith("question");
  expect(screen.getByRole("radio", { name: "Questions" }).getAttribute("aria-checked")).toBe(
    "true",
  );
  expect(onPageChange).toHaveBeenLastCalledWith(1);
  expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
});

test("paginates with previous and next and disables them at the ends", async () => {
  const user = userEvent.setup();
  render(<Fixture pageCount={2} />);
  const nav = screen.getByRole("navigation", { name: "Pagination" });
  const previous = within(nav).getByRole("button", { name: "Previous page" }) as HTMLButtonElement;
  const next = within(nav).getByRole("button", { name: "Next page" }) as HTMLButtonElement;
  expect(previous.disabled).toBe(true);
  await user.click(next);
  expect(next.disabled).toBe(true);
  expect(previous.disabled).toBe(false);
});

test("collapses long page ranges and hides pagination for one page", () => {
  const view = render(<Fixture pageCount={20} page={10} />);
  const labels = within(view.getByRole("navigation", { name: "Pagination" }))
    .getAllByRole("button")
    .map((button) => button.textContent || button.getAttribute("aria-label"));
  expect(labels).toEqual(["Previous page", "1", "9", "10", "11", "20", "Next page"]);
  view.unmount();
  render(<Fixture pageCount={1} />);
  expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
});

test("renders every variant and guards its parts", () => {
  for (const variant of COMMUNITY_FEED_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.querySelector("section")?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<CommunityFeedPosts />)).toThrow(
    "CommunityFeedPosts must be used within CommunityFeed",
  );
  expect(() =>
    render(
      <CommunityFeed>
        <CommunityFeedPostTitle />
      </CommunityFeed>,
    ),
  ).toThrow("CommunityFeedPostTitle must be used within CommunityFeedPost");
});
