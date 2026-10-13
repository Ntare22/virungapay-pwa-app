"use client";

import { useEffect, useState } from "react";
import { downloadStatement, payments, readSession } from "../lib/api";
import { transactionRows, type TransactionRow } from "./movement";

const operatorFilters = [
  { id: "all", label: "All" },
  { id: "collection", label: "Collections" },
  { id: "exchange", label: "Exchanges" },
  { id: "wallet", label: "Wallet movements" },
  { id: "other", label: "Other" },
] as const;

const touristFilters = [
  { id: "all", label: "All" },
  { id: "collection", label: "Card" },
  { id: "wallet", label: "Payments" },
  { id: "other", label: "Mobile money" },
] as const;

type Filter = (typeof operatorFilters)[number]["id"];

export function TransactionsScreen() {
  const tourist = readSession()?.user.role === "tourist";
  const filters = tourist ? touristFilters : operatorFilters;
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [notice, setNotice] = useState("");
  const [statementNotice, setStatementNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    payments()
      .then((body) => setRows(transactionRows(body.payments ?? [])))
      .catch((error: unknown) => setNotice(error instanceof Error ? error.message : "Something went wrong. Try again."));
  }, []);

  const shown = rows.filter((row) => matches(row, filter));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#1B2129]">Activity</h1>
        {tourist ? (
          <button
            type="button"
            onClick={() => {
              setPending(true);
              setStatementNotice("");
              downloadStatement()
                .catch((error: unknown) => setStatementNotice(error instanceof Error ? error.message : "Something went wrong. Try again."))
                .finally(() => setPending(false));
            }}
            disabled={pending}
            className="h-10 shrink-0 border-2 border-[#1B2129] bg-[#4BFF2A] px-3 text-xs font-bold uppercase disabled:opacity-60"
          >
            {pending ? "Generating" : "Generate statement"}
          </button>
        ) : null}
      </div>
      {statementNotice ? <p className="mt-2 text-sm">{statementNotice}</p> : null}
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
        <p className="mt-4 border-2 border-[#1B2129] bg-white p-4 text-sm">{emptyCopy(filter, tourist)}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {shown.map((row) => (
            <li key={row.id} className="border-2 border-[#1B2129] bg-white p-3 shadow-[4px_4px_0_#4BFF2A]">
              <p className="text-xs uppercase text-[#28313D]">{row.when}</p>
              <p className="mt-1 font-bold text-[#1B2129]">{titleFor(row, tourist)}</p>
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

function titleFor(row: TransactionRow, tourist: boolean) {
  if (tourist) {
    if (row.kind === "collection") return "Card top-up";
    if (row.kind === "p2p") return row.invoice === "service" ? "Payment" : "Tip";
    if (row.kind === "withdraw") return "Mobile money";
    return row.what;
  }
  if (row.kind === "collection") return "Collection";
  if (row.kind === "conversion") return "Exchange";
  if (row.kind === "p2p") return "Wallet movement";
  if (row.kind === "withdraw") return "Withdrawal";
  return row.what;
}

function emptyCopy(filter: Filter, tourist: boolean) {
  if (tourist) {
    if (filter === "collection") return "No card top-ups yet.";
    if (filter === "wallet") return "No tips or payments yet.";
    if (filter === "other") return "No mobile money sends yet.";
    return "No transactions yet.";
  }
  if (filter === "collection") return "No collections yet.";
  if (filter === "exchange") return "No exchanges yet.";
  if (filter === "wallet") return "No wallet movements yet.";
  if (filter === "other") return "No other transactions yet.";
  return "No transactions yet.";
}
