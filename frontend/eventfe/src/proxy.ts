import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server'
import { http } from './configs/http.comfig';
import { envConfig } from './configs/env.config';

const publicPath = ['/auth']

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')
  const refreshToken = cookieStore.get('refresh_token')?.value
  const { pathname } = request.nextUrl;

  if (accessToken && publicPath.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!accessToken && refreshToken) {
    try {
      const res: any = await http.post(`${envConfig.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        refreshToken
      })

      if ("code" in res) {
        cookieStore.delete('refresh_token')
        return NextResponse.redirect(new URL('/auth', request.url))
      }

      const response = NextResponse.redirect(request.url)
      
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

      return response
    } catch {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth'],
}