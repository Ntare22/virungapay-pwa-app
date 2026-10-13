"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { registerTourist } from "../lib/api";

export function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setNotice("Enter a first name and a last name.");
      return;
    }
    if (!email.trim().includes("@")) {
      setNotice("Enter a valid email.");
      return;
    }
    setPending(true);
    setNotice("");
    try {
      const result = await registerTourist({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      setCreatedEmail(result.user.email);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F8F8FF] px-4 py-8">
      <p className="font-mono text-sm font-bold text-[#2A2AFF]">VP</p>
      <h1 className="mt-6 text-3xl font-bold text-[#1B2129]">Sign up as a tourist</h1>
      <p className="mt-2 text-sm text-[#28313D]">No password. We email a code when you log in.</p>
      {createdEmail ? (
        <section className="mt-8 border-2 border-[#1B2129] bg-white p-4 shadow-[6px_6px_0_#4BFF2A]">
          <p className="text-sm">The account for {createdEmail} is ready. Log in and we will email a code.</p>
          <Link href="/" className="mt-4 flex h-12 items-center justify-center border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase">
            Login
          </Link>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-2 border-[#1B2129] bg-white p-4 shadow-[6px_6px_0_#4BFF2A]">
          <label className="text-sm font-bold text-[#1B2129]">
            First name
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-[#1B2129]">
            Last name
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-[#1B2129]">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal" />
          </label>
          {notice ? <p className="text-sm text-[#1B2129]">{notice}</p> : null}
          <button type="submit" disabled={pending} className="h-12 border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase tracking-wide text-[#1B2129] disabled:opacity-60">
            {pending ? "Please wait" : "Sign up"}
          </button>
          <Link href="/" className="text-center text-sm font-bold text-[#2A2AFF]">
            Login
          </Link>
        </form>
      )}
    </main>
  );
}
