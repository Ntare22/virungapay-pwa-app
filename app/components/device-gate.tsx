"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Mark } from "./mark";

const website = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

export function DeviceGate({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<boolean | null>(null);

  useEffect(() => {
    setPhone(isPhone());
  }, []);

  if (phone === null) return children;
  if (!phone) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F6F1E7] px-4">
        <section className="w-full max-w-md border-2 border-[#1C2416] bg-white p-6 shadow-[6px_6px_0_#E2B15A]">
          <Mark className="h-12 w-14" />
          <h1 className="mt-4 text-2xl font-bold text-[#1C2416]">This app is for a phone</h1>
          <p className="mt-3 text-sm text-[#1C2416]">
            On a computer, open the VirungaPay website for tour operators, itineraries, and staff.
          </p>
          <a
            href={website}
            className="mt-6 flex h-12 items-center justify-center border-2 border-[#1C2416] bg-[#E2B15A] text-sm font-bold uppercase tracking-wide text-[#1C2416]"
          >
            Open the website
          </a>
        </section>
      </main>
    );
  }
  return children;
}

function isPhone() {
  return /iPhone|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
