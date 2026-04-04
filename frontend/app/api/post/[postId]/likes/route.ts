import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getToken() {
    const cookie = await cookies();
    return cookie.get("token")?.value;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit");

    const token = await getToken();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/posts/${postId}/likes`);
    if (cursor) backendUrl.searchParams.set("cursor", cursor);
    if (limit) backendUrl.searchParams.set("limit", limit);

    const res = await fetch(backendUrl.toString(), {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.message ?? "Failed to fetch likes" },
            { status: res.status }
        );
    }

    return NextResponse.json(data);
}
