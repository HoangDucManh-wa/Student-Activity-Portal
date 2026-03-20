import { http } from "@/configs/http.comfig"

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/chat-sessions`

export interface ChatMessage {
  messageId: number
  sessionId: number
  role: "user" | "model"
  content: string
  createdAt: string
}

export interface ChatSession {
  sessionId: number
  title: string
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export async function createSession(title?: string) {
  return http.post<{ success: boolean; data: ChatSession }>(BASE, { title })
}

export async function getMySessions(page = 1, limit = 30) {
  return http.get<{ success: boolean; data: { data: ChatSession[]; meta: Record<string, number> } }>(
    `${BASE}?page=${page}&limit=${limit}`
  )
}

export async function getSessionById(id: number) {
  return http.get<{ success: boolean; data: ChatSession }>(`${BASE}/${id}`)
}

export async function saveMessages(sessionId: number, messages: { role: string; content: string }[]) {
  return http.post(`${BASE}/${sessionId}/messages`, { messages })
}

export async function deleteSession(id: number) {
  return http.delete(`${BASE}/${id}`, {})
}
