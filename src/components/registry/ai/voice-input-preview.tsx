"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PromptComposer,
  PromptComposerActions,
  PromptComposerAdd,
  PromptComposerFileItem,
  PromptComposerInput,
  PromptComposerSubmit,
} from "@/components/ui/uai/prompt-composer";
import {
  VoiceInput,
  VoiceInputCancel,
  VoiceInputError,
  VoiceInputFinish,
  VoiceInputIndicator,
  VoiceInputRecorder,
  type VoiceInputState,
  VoiceInputStatus,
  VoiceInputStrip,
  VoiceInputTimer,
  VoiceInputTrigger,
  type VoiceInputVariant,
  VoiceInputWaveform,
} from "@/components/ui/uai/voice-input";

const transcript = "Summarize the failing checks on the Kiln 4.2 release branch and suggest a fix.";

// A seeded stand-in for useAudioLevel(stream): speech-like bursts, the same every run.
function mockLevel() {
  const k = Math.floor(performance.now() / 33);
  const syllable = Math.abs(Math.sin(k * 0.37) * Math.sin(k * 0.11 + 1.3));
  const pause = Math.sin(k * 0.045) > 0.82 ? 0.15 : 1;
  return Math.min(1, 0.08 + syllable * 0.92 * pause);
}

export function VoiceInputPreview({ variant = "inline" }: { variant?: VoiceInputVariant }) {
  const [microphone, setMicrophone] = useState<"allow" | "block">("allow");
  const [transcription, setTranscription] = useState<"succeeds" | "fails">("succeeds");
  const [status, setStatus] = useState<VoiceInputState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [value, setValue] = useState("");
  const [inserted, setInserted] = useState<readonly [number, number]>();
  const timer = useRef<number>(undefined);

  const later = useCallback((ms: number, run: () => void) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(run, ms);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Your app records and counts; the preview ticks a clock while "recording".
  useEffect(() => {
    if (status !== "recording") return;
    const tick = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(tick);
  }, [status]);

  const insert = () => {
    const start = value.length === 0 ? 0 : value.length + 1;
    setValue((current) => (current ? `${current} ${transcript}` : transcript));
    setInserted([start, start + transcript.length]);
    setStatus("idle");
  };

  const transcribe = (fails: boolean) => {
    setStatus("transcribing");
    later(1400, () => (fails ? setStatus("error") : insert()));
  };

  const voice = (children: React.ReactNode, composer?: React.ReactNode) => (
    <VoiceInput
      variant={variant}
      status={status}
      getLevel={mockLevel}
      elapsed={elapsed}
      insertedRange={inserted}
      onStart={() => {
        setElapsed(0);
        setInserted(undefined);
        setStatus("requesting");
        later(900, () => setStatus(microphone === "block" ? "denied" : "recording"));
      }}
      onCancel={() => {
        window.clearTimeout(timer.current);
        setStatus("idle");
      }}
      onFinish={() => transcribe(transcription === "fails")}
      onRetry={() => transcribe(false)}
    >
      {composer ?? children}
      <VoiceInputError />
    </VoiceInput>
  );

  const recorder = (
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
  );

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        <ToggleGroup
          type="single"
          aria-label="Microphone permission"
          value={microphone}
          onValueChange={(next) => next && setMicrophone(next as "allow" | "block")}
        >
          <ToggleGroupItem value="allow">Mic allowed</ToggleGroupItem>
          <ToggleGroupItem value="block">Mic blocked</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="single"
          aria-label="Transcription result"
          value={transcription}
          onValueChange={(next) => next && setTranscription(next as "succeeds" | "fails")}
        >
          <ToggleGroupItem value="succeeds">Transcribes</ToggleGroupItem>
          <ToggleGroupItem value="fails">Fails</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {variant === "pill" ? (
        <div style={{ display: "grid", gap: 16, justifyItems: "center", minHeight: 240 }}>
          <p
            style={{ maxWidth: 340, textAlign: "center" }}
            className="text-muted-foreground text-sm"
          >
            {value || "Tap the mic and say what you need."}
          </p>
          {voice(
            <>
              <VoiceInputTrigger />
              {recorder}
            </>,
          )}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            minHeight: 320,
            display: "grid",
            alignContent: "end",
          }}
        >
          {voice(
            null,
            <PromptComposer
              variant={variant === "compact" ? "compact" : "rounded"}
              value={value}
              onValueChange={(next) => {
                setValue(next);
                setInserted(undefined);
              }}
            >
              <PromptComposerAdd>
                <PromptComposerFileItem />
              </PromptComposerAdd>
              <PromptComposerInput
                placeholder="Ask about the Kiln 4.2 release…"
                aria-label="Message"
              />
              <PromptComposerActions>
                <VoiceInputTrigger />
                {recorder}
                <PromptComposerSubmit />
              </PromptComposerActions>
            </PromptComposer>,
          )}
        </div>
      )}
    </div>
  );
}
