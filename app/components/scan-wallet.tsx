"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { lookupWallet, type WalletLookup } from "../lib/api";
import { usernameFromQr } from "../lib/wallet-qr";

export function ScanWalletButton({
  onFound,
  label = "Scan a wallet",
  prominent = false,
}: {
  onFound: (wallet: WalletLookup) => void;
  label?: string;
  prominent?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`h-12 w-full border-2 border-[#1C2416] text-sm font-bold uppercase ${
          prominent ? "bg-[#E2B15A] text-[#1C2416]" : "bg-white text-[#1C2416]"
        }`}
      >
        {label}
      </button>
      {open ? (
        <Scanner
          onClose={() => setOpen(false)}
          onFound={(wallet) => {
            setOpen(false);
            onFound(wallet);
          }}
        />
      ) : null}
    </>
  );
}

function Scanner({ onClose, onFound }: { onClose: () => void; onFound: (wallet: WalletLookup) => void }) {
  const regionId = `qr-${useId().replace(/:/g, "")}`;
  const photoId = `${regionId}-photo`;
  const onFoundRef = useRef(onFound);
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [cameraDown, setCameraDown] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    onFoundRef.current = onFound;
  }, [onFound]);

  useEffect(() => {
    let active = true;
    let scanner: Html5Qrcode | null = null;

    async function accept(text: string, camera: Html5Qrcode | null) {
      if (busy.current) return;
      const username = usernameFromQr(text);
      if (!username) {
        setNotice("That is not a VirungaPay wallet code.");
        return;
      }
      busy.current = true;
      setPending(true);
      setNotice("");
      if (camera?.isScanning) camera.pause(true);
      try {
        const wallet = await lookupWallet(username);
        if (!active) return;
        if (wallet.currency !== "UGX") {
          setNotice("Send to a UGX wallet.");
          busy.current = false;
          setPending(false);
          if (camera?.isScanning) camera.resume();
          return;
        }
        if (camera?.isScanning) await camera.stop();
        onFoundRef.current(wallet);
      } catch (error: unknown) {
        if (!active) return;
        setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
        busy.current = false;
        setPending(false);
        if (camera?.isScanning) camera.resume();
      }
    }

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!active) return;
      scanner = new Html5Qrcode(regionId, { verbose: false });
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (text) => {
          void accept(text, scanner);
        },
        () => undefined,
      );
      if (!active && scanner.isScanning) await scanner.stop();
    })().catch((error: unknown) => {
      if (!active) return;
      setCameraDown(true);
      setNotice(cameraNotice(error));
    });

    return () => {
      active = false;
      if (scanner?.isScanning) void scanner.stop().catch(() => undefined);
    };
  }, [attempt, regionId]);

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy.current) return;
    busy.current = true;
    setPending(true);
    setNotice("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const reader = new Html5Qrcode(photoId, { verbose: false });
      let text = "";
      try {
        text = await reader.scanFile(file, false);
      } catch {
        setNotice("No wallet code was found in that photo.");
        busy.current = false;
        setPending(false);
        return;
      } finally {
        try {
          reader.clear();
        } catch {
          /* The file reader has nothing left to release. */
        }
      }
      const username = usernameFromQr(text);
      if (!username) {
        setNotice("That is not a VirungaPay wallet code.");
        busy.current = false;
        setPending(false);
        return;
      }
      const wallet = await lookupWallet(username);
      if (wallet.currency !== "UGX") {
        setNotice("Send to a UGX wallet.");
        busy.current = false;
        setPending(false);
        return;
      }
      onFoundRef.current(wallet);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1C2416]/40 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-wallet-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md border-2 border-[#1C2416] bg-[#F6F1E7] p-4 shadow-[6px_6px_0_#E2B15A]"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="scan-wallet-title" className="text-lg font-bold">Scan a wallet</h2>
          <button type="button" onClick={onClose} className="px-2 text-xl" aria-label="Close">×</button>
        </div>
        <p className="mt-2 text-sm">Point the camera at a UGX wallet code.</p>
        <div id={regionId} className="mt-4 overflow-hidden border-2 border-[#1C2416] bg-black [&_video]:w-full" />
        <div id={photoId} className="hidden" />
        {pending ? <p className="mt-3 text-sm">Checking this wallet.</p> : null}
        {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
        {cameraDown && !pending ? (
          <button
            type="button"
            onClick={() => {
              busy.current = false;
              setCameraDown(false);
              setNotice("");
              setAttempt((current) => current + 1);
            }}
            className="mt-3 h-12 w-full border-2 border-[#1C2416] bg-white text-sm font-bold uppercase"
          >
            Scan again
          </button>
        ) : null}
        <label className="mt-3 flex h-12 cursor-pointer items-center justify-center border-2 border-[#1C2416] bg-white text-sm font-bold uppercase">
          Choose a photo
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        </label>
      </div>
    </div>
  );
}

function cameraNotice(error: unknown) {
  if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")) {
    return "Allow the camera to scan a wallet code.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera was found on this phone.";
  }
  return "The camera did not start. You can choose a photo of the code.";
}
