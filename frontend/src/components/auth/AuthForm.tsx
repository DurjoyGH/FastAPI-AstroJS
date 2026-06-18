import { useMemo, useState } from "react";
import { login, register } from "../../lib/api";
import { saveSession } from "../../lib/auth";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = useMemo(
    () =>
      mode === "login"
        ? {
            eyebrow: "Welcome back",
            title: "Access your tactical hub",
            description: "Sign in to continue your match analysis, transfer debates, and tactical questions.",
            action: "Sign in",
            swapText: "New here?",
            swapAction: "Create an account",
            swapHref: "/register",
          }
        : {
            eyebrow: "Join the elite",
            title: "Start your football journey",
            description: "Get instant, AI-driven answers about teams, players, tactics, and real-time match data.",
            action: "Create account",
            swapText: "Already registered?",
            swapAction: "Sign in",
            swapHref: "/login",
          },
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register(name.trim(), email.trim(), password);
      }

      const session = await login(email.trim(), password);
      saveSession(session.access_token, email.trim());
      window.location.href = "/chat";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white relative overflow-hidden flex items-center justify-center">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 relative z-10">
        
        {/* Left Side: Copy */}
        <section className="flex flex-col justify-center px-4 py-8 sm:px-10">
          <a href="/" className="inline-flex w-fit items-center gap-3 text-lg font-bold tracking-wide mb-16">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="relative z-10 font-black">FC</span>
            </div>
            Football Chatbot
          </a>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-400">{content.eyebrow}</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 pb-2">{content.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400 font-light">{content.description}</p>
          </div>

          <div className="mt-12 hidden grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-zinc-400 sm:grid">
            <div className="border-l-2 border-brand-500 pl-4 bg-gradient-to-r from-brand-500/10 to-transparent py-2 rounded-r-lg">
              <span className="block font-bold text-zinc-200 mb-1">Expert AI</span>
              Football-only answers
            </div>
            <div className="border-l-2 border-blue-500 pl-4 bg-gradient-to-r from-blue-500/10 to-transparent py-2 rounded-r-lg">
              <span className="block font-bold text-zinc-200 mb-1">Secure</span>
              Encrypted sessions
            </div>
            <div className="border-l-2 border-purple-500 pl-4 bg-gradient-to-r from-purple-500/10 to-transparent py-2 rounded-r-lg">
              <span className="block font-bold text-zinc-200 mb-1">Fast</span>
              Real-time responses
            </div>
          </div>
        </section>

        {/* Right Side: Form */}
        <section className="flex items-center justify-center py-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
          
          <div className="relative w-full max-w-md glass-card rounded-2xl p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Name</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-white placeholder-zinc-500 outline-none transition-all focus:border-brand-500 focus:bg-zinc-800 focus:ring-1 focus:ring-brand-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-white placeholder-zinc-500 outline-none transition-all focus:border-brand-500 focus:bg-zinc-800 focus:ring-1 focus:ring-brand-500"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  type="password"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3.5 text-white placeholder-zinc-500 outline-none transition-all focus:border-brand-500 focus:bg-zinc-800 focus:ring-1 focus:ring-brand-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-xl bg-brand-500 px-5 py-4 font-bold text-zinc-950 transition-all hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10">{isSubmitting ? "Authenticating..." : content.action}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-400">
              {content.swapText}{" "}
              <a href={content.swapHref} className="font-semibold text-brand-400 hover:text-brand-300 transition-colors hover:underline underline-offset-4">
                {content.swapAction}
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
