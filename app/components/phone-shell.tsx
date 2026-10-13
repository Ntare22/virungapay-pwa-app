"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearSession, readSession, roleLabel, type Session } from "../lib/api";
import { Mark } from "./mark";

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/wallets", label: "Wallets" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/profile", label: "Profile" },
];

const operatorLinks = [
  { href: "/wallets", label: "Wallets" },
  { href: "/transactions", label: "Transactions" },
  { href: "/transact", label: "Transact" },
  { href: "/profile", label: "Profile" },
];

const touristLinks = [
  { href: "/wallets", label: "Wallet" },
  { href: "/profile", label: "Profile" },
];

export function PhoneShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const saved = readSession();
    setSession(saved);
    if (!saved) router.replace("/");
    else if ((saved.user.role === "tourist" || saved.user.role === "operator_owner") && pathname === "/home") router.replace("/wallets");
    else if (pathname === "/movement") router.replace("/transactions");
    else if (saved.user.role === "operator_owner" && pathname === "/withdraw") router.replace("/transact");
  }, [router, pathname]);

  if (!session) {
    return <main className="mx-auto min-h-dvh w-full max-w-md bg-[#F8F8FF]" />;
  }

  const tourist = session.user.role === "tourist";
  const operator = session.user.role === "operator_owner";
  const links = tourist ? touristLinks : operator ? operatorLinks : tabs;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F8F8FF]">
      <header className="flex items-center justify-between border-b-2 border-[#1B2129] bg-white px-4 py-3">
        <Mark />
        {tourist || operator ? (
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.replace("/");
            }}
            className="border-2 border-[#1B2129] px-3 py-2 text-xs font-bold uppercase tracking-wide"
          >
            Log out
          </button>
        ) : (
          <p className="text-xs uppercase tracking-wide text-[#28313D]">{roleLabel(session.user.role)}</p>
        )}
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <nav className="sticky bottom-0 z-30 flex border-t-2 border-[#1B2129] bg-white pb-[env(safe-area-inset-bottom)]">
        {links.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-16 flex-1 items-center justify-center px-1 text-center text-[11px] font-bold uppercase leading-tight tracking-wide ${
                active ? "bg-[#2A2AFF] text-white" : "text-[#1B2129]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
