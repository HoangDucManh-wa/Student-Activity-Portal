const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:3001"
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? ""

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${AI_SERVICE_URL}/api/chatbot/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-key": AI_SERVICE_SECRET,
      },
      body: JSON.stringify(body),
    })
  } catch {
    return new Response("AI service không khả dụng", { status: 503 })
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "unknown error")
    return new Response(`AI service error ${upstream.status}: ${errText}`, {
      status: upstream.status || 502,
    })
  }

  // Pipe the SSE stream from FastAPI straight to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
