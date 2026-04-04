import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    const res = await fetch(
        `${BACKEND_URL}/api/comments/${commentId}/likes/toggle`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.message ?? "Failed to toggle comment like" },
            { status: res.status }
        );
    }

    return NextResponse.json(data);
}
