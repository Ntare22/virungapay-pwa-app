"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, readSession, roleLabel } from "../lib/api";

export function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof readSession>>(null);

  useEffect(() => {
    setSession(readSession());
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">Profile</h1>
      <dl className="mt-4 border-2 border-[#1B2129] bg-white p-4 shadow-[4px_4px_0_#4BFF2A]">
        <dt className="text-xs font-bold uppercase">Name</dt>
        <dd className="mb-3">{session?.user.name}</dd>
        <dt className="text-xs font-bold uppercase">Email</dt>
        <dd className="mb-3">{session?.user.email}</dd>
        <dt className="text-xs font-bold uppercase">Role</dt>
        <dd>{roleLabel(session?.user.role ?? "")}</dd>
      </dl>
      <button
        type="button"
        className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-white text-sm font-bold uppercase"
        onClick={() => {
          clearSession();
          router.replace("/");
        }}
      >
        Log out
      </button>
    </div>
  );
}
