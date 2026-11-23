export function todayIso(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) throw new Error("Could not format the calendar date");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function classifyDue(dueDate: string, timeZone: string, now = new Date()) {
  const today = todayIso(timeZone, now);
  if (dueDate < today) return "overdue" as const;
  if (dueDate === today) return "today" as const;
  if (dueDate === addCalendarDays(today, 1)) return "tomorrow" as const;
  return "later" as const;
}

export function reminderDedupKey(userId: string, issueId: string, kind: string, dueDate: string) {
  return `${userId}:${issueId}:${kind}:${dueDate}`;
}

export function isValidTimeZone(timeZone: string) {
  try {
    todayIso(timeZone, new Date());
    return true;
  } catch {
    return false;
  }
}
