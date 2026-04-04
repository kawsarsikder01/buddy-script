import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Call external backend
    const res = await fetch(`${backendUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed" },
        { status: res.status }
      );
    }

    // Prepare success response
    const response = NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );

    // Store JWT in httpOnly cookie
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}