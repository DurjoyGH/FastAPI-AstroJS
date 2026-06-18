const TOKEN_KEY = "football_chat_token";
const EMAIL_KEY = "football_chat_email";

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUserEmail() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(EMAIL_KEY);
}

export function saveSession(token: string, email: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}
