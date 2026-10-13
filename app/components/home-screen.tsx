"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MovementList } from "./movement";
import { myCompany, myWallets, payments, readSession, roleLabel, type Payment, type Wallet } from "../lib/api";

export function HomeScreen() {
  const [session, setSession] = useState<ReturnType<typeof readSession>>(null);
  const role = session?.user.role ?? "";
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [moves, setMoves] = useState<Payment[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = readSession();
    setSession(saved);
    if (!saved) return;
    const load =
      saved.user.role === "operator_owner"
        ? myCompany().then((company) => company.wallets)
        : myWallets().then((body) => body.wallets);
    load
      .then(setWallets)
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
    if (saved.user.role === "tourist") return;
    payments()
      .then((body) => setMoves(body.payments ?? []))
      .catch(() => setMoves([]));
  }, []);

  if (role === "tourist") {
    const wallet = wallets[0];
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#1B2129]">{session?.user.name}</h1>
        <p className="text-sm uppercase tracking-wide">{roleLabel(role)}</p>
        <p className="mt-4 text-sm">Use the menu for your wallet and profile.</p>
        {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
        {notice ? null : wallet ? (
          <Link href="/wallets" className="mt-4 block border-2 border-[#1B2129] bg-white p-4 shadow-[4px_4px_0_#2A2AFF]">
            <p className="text-xs font-bold uppercase">{wallet.name || "VirungaPass Wallet"}</p>
            <p className="mt-1 text-sm">{wallet.currency}</p>
            <p className="mt-1 font-mono text-2xl">{wallet.balance}</p>
          </Link>
        ) : (
          <p className="mt-4 border-2 border-[#1B2129] bg-white p-4 text-sm">Your VirungaPass Wallet is not ready yet.</p>
        )}
      </div>
    );
  }

  const recent = role === "operator_owner" ? moves.slice(0, 5) : moves.filter((row) => row.kind === "p2p" || row.kind === "withdraw").slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">{session?.user.name}</h1>
      <p className="text-sm uppercase tracking-wide">{roleLabel(role)}</p>
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      <div className="mt-4 flex flex-col gap-3">
        {notice ? null : wallets.length === 0 ? (
          <p className="border-2 border-[#1B2129] bg-white p-4 text-sm">
            {role === "operator_owner" ? "No wallet on this business yet." : "No wallet yet. A tip opens one."}
          </p>
        ) : (
          wallets.map((wallet) => (
            <article key={wallet.id} className="border-2 border-[#1B2129] bg-white p-4 shadow-[4px_4px_0_#2A2AFF]">
              <p className="text-xs font-bold uppercase">{wallet.currency}</p>
              <p className="mt-1 font-mono text-2xl">{wallet.balance}</p>
            </article>
          ))
        )}
      </div>
      <MovementList payments={recent} />
    </div>
  );
}
