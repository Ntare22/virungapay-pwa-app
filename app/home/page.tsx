"use client";

import { HomeScreen } from "../components/home-screen";
import { PhoneShell } from "../components/phone-shell";

export default function Page() {
  return (
    <PhoneShell>
      <HomeScreen />
    </PhoneShell>
  );
}
