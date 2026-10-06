"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthCard, Button, OtpInput } from "@gio4x/ui";
import { requestEmailOtp, resendVerification, verifyEmailOtp } from "@/lib/auth-actions";

// Two modes:
//   ?type=signup&email=…  confirm a new account with the 6-digit code from the
//                         "Confirm signup" e-mail, then land on the dashboard.
//   (default)             passwordless sign-in: ask for the e-mail, send a code.
export default function VerifyOtpPage() {
  const router = useRouter();
  const search = useSearchParams();
  const isSignup = search.get("type") === "signup";
  const initialEmail = search.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(!!initialEmail);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    isSignup && initialEmail ? "Account created. We emailed you a 6-digit code." : null,
  );

  function onRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = isSignup ? await resendVerification(fd) : await requestEmailOtp(fd);
      if (res?.ok) {
        setSent(true);
        setMessage(res.message ?? "Code sent.");
      } else {
        setError(res?.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("token", code);
    fd.set("type", isSignup ? "signup" : "email");
    startTransition(async () => {
      const res = await verifyEmailOtp(fd);
      if (res?.ok) {
        router.push(res.redirectTo ?? "/");
        router.refresh();
      } else {
        setError(res?.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function onResend() {
    setError(null);
    setMessage(null);
    const fd = new FormData();
    fd.set("email", email);
    startTransition(async () => {
      const res = isSignup ? await resendVerification(fd) : await requestEmailOtp(fd);
      if (res?.ok) setMessage(isSignup ? "A new code is on its way." : (res.message ?? "Code sent."));
      else setError(res?.error ?? "Could not send a new code.");
    });
  }

  const title = isSignup ? "Verify your email" : sent ? "Enter the code" : "Sign in with a code";
  const subtitle = sent
    ? `Enter the 6-digit code we sent to ${email}.`
    : isSignup
      ? "Enter your email to get a new verification code."
      : "We'll email you a 6-digit code instead of a password.";

  return (
    <AuthCard
      title={title}
      subtitle={subtitle}
      footer={
        <Link href="/auth/login" className="text-sky hover:underline">
          {isSignup ? "← Back to sign in" : "← Use password instead"}
        </Link>
      }
    >
      {!sent ? (
        <form onSubmit={onRequest} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-steel">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky/60 focus:outline-none"
            />
          </div>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}
          <Button variant="primary" type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <div>
            <label className="block text-xs font-medium text-steel">6-digit code</label>
            <div className="mt-2">
              <OtpInput value={code} onChange={setCode} disabled={pending} />
            </div>
          </div>
          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}
          <Button
            variant="primary"
            type="submit"
            className="w-full"
            disabled={pending || code.length < 6}
          >
            {pending ? "Verifying…" : isSignup ? "Verify & continue" : "Verify & sign in"}
          </Button>
          <div className="flex items-center justify-between text-[11px] text-steel">
            <button
              type="button"
              onClick={onResend}
              disabled={pending}
              className="hover:text-navy disabled:opacity-50"
            >
              Didn&apos;t get it? Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setCode("");
                setMessage(null);
                setError(null);
              }}
              className="hover:text-navy"
            >
              Wrong email? Start over
            </button>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
