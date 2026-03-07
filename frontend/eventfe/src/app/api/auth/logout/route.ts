import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value;

  const res = await http.post(`${envConfig.NEXT_PUBLIC_API_URL}/auth/logout`, { refreshToken }) as any
  

  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")

  return NextResponse.json(res)
}