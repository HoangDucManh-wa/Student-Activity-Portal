import { envConfig } from "@/configs/env.config";
import { http } from "@/configs/http.comfig";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const body = await request.json();
  const res = await http.post(`${envConfig.NEXT_PUBLIC_API_URL}/auth/login`, body) as any
  const response = NextResponse.json({
    code: res.code,
    message: res.message,
    server: res.server
  })

  if("code" in res){
    return response
  }
  
  response.cookies.set('access_token', res.accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: Number(envConfig.COOKIE_ACCESS_TOKEN_MAX_AGE),
    path: '/'
  })

  response.cookies.set('refresh_token', res.refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: Number(envConfig.COOKIE_REFRESH_TOKEN_MAX_AGE),
    path: '/'
  })
  return response;
}