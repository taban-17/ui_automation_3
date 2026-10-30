import "dotenv/config"

import type { ChatMessage, ToolCall, ToolDefinition } from "./tools";

export interface ChatOptions {
  sessionId: string;
  systemPrompt: string;
  messages: ChatMessage[];
  tools: ToolDefinition[];
  model?: string;
  maxTokens?: number;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
}

export interface ChatResponse {
  assistant: ChatMessage;
  toolCalls: ToolCall[];
  usage: ChatUsage;
  finishReason: string;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function chat(opts: ChatOptions): Promise<ChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const model =
    opts.model ??
    process.env.OPENROUTER_MODEL ??
    "openai/gpt-oss-120b:free";;

  const body = {
    model,
    session_id: opts.sessionId,
    max_tokens: opts.maxTokens ?? 1024,
    tool_choice: "auto",
    tools: opts.tools,
    messages: [
      {
        role: "system",
        content: [
          { type: "text", text: opts.systemPrompt },
          { type: "text", text: "", cache_control: { type: "ephemeral" } },
        ],
      },
      ...opts.messages,
    ],
  };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Router UI Automation",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 402) {
    const body = await res.json();
    const limitSource = body?.error?.metadata?.limit_source;
    if (limitSource === "openrouter_in_flight_budget") {
        const retryAfter = Number(body?.error?.metadata?.headers?.["Retry-After"] ?? 120);
        console.warn(`in-flight budget exhausted; sleeping ${retryAfter}s`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return chat(opts); // retry once
    }
    throw new Error(`OpenRouter 402: ${JSON.stringify(body)}`);
    }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  const json = (await res.json()) as {
    choices: Array<{
      message: ChatMessage & { tool_calls?: ToolCall[] };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      prompt_tokens_details?: { cached_tokens?: number };
    };
  };

  const choice = json.choices[0];
  return {
    assistant: {
      role: "assistant",
      content: choice.message.content,
      tool_calls: choice.message.tool_calls,
    },
    toolCalls: choice.message.tool_calls ?? [],
    usage: {
      prompt_tokens: json.usage.prompt_tokens,
      completion_tokens: json.usage.completion_tokens,
      cached_tokens: json.usage.prompt_tokens_details?.cached_tokens ?? 0,
    },
    finishReason: choice.finish_reason,
  };
}