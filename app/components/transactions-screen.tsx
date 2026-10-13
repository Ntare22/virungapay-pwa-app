"use client";

import { useEffect, useState } from "react";
import { payments } from "../lib/api";
import { transactionRows, type TransactionRow } from "./movement";

const filters = [
  { id: "all", label: "All" },
  { id: "collection", label: "Collections" },
  { id: "exchange", label: "Exchanges" },
  { id: "wallet", label: "Wallet movements" },
  { id: "other", label: "Other" },
] as const;

type Filter = (typeof filters)[number]["id"];

export function TransactionsScreen() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    payments()
      .then((body) => setRows(transactionRows(body.payments ?? [])))
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
  }, []);

  const shown = rows.filter((row) => matches(row, filter));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">Transactions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`border-2 border-[#1B2129] px-3 py-2 text-xs font-bold uppercase ${
              filter === item.id ? "bg-[#2A2AFF] text-white" : "bg-white text-[#1B2129]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
      {notice ? null : shown.length === 0 ? (
        <p className="mt-4 border-2 border-[#1B2129] bg-white p-4 text-sm">{emptyCopy(filter)}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {shown.map((row) => (
            <li key={row.id} className="border-2 border-[#1B2129] bg-white p-3 shadow-[4px_4px_0_#4BFF2A]">
              <p className="text-xs uppercase text-[#28313D]">{row.when}</p>
              <p className="mt-1 font-bold text-[#1B2129]">{titleFor(row)}</p>
              <p className="text-sm">{row.between}</p>
              <p className="mt-1 font-mono text-sm">{row.amount}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function matches(row: TransactionRow, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "collection") return row.kind === "collection";
  if (filter === "exchange") return row.kind === "conversion";
  if (filter === "wallet") return row.kind === "conversion" || row.kind === "p2p";
  return row.kind !== "collection" && row.kind !== "conversion" && row.kind !== "p2p";
}

function titleFor(row: TransactionRow) {
  if (row.kind === "collection") return "Collection";
  if (row.kind === "conversion") return "Exchange";
  if (row.kind === "p2p") return "Wallet movement";
  if (row.kind === "withdraw") return "Withdrawal";
  return row.what;
}

function emptyCopy(filter: Filter) {
  if (filter === "collection") return "No collections yet.";
  if (filter === "exchange") return "No exchanges yet.";
  if (filter === "wallet") return "No wallet movements yet.";
  if (filter === "other") return "No other transactions yet.";
  return "No transactions yet.";
}
