import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { NextResponse } from "next/server";

// Backend trả: { success: true, data: { user, accessToken, refreshToken } }
// Lỗi trả:    { success: false, code, message }

export async function POST(request: Request) {
  const body = await request.json();
  const res = await http.post(`${envConfig.NEXT_PUBLIC_API_URL}/auth/login`, body) as any;

  if (!res?.success) {
    return NextResponse.json({ code: res?.code, message: res?.message });
  }

  const { user, accessToken, refreshToken } = res.data;

  const cookieOpts = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(envConfig.COOKIE_ACCESS_TOKEN_MAX_AGE) || 1800,
    path: "/",
    sameSite: "lax" as const,
  };

  const response = NextResponse.json({
    success: true,
    refreshToken,
    user,
  });

  response.cookies.set("access_token", accessToken, cookieOpts);
  response.cookies.set("user_role", user.role ?? "student", cookieOpts);

  return response;
}
