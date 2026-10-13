"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MovementList } from "./movement";
import { TouristWallet } from "./tourist-wallet";
import {
  moveWallets,
  myCompany,
  myWallets,
  payments,
  readSession,
  requestEurWallet,
  roleLabel,
  tariffs,
  type Payment,
  type Tariff,
  type Wallet,
} from "../lib/api";

export function WalletsScreen() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const operator = role === "operator_owner";
  const [companyStatus, setCompanyStatus] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<Tariff[]>([]);
  const [moves, setMoves] = useState<Payment[]>([]);
  const [notice, setNotice] = useState("");
  const [move, setMove] = useState<{ fromId: string; toId: string } | null>(null);

  function reload(asRole: string) {
    const load = asRole === "operator_owner" ? myCompany().then((company) => {
      setCompanyStatus(company.status);
      return company.wallets ?? [];
    }) : myWallets().then((body) => body.wallets ?? []);
    const jobs: Promise<unknown>[] = [
      load.then(setWallets),
      tariffs().then((body) => setRates(body.tariffs ?? [])).catch(() => setRates([])),
    ];
    if (asRole !== "operator_owner") {
      jobs.push(payments().then((body) => setMoves(body.payments ?? [])).catch(() => setMoves([])));
    }
    return Promise.all(jobs).catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
  }

  useEffect(() => {
    const saved = readSession();
    const asRole = saved?.user.role ?? "";
    setRole(asRole);
    setName(saved?.user.name ?? "");
    if (asRole === "") return;
    void reload(asRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (role === "tourist") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#1B2129]">Wallet</h1>
        <TouristWallet wallets={wallets} payments={moves} notice={notice} />
      </div>
    );
  }

  const slots = exchangeSlots(wallets, rates);
  const canRequestEur = operator && companyStatus === "approved" && !wallets.some((wallet) => wallet.currency === "EUR");

  return (
    <div>
      {operator ? (
        <>
          <h1 className="text-2xl font-bold text-[#1B2129]">{name}</h1>
          <p className="text-sm uppercase tracking-wide">{roleLabel(role)}</p>
        </>
      ) : (
        <h1 className="text-2xl font-bold text-[#1B2129]">Wallets</h1>
      )}
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      <div className="mt-4 flex flex-col gap-2">
        {slots.map((slot, index) =>
          slot.kind === "wallet" ? (
            <article key={slot.wallet.id} className="border-2 border-[#1B2129] bg-white p-4 shadow-[4px_4px_0_#2A2AFF]">
              <p className="text-xs font-bold uppercase">{slot.wallet.currency}</p>
              <p className="mt-1 font-mono text-2xl">{slot.wallet.balance}</p>
            </article>
          ) : (
            <div key={`${slot.pair}-${index}`} className="flex items-center justify-center gap-2 py-1">
              <Arrow direction="right" />
              <button
                type="button"
                disabled={!operator}
                onClick={() => operator && setMove({ fromId: slot.fromId, toId: slot.toId })}
                className="border-2 border-[#1B2129] bg-[#4BFF2A] px-3 py-2 text-center text-xs font-bold uppercase shadow-[3px_3px_0_#1B2129] disabled:bg-white"
              >
                {slot.pair}
                <span className="mt-1 block font-mono text-sm normal-case">{slot.rate}</span>
              </button>
              <Arrow direction="left" />
            </div>
          ),
        )}
      </div>
      {canRequestEur ? (
        <button
          type="button"
          className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-white text-sm font-bold uppercase"
          onClick={() => {
            setNotice("");
            requestEurWallet()
              .then((company) => {
                setWallets(company.wallets ?? []);
                setCompanyStatus(company.status);
              })
              .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
          }}
        >
          Request EUR wallet
        </button>
      ) : null}
      {operator ? null : <MovementList payments={moves} />}
      {move ? (
        <MoveModal
          wallets={wallets}
          fromId={move.fromId}
          toId={move.toId}
          onClose={() => setMove(null)}
          onDone={() => {
            setMove(null);
            void reload(role);
          }}
        />
      ) : null}
    </div>
  );
}

function MoveModal({
  wallets,
  fromId,
  toId,
  onClose,
  onDone,
}: {
  wallets: Wallet[];
  fromId: string;
  toId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [from, setFrom] = useState(fromId);
  const [to, setTo] = useState(toId);
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    moveWallets({ fromWalletId: from, toWalletId: to, amount })
      .then(onDone)
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
        setPending(false);
      });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1B2129]/40 p-4" onMouseDown={() => !pending && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md border-2 border-[#1B2129] bg-[#F8F8FF] p-4 shadow-[6px_6px_0_#4BFF2A]"
      >
        <div className="flex items-center justify-between">
          <h2 id="move-title" className="text-lg font-bold">Move money</h2>
          <button type="button" onClick={onClose} className="px-2 text-xl" aria-label="Close">×</button>
        </div>
        <label className="mt-3 block text-sm font-bold">
          From
          <select value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-2 font-normal">
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>{wallet.currency}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm font-bold">
          To
          <select value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-2 font-normal">
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>{wallet.currency}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm font-bold">
          Amount
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-1 h-12 w-full border-2 border-[#1B2129] px-3 font-normal" />
        </label>
        {notice ? <p className="mt-2 text-sm">{notice}</p> : null}
        <button type="submit" disabled={pending} className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60">
          {pending ? "Moving" : "Move"}
        </button>
      </form>
    </div>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true">
      <polygon fill="#2A2AFF" points={direction === "right" ? "0,0 28,8 0,16" : "28,0 0,8 28,16"} />
    </svg>
  );
}

function exchangeSlots(wallets: Wallet[], rates: Tariff[]) {
  const byCurrency = new Map(wallets.map((wallet) => [wallet.currency, wallet]));
  const slots: ({ kind: "wallet"; wallet: Wallet } | { kind: "rate"; pair: string; rate: string; fromId: string; toId: string })[] = [];
  const usd = byCurrency.get("USD");
  const ugx = byCurrency.get("UGX");
  const eur = byCurrency.get("EUR");
  if (usd && ugx) {
    slots.push({ kind: "wallet", wallet: usd }, rateSlot("USD/UGX", rates, usd.id, ugx.id), { kind: "wallet", wallet: ugx });
  }
  if (eur && ugx) {
    if (!slots.some((slot) => slot.kind === "wallet" && slot.wallet.currency === "UGX")) slots.push({ kind: "wallet", wallet: ugx });
    slots.push(rateSlot("EUR/UGX", rates, eur.id, ugx.id), { kind: "wallet", wallet: eur });
  }
  if (slots.length === 0) wallets.forEach((wallet) => slots.push({ kind: "wallet", wallet }));
  return slots;
}

function rateSlot(pair: string, rates: Tariff[], fromId: string, toId: string) {
  const found = rates.find((rate) => rate.pair === pair);
  const rate = found ? found.customer_rate.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "") : "No rate";
  return { kind: "rate" as const, pair, rate, fromId, toId };
}
