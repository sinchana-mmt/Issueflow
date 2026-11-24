import { redirect } from "next/navigation";
import { IssueForm } from "@/components/issue-form";
import { getActor } from "@/lib/session";
import { companyContext, listTags } from "@/server/companies";
import { listPeople } from "@/server/users";

export const metadata = { title: "Create issue" };

export default async function NewIssuePage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const context = await companyContext(actor);
  const company = context.companies.find((item) => item.id === context.companyId);
  const [people, tags] = await Promise.all([
    listPeople(actor),
    context.companyId ? listTags(actor, context.companyId) : Promise.resolve([]),
  ]);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Create issue</h2>
      {company ? (
        <IssueForm companyId={company.id} companyName={company.name} people={people} tags={tags} />
      ) : (
        <p className="text-sm text-muted">Add a company from Team before creating issues.</p>
      )}
    </div>
  );
}
