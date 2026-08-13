"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-soft">
        <h1 className="font-display text-2xl font-semibold text-leaf-deep">Onapookkal Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your shop</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Username</label>
            <input
              name="username"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-chethi/10 px-4 py-2.5 text-sm text-chethi">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-leaf py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
