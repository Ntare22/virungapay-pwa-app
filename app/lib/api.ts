const storageKey = "virungapay.pwa.session";

export type PublicUser = {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  status: string;
};

export type Session = { token: string; user: PublicUser };

export type Wallet = { id: string; name?: string; username?: string; currency: string; balance: string; is_default: boolean };

export type WalletLookup = { username: string; name: string; currency: string; kind: string };

export type Company = {
  id: string;
  name: string;
  status: string;
  wallets: Wallet[];
};

export type Payment = {
  id: string;
  kind: string;
  direction: "in" | "out";
  amount: string;
  currency: string;
  invoice_number?: string;
  counterparty?: string;
  created_at: string;
};

export type Bureau = { id: string; name: string; status: string };

export type Tariff = { pair: string; customer_rate: string; quote_on: string };

export class ApiError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (!session.token || !session.user?.role) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(storageKey);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(path, { ...init, headers });
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
  let message = "Something went wrong. Try again.";
  let code = "request_failed";
  try {
    const body = (await response.json()) as { error?: { message?: string; code?: string } };
    if (body.error?.message) message = body.error.message;
    if (body.error?.code) code = body.error.code;
  } catch {
    // keep the fallback
  }
  throw new ApiError(message, code);
}

function token() {
  return readSession()?.token;
}

export function registerTourist(input: { firstName: string; lastName: string; email: string }) {
  return request<{ user: PublicUser }>("/v1/auth/tourists", {
    method: "POST",
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
    }),
  });
}

export function requestLoginCode(email: string) {
  return request<{ message: string }>("/v1/auth/login-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmLoginCode(email: string, code: string) {
  return request<Session>("/v1/auth/login-code/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function me() {
  return request<PublicUser>("/v1/me", {}, token());
}

export function myCompany() {
  return request<Company>("/v1/companies/mine", {}, token());
}

export function lookupWallet(username: string) {
  return request<WalletLookup>(`/v1/wallets/lookup?username=${encodeURIComponent(username)}`, {}, token());
}

export function myWallets() {
  return request<{ wallets: Wallet[] }>("/v1/wallets/mine", {}, token());
}

export function payments() {
  return request<{ payments: Payment[] }>("/v1/transactions", {}, token());
}

export type Trip = {
  id: string;
  title: string;
  business_name?: string;
  starts_on: string;
  ends_on: string;
  currency: string;
  amount_due: string;
  status: string;
};

export function myItineraries() {
  return request<{ itineraries: Trip[] }>("/v1/itineraries/mine", {}, token());
}

export async function downloadStatement() {
  const response = await fetch("/v1/wallets/mine/statement?format=pdf", {
    headers: { authorization: `Bearer ${token() ?? ""}` },
  });
  if (!response.ok) {
    let message = "The statement could not be generated.";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // keep the fallback
    }
    throw new ApiError(message, "statement_failed");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "VirungaPass-statement.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export function tariffs() {
  return request<{ tariffs: Tariff[] }>("/v1/tariff", {}, token());
}

export function bureaus() {
  return request<{ businesses: Bureau[] }>("/v1/bureaus", {}, token());
}

export function withdraw(input: { bureauId: string; currency: string; amount: string }) {
  return request<{ status: string }>(
    "/v1/withdrawals",
    {
      method: "POST",
      body: JSON.stringify({ bureau_id: input.bureauId, currency: input.currency, amount: input.amount }),
    },
    token(),
  );
}

export function moveWallets(input: { fromWalletId: string; toWalletId: string; amount: string }) {
  return request<{ status: string }>(
    "/v1/wallets/moves",
    {
      method: "POST",
      body: JSON.stringify({
        from_wallet_id: input.fromWalletId,
        to_wallet_id: input.toWalletId,
        amount: input.amount,
      }),
    },
    token(),
  );
}

export function topUpCard(input: { amount: string; last4: string }) {
  return request<{ status: string }>("/v1/wallets/topup", { method: "POST", body: JSON.stringify(input) }, token());
}

export function sendMobileMoney(input: { network: "airtel" | "mtn"; phone: string; amount: string }) {
  return request<{ status: string }>("/v1/mobile-money", { method: "POST", body: JSON.stringify(input) }, token());
}

export function sendTip(input: { username: string; amount: string; purpose: "tip" | "service" }) {
  return request<{ status: string }>("/v1/tips", { method: "POST", body: JSON.stringify(input) }, token());
}

export function requestEurWallet() {
  return request<Company>("/v1/wallets", { method: "POST", body: JSON.stringify({ currency: "EUR" }) }, token());
}

export function renameWallet(id: string, input: { name: string; username: string }) {
  return request<Wallet>(`/v1/wallets/${id}`, { method: "PATCH", body: JSON.stringify(input) }, token());
}

export function roleLabel(role: string) {
  switch (role) {
    case "operator_owner":
      return "Tour operator";
    case "guide":
      return "Guide";
    case "driver":
      return "Driver";
    case "tourist":
      return "Tourist";
    default:
      return role;
  }
}
