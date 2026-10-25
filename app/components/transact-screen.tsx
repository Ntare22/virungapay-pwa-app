"use client";

import { useState, type FormEvent } from "react";
import { actionNotice, lookupWallet, readSession, sendToWallet, type WalletLookup } from "../lib/api";
import { ScanWalletButton } from "./scan-wallet";
import { Toast } from "./toast";
import { TouristTransact } from "./tourist-transact";
import { WithdrawScreen } from "./withdraw-screen";

const actions = [
  { id: "mobile", title: "Mobile money", text: "Send from a wallet to a mobile money operator." },
  { id: "wallet", title: "VirungaPay wallet", text: "Send from a wallet to another VirungaPay wallet." },
  { id: "withdraw", title: "Withdraw", text: "Cash out at a forex bureau." },
] as const;

type Action = (typeof actions)[number]["id"];

export function TransactScreen() {
  if (readSession()?.user.role === "tourist") return <TouristTransact />;
  return <OperatorTransact />;
}

function OperatorTransact() {
  const [action, setAction] = useState<Action | null>(null);
  const [scanned, setScanned] = useState<WalletLookup | null>(null);
  const chosen = actions.find((item) => item.id === action);

  if (action === "withdraw") {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <WithdrawScreen embedded />
      </div>
    );
  }

  if (action === "wallet") {
    return (
      <div>
        <Back onBack={() => { setAction(null); setScanned(null); }} />
        <SendToWallet initial={scanned} />
      </div>
    );
  }

  if (chosen) {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <h1 className="text-2xl font-bold text-[#1C2416]">{chosen.title}</h1>
        <p className="mt-4 border-2 border-[#1C2416] bg-white p-4 text-sm">{chosen.text}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C2416]">Pay</h1>
      <p className="mt-2 text-sm">Scan a UGX wallet code, or choose how to pay.</p>
      <div className="mt-4">
        <ScanWalletButton
          prominent
          onFound={(wallet) => {
            setScanned(wallet);
            setAction("wallet");
          }}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {actions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAction(item.id)}
            className="border-2 border-[#1C2416] bg-white p-4 text-left shadow-[4px_4px_0_#1F4D3A]"
          >
            <p className="font-bold text-[#1C2416]">{item.title}</p>
            <p className="mt-1 text-sm">{item.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SendToWallet({ initial }: { initial?: WalletLookup | null }) {
  const [username, setUsername] = useState(initial?.username ?? "");
  const [amount, setAmount] = useState("");
  const [found, setFound] = useState<WalletLookup | null>(initial ?? null);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  function onCheck() {
    const handle = username.trim().replace(/^@/, "");
    if (!handle) {
      setFound(null);
      setNotice("Enter a wallet username.");
      return;
    }
    setPending(true);
    setNotice("");
    setDone("");
    setFound(null);
    lookupWallet(handle)
      .then((wallet) => {
        if (wallet.currency !== "UGX") {
          setNotice("Send to a UGX wallet.");
          return;
        }
        setFound(wallet);
      })
      .catch((error: unknown) => setNotice(actionNotice(error)))
      .finally(() => setPending(false));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!found) {
      setNotice("Check the username before you send.");
      return;
    }
    if (!amount.trim()) {
      setNotice("Enter the amount to send.");
      return;
    }
    setPending(true);
    setNotice("");
    setDone("");
    const paid = amount.trim();
    sendToWallet({ username: found.username, amount: paid })
      .then(() => {
        setDone(`UGX ${paid} is on the way to ${found.name || found.username}.`);
        setAmount("");
        setUsername("");
        setFound(null);
      })
      .catch((error: unknown) => setNotice(actionNotice(error)))
      .finally(() => setPending(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-[#1C2416]">VirungaPay wallet</h1>
      <p className="mt-2 text-sm">Scan a wallet code, or enter the username, and check it before you send.</p>
      <label className="mt-4 block text-sm font-bold">
        Username
        <input
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setFound(null);
          }}
          placeholder="james-ugx"
          className="mt-1 h-12 w-full border-2 border-[#1C2416] bg-white px-3 font-mono font-normal"
        />
      </label>
      <div className="mt-3">
        <ScanWalletButton
          onFound={(wallet) => {
            setUsername(wallet.username);
            setNotice("");
            setDone("");
            if (wallet.currency !== "UGX") {
              setFound(null);
              setNotice("Send to a UGX wallet.");
              return;
            }
            setFound(wallet);
          }}
        />
      </div>
      <button type="button" onClick={onCheck} disabled={pending} className="mt-3 h-12 w-full border-2 border-[#1C2416] bg-white text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Checking" : "Check username"}
      </button>
      {found ? (
        <p className="mt-3 border-2 border-[#1C2416] bg-white p-4 text-sm shadow-[4px_4px_0_#E2B15A]">
          <span className="font-bold">{found.name || "Wallet"}</span>
          <span className="mt-1 block font-mono text-[#1F4D3A]">@{found.username}</span>
          <span className="mt-1 block">{found.currency} wallet</span>
        </p>
      ) : null}
      <label className="mt-4 block text-sm font-bold">
        Amount in UGX
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          className="mt-1 h-12 w-full border-2 border-[#1C2416] bg-white px-3 font-normal"
        />
      </label>
      {done ? <p className="mt-3 border-2 border-[#1C2416] bg-white p-3 text-sm shadow-[4px_4px_0_#E2B15A]">{done}</p> : null}
      <button type="submit" disabled={pending || !found} className="mt-4 h-12 w-full border-2 border-[#1C2416] bg-[#E2B15A] text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Sending" : "Send"}
      </button>
      <Toast message={notice} onClose={() => setNotice("")} />
    </form>
  );
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="mb-4 inline-flex h-10 items-center gap-2 border-2 border-[#1C2416] bg-white px-3 text-sm font-bold uppercase text-[#1C2416]">
      <span aria-hidden="true">←</span>
      Pay
    </button>
  );
}
