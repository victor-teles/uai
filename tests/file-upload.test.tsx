import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FILE_UPLOAD_VARIANTS,
  FileUpload,
  FileUploadDropzone,
  FileUploadInput,
  FileUploadItem,
  FileUploadList,
  FileUploadProgress,
  type FileUploadProps,
  FileUploadRemove,
  FileUploadRetry,
  FileUploadTrigger,
} from "@/registry/uai/components/file-upload";

function Fixture(props: FileUploadProps) {
  return (
    <FileUpload {...props}>
      <FileUploadDropzone>
        <FileUploadInput />
        <FileUploadTrigger />
      </FileUploadDropzone>
    </FileUpload>
  );
}
const pdf = () => new File(["pdf"], "brief.pdf", { type: "application/pdf" });
test("validates picker files for type, size and count including existing files", async () => {
  const user = userEvent.setup({ applyAccept: false });
  const accepted = mock(() => {});
  const rejected = mock(() => {});
  render(
    <Fixture
      accept=".pdf,image/*"
      maxSize={8}
      maxFiles={2}
      fileCount={1}
      onFilesAccepted={accepted}
      onFilesRejected={rejected}
    />,
  );
  const valid = pdf();
  const wrong = new File(["text"], "notes.txt", { type: "text/plain" });
  const large = new File(["too much content"], "large.pdf", { type: "application/pdf" });
  const extra = new File(["png"], "diagram.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("Choose files", { selector: "input" }), [
    valid,
    wrong,
    large,
    extra,
  ]);
  expect(accepted).toHaveBeenCalledWith([valid]);
  expect(rejected).toHaveBeenCalledWith([
    { file: wrong, reason: "File type is not supported." },
    { file: large, reason: "File exceeds the size limit." },
    { file: extra, reason: "File count limit reached." },
  ]);
  expect(screen.getByRole("alert").textContent).toContain("notes.txt");
});
test("applies the same rules to dropped files and ignores disabled drops", () => {
  const accepted = mock(() => {});
  const rejected = mock(() => {});
  const view = render(
    <Fixture accept="image/*" onFilesAccepted={accepted} onFilesRejected={rejected} />,
  );
  const zone = screen.getByRole("group", { name: "Upload files" });
  const file = pdf();
  fireEvent.drop(zone, { dataTransfer: { files: [file] } });
  expect(accepted).not.toHaveBeenCalled();
  expect(rejected).toHaveBeenCalledTimes(1);
  view.rerender(<Fixture disabled onFilesAccepted={accepted} />);
  fireEvent.drop(zone, { dataTransfer: { files: [file] } });
  expect(accepted).not.toHaveBeenCalled();
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<Fixture onFilesAccepted={accepted} />);
  fireEvent.drop(zone, { dataTransfer: { files: [file] } });
  expect(accepted).toHaveBeenCalledWith([file]);
});
test("reopens the picker from the keyboard trigger and allows reselection", async () => {
  const user = userEvent.setup();
  const accepted = mock(() => {});
  render(<Fixture onFilesAccepted={accepted} />);
  const input = screen.getByLabelText("Choose files", { selector: "input" }) as HTMLInputElement;
  const click = mock(() => {});
  input.addEventListener("click", click);
  screen.getByRole("button").focus();
  await user.keyboard("{Enter}");
  expect(click).toHaveBeenCalled();
  await user.upload(input, pdf());
  await user.upload(input, pdf());
  expect(accepted).toHaveBeenCalledTimes(2);
  expect(input.value).toBe("");
});
test("exposes progress, failed retry and removal as consumer actions", async () => {
  const user = userEvent.setup();
  const retry = mock(() => {});
  const remove = mock(() => {});
  const view = render(
    <FileUpload>
      <FileUploadList>
        <FileUploadItem progress={42}>
          <FileUploadProgress aria-label="Uploading brief.pdf" />
          <FileUploadRetry onClick={retry} />
          <FileUploadRemove onClick={remove} />
        </FileUploadItem>
      </FileUploadList>
    </FileUpload>,
  );
  expect((screen.getByRole("progressbar") as HTMLProgressElement).value).toBe(42);
  expect(screen.queryByRole("button", { name: "Retry upload" })).toBeNull();
  view.rerender(
    <FileUpload>
      <FileUploadList>
        <FileUploadItem status="error">
          <FileUploadProgress />
          <FileUploadRetry onClick={retry} />
          <FileUploadRemove onClick={remove} />
        </FileUploadItem>
      </FileUploadList>
    </FileUpload>,
  );
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("Upload failed");
  await user.click(screen.getByRole("button", { name: "Retry upload" }));
  await user.click(screen.getByRole("button", { name: "Remove file" }));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(remove).toHaveBeenCalledTimes(1);
});
test("single-file mode limits drops, renders all variants, and guards item children", () => {
  const accept = mock(() => {});
  render(<Fixture multiple={false} onFilesAccepted={accept} />);
  fireEvent.drop(screen.getByRole("group"), { dataTransfer: { files: [pdf(), pdf()] } });
  expect(accept).toHaveBeenCalledWith([expect.any(File)]);
  for (const variant of FILE_UPLOAD_VARIANTS) {
    const view = render(<FileUpload variant={variant} />);
    expect(view.container.firstElementChild?.getAttribute("data-variant")).toBe(variant);
    view.unmount();
  }
  expect(() => render(<FileUploadRetry />)).toThrow("within FileUploadItem");
});
