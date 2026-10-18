"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const dismissedKey = "virungapay.install.dismissed";

export function InstallPrompt() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [iphone, setIphone] = useState(false);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    setInstalled(standalone);
    setIphone(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    setDismissed(sessionStorage.getItem(dismissedKey) === "1");
    setReady(true);

    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!ready || installed || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(dismissedKey, "1");
    setDismissed(true);
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") setInstalled(true);
  }

  return (
    <section className="border-b-2 border-[#1C2416] bg-white px-4 py-3">
      <div className="mx-auto flex max-w-md items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#1C2416]">Add VirungaPay to your home screen</h2>
          {promptEvent ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 h-10 border-2 border-[#1C2416] bg-[#E2B15A] px-4 text-xs font-bold uppercase tracking-wide text-[#1C2416]"
            >
              Install
            </button>
          ) : iphone ? (
            <p className="mt-1 text-sm text-[#1C2416]">Tap Share, then Add to Home Screen. That saves the app on your phone.</p>
          ) : (
            <p className="mt-1 text-sm text-[#1C2416]">
              Open the browser menu and choose Install app or Add to Home screen.
            </p>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-lg leading-none text-[#1C2416]">
          ×
        </button>
      </div>
    </section>
  );
}
