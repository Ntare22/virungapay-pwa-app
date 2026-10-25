"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { registerTourist } from "../lib/api";
import { Mark } from "./mark";

export function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("email");
    if (value) setEmail(value);
  }, []);

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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F6F1E7] px-4 py-8">
      <Mark />
      <h1 className="mt-6 text-3xl font-bold text-[#1C2416]">Sign Up As A Tourist</h1>
      <p className="mt-2 text-sm text-[#1C2416]">No password. We email a code when you log in.</p>
      {createdEmail ? (
        <section className="mt-8 border-2 border-[#1C2416] bg-white p-4 shadow-[6px_6px_0_#E2B15A]">
          <p className="text-sm">The account for {createdEmail} is ready. Log in and we will email a code.</p>
          <Link href="/" className="mt-4 flex h-12 items-center justify-center border-2 border-[#1C2416] bg-[#E2B15A] text-sm font-bold uppercase">
            Login
          </Link>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-2 border-[#1C2416] bg-white p-4 shadow-[6px_6px_0_#E2B15A]">
          <label className="text-sm font-bold text-[#1C2416]">
            First name
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className="mt-1 h-12 w-full border-2 border-[#1C2416] px-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-[#1C2416]">
            Last name
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" className="mt-1 h-12 w-full border-2 border-[#1C2416] px-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-[#1C2416]">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1 h-12 w-full border-2 border-[#1C2416] px-3 font-normal" />
          </label>
          {notice ? <p className="text-sm text-[#1C2416]">{notice}</p> : null}
          <button type="submit" disabled={pending} className="h-12 border-2 border-[#1C2416] bg-[#E2B15A] text-sm font-bold uppercase tracking-wide text-[#1C2416] disabled:opacity-60">
            {pending ? "Please wait" : "Sign up"}
          </button>
          <Link href="/" className="text-center text-sm font-bold text-[#1F4D3A]">
            Login
          </Link>
        </form>
      )}
    </main>
  );
}
