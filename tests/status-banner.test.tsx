import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  STATUS_BANNER_VARIANTS,
  StatusBanner,
  StatusBannerAction,
  StatusBannerActions,
  StatusBannerContent,
  StatusBannerDescription,
  StatusBannerDismiss,
  StatusBannerIcon,
  type StatusBannerProps,
  StatusBannerTitle,
} from "@/registry/uai/components/status-banner";

function Fixture(props: StatusBannerProps) {
  return (
    <StatusBanner {...props}>
      <StatusBannerIcon />
      <StatusBannerContent>
        <StatusBannerTitle>Payment failed</StatusBannerTitle>
        <StatusBannerDescription>Update the card ending in 4242.</StatusBannerDescription>
      </StatusBannerContent>
      <StatusBannerActions>
        <StatusBannerAction>Update card</StatusBannerAction>
      </StatusBannerActions>
      <StatusBannerDismiss />
    </StatusBanner>
  );
}

test("maps tones to assertive or polite live regions", () => {
  const view = render(<Fixture tone="error" />);
  expect(screen.getByRole("alert").getAttribute("data-tone")).toBe("error");
  view.rerender(<Fixture tone="warning" />);
  expect(screen.getByRole("alert")).toBeTruthy();
  view.rerender(<Fixture tone="success" />);
  expect(screen.getByRole("status").textContent).toContain("Payment failed");
  view.rerender(<Fixture tone="info" />);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("dismisses with the keyboard when uncontrolled", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  render(<Fixture onOpenChange={change} />);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Update card" }));
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Dismiss" }));
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.queryByText("Payment failed")).toBeNull();
});

test("respects controlled open state and preventDefault on dismiss", async () => {
  const user = userEvent.setup();
  const change = mock((_open: boolean) => {});
  const view = render(<Fixture open onOpenChange={change} />);
  await user.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByText("Payment failed")).toBeTruthy();
  view.rerender(<Fixture open={false} />);
  expect(screen.queryByText("Payment failed")).toBeNull();
  view.rerender(
    <StatusBanner>
      <StatusBannerDismiss onClick={(event) => event.preventDefault()} />
    </StatusBanner>,
  );
  await user.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of STATUS_BANNER_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<StatusBannerDismiss />)).toThrow(
    "StatusBannerDismiss must be used within StatusBanner",
  );
  expect(() => render(<StatusBannerIcon />)).toThrow("within StatusBanner");
});
