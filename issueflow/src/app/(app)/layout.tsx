import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { getActor } from "@/lib/session";
import { listNotifications } from "@/server/reminders";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const notes = await listNotifications(actor);
  return (
    <Shell actor={actor} unread={notes.unread}>
      {children}
    </Shell>
  );
}
