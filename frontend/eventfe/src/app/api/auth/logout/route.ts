import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  let refreshToken: string | undefined;
  try {
    const body = await request.json();
    refreshToken = body.refreshToken;
  } catch {
    refreshToken = undefined;
  }

  if (accessToken) {
    await http.post(
      `${envConfig.NEXT_PUBLIC_API_URL}/auth/logout`,
      { refreshToken },
      `access_token=${accessToken}`
    );
  }

  cookieStore.delete("access_token");
  cookieStore.delete("user_role");

  return NextResponse.json({ success: true });
}
