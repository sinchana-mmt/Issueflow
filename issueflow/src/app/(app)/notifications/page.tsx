import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationActions, ReadOne } from "@/components/manage";
import { getActor } from "@/lib/session";
import { listNotifications } from "@/server/reminders";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const data = await listNotifications(actor);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
        <NotificationActions />
      </div>
      <div className="space-y-2">
        {data.notifications.length === 0 ? <p className="text-sm text-muted">You are caught up.</p> : null}
        {data.notifications.map((note) => (
          <article key={note.id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">{note.title}</h3>
                <p className="mt-1 text-sm text-muted">{note.body}</p>
                <p className="mt-2 text-xs text-faint">{note.createdAt.slice(0, 16).replace("T", " ")} {note.readAt ? "· Read" : ""}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {note.issue ? <Link className="text-xs text-accent-2" href={`/issues/${note.issue.id}`}>{note.issue.key}</Link> : null}
                {!note.readAt ? <ReadOne id={note.id} /> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
