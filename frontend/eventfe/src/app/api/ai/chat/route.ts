import { NextResponse } from "next/server"

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:3001"
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET ?? ""

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
  }

  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-key": AI_SERVICE_SECRET,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, message: "AI service không khả dụng" },
      { status: 503 }
    )
  }
}
