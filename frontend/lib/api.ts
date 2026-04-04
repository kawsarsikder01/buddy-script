export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function buildHeaders(token?: string, extra?: HeadersInit): HeadersInit {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(token, options.headers),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? "Request failed";
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export async function apiJson<T>(
  path: string,
  method: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return apiRequest<T>(
    path,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    token,
  );
}
