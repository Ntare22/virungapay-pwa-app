"use client";

import type { Payment } from "../lib/api";

export type TransactionRow = {
  id: string;
  kind: string;
  invoice?: string;
  when: string;
  what: string;
  between: string;
  amount: string;
  at: number;
};

export function transactionRows(payments: Payment[]): TransactionRow[] {
  return movementRows(payments);
}

export function MovementList({ payments, title = "Movement", standalone = false }: { payments: Payment[]; title?: string; standalone?: boolean }) {
  const rows = movementRows(payments);
  return (
    <section className={standalone ? "" : "mt-6"}>
      {standalone ? (
        <h1 className="text-2xl font-bold text-[#1B2129]">{title}</h1>
      ) : (
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B2129]">{title}</h2>
      )}
      {rows.length === 0 ? (
        <p className="mt-3 border-2 border-[#1B2129] bg-white p-4 text-sm">No transactions yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.id} className="border-2 border-[#1B2129] bg-white p-3 shadow-[4px_4px_0_#4BFF2A]">
              <p className="text-xs uppercase text-[#28313D]">{row.when}</p>
              <p className="mt-1 font-bold text-[#1B2129]">{row.what}</p>
              <p className="text-sm">{row.between}</p>
              <p className="mt-1 font-mono text-sm">{row.amount}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function movementRows(payments: Payment[]) {
  const used = new Set<string>();
  const rows: TransactionRow[] = [];
  const sorted = [...payments].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  for (const payment of sorted) {
    if (used.has(payment.id)) continue;
    if (payment.kind === "conversion" && payment.direction === "out") {
      const arrived = sorted.find((other) => {
        if (used.has(other.id) || other.id === payment.id) return false;
        if (other.kind !== "conversion" || other.direction !== "in" || other.currency === payment.currency) return false;
        return Math.abs(Date.parse(other.created_at) - Date.parse(payment.created_at)) <= 5000;
      });
      if (arrived) {
        used.add(arrived.id);
        rows.push({
          id: payment.id,
          kind: "conversion",
          when: when(payment.created_at),
          what: "Exchange",
          between: `${payment.currency} wallet to ${arrived.currency} wallet`,
          amount: `${payment.currency} ${payment.amount} → ${arrived.currency} ${arrived.amount}`,
          at: Date.parse(payment.created_at),
        });
        used.add(payment.id);
        continue;
      }
    }
    used.add(payment.id);
    const inbound = payment.direction === "in";
    rows.push({
      id: payment.id,
      kind: payment.kind,
      invoice: payment.invoice_number,
      when: when(payment.created_at),
      what: label(payment.kind, payment.direction),
      between: inbound
        ? `${payment.counterparty || "Someone"} to ${payment.currency} wallet`
        : `${payment.currency} wallet to ${payment.counterparty || "Someone"}`,
      amount: `${inbound ? "In" : "Out"} ${payment.currency} ${payment.amount}`,
      at: Date.parse(payment.created_at),
    });
  }
  return rows.sort((a, b) => b.at - a.at);
}

function label(kind: string, direction: string) {
  if (kind === "collection") return "Collection";
  if (kind === "withdraw") return "Withdrawal";
  if (kind === "p2p") return direction === "in" ? "Tip in" : "Tip out";
  if (kind === "conversion") return "Exchange";
  return direction === "in" ? "Money in" : "Money out";
}

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
