"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { confirmLoginCode, readSession, requestLoginCode, saveSession } from "../lib/api";
import { Mark } from "./mark";

function startPath(role: string) {
  return role === "tourist" || role === "operator_owner" ? "/wallets" : "/home";
}

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const saved = readSession();
    if (saved) router.replace(startPath(saved.user.role));
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setNotice("Enter a valid email.");
      return;
    }
    if (sent && code.trim().length !== 6) {
      setNotice("Enter the 6-digit code from your email.");
      return;
    }
    setPending(true);
    setNotice("");
    try {
      if (!sent) {
        const result = await requestLoginCode(trimmed);
        setSent(true);
        setNotice(result.message);
      } else {
        const session = await confirmLoginCode(trimmed, code.trim());
        saveSession(session);
        router.push(startPath(session.user.role));
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F8F8FF] px-4 py-8">
      <Mark />
      <h1 className="mt-6 text-3xl font-bold text-[#1B2129]">VirungaPay</h1>
      <p className="mt-2 text-sm text-[#28313D]">Sign in with a code sent to your email. Passwords stay on the website.</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-2 border-[#1B2129] bg-white p-4 shadow-[6px_6px_0_#4BFF2A]">
        <label className="text-sm font-bold text-[#1B2129]">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal"
          />
        </label>
        {sent ? (
          <label className="text-sm font-bold text-[#1B2129]">
            Code
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-mono text-lg tracking-widest font-normal"
            />
          </label>
        ) : null}
        {notice ? <p className="text-sm text-[#1B2129]">{notice}</p> : null}
        <button type="submit" disabled={pending} className="h-12 border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase tracking-wide text-[#1B2129] disabled:opacity-60">
          {pending ? "Please wait" : sent ? "Login" : "Email me a code"}
        </button>
        {sent ? (
          <button
            type="button"
            className="text-sm font-bold text-[#2A2AFF]"
            onClick={() => {
              setSent(false);
              setCode("");
              setNotice("");
            }}
          >
            Use a different email
          </button>
        ) : null}
        <Link href="/signup" className="text-center text-sm font-bold text-[#1B2129]">
          Sign up as a tourist
        </Link>
      </form>
    </main>
  );
}
