import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { NextResponse } from "next/server";

// Backend trả: { success: true, data: { accessToken } }

export async function POST(request: Request) {
  let refreshToken: string | undefined;
  try {
    const body = await request.json();
    refreshToken = body.refreshToken;
  } catch {
    return NextResponse.json({ code: "INVALID_BODY", message: "Missing refreshToken" }, { status: 400 });
  }

  if (!refreshToken) {
    return NextResponse.json({ code: "MISSING_TOKEN", message: "refreshToken is required" }, { status: 400 });
  }

  const res = await http.post(
    `${envConfig.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
    { refreshToken }
  ) as any;

  if (!res?.success) {
    return NextResponse.json(
      { code: res?.code ?? "REFRESH_FAILED", message: res?.message ?? "Token refresh failed" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", res.data.accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(envConfig.COOKIE_ACCESS_TOKEN_MAX_AGE) || 1800,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
