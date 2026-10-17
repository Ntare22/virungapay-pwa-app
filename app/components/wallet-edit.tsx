"use client";

import { useState, type FormEvent } from "react";
import { renameWallet, type Wallet } from "../lib/api";

export function WalletIdentity({
  wallet,
  fallback,
  onSaved,
  usernameOnly = false,
}: {
  wallet: Wallet;
  fallback: string;
  onSaved: (wallet: Wallet) => void;
  usernameOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = wallet.name?.trim() || fallback;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase">{label}</p>
          <p className="mt-1 break-all font-mono text-sm normal-case text-[#1F4D3A]">@{wallet.username || "no username"}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-9 shrink-0 border-2 border-[#1C2416] bg-white px-3 text-xs font-bold uppercase"
        >
          Edit
        </button>
      </div>
      {open ? (
        <UsernameModal
          wallet={wallet}
          usernameOnly={usernameOnly}
          onClose={() => setOpen(false)}
          onSaved={(saved) => {
            onSaved(saved);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function UsernameModal({
  wallet,
  usernameOnly,
  onClose,
  onSaved,
}: {
  wallet: Wallet;
  usernameOnly: boolean;
  onClose: () => void;
  onSaved: (wallet: Wallet) => void;
}) {
  const [name, setName] = useState(wallet.name || "");
  const [username, setUsername] = useState(wallet.username || "");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim()) {
      setNotice("Enter a username.");
      return;
    }
    setPending(true);
    setNotice("");
    renameWallet(wallet.id, { name: usernameOnly ? "" : name.trim(), username: username.trim() })
      .then(onSaved)
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
        setPending(false);
      });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C2416]/40 p-4" onMouseDown={() => !pending && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-username-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md border-2 border-[#1C2416] bg-[#F6F1E7] p-4 shadow-[6px_6px_0_#E2B15A]"
      >
        <div className="flex items-center justify-between">
          <h2 id="edit-username-title" className="text-lg font-bold">Edit username</h2>
          <button type="button" onClick={onClose} className="px-2 text-xl" aria-label="Close">×</button>
        </div>
        <p className="mt-2 text-sm">Senders find this wallet by the username.</p>
        {usernameOnly ? null : (
          <label className="mt-3 block text-sm font-bold" htmlFor={`wallet-name-${wallet.id}`}>
            Wallet name
            <input
              id={`wallet-name-${wallet.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              className="mt-1 h-12 w-full border-2 border-[#1C2416] bg-white px-3 font-normal"
            />
          </label>
        )}
        <label className="mt-3 block text-sm font-bold" htmlFor={`wallet-username-${wallet.id}`}>
          Username
          <input
            id={`wallet-username-${wallet.id}`}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="mt-1 h-12 w-full border-2 border-[#1C2416] bg-white px-3 font-mono font-normal normal-case"
          />
        </label>
        {notice ? <p className="mt-2 text-sm font-normal normal-case">{notice}</p> : null}
        <button type="submit" disabled={pending} className="mt-4 h-12 w-full border-2 border-[#1C2416] bg-[#E2B15A] text-sm font-bold uppercase disabled:opacity-60">
          {pending ? "Saving" : "Save"}
        </button>
      </form>
    </div>
  );
}
