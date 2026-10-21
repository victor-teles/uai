"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AgentQuestion,
  type AgentQuestionAnswers,
  AgentQuestionDescription,
  AgentQuestionFooter,
  AgentQuestionHeader,
  AgentQuestionItem,
  AgentQuestionItems,
  AgentQuestionOption,
  AgentQuestionOptions,
  AgentQuestionOther,
  AgentQuestionSummary,
  AgentQuestionTitle,
  type AgentQuestionVariant,
} from "@/components/ui/uai/agent-question";

export function AgentQuestionPreview({ variant = "card" }: { variant?: AgentQuestionVariant }) {
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Your agent receives the answers; the preview just waits a moment.
  const send = (_answers: AgentQuestionAnswers) =>
    new Promise<void>((resolve) => {
      timer.current = window.setTimeout(() => {
        setAnswered(true);
        resolve();
      }, 900);
    });

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <p className="m-0 text-[13px]/5 text-muted-foreground">
        Before I scaffold Kiln’s storefront I need three decisions.
      </p>
      <AgentQuestion key={`${variant}-${round}`} variant={variant} onSubmit={send}>
        <AgentQuestionHeader />
        <AgentQuestionItems>
          <AgentQuestionItem id="database" required>
            <AgentQuestionTitle>Which database should I set up?</AgentQuestionTitle>
            <AgentQuestionDescription>
              I found a Prisma schema and a Drizzle config. Migrations will use the one you pick.
            </AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption
                value="postgres"
                label="Postgres"
                recommended
                description="Matches DATABASE_URL in .env.example"
              />
              <AgentQuestionOption
                value="sqlite"
                label="SQLite"
                description="Fastest for local work, no server to run"
              />
              <AgentQuestionOther />
            </AgentQuestionOptions>
          </AgentQuestionItem>
          <AgentQuestionItem id="seed" type="multiple" required>
            <AgentQuestionTitle>What should the seed data include?</AgentQuestionTitle>
            <AgentQuestionDescription>Choose all that apply.</AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption
                value="users"
                label="Demo users"
                description="3 accounts with fixed passwords"
              />
              <AgentQuestionOption
                value="orders"
                label="Sample orders"
                description="40 orders across 2 months"
              />
              <AgentQuestionOther />
            </AgentQuestionOptions>
          </AgentQuestionItem>
          <AgentQuestionItem id="auth">
            <AgentQuestionTitle>Add auth now?</AgentQuestionTitle>
            <AgentQuestionDescription>
              You can add it later with one command.
            </AgentQuestionDescription>
            <AgentQuestionOptions>
              <AgentQuestionOption value="password" label="Email and password" />
              <AgentQuestionOption value="magic-link" label="Magic link" />
              <AgentQuestionOption value="later" label="Not yet" />
            </AgentQuestionOptions>
          </AgentQuestionItem>
        </AgentQuestionItems>
        <AgentQuestionFooter />
        <AgentQuestionSummary time="14:02" />
      </AgentQuestion>
      {answered ? (
        <>
          <p className="m-0 text-[13px]/5 text-foreground">
            Setting up the database and seeding the storefront.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAnswered(false);
              setRound((count) => count + 1);
            }}
          >
            <RotateCcw aria-hidden="true" />
            Ask again
          </Button>
        </>
      ) : null}
    </div>
  );
}
