import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const cookie = await cookies();
    const token = cookie.get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.message ?? "Failed to add comment" },
            { status: res.status }
        );
    }

    return NextResponse.json(data, { status: 201 });
}
