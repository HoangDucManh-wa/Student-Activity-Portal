/**
 * Chatbot service — thin typed wrapper around /api/ai/chat/stream (SSE).
 * The route proxies to AI service which uses RAG retrieval.
 */

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface PortalContext {
  activities: Record<string, unknown>[];
  organizations: Record<string, unknown>[];
  currentUser: Record<string, unknown> | null;
}

export interface StreamChunk {
  text?: string;
  done?: boolean;
}

function parseSSELines(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onText: (text: string) => void
): Promise<string> {
  const decoder = new TextDecoder();
  let buffer = "";

  async function read(): Promise<string> {
    const { done, value } = await reader.read();
    if (done) {
      // flush remaining buffer
      if (buffer.trim()) {
        const raw = buffer.trim();
        if (raw.startsWith("data:")) {
          const text = raw.slice(5).trim();
          if (text !== "[DONE]") {
            try {
              const parsed: StreamChunk = JSON.parse(text);
              if (parsed.text) onText(parsed.text);
            } catch {
              /* ignore partial */
            }
          }
        }
      }
      return buffer;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (raw === "[DONE]") continue;
      try {
        const parsed: StreamChunk = JSON.parse(raw);
        if (parsed.text) onText(parsed.text);
      } catch {
        /* ignore partial JSON */
      }
    }

    return read();
  }

  return read();
}

/**
 * Send a message and stream the response back as chunks.
 * Returns an async generator yielding text fragments.
 */
export async function* streamChat(
  message: string,
  history: ChatMessage[],
  context: PortalContext
): AsyncGenerator<string, void, unknown> {
  const res = await fetch("/api/ai/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok || !res.body) {
    throw new Error("stream_unavailable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (raw === "[DONE]") continue;
      try {
        const parsed: StreamChunk = JSON.parse(raw);
        if (parsed.text) {
          yield parsed.text;
        }
      } catch {
        /* partial JSON */
      }
    }
  }
}

/**
 * Non-streaming variant — waits for full response.
 */
export async function chat(
  message: string,
  history: ChatMessage[],
  context: PortalContext
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok) {
    throw new Error("chat_failed");
  }

  const data = await res.json() as { success: boolean; data: { reply: string; history: ChatMessage[] } };
  return { reply: data.data.reply, updatedHistory: data.data.history };
}
