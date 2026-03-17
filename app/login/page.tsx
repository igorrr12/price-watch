"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus("loading");
    setErrorMessage("");

    const supabase = createSupabaseBrowserClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-charcoal">
          Login
        </h1>
        <p className="mt-2 text-sm font-medium text-charcoal/80">
          Sign in with your email and password to access your dashboard.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "loading"}
            />
          </div>
          
          {status === "error" && (
            <p className="border-2 border-charcoal bg-rose-200 px-4 py-2 font-bold text-charcoal">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 text-base font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:bg-gray-400"
          >
            {status === "loading" ? "Logging in..." : "Log In"}
          </button>
          
          <div className="mt-4 text-center">
            <Link
              href="/register"
              className="text-sm font-bold uppercase tracking-wide text-charcoal underline transition-colors hover:text-brand"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

