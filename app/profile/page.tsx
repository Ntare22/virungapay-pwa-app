"use client";

import { PhoneShell } from "../components/phone-shell";
import { ProfileScreen } from "../components/profile-screen";

export default function Page() {
  return (
    <PhoneShell>
      <ProfileScreen />
    </PhoneShell>
  );
}
