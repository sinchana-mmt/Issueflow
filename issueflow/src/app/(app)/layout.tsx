import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { getActor } from "@/lib/session";
import { companyContext } from "@/server/companies";
import { listNotifications } from "@/server/reminders";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const [notes, context] = await Promise.all([listNotifications(actor), companyContext(actor)]);
  return (
    <Shell actor={actor} unread={notes.unread} companies={context.companies} companyId={context.companyId}>
      {children}
    </Shell>
  );
}
