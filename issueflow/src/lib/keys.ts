export function formatIssueKey(projectKey: string, number: number) {
  const width = Math.max(3, String(number).length);
  return `${projectKey}-${String(number).padStart(width, "0")}`;
}

export function parseIssueKey(value: string) {
  const match = value.trim().toUpperCase().match(/^([A-Z][A-Z0-9]{1,9})-(\d+)$/);
  if (!match) return null;
  return { projectKey: match[1], number: Number(match[2]) };
}
