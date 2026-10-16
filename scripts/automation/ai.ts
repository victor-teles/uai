/**
 * Minimal client for the vision/text model used by the automation scripts.
 *
 * Keys come only from the environment, which the workflows fill from GitHub
 * Secrets. Nothing here has a default key or model:
 *
 *   ANTHROPIC_API_KEY or OPENAI_API_KEY   (secret)
 *   AI_PROVIDER   "anthropic" | "openai"  (optional; inferred from the key that is set)
 *   AI_MODEL      model id, e.g. a current vision-capable model of that provider
 */

export type AiImage = { mediaType: "image/png" | "image/jpeg"; base64: string; label?: string };

export type AiRequest = {
  system: string;
  prompt: string;
  images?: readonly AiImage[];
  maxTokens?: number;
};

type Provider = "anthropic" | "openai";

export class AiConfigError extends Error {}

export function resolveAiConfig(env: Record<string, string | undefined> = process.env) {
  const requested = env.AI_PROVIDER?.trim().toLowerCase();
  const provider: Provider | undefined =
    requested === "anthropic" || requested === "openai"
      ? requested
      : env.ANTHROPIC_API_KEY
        ? "anthropic"
        : env.OPENAI_API_KEY
          ? "openai"
          : undefined;
  if (!provider) {
    throw new AiConfigError(
      "No AI key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY (as a GitHub Secret in CI).",
    );
  }
  const apiKey = provider === "anthropic" ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiConfigError(`AI_PROVIDER is ${provider}, but its API key is not set.`);
  }
  const model = env.AI_MODEL?.trim();
  if (!model) {
    throw new AiConfigError("Set AI_MODEL to a vision-capable model id for the chosen provider.");
  }
  return { provider, apiKey, model };
}

export async function completeWithAi(request: AiRequest): Promise<string> {
  const { provider, apiKey, model } = resolveAiConfig();
  const maxTokens = request.maxTokens ?? 1500;
  const images = request.images ?? [];

  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: request.system,
        messages: [
          {
            role: "user",
            content: [
              ...images.flatMap((image) => [
                ...(image.label ? [{ type: "text", text: image.label }] : []),
                {
                  type: "image",
                  source: { type: "base64", media_type: image.mediaType, data: image.base64 },
                },
              ]),
              { type: "text", text: request.prompt },
            ],
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Anthropic API ${response.status}: ${await response.text()}`);
    const body = (await response.json()) as { content: { type: string; text?: string }[] };
    return body.content.map((part) => part.text ?? "").join("");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: request.system },
        {
          role: "user",
          content: [
            ...images.flatMap((image) => [
              ...(image.label ? [{ type: "text", text: image.label }] : []),
              {
                type: "image_url",
                image_url: { url: `data:${image.mediaType};base64,${image.base64}` },
              },
            ]),
            { type: "text", text: request.prompt },
          ],
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${await response.text()}`);
  const body = (await response.json()) as { choices: { message: { content: string } }[] };
  return body.choices[0]?.message.content ?? "";
}

/** The first JSON object in a model reply, which may wrap it in prose or a code fence. */
export function extractJson<T>(reply: string): T {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error(`No JSON object in model reply: ${reply}`);
  return JSON.parse(reply.slice(start, end + 1)) as T;
}
