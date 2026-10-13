"use client";

import { useState } from "react";
import { WithdrawScreen } from "./withdraw-screen";

const actions = [
  { id: "mobile", title: "Mobile money", text: "Send from a wallet to a mobile money operator." },
  { id: "wallet", title: "VirungaPay wallet", text: "Send from a wallet to another VirungaPay wallet." },
  { id: "withdraw", title: "Withdraw", text: "Cash out at a forex bureau." },
] as const;

type Action = (typeof actions)[number]["id"];

export function TransactScreen() {
  const [action, setAction] = useState<Action | null>(null);
  const chosen = actions.find((item) => item.id === action);

  if (action === "withdraw") {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <WithdrawScreen embedded />
      </div>
    );
  }

  if (chosen) {
    return (
      <div>
        <Back onBack={() => setAction(null)} />
        <h1 className="text-2xl font-bold text-[#1B2129]">{chosen.title}</h1>
        <p className="mt-4 border-2 border-[#1B2129] bg-white p-4 text-sm">{chosen.text}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B2129]">Transact</h1>
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

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="mb-3 text-sm font-bold uppercase text-[#2A2AFF]">
      Transact
    </button>
  );
}
