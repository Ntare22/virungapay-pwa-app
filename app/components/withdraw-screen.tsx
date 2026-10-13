"use client";

import { useEffect, useState, type FormEvent } from "react";
import { bureaus, myCompany, myWallets, readSession, withdraw, type Bureau, type Wallet } from "../lib/api";

export function WithdrawScreen({ embedded = false }: { embedded?: boolean }) {
  const [role, setRole] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [places, setPlaces] = useState<Bureau[]>([]);
  const [currency, setCurrency] = useState("");
  const [bureauId, setBureauId] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const saved = readSession()?.user.role ?? "";
    setRole(saved);
    if (saved !== "operator_owner" && saved !== "guide" && saved !== "driver") return;
    const load = saved === "operator_owner" ? myCompany().then((company) => company.wallets ?? []) : myWallets().then((body) => body.wallets ?? []);
    load
      .then((list) => {
        setWallets(list);
        setCurrency(list[0]?.currency ?? "");
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
    bureaus()
      .then((body) => {
        const list = body.businesses ?? [];
        setPlaces(list);
        setBureauId(list[0]?.id ?? "");
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
  }, []);

  if (role === "tourist") {
    return <p className="border-2 border-[#1B2129] bg-white p-4 text-sm">A VirungaPass Wallet is not withdrawn from here.</p>;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    withdraw({ bureauId, currency, amount })
      .then(() => {
        setAmount("");
        setNotice(embedded ? "Withdrawal recorded. The balance will update on Wallets." : "Withdrawal recorded. The balance will update on Home and Wallets.");
        const load = role === "operator_owner" ? myCompany().then((company) => company.wallets ?? []) : myWallets().then((body) => body.wallets ?? []);
        return load.then(setWallets);
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  const held = wallets.find((wallet) => wallet.currency === currency);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">Withdraw</h1>
      <form onSubmit={onSubmit} className={`${embedded ? "" : "mt-4"} flex flex-col gap-3 border-2 border-[#1B2129] bg-white p-4 shadow-[6px_6px_0_#4BFF2A]`}>
        <label className="text-sm font-bold">
          Currency
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-2 font-normal">
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.currency}>{wallet.currency}</option>
            ))}
          </select>
        </label>
        <p className="font-mono text-sm">Available {held ? `${held.currency} ${held.balance}` : "—"}</p>
        <label className="text-sm font-bold">
          Amount
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal" />
        </label>
        <label className="text-sm font-bold">
          Forex bureau
          <select value={bureauId} onChange={(event) => setBureauId(event.target.value)} className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-2 font-normal">
            {places.length === 0 ? <option value="">No approved bureau</option> : null}
            {places.map((place) => (
              <option key={place.id} value={place.id}>{place.name}</option>
            ))}
          </select>
        </label>
        {notice ? <p className="text-sm">{notice}</p> : null}
        <button type="submit" disabled={pending || !currency || !bureauId} className="h-12 border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60">
          {pending ? "Sending" : "Withdraw"}
        </button>
      </form>
    </div>
  );
}
