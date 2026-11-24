import Link from "next/link";
import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { companyContext } from "@/server/companies";
import { getDashboard } from "@/server/dashboard";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/constants";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const context = await companyContext(actor);
  const company = context.companies.find((item) => item.id === context.companyId);
  const data = await getDashboard(actor, context.companyId || undefined);
  const stats = [
    ["Active", data.counts.active],
    ["Assigned to me", data.counts.mine],
    ["In progress", data.counts.inProgress],
    ["Blocked", data.counts.blocked],
    ["Done", data.counts.done],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted">{company ? `Issues for ${company.name}.` : "Add a company from Team to start tracking issues."}</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-panel px-4 py-3">
            <div className="text-xs text-faint">{label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
          </div>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <List title="Upcoming deadlines" empty="No deadlines this week." rows={data.upcoming.map((issue) => ({ href: `/issues/${issue.id}`, key: issue.key, title: issue.title, meta: issue.dueDate || "" }))} />
        <List title="My assigned issues" empty="Nothing is assigned to you." rows={data.assigned.map((issue) => ({ href: `/issues/${issue.id}`, key: issue.key, title: issue.title, meta: STATUS_LABEL[issue.status] }))} />
        <List title="Recently updated" empty="No recent updates." rows={data.recent.map((issue) => ({ href: `/issues/${issue.id}`, key: issue.key, title: issue.title, meta: PRIORITY_LABEL[issue.priority] }))} />
        <div className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Reminders</h3>
          <div className="mt-3 space-y-2">
            {data.notifications.length === 0 ? <p className="text-sm text-faint">No notifications yet.</p> : null}
            {data.notifications.map((note) => (
              <Link key={note.id} href={note.issue ? `/issues/${note.issue.id}` : "/notifications"} className="block rounded-[10px] px-2 py-2 hover:bg-panel-2">
                <div className="text-sm">{note.title}</div>
                <div className="text-xs text-faint">{note.readAt ? "Read" : "Unread"}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function List({ title, empty, rows }: { title: string; empty: string; rows: { href: string; key: string; title: string; meta: string }[] }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="mt-3 space-y-1">
        {rows.length === 0 ? <p className="text-sm text-faint">{empty}</p> : null}
        {rows.map((row) => (
          <Link key={row.href + row.key} href={row.href} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-panel-2">
            <span className="font-mono text-xs text-accent-2">{row.key}</span>
            <span className="truncate text-sm">{row.title}</span>
            <span className="text-xs text-faint">{row.meta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
