import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ATTACHMENT_VARIANTS,
  Attachment,
  AttachmentDetails,
  AttachmentError,
  AttachmentMeta,
  AttachmentName,
  AttachmentProgress,
  type AttachmentProps,
  AttachmentRemove,
  AttachmentRetry,
  AttachmentThumbnail,
} from "@/registry/uai/components/attachment";

function Fixture({
  onRetry,
  onRemove,
  src,
  ...props
}: AttachmentProps & { onRetry?: () => void; onRemove?: () => void; src?: string }) {
  return (
    <Attachment mimeType="application/pdf" {...props}>
      <AttachmentThumbnail src={src} />
      <AttachmentDetails>
        <AttachmentName>Q3 board update.pdf</AttachmentName>
        <AttachmentMeta>PDF · 8.2 MB</AttachmentMeta>
        <AttachmentProgress />
        <AttachmentError>Connection lost</AttachmentError>
      </AttachmentDetails>
      <AttachmentRetry onClick={onRetry} />
      <AttachmentRemove onClick={onRemove} />
    </Attachment>
  );
}

test("names the group by file and exposes upload progress", () => {
  const view = render(<Fixture status="uploading" progress={42.4} />);
  const group = screen.getByRole("group", { name: "Q3 board update.pdf" });
  expect(group.getAttribute("aria-busy")).toBe("true");
  const progress = screen.getByRole("progressbar", { name: "Q3 board update.pdf" });
  expect(progress.getAttribute("aria-valuenow")).toBe("42.4");
  expect(progress.getAttribute("aria-valuetext")).toBe("42% uploaded");
  expect(screen.getByRole("button", { name: "Cancel upload" })).toBeTruthy();
  view.rerender(<Fixture status="uploading" />);
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBeNull();
  view.rerender(<Fixture status="ready" />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.getByText("PDF · 8.2 MB")).toBeTruthy();
});

test("announces failure and supports retry and removal from the keyboard", async () => {
  const user = userEvent.setup();
  const retry = mock(() => {});
  const remove = mock(() => {});
  render(<Fixture status="error" onRetry={retry} onRemove={remove} />);
  expect(screen.getByRole("alert").textContent).toBe("Connection lost");
  expect(screen.queryByText("PDF · 8.2 MB")).toBeNull();
  await user.tab();
  const retryButton = screen.getByRole("button", { name: "Retry upload" });
  expect(document.activeElement).toBe(retryButton);
  expect(retryButton.getAttribute("aria-describedby")).toBe(
    screen.getByText("Q3 board update.pdf").id,
  );
  await user.keyboard("{Enter}");
  await user.tab();
  await user.keyboard(" ");
  expect(retry).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledTimes(1);
});

test("shows an image thumbnail when ready and hides retry", () => {
  const view = render(<Fixture mimeType="image/png" src="/mockup.png" />);
  expect(view.container.querySelector("img")?.getAttribute("src")).toBe("/mockup.png");
  expect(screen.queryByRole("button", { name: "Retry upload" })).toBeNull();
  expect(screen.getByRole("button", { name: "Remove attachment" })).toBeTruthy();
});

test("renders every variant and guards compound children", () => {
  for (const variant of ATTACHMENT_VARIANTS) {
    const view = render(<Fixture variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<AttachmentRemove />)).toThrow(
    "AttachmentRemove must be used within Attachment",
  );
});
