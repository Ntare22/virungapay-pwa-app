"use client";

import { useState, type FormEvent } from "react";
import { lookupWallet, sendMobileMoney, sendTip, topUpCard, type WalletLookup } from "../lib/api";

const actions = [
  { id: "card", title: "Add money", text: "Add UGX to your VirungaPass Wallet with a bank card." },
  { id: "mobile", title: "Mobile money", text: "Send UGX to Airtel or MTN in Uganda." },
  { id: "tip", title: "Tip or pay a business", text: "Tip a guide or driver, or pay a tour operator for a service." },
] as const;

type Action = (typeof actions)[number]["id"];

export function TouristTransact() {
  const [action, setAction] = useState<Action | null>(null);

  if (action === "card") {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <AddMoney />
      </div>
    );
  }
  if (action === "mobile") {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <MobileMoney />
      </div>
    );
  }
  if (action === "tip") {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <TipCrew />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">Pay</h1>
      <div className="mt-4 flex flex-col gap-3">
        {actions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAction(item.id)}
            className="border-2 border-[#1B2129] bg-white p-4 text-left shadow-[4px_4px_0_#2A2AFF]"
          >
            <p className="font-bold text-[#1B2129]">{item.title}</p>
            <p className="mt-1 text-sm">{item.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AddMoney() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pan = number.replace(/\D/g, "");
    const problem = cardProblem(name, pan, expiry, cvc, amount);
    if (problem) {
      setNotice(problem);
      setDone("");
      return;
    }
    setPending(true);
    setNotice("");
    setDone("");
    topUpCard({ amount: amount.trim(), last4: pan.slice(-4) })
      .then(() => {
        setDone(`UGX ${amount.trim()} is on the way to your VirungaPass Wallet.`);
        setNumber("");
        setCvc("");
        setAmount("");
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-[#1B2129]">Add money</h1>
      <p className="mt-2 text-sm">The card payment is simulated. Only the last four digits leave this phone.</p>
      <Field label="Name on card" value={name} onChange={setName} autoComplete="cc-name" />
      <Field label="Card number" value={number} onChange={setNumber} inputMode="numeric" autoComplete="cc-number" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Expiry" value={expiry} onChange={setExpiry} placeholder="MM/YY" autoComplete="cc-exp" />
        <Field label="CVC" value={cvc} onChange={setCvc} inputMode="numeric" autoComplete="cc-csc" />
      </div>
      <Field label="Amount in UGX" value={amount} onChange={setAmount} inputMode="decimal" />
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      {done ? <p className="mt-3 border-2 border-[#1B2129] bg-white p-3 text-sm shadow-[4px_4px_0_#4BFF2A]">{done}</p> : null}
      <button type="submit" disabled={pending} className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Adding" : "Add money"}
      </button>
    </form>
  );
}

function MobileMoney() {
  const [network, setNetwork] = useState<"mtn" | "airtel">("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim() || !amount.trim()) {
      setNotice("Enter the mobile number and the amount.");
      setDone("");
      return;
    }
    setPending(true);
    setNotice("");
    setDone("");
    sendMobileMoney({ network, phone: phone.trim(), amount: amount.trim() })
      .then(() => {
        setDone(`UGX ${amount.trim()} is going to ${network === "mtn" ? "MTN" : "Airtel"}.`);
        setPhone("");
        setAmount("");
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-[#1B2129]">Mobile money</h1>
      <p className="mt-2 text-sm">Airtel and MTN numbers in Uganda.</p>
      <label className="mt-4 block text-sm font-bold">
        Network
        <select value={network} onChange={(event) => setNetwork(event.target.value as "mtn" | "airtel")} className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-3 font-normal">
          <option value="mtn">MTN</option>
          <option value="airtel">Airtel</option>
        </select>
      </label>
      <label className="mt-3 block text-sm font-bold">
        Mobile number
        <span className="mt-1 flex h-12 border-2 border-[#1B2129] bg-white">
          <span className="grid place-items-center border-r-2 border-[#1B2129] px-3 font-mono">+256</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            placeholder="771234567"
            className="min-w-0 flex-1 px-3 font-normal outline-none"
          />
        </span>
      </label>
      <Field label="Amount in UGX" value={amount} onChange={setAmount} inputMode="decimal" />
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      {done ? <p className="mt-3 border-2 border-[#1B2129] bg-white p-3 text-sm shadow-[4px_4px_0_#4BFF2A]">{done}</p> : null}
      <button type="submit" disabled={pending} className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Sending" : "Send"}
      </button>
    </form>
  );
}

function TipCrew() {
  const [purpose, setPurpose] = useState<"tip" | "service">("tip");
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [found, setFound] = useState<WalletLookup | null>(null);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);
  const service = purpose === "service";

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
        if (service && wallet.kind !== "operator") {
          setNotice("Payments for a service go to a tour operator.");
          return;
        }
        if (!service && wallet.kind !== "personal") {
          setNotice("Tips go to a guide or a driver.");
          return;
        }
        setFound(wallet);
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!found) {
      setNotice(service ? "Check the username before you pay." : "Check the username before you send the tip.");
      return;
    }
    if (!amount.trim()) {
      setNotice(service ? "Enter the amount to pay." : "Enter the tip amount.");
      return;
    }
    setPending(true);
    setNotice("");
    setDone("");
    sendTip({ username: found.username, amount: amount.trim(), purpose })
      .then(() => {
        setDone(`UGX ${amount.trim()} is on the way to ${found.name || found.username}.`);
        setAmount("");
        setUsername("");
        setFound(null);
      })
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
      .finally(() => setPending(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-[#1B2129]">Tip or pay a business</h1>
      <p className="mt-2 text-sm">Choose a tip for a guide or driver, or a payment to a tour operator. Then check their username.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {([
          ["tip", "Tip"],
          ["service", "Payment for a service"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={purpose === id}
            onClick={() => {
              setPurpose(id);
              setFound(null);
              setNotice("");
              setDone("");
            }}
            className={`border-2 border-[#1B2129] px-3 py-3 text-sm font-bold ${
              purpose === id ? "bg-[#2A2AFF] text-white" : "bg-white text-[#1B2129]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-bold">
        Username
        <input
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setFound(null);
          }}
          placeholder={service ? "kigezi-ugx" : "peter-ugx"}
          className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-3 font-mono font-normal"
        />
      </label>
      <button type="button" onClick={onCheck} disabled={pending} className="mt-3 h-12 w-full border-2 border-[#1B2129] bg-white text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Checking" : "Check username"}
      </button>
      {found ? (
        <p className="mt-3 border-2 border-[#1B2129] bg-white p-4 text-sm shadow-[4px_4px_0_#4BFF2A]">
          <span className="font-bold">{found.name || (service ? "Tour operator" : "Guide or driver")}</span>
          <span className="mt-1 block font-mono text-[#2A2AFF]">@{found.username}</span>
          <span className="mt-1 block">{found.currency} wallet</span>
        </p>
      ) : null}
      <Field label="Amount in UGX" value={amount} onChange={setAmount} inputMode="decimal" />
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      {done ? <p className="mt-3 border-2 border-[#1B2129] bg-white p-3 text-sm shadow-[4px_4px_0_#4BFF2A]">{done}</p> : null}
      <button type="submit" disabled={pending || !found} className="mt-4 h-12 w-full border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase disabled:opacity-60">
        {pending ? "Sending" : service ? "Pay" : "Send tip"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "decimal" | "tel";
  autoComplete?: string;
}) {
  return (
    <label className="mt-3 block text-sm font-bold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-1 h-12 w-full border-2 border-[#1B2129] bg-white px-3 font-normal"
      />
    </label>
  );
}

function cardProblem(name: string, pan: string, expiry: string, cvc: string, amount: string) {
  if (name.trim().length < 2) return "Enter the name on the card.";
  if (pan.length < 13 || pan.length > 19 || !luhn(pan)) return "Enter a valid card number.";
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim());
  if (!match) return "Enter the expiry as MM/YY.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Enter the expiry as MM/YY.";
  const end = new Date(year, month, 1);
  if (end.getTime() <= Date.now()) return "This card has expired.";
  if (!/^\d{3,4}$/.test(cvc.trim())) return "Enter the CVC.";
  if (!amount.trim() || Number(amount) <= 0) return "Enter the amount to add.";
  return "";
}

function luhn(pan: string) {
  let sum = 0;
  let alternate = false;
  for (let index = pan.length - 1; index >= 0; index -= 1) {
    let digit = pan.charCodeAt(index) - 48;
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="mb-4 inline-flex h-10 items-center gap-2 border-2 border-[#1B2129] bg-white px-3 text-sm font-bold uppercase text-[#1B2129]">
      <span aria-hidden="true">←</span>
      Pay
    </button>
  );
}
