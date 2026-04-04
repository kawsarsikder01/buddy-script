import { NextResponse } from 'next/server'

export async function POST(req: Request) { 
    const { email, password } = await req.json()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

    // Call your external backend
    const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }) 

    const data = await res.json()

    if (!res.ok) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Store JWT in httpOnly cookie
    const response = NextResponse.json({ success: true, user: data.user })
    response.cookies.set('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    return response;
}