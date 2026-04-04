import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.message ?? "Failed to fetch user" },
            { status: res.status }
        );
    }

    return NextResponse.json(data);
}
