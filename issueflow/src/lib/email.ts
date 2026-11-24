const BLOCKED_DOMAINS = new Set(["issueflow.local", "example.com", "example.org", "example.net", "localhost"]);

export function workEmail(value: string) {
  const email = value.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  const domain = at > 0 ? email.slice(at + 1) : "";
  const shaped = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!shaped || !domain || domain.endsWith(".local") || BLOCKED_DOMAINS.has(domain)) return null;
  return email;
}
