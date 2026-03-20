import { NextResponse, NextRequest } from 'next/server'

const publicPaths = ['/auth']

// Routes that require specific roles
const adminPaths = ['/admin']
const orgPaths = ['/organization']

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')
  const role = request.cookies.get('user_role')?.value ?? 'student'
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isAdmin = adminPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isOrg = orgPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Authenticated user visiting login page → redirect to their dashboard
  if (accessToken && isPublic) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Unauthenticated user visiting protected page → redirect to login
  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Role-based protection
  if (accessToken) {
    if (isAdmin && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (isOrg && role !== 'organization_leader' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
