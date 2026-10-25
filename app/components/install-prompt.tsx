"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const installedKey = "virungapay.installed";

export function InstallPrompt() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [iphone, setIphone] = useState(false);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)");
    const nav = navigator as Navigator & {
      standalone?: boolean;
      getInstalledRelatedApps?: () => Promise<Array<{ platform: string }>>;
    };

    function runningInstalled() {
      return media.matches || nav.standalone === true;
    }

    function markInstalled() {
      localStorage.setItem(installedKey, "1");
      setInstalled(true);
    }

    if (runningInstalled()) markInstalled();
    else setInstalled(localStorage.getItem(installedKey) === "1");
    setIphone(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    setReady(true);

    function onMode() {
      if (runningInstalled()) markInstalled();
    }
    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    }
    media.addEventListener("change", onMode);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", markInstalled);

    nav.getInstalledRelatedApps?.()
      .then((apps) => {
        if (apps.some((app) => app.platform === "webapp")) markInstalled();
      })
      .catch(() => {});

    return () => {
      media.removeEventListener("change", onMode);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (!ready || installed || (!promptEvent && !iphone)) return null;

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      if (choice.outcome === "accepted") {
        localStorage.setItem(installedKey, "1");
        setInstalled(true);
      }
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "VirungaPay", url: window.location.origin });
      } catch {
        // The share sheet was closed.
      }
    }
  }

  return (
    <div className="border-b-2 border-[#1C2416] bg-white px-4 py-3">
      <button
        type="button"
        onClick={install}
        className="mx-auto flex h-10 w-full max-w-md items-center justify-center border-2 border-[#1C2416] bg-[#E2B15A] text-xs font-bold uppercase tracking-wide text-[#1C2416]"
      >
        Install
      </button>
    </div>
  );
}
