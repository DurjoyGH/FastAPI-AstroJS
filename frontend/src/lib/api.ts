export const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

type ApiOptions = {
  token?: string | null;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterResponse = {
  message: string;
  user_id: string;
};

export type ChatResponse = {
  reply: string;
};

export type ChatHistoryItem = {
  id: string;
  user_message: string;
  bot_reply: string;
  created_at: string;
};

async function parseApiError(response: Response) {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    return response.statusText || "Request failed";
  }

  return response.statusText || "Request failed";
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(name: string, email: string, password: string) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function sendChatMessage(message: string, token: string) {
  return apiRequest<ChatResponse>("/chat/message", {
    method: "POST",
    token,
    body: { message },
  });
}

export function getChatHistory(token: string) {
  return apiRequest<ChatHistoryItem[]>("/chat/history", {
    token,
  });
}
