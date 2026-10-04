import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PLACE_CARD_VARIANTS,
  PlaceCard,
  PlaceCardAction,
  PlaceCardActions,
  PlaceCardCategory,
  PlaceCardClose,
  PlaceCardDetail,
  PlaceCardDetails,
  PlaceCardHeader,
  PlaceCardMeta,
  PlaceCardRating,
  PlaceCardStatus,
  PlaceCardTitle,
} from "@/registry/uai/components/place-card";

test("labels the place and speaks rating and status in words", async () => {
  const user = userEvent.setup();
  const close = mock(() => {});
  render(
    <PlaceCard variant="popup">
      <PlaceCardHeader>
        <PlaceCardTitle>Lume Bakery</PlaceCardTitle>
        <PlaceCardCategory>Bakery · $$</PlaceCardCategory>
        <PlaceCardClose onClick={close} />
      </PlaceCardHeader>
      <PlaceCardMeta>
        <PlaceCardRating value={4.66} count={1284} />
        <PlaceCardStatus status="open">Open until 6 PM</PlaceCardStatus>
      </PlaceCardMeta>
      <PlaceCardDetails>
        <PlaceCardDetail>218 Harbor Street</PlaceCardDetail>
      </PlaceCardDetails>
      <PlaceCardActions>
        <PlaceCardAction emphasis="primary">Directions</PlaceCardAction>
      </PlaceCardActions>
    </PlaceCard>,
  );
  const card = screen.getByRole("article", { name: "Lume Bakery" });
  expect(card.getAttribute("data-variant")).toBe("popup");
  expect(screen.getByRole("img", { name: "Rated 4.7 out of 5, 1,284 reviews" })).toBeTruthy();
  expect(screen.getByText("Open until 6 PM").getAttribute("data-status")).toBe("open");
  expect(screen.getByRole("listitem").textContent).toBe("218 Harbor Street");
  const directions = screen.getByRole("button", { name: "Directions" });
  expect(directions.getAttribute("type")).toBe("button");
  await user.click(screen.getByRole("button", { name: "Close place details" }));
  expect(close).toHaveBeenCalledTimes(1);
});

test("ships three variants and rejects parts outside the card", () => {
  expect(PLACE_CARD_VARIANTS).toEqual(["card", "popup", "compact"]);
  expect(() => render(<PlaceCardTitle />)).toThrow("PlaceCardTitle must be used within PlaceCard");
});
