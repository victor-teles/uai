import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AUTHOR_CARD_VARIANTS,
  AuthorCard,
  AuthorCardAvatar,
  AuthorCardBio,
  AuthorCardFollow,
  type AuthorCardFollowProps,
  AuthorCardHeader,
  AuthorCardLink,
  AuthorCardLinks,
  AuthorCardName,
  type AuthorCardVariant,
} from "@/registry/uai/components/author-card";

function Fixture({
  variant,
  src,
  ...follow
}: AuthorCardFollowProps & { variant?: AuthorCardVariant; src?: string }) {
  return (
    <AuthorCard variant={variant}>
      <AuthorCardAvatar name="Marta Oliveira" src={src} />
      <AuthorCardHeader>
        <AuthorCardName>Marta Oliveira</AuthorCardName>
        <AuthorCardFollow {...follow} />
      </AuthorCardHeader>
      <AuthorCardBio>Writes about payments.</AuthorCardBio>
      <AuthorCardLinks>
        <AuthorCardLink href="https://github.com/marta">GitHub</AuthorCardLink>
      </AuthorCardLinks>
    </AuthorCard>
  );
}

test("labels the article by the author and falls back to initials", () => {
  const view = render(<Fixture src="/missing.png" />);
  expect(screen.getByRole("article", { name: "Marta Oliveira" })).toBeTruthy();
  const image = view.container.querySelector("img");
  if (image) fireEvent.error(image);
  expect(view.container.querySelector("img")).toBeNull();
  expect(view.container.textContent).toContain("MO");
  expect(screen.getByRole("list", { name: "Profiles" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "GitHub" })).toBeTruthy();
});

test("toggles follow with the keyboard and keeps the label constant", async () => {
  const user = userEvent.setup();
  const change = mock((_pressed: boolean) => {});
  render(<Fixture onPressedChange={change} />);
  const follow = screen.getByRole("button", { name: "Follow" });
  expect(follow.getAttribute("aria-pressed")).toBe("false");
  expect(follow.getAttribute("aria-describedby")).toBeTruthy();
  follow.focus();
  await user.keyboard("{Enter}");
  expect(follow.getAttribute("aria-pressed")).toBe("true");
  expect(change).toHaveBeenLastCalledWith(true);
  await user.keyboard(" ");
  expect(follow.getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByRole("button", { name: "Follow" })).toBe(follow);
});

test("respects a controlled follow state", async () => {
  const user = userEvent.setup();
  const change = mock((_pressed: boolean) => {});
  render(<Fixture pressed onPressedChange={change} />);
  await user.click(screen.getByRole("button", { name: "Follow" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("button", { name: "Follow" }).getAttribute("aria-pressed")).toBe("true");
});

test("renders every variant and guards compound children", () => {
  for (const variant of AUTHOR_CARD_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<AuthorCardFollow />)).toThrow(
    "AuthorCardFollow must be used within AuthorCard",
  );
});
