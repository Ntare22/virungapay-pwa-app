const handle = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function walletQrPayload(username: string) {
  return `virungapay://pay/${username.trim().replace(/^@/, "").toLowerCase()}`;
}

export function usernameFromQr(raw: string) {
  const text = raw.trim();
  const scheme = /^virungapay:\/\/pay\/([^/?#]+)$/i.exec(text);
  if (scheme) return clean(decodeURIComponent(scheme[1]));
  if (text.startsWith("http://") || text.startsWith("https://")) {
    try {
      const url = new URL(text);
      const query = url.searchParams.get("username") || url.searchParams.get("u");
      if (query) return clean(query);
      const parts = url.pathname.split("/").filter(Boolean);
      const pay = parts.indexOf("pay");
      if (pay >= 0 && parts[pay + 1]) return clean(parts[pay + 1]);
    } catch {
      return "";
    }
    return "";
  }
  return clean(text);
}

function clean(raw: string) {
  const username = raw.trim().replace(/^@/, "").toLowerCase();
  if (username.length < 3 || username.length > 30 || !handle.test(username)) return "";
  return username;
}
