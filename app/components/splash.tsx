"use client";

import { useEffect, useState } from "react";

export function Splash() {
  const [phase, setPhase] = useState<"show" | "hide" | "done">("show");

  useEffect(() => {
    const hide = window.setTimeout(() => setPhase("hide"), 1400);
    const done = window.setTimeout(() => setPhase("done"), 1700);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden={phase === "hide"}
      className={`fixed inset-0 z-[80] grid place-items-center bg-[#1F4D3A] transition-opacity duration-300 ${phase === "hide" ? "opacity-0" : "opacity-100"}`}
    >
      <div className="grid justify-items-center">
        <img src="/icon-512.png" alt="" className="logo-loader h-28 w-28" />
        <p className="mt-4 text-lg font-bold tracking-wide text-[#F6F1E7]">VirungaPay</p>
      </div>
    </div>
  );
}
