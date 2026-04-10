"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Bot, Loader2, History, Plus, Trash2, ChevronLeft } from "lucide-react"
import {
  createSession,
  getMySessions,
  getSessionById,
  saveMessages,
  deleteSession,
  type ChatSession,
} from "@/services/chatSession.service"
import { useChatBot } from "@/hooks/useChatBot"

type View = "chat" | "history"

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<View>("chat")

  // Session management (history — kept separate from AI hook)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // ── RAG-powered chatbot hook ─────────────────────────────────────────────────
  const { messages, isLoading, sendMessage, reset, isContextReady } = useChatBot()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // ── History ────────────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await getMySessions()
      setSessions(res?.data?.data ?? [])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const openSession = async (id: number) => {
    const res = await getSessionById(id)
    if (!res?.data) return
    setSessionId(res.data.sessionId)
    setView("chat")
  }

  const startNewSession = () => {
    setSessionId(null)
    reset()
    setView("chat")
  }

  const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.sessionId !== id))
    if (sessionId === id) {
      setSessionId(null)
      reset()
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    setInput("")
    let currentSessionId = sessionId

    // Create backend session on first message
    if (!currentSessionId) {
      const created = await createSession(text.slice(0, 60)).catch(() => null)
      if (created?.data?.sessionId) {
        currentSessionId = created.data.sessionId
        setSessionId(currentSessionId)
      }
    }

    await sendMessage(text)

    // Persist conversation to backend session
    if (currentSessionId) {
      const recent = messages.slice(-2)
      if (recent.length === 2) {
        await saveMessages(currentSessionId, recent).catch(() => {})
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (view === "history") loadHistory()
  }

  const switchToHistory = () => {
    setView("history")
    loadHistory()
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="fixed bottom-6 right-6 z-[9999] w-[52px] h-[52px] rounded-full bg-[#05566B] text-white flex items-center justify-center shadow-lg hover:bg-[#06677f] transition-colors"
        aria-label="Mở chatbot AI"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-[72px] right-6 z-[9998] w-[360px] flex flex-col rounded-[16px] overflow-hidden shadow-2xl border border-gray-200 bg-white">
          {/* Header */}
          <div className="bg-[#05566B] px-4 py-3 flex items-center gap-3">
            {view === "history" ? (
              <button onClick={() => setView("chat")} className="text-white/80 hover:text-white">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <Bot size={20} className="text-white" />
            )}
            <div className="flex-1">
              <p className="text-white font-semibold text-[14px]">
                {view === "history" ? "Lịch sử trò chuyện" : "Trợ lý AI"}
              </p>
              {view === "chat" && (
                <p className="text-white/70 text-[11px]">
                  {isContextReady ? "Hỏi về sự kiện, CLB, đăng ký..." : "Đang tải dữ liệu..."}
                </p>
              )}
            </div>
            {view === "chat" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewSession}
                  title="Cuộc trò chuyện mới"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={switchToHistory}
                  title="Lịch sử"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <History size={18} />
                </button>
              </div>
            )}
            {view === "history" && (
              <button
                onClick={startNewSession}
                title="Cuộc trò chuyện mới"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          {/* ── History view ── */}
          {view === "history" && (
            <div className="flex-1 overflow-y-auto bg-gray-50" style={{ height: 360 }}>
              {historyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="animate-spin text-[#05566B]" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[13px] gap-2">
                  <History size={32} className="text-[#05566B]/20" />
                  <p>Chưa có lịch sử trò chuyện</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sessions.map((s) => (
                    <li
                      key={s.sessionId}
                      onClick={() => openSession(s.sessionId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                        sessionId === s.sessionId ? "bg-blue-50" : ""
                      }`}
                    >
                      <Bot size={16} className="text-[#05566B] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-800 truncate">{s.title}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(s.updatedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(s.sessionId, e)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Chat view ── */}
          {view === "chat" && (
            <>
              <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50"
                style={{ height: 360, maxHeight: 360 }}
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 text-[13px] gap-2">
                    <Bot size={32} className="text-[#05566B]/30" />
                    <p>
                      Xin chào! Tôi có thể giúp bạn tìm sự kiện,
                      <br />
                      thông tin CLB và hỗ trợ đăng ký.
                    </p>
                    {!isContextReady && (
                      <Loader2 size={14} className="animate-spin mt-1" />
                    )}
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isPlaceholder =
                    !isLoading && msg.role === "model" && i === messages.length - 1 && msg.content === ""
                  return (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "model" && (
                        <div className="w-7 h-7 rounded-full bg-[#05566B] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot size={14} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-[12px] text-[13px] leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-[#05566B] text-white rounded-tr-[4px]"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-[4px]"
                        }`}
                      >
                        {msg.content}
                        {/* Blinking cursor for streaming placeholder */}
                        {isPlaceholder && (
                          <span className="inline-block w-[2px] h-[13px] ml-0.5 bg-gray-400 align-middle animate-pulse" />
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Loading dots while AI is thinking */}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#05566B] flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-[12px] rounded-tl-[4px] px-3 py-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#05566B]/50 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-[#05566B]/50 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-[#05566B]/50 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-200 bg-white flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isContextReady ? "Nhập câu hỏi..." : "Đang tải dữ liệu portal..."
                  }
                  disabled={isLoading}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-[13px] outline-none focus:border-[#05566B] disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || !isContextReady}
                  className="w-9 h-9 rounded-full bg-[#05566B] text-white flex items-center justify-center hover:bg-[#06677f] disabled:opacity-40 transition-colors"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
