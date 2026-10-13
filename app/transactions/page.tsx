"use client";

import { PhoneShell } from "../components/phone-shell";
import { TransactionsScreen } from "../components/transactions-screen";

export default function Page() {
  return (
    <PhoneShell>
      <TransactionsScreen />
    </PhoneShell>
  );
}
