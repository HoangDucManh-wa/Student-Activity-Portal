/**
 * useChatBot — fetches real portal context (activities, orgs, current user)
 * and exposes streaming sendMessage + conversation state.
 *
 * Context is refreshed on every new session so the AI always has
 * up-to-date data from the database.
 */

import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth.service";
import { getActivities } from "@/services/activity.service";
import { getOrganizations } from "@/services/organization.service";
import type { ChatMessage, PortalContext } from "@/services/chatbot.service";

interface UseChatBotOptions {
  enabled?: boolean;
}

export function useChatBot(opts: UseChatBotOptions = {}) {
  const { enabled = true } = opts;

  // ── Portal context (refreshed every session start) ──────────────────────────

  const { data: meData } = useQuery({
    queryKey: ["chatbot", "me"],
    queryFn: () => getMe(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const { data: activitiesData } = useQuery({
    queryKey: ["chatbot", "activities"],
    queryFn: () =>
      getActivities({
        page: 1,
        limit: 50,
        status: "published",
      }),
    enabled,
    staleTime: 1000 * 60, // 1 min
  });

  const { data: orgsData } = useQuery({
    queryKey: ["chatbot", "organizations"],
    queryFn: () => getOrganizations({ page: 1, limit: 50 }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // ── Conversation state ──────────────────────────────────────────────────────

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Build context ───────────────────────────────────────────────────────────

  const buildContext = useCallback((): PortalContext => {
    const user = meData?.data?.user;
    const activities = (activitiesData?.data?.data ?? []).map((a) => ({
      activityId: a.activityId,
      activityName: a.activityName,
      description: a.description,
      location: a.location,
      startTime: a.startTime,
      endTime: a.endTime,
      registrationDeadline: a.registrationDeadline,
      organizationName: a.organization?.organizationName,
      categoryName: a.category?.categoryName,
      activityStatus: a.activityStatus,
    }));

    const organizations = (orgsData?.data?.data ?? []).map((o) => ({
      organizationId: o.organizationId,
      organizationName: o.organizationName,
      description: o.description,
      organizationType: o.organizationType,
    }));

    return {
      activities,
      organizations,
      currentUser: user
        ? {
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            university: user.university,
          }
        : null,
    };
  }, [meData, activitiesData, orgsData]);

  // ── Send message ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      // Placeholder for streaming reply
      const placeholderMsg: ChatMessage = { role: "model", content: "" };
      setMessages([...nextMessages, placeholderMsg]);

      // Abort any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            message: text,
            history: messages,
            context: buildContext(),
          }),
        });

        if (!res.ok || !res.body) throw new Error("stream_unavailable");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

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
            if (raw === "[DONE]") break;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "model", content: accumulated };
                  return updated;
                });
              }
            } catch {
              /* partial JSON */
            }
          }
        }

        const finalReply = accumulated || "Xin loi, toi khong the phan hoi luc nay.";

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "model" && last.content === "") {
            updated[updated.length - 1] = { role: "model", content: finalReply };
          }
          return updated;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errMsg: ChatMessage = {
          role: "model",
          content: "Khong the ket noi den AI service. Vui long kiem tra lai.",
        };
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "model" && last.content === "") {
            updated[updated.length - 1] = errMsg;
          } else {
            updated.push(errMsg);
          }
          return updated;
        });
        setError("AI service unavailable");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, buildContext]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
    isContextReady: !!(activitiesData && orgsData),
  };
}
