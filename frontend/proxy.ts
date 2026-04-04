// proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const { pathname } = req.nextUrl

  const isAuthPage = pathname === '/login' || pathname === '/registration'
  const isHomePage = pathname === '/'

  // No token + trying to access home → go to login
  if (!token && isHomePage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Has token + trying to access login/register → go to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/registration'],
}