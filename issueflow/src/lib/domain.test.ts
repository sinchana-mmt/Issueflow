import { describe, expect, it } from "vitest";
import { createsBlockCycle } from "@/lib/dependencies";
import { formatIssueKey, parseIssueKey } from "@/lib/keys";
import { can, type Actor } from "@/lib/permissions";
import { addCalendarDays, classifyDue, reminderDedupKey, todayIso } from "@/lib/reminders";

function actor(role: Actor["role"], active = true): Actor {
  return { id: "u1", name: "Ada", email: "ada@example.com", role, active };
}

describe("permissions", () => {
  it("lets members work on issues and keeps administration with admins", () => {
    expect(can(actor("USER"), "issue.create")).toBe(true);
    expect(can(actor("USER"), "issue.update")).toBe(true);
    expect(can(actor("USER"), "export")).toBe(true);
    expect(can(actor("USER"), "project.create")).toBe(false);
    expect(can(actor("USER"), "issue.delete")).toBe(false);
    expect(can(actor("USER"), "user.create")).toBe(false);
    expect(can(actor("ADMIN"), "project.create")).toBe(true);
    expect(can(actor("ADMIN"), "user.create")).toBe(true);
    expect(can(actor("ADMIN"), "issue.delete")).toBe(true);
    expect(can(actor("ADMIN"), "settings.update")).toBe(false);
    expect(can(actor("SUPERADMIN"), "settings.update")).toBe(true);
    expect(can(actor("SUPERADMIN", false), "issue.update")).toBe(false);
  });
});

describe("issue keys", () => {
  it("pads to three digits and grows past 999", () => {
    expect(formatIssueKey("ECOM", 1)).toBe("ECOM-001");
    expect(formatIssueKey("ECOM", 999)).toBe("ECOM-999");
    expect(formatIssueKey("ECOM", 1000)).toBe("ECOM-1000");
    expect(parseIssueKey("web-12")).toEqual({ projectKey: "WEB", number: 12 });
    expect(parseIssueKey("checkout")).toBeNull();
  });
});

describe("blocking cycles", () => {
  const edges = [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ];

  it("rejects a transitive cycle and a self link", () => {
    expect(createsBlockCycle(edges, "c", "a")).toBe(true);
    expect(createsBlockCycle(edges, "b", "a")).toBe(true);
    expect(createsBlockCycle(edges, "a", "a")).toBe(true);
    expect(createsBlockCycle(edges, "a", "d")).toBe(false);
  });
});

describe("due reminders", () => {
  const now = new Date("2026-11-23T07:30:00.000Z");

  it("classifies dates in the organization timezone", () => {
    expect(todayIso("UTC", now)).toBe("2026-11-23");
    expect(todayIso("America/Los_Angeles", now)).toBe("2026-11-22");
    expect(classifyDue("2026-11-23", "UTC", now)).toBe("today");
    expect(classifyDue("2026-11-24", "UTC", now)).toBe("tomorrow");
    expect(classifyDue("2026-11-22", "UTC", now)).toBe("overdue");
    expect(classifyDue("2026-11-30", "UTC", now)).toBe("later");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("builds a stable dedup key", () => {
    expect(reminderDedupKey("user", "issue", "today", "2026-11-23")).toBe("user:issue:today:2026-11-23");
  });
});
