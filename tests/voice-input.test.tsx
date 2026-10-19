import { afterEach, expect, mock, test } from "bun:test";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/registry/uai/components/prompt-composer";
import {
  formatVoiceElapsed,
  useAudioLevel,
  VOICE_INPUT_STATUSES,
  VOICE_INPUT_VARIANTS,
  VoiceInput,
  VoiceInputCancel,
  VoiceInputError,
  VoiceInputFinish,
  VoiceInputIndicator,
  type VoiceInputProps,
  VoiceInputRecorder,
  VoiceInputStatus,
  VoiceInputStrip,
  VoiceInputTimer,
  VoiceInputTrigger,
  VoiceInputWaveform,
} from "@/registry/uai/components/voice-input";

function Dictation(props: Partial<VoiceInputProps> & { value?: string }) {
  const { value = "", ...rest } = props;
  return (
    <VoiceInput {...rest}>
      <PromptComposer defaultValue={value}>
        <PromptComposerInput aria-label="Message" />
        <PromptComposerActions>
          <VoiceInputTrigger />
          <VoiceInputRecorder>
            <VoiceInputStrip>
              <VoiceInputIndicator />
              <VoiceInputTimer />
              <VoiceInputStatus />
              <VoiceInputWaveform />
            </VoiceInputStrip>
            <VoiceInputCancel />
            <VoiceInputFinish />
          </VoiceInputRecorder>
          <PromptComposerSubmit />
        </PromptComposerActions>
      </PromptComposer>
      <VoiceInputError />
    </VoiceInput>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: the test swaps window.AudioContext for a double.
const audioWindow = window as any;
const originalAudioContext = audioWindow.AudioContext;
afterEach(() => {
  audioWindow.AudioContext = originalAudioContext;
});

test("exports three variants, six statuses, and an m:ss formatter", () => {
  expect(VOICE_INPUT_VARIANTS).toEqual(["inline", "pill", "compact"]);
  expect(VOICE_INPUT_STATUSES).toEqual([
    "idle",
    "requesting",
    "recording",
    "transcribing",
    "denied",
    "error",
  ]);
  expect(formatVoiceElapsed(7)).toBe("0:07");
  expect(formatVoiceElapsed(75)).toBe("1:15");
});

test("the idle mic starts dictation from a click and from Alt+Space inside the composer", async () => {
  const onStart = mock();
  const user = userEvent.setup();
  render(<Dictation onStart={onStart} />);
  const mic = screen.getByRole("button", { name: "Start dictation" });
  expect(mic.getAttribute("aria-keyshortcuts")).toBe("Alt+Space");
  expect(screen.queryByRole("group", { name: "Dictation" })).toBeNull();
  await user.click(mic);
  expect(onStart).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("textbox", { name: "Message" }));
  await user.keyboard("{Alt>} {/Alt}");
  expect(onStart).toHaveBeenCalledTimes(2);
});

test("requesting shows the access label and Cancel, without Finish", () => {
  render(<Dictation status="requesting" />);
  const group = screen.getByRole("group", { name: "Dictation" });
  expect(group.textContent).toContain("Waiting for microphone access");
  expect(screen.getByRole("button", { name: "Cancel dictation" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Finish dictation" })).toBeNull();
});

test("recording focuses Finish, announces once, and Esc and Enter cancel and finish", async () => {
  const onCancel = mock();
  const onFinish = mock();
  const user = userEvent.setup();
  const { rerender } = render(<Dictation onCancel={onCancel} onFinish={onFinish} />);
  rerender(<Dictation status="recording" elapsed={7} onCancel={onCancel} onFinish={onFinish} />);
  const finish = screen.getByRole("button", { name: "Finish dictation" });
  expect(document.activeElement).toBe(finish);
  expect(screen.getByRole("status").textContent).toBe("Recording");
  const timer = document.querySelector("[data-slot=voice-input-timer]");
  expect(timer?.textContent).toBe("0:07");
  expect(timer?.getAttribute("aria-hidden")).toBe("true");
  rerender(<Dictation status="recording" elapsed={8} onCancel={onCancel} onFinish={onFinish} />);
  expect(screen.getByRole("status").textContent).toBe("Recording");
  await user.keyboard("{Enter}");
  expect(onFinish).toHaveBeenCalledTimes(1);
  await user.keyboard("{Escape}");
  expect(onCancel).toHaveBeenCalledTimes(1);
});

test("the waveform renders at most 64 decorative bars", () => {
  render(<Dictation status="recording" getLevel={() => 0.5} />);
  const waveform = document.querySelector("[data-slot=voice-input-waveform]");
  expect(waveform?.getAttribute("aria-hidden")).toBe("true");
  expect(waveform?.children.length).toBeLessThanOrEqual(64);
});

test("transcribing disables Finish and announces", () => {
  const { rerender } = render(<Dictation status="recording" />);
  rerender(<Dictation status="transcribing" />);
  const finish = screen.getByRole("button", { name: "Finish dictation" }) as HTMLButtonElement;
  expect(finish.disabled).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Transcribing");
  expect(screen.getByRole("group", { name: "Dictation" }).textContent).toContain("Transcribing");
});

test("closing returns focus to the field and announces the words added", async () => {
  const transcript = "Ship the release notes";
  function Flow() {
    const [status, setStatus] = useState<VoiceInputProps["status"]>("transcribing");
    const [range, setRange] = useState<readonly [number, number]>();
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setRange([0, transcript.length]);
          }}
        >
          done
        </button>
        <Dictation status={status} insertedRange={range} value={transcript} />
      </>
    );
  }
  const user = userEvent.setup();
  render(<Flow />);
  await user.click(screen.getByRole("button", { name: "done" }));
  const field = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
  expect(document.activeElement).toBe(field);
  expect(field.selectionStart).toBe(transcript.length);
  expect(screen.getByRole("status").textContent).toBe("Added 4 words");
  expect(screen.queryByRole("group", { name: "Dictation" })).toBeNull();
});

test("cancelling announces Dictation cancelled", async () => {
  function Flow() {
    const [status, setStatus] = useState<VoiceInputProps["status"]>("recording");
    return <Dictation status={status} onCancel={() => setStatus("idle")} />;
  }
  const user = userEvent.setup();
  render(<Flow />);
  await user.click(screen.getByRole("button", { name: "Cancel dictation" }));
  expect(screen.getByRole("status").textContent).toBe("Dictation cancelled");
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Message" }));
});

test("denied shows the blocked line, linked to a mic-off trigger", () => {
  render(<Dictation status="denied" />);
  const mic = screen.getByRole("button", { name: "Start dictation" });
  const line = screen.getByText(
    "Microphone blocked. Allow it in your browser's site settings, then try again.",
  );
  expect(mic.getAttribute("aria-describedby")).toBe(line.id);
  expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
});

test("error offers Retry", async () => {
  const onRetry = mock();
  const user = userEvent.setup();
  render(<Dictation status="error" onRetry={onRetry} />);
  expect(screen.getByText("Couldn't transcribe that. Try again.")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test("the pill variant renders a 44px mic that opens into the pill recorder", () => {
  const { rerender } = render(
    <VoiceInput variant="pill">
      <VoiceInputTrigger />
      <VoiceInputRecorder>
        <VoiceInputStrip>
          <VoiceInputWaveform />
        </VoiceInputStrip>
        <VoiceInputCancel />
        <VoiceInputFinish />
      </VoiceInputRecorder>
    </VoiceInput>,
  );
  expect(screen.getByRole("button", { name: "Start dictation" }).className).toContain("size-11");
  rerender(
    <VoiceInput variant="pill" status="recording">
      <VoiceInputTrigger />
      <VoiceInputRecorder>
        <VoiceInputStrip>
          <VoiceInputWaveform />
        </VoiceInputStrip>
        <VoiceInputCancel />
        <VoiceInputFinish />
      </VoiceInputRecorder>
    </VoiceInput>,
  );
  expect(screen.getByRole("group", { name: "Dictation" }).className).toContain("w-[320px]");
});

test("parts throw outside VoiceInput", () => {
  const error = console.error;
  console.error = () => {};
  expect(() => render(<VoiceInputTrigger />)).toThrow("must be used within VoiceInput");
  console.error = error;
});

test("useAudioLevel reads an RMS level and closes its AudioContext", () => {
  const close = mock(() => Promise.resolve());
  const disconnect = mock();
  class FakeAudioContext {
    close = close;
    createMediaStreamSource() {
      return { connect() {}, disconnect };
    }
    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData(buffer: Float32Array) {
          buffer.fill(0.5);
        },
        disconnect() {},
      };
    }
  }
  audioWindow.AudioContext = FakeAudioContext;
  const stream = {} as MediaStream;
  const { result, unmount } = renderHook(() => useAudioLevel(stream));
  let level = 0;
  act(() => {
    level = result.current();
  });
  expect(level).toBeGreaterThan(0);
  expect(level).toBeLessThanOrEqual(1);
  unmount();
  expect(close).toHaveBeenCalledTimes(1);
});
