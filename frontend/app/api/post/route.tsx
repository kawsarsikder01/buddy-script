import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getToken() {
    const cookie = await cookies();
    return cookie.get("token")?.value;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit");

    const token = await getToken();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/posts`);
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
            { error: data.message ?? "Failed to fetch posts" },
            { status: res.status }
        );
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const token = await getToken();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const res = await fetch(`${BACKEND_URL}/api/posts`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { error: data.message ?? "Failed to create post" },
            { status: res.status }
        );
    }

    return NextResponse.json(data, { status: 201 });
}