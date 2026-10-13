"use client";

import { PhoneShell } from "../components/phone-shell";
import { WithdrawScreen } from "../components/withdraw-screen";

export default function Page() {
  return (
    <PhoneShell>
      <WithdrawScreen />
    </PhoneShell>
  );
}
