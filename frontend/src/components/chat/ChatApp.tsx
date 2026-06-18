import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getChatHistory, sendChatMessage, type ChatHistoryItem } from "../../lib/api";
import { clearSession, getToken, getUserEmail } from "../../lib/auth";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  fullContent?: string;
  status?: "sending" | "sent" | "error";
  isTyping?: boolean;
};

export default function ChatApp() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to your tactical hub. Ask me anything about football: tactics, players, rules, leagues, transfers, or match history.",
      status: "sent",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      window.location.href = "/login";
      return;
    }

    setToken(storedToken);
    setEmail(getUserEmail());
    loadHistory(storedToken);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const canSend = useMemo(() => Boolean(input.trim() && token && !isSending), [input, token, isSending]);

  async function loadHistory(authToken: string) {
    setIsHistoryLoading(true);

    try {
      setHistory(await getChatHistory(authToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load chat history");
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function typeAssistantReply(messageId: string, fullContent: string) {
    let index = 0;
    const step = Math.max(2, Math.ceil(fullContent.length / 180));

    const interval = window.setInterval(() => {
      index = Math.min(fullContent.length, index + step);

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: fullContent.slice(0, index),
                fullContent,
                status: index >= fullContent.length ? "sent" : "sending",
                isTyping: index < fullContent.length,
              }
            : message,
        ),
      );

      if (index >= fullContent.length) {
        window.clearInterval(interval);
      }
    }, 18);
  }

  function openHistoryItem(item: ChatHistoryItem) {
    setMessages([
      {
        id: `${item.id}-user`,
        role: "user",
        content: item.user_message,
        status: "sent",
      },
      {
        id: `${item.id}-assistant`,
        role: "assistant",
        content: item.bot_reply,
        status: "sent",
      },
    ]);
    setError("");
  }

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>, value = input) {
    event?.preventDefault();

    const trimmed = value.trim();
    if (!trimmed || !token || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      status: "sent",
    };
    const pendingMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Analyzing data...",
      status: "sending",
    };

    setMessages((current) => [...current, userMessage, pendingMessage]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await sendChatMessage(trimmed, token);
      typeAssistantReply(pendingMessage.id, response.reply);
      loadHistory(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Message failed";
      setError(message);
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingMessage.id ? { ...item, content: message, status: "error" } : item,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  function logout() {
    clearSession();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Subtle background ambient light */}
      <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] rounded-full bg-brand-900/10 blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="grid h-screen grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-5 text-white lg:border-b-0 lg:border-r overflow-y-auto custom-scrollbar flex flex-col z-20">
          <div className="flex items-center justify-between gap-4 lg:block">
            <a href="/" className="inline-flex items-center gap-3 font-bold tracking-wide">
              <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <span className="relative z-10 font-black text-sm">FC</span>
              </div>
              <span className="text-zinc-100">Football Chatbot</span>
            </a>
            <button
              onClick={logout}
              className="lg:hidden rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Session Active</p>
            </div>
            <p className="break-words text-sm font-medium text-zinc-200 mt-1">{email ?? "Authenticated user"}</p>
            <button
              onClick={logout}
              className="mt-3 w-full rounded-lg bg-zinc-800/80 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            >
              Sign out
            </button>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Chat History</p>
              {token && (
                <button
                  onClick={() => loadHistory(token)}
                  className="text-zinc-500 hover:text-brand-400 transition-colors"
                  title="Refresh history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {isHistoryLoading && <p className="text-sm text-zinc-500 flex items-center gap-2"><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading...</p>}
              {!isHistoryLoading && history.length === 0 && (
                <p className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 px-3 py-3 text-sm text-zinc-600">
                  No saved chats yet.
                </p>
              )}
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openHistoryItem(item)}
                  className="w-full rounded-xl border border-zinc-800/30 bg-zinc-900/20 px-3 py-3 text-left transition hover:border-brand-500/30 hover:bg-zinc-800/50 group"
                >
                  <span className="block truncate text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{item.user_message}</span>
                  <span className="mt-1 block text-[10px] text-zinc-600 uppercase tracking-wide">{formatHistoryDate(item.created_at)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex h-screen flex-col relative z-10">
          <header className="border-b border-zinc-800/80 bg-zinc-950/60 px-5 py-4 backdrop-blur-md sm:px-8 shrink-0">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  Tactical Analysis 
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-400 border border-brand-500/20">Live</span>
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 custom-scrollbar">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-brand-600 text-white rounded-tr-sm shadow-[0_4px_20px_rgba(16,185,129,0.15)] border border-brand-500/50"
                        : message.status === "error"
                          ? "border border-red-500/30 bg-red-500/10 text-red-200 rounded-tl-sm"
                          : "border border-zinc-800 bg-zinc-900/80 text-zinc-200 rounded-tl-sm backdrop-blur-sm shadow-lg"
                    }`}
                  >
                    {message.role === "assistant" && message.status !== "error" ? (
                      <FormattedAnswer content={message.content} isTyping={message.isTyping} />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">{message.content}</p>
                    )}
                  </div>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-5 py-4 sm:px-8 shrink-0">
            <div className="mx-auto max-w-4xl">
              {error && <p className="mb-3 text-sm font-medium text-red-400 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</p>}
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={1}
                  className="min-h-[56px] w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900/50 pl-5 pr-20 py-4 text-white placeholder-zinc-500 outline-none transition-all focus:border-brand-500 focus:bg-zinc-800/80 focus:ring-1 focus:ring-brand-500 custom-scrollbar"
                  placeholder="Ask about tactics, players, or match data..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="absolute right-2 top-2 bottom-2 flex w-10 items-center justify-center rounded-xl bg-brand-500 text-zinc-950 transition-all hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  )}
                </button>
              </form>
              <div className="mt-2 text-center">
                <p className="text-[10px] text-zinc-600">AI can make mistakes. Verify critical tactical information.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatHistoryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function FormattedAnswer({ content, isTyping }: { content: string; isTyping?: boolean }) {
  if (content === "Analyzing data..." && !isTyping) {
    return (
      <div className="flex items-center gap-1.5 h-6 px-2 py-1">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-zinc-200 sm:text-base markdown-body">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="mb-4 text-xl font-black text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-4 text-lg font-bold text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-bold text-white">{children}</h3>,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 space-y-2 pl-2 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6 last:mb-0">{children}</ol>,
          li: ({ children }) => (
            <li className="flex gap-3 items-start">
              <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-zinc-300">{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-4 transition-colors" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-sm font-mono text-brand-300 border border-zinc-700/50">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isTyping && <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-brand-500 ml-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
    </div>
  );
}
