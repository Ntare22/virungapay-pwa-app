"use client";

import { useEffect, useState, type ReactNode } from "react";

const website = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

export function DeviceGate({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<boolean | null>(null);

  useEffect(() => {
    setPhone(isPhone());
  }, []);

  if (phone === null) return children;
  if (!phone) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F8F8FF] px-4">
        <section className="w-full max-w-md border-2 border-[#1B2129] bg-white p-6 shadow-[6px_6px_0_#4BFF2A]">
          <p className="font-mono text-sm font-bold text-[#2A2AFF]">VP</p>
          <h1 className="mt-4 text-2xl font-bold text-[#1B2129]">This app is for a phone</h1>
          <p className="mt-3 text-sm text-[#28313D]">
            On a computer, open the VirungaPay website for tour operators, itineraries, and staff.
          </p>
          <a
            href={website}
            className="mt-6 flex h-12 items-center justify-center border-2 border-[#1B2129] bg-[#4BFF2A] text-sm font-bold uppercase tracking-wide text-[#1B2129]"
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
