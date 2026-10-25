"use client";

import { useEffect, useRef, useState } from "react";
import type { Wallet } from "../lib/api";
import { walletQrPayload } from "../lib/wallet-qr";

export function WalletQr({ wallet }: { wallet: Wallet }) {
  const [open, setOpen] = useState(false);
  if (wallet.currency !== "UGX") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 h-12 w-full border-2 border-[#1C2416] bg-white text-sm font-bold uppercase"
      >
        Show QR code
      </button>
      {open ? <QrDialog username={wallet.username?.trim() ?? ""} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function QrDialog({ username, onClose }: { username: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!username) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancel = false;
    drawWalletQr(canvas, walletQrPayload(username))
      .catch(() => {
        if (!cancel) setFailed(true);
      });
    return () => {
      cancel = true;
    };
  }, [username]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C2416]/40 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-qr-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md border-2 border-[#1C2416] bg-[#F6F1E7] p-4 shadow-[6px_6px_0_#E2B15A]"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="wallet-qr-title" className="text-lg font-bold">Wallet code</h2>
          <button type="button" onClick={onClose} className="px-2 text-xl" aria-label="Close">×</button>
        </div>
        {username ? (
          <>
            <p className="mt-2 text-sm">Show this code so someone can send UGX to this wallet.</p>
            <div className="mt-4 grid justify-items-center border-2 border-[#1C2416] bg-white p-5">
              <canvas ref={canvasRef} className="h-64 w-64" role="img" aria-label={`QR code for @${username}`} />
              {failed ? <p className="mt-2 text-sm">The code could not be drawn. The username still works.</p> : null}
              <p className="mt-3 font-mono text-sm text-[#1F4D3A]">@{username}</p>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm">Add a username so someone can send to this wallet.</p>
        )}
      </div>
    </div>
  );
}

const forest = "#1F4D3A";

async function drawWalletQr(canvas: HTMLCanvasElement, payload: string) {
  const QR = await import("qrcode");
  const symbol = QR.create(payload, { errorCorrectionLevel: "H" });
  const count = symbol.modules.size;
  const quiet = 2;
  const cell = 10;
  const full = (count + quiet * 2) * cell;
  const scale = 3;
  canvas.width = full * scale;
  canvas.height = full * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, full, full);
  ctx.fillStyle = forest;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!symbol.modules.get(row, col) || inFinder(row, col, count)) continue;
      ctx.beginPath();
      ctx.arc((col + quiet) * cell + cell / 2, (row + quiet) * cell + cell / 2, cell * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFinder(ctx, quiet * cell, quiet * cell, cell);
  drawFinder(ctx, (count - 7 + quiet) * cell, quiet * cell, cell);
  drawFinder(ctx, quiet * cell, (count - 7 + quiet) * cell, cell);

  const logoModules = 9;
  const logoStart = Math.floor((count - logoModules) / 2);
  const box = logoModules * cell;
  const origin = (logoStart + quiet) * cell;
  const pad = cell * 1.2;
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, origin - pad, origin - pad, box + pad * 2, box + pad * 2, cell * 1.3);
  ctx.fill();

  const image = await loadLogo();
  const inset = cell * 0.2;
  ctx.save();
  roundedRect(ctx, origin + inset, origin + inset, box - inset * 2, box - inset * 2, cell * 1.1);
  ctx.clip();
  ctx.drawImage(image, origin + inset, origin + inset, box - inset * 2, box - inset * 2);
  ctx.restore();
}

function inFinder(row: number, col: number, count: number) {
  const top = row < 7;
  const left = col < 7;
  const bottom = row >= count - 7;
  const right = col >= count - 7;
  return (top && left) || (top && right) || (bottom && left);
}

function drawFinder(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
  ctx.fillStyle = forest;
  roundedRect(ctx, x, y, cell * 7, cell * 7, cell * 1.6);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 1.1);
  ctx.fill();
  ctx.fillStyle = forest;
  roundedRect(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.8);
  ctx.fill();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const curve = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + curve, y);
  ctx.arcTo(x + width, y, x + width, y + height, curve);
  ctx.arcTo(x + width, y + height, x, y + height, curve);
  ctx.arcTo(x, y + height, x, y, curve);
  ctx.arcTo(x, y, x + width, y, curve);
  ctx.closePath();
}

function loadLogo() {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("logo"));
    image.src = "/icon-512.png";
  });
}
