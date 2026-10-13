"use client";

import { PhoneShell } from "../components/phone-shell";
import { TransactScreen } from "../components/transact-screen";

export default function Page() {
  return (
    <PhoneShell>
      <TransactScreen />
    </PhoneShell>
  );
}
