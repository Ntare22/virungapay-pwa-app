"use client";

import { type Payment, type Wallet } from "../lib/api";
import { WalletIdentity } from "./wallet-edit";
import { WalletQr } from "./wallet-qr";

export function TouristWallet({
  wallets,
  payments,
  notice,
  onRenamed,
}: {
  wallets: Wallet[];
  payments: Payment[];
  notice: string;
  onRenamed: (wallet: Wallet) => void;
}) {
  const currency = wallets[0]?.currency || "UGX";
  const moneyIn = sum(payments, "in", currency);
  const moneyOut = sum(payments, "out", currency);

  if (notice) return <p className="mt-3 text-sm">{notice}</p>;
  if (wallets.length === 0) {
    return <p className="mt-4 border-2 border-[#1C2416] bg-white p-4 text-sm">Your VirungaPass Wallet is not ready yet.</p>;
  }

  return (
    <div>
      {wallets.map((wallet) => (
        <article key={wallet.id} className="mt-4 border-2 border-[#1C2416] bg-white p-4 shadow-[4px_4px_0_#1F4D3A]">
          <WalletIdentity wallet={wallet} fallback="VirungaPass Wallet" usernameOnly onSaved={onRenamed} />
          <p className="mt-2 text-sm">{wallet.currency}</p>
          <p className="mt-1 font-mono text-2xl">{wallet.balance}</p>
          <WalletQr wallet={wallet} />
        </article>
      ))}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <article className="border-2 border-[#1C2416] bg-white p-3 shadow-[4px_4px_0_#E2B15A]">
          <p className="text-xs font-bold uppercase">Money in</p>
          <p className="mt-2 font-mono text-lg">{currency} {moneyIn}</p>
        </article>
        <article className="border-2 border-[#1C2416] bg-white p-3 shadow-[4px_4px_0_#1F4D3A]">
          <p className="text-xs font-bold uppercase">Money out</p>
          <p className="mt-2 font-mono text-lg">{currency} {moneyOut}</p>
        </article>
      </div>
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
