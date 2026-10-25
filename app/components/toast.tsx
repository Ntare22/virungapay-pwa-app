"use client";

import { useEffect, useRef } from "react";

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => close.current(), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed right-4 bottom-4 z-[80] flex max-w-sm items-start gap-3 border-2 border-[#1C2416] bg-[#F6F1E7] px-4 py-3 text-sm text-[#1C2416] shadow-[4px_4px_0_#E2B15A]"
    >
      <p className="min-w-0 flex-1">{message}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-lg leading-none">
        ×
      </button>
    </div>
  );
}
