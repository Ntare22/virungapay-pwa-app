"use client";

import { PhoneShell } from "../components/phone-shell";
import { WalletsScreen } from "../components/wallets-screen";

export default function Page() {
  return (
    <PhoneShell>
      <WalletsScreen />
    </PhoneShell>
  );
}
