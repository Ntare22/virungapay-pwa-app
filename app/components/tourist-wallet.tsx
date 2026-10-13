"use client";

import { useState } from "react";
import { downloadStatement, type Payment, type Wallet } from "../lib/api";
import { MovementList } from "./movement";

export function TouristWallet({ wallets, payments, notice }: { wallets: Wallet[]; payments: Payment[]; notice: string }) {
  const [statementNotice, setStatementNotice] = useState("");
  const [pending, setPending] = useState(false);
  const currency = wallets[0]?.currency || "UGX";
  const moneyIn = sum(payments, "in", currency);
  const moneyOut = sum(payments, "out", currency);

  function onStatement() {
    setPending(true);
    setStatementNotice("");
    downloadStatement()
      .catch((error: unknown) => setStatementNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  if (notice) return <p className="mt-3 text-sm">{notice}</p>;
  if (wallets.length === 0) {
    return <p className="mt-4 border-2 border-[#1B2129] bg-white p-4 text-sm">Your VirungaPass Wallet is not ready yet.</p>;
  }

  return (
    <div>
      {wallets.map((wallet) => (
        <article key={wallet.id} className="mt-4 border-2 border-[#1B2129] bg-white p-4 shadow-[4px_4px_0_#2A2AFF]">
          <p className="text-xs font-bold uppercase">{wallet.name || "VirungaPass Wallet"}</p>
          <p className="mt-1 text-sm">{wallet.currency}</p>
          <p className="mt-1 font-mono text-2xl">{wallet.balance}</p>
        </article>
      ))}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <article className="border-2 border-[#1B2129] bg-white p-3 shadow-[4px_4px_0_#4BFF2A]">
          <p className="text-xs font-bold uppercase">Money in</p>
          <p className="mt-2 font-mono text-lg">{currency} {moneyIn}</p>
        </article>
        <article className="border-2 border-[#1B2129] bg-white p-3 shadow-[4px_4px_0_#2A2AFF]">
          <p className="text-xs font-bold uppercase">Money out</p>
          <p className="mt-2 font-mono text-lg">{currency} {moneyOut}</p>
        </article>
      </div>
      <MovementList payments={payments} title="Transactions" />
      <button
        type="button"
        onClick={onStatement}
        disabled={pending}
        className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60"
      >
        {pending ? "Generating" : "Generate statement"}
      </button>
      {statementNotice ? <p className="mt-2 text-sm">{statementNotice}</p> : null}
    </div>
  );
}

function sum(payments: Payment[], direction: "in" | "out", currency: string) {
  const total = payments.reduce((sum, payment) => {
    if (payment.direction !== direction || payment.currency !== currency) return sum;
    const amount = Number(payment.amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  return total.toFixed(2);
}
