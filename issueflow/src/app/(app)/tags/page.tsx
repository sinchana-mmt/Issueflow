import { redirect } from "next/navigation";
import { TagForm, TagRow } from "@/components/manage";
import { getActor } from "@/lib/session";
import { companyContext, listTags } from "@/server/companies";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const context = await companyContext(actor);
  const company = context.companies.find((item) => item.id === context.companyId);
  const tags = context.companyId ? await listTags(actor, context.companyId) : [];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tags</h2>
        <p className="text-sm text-muted">{company ? `Tags for ${company.name}.` : "Choose a company to manage tags."}</p>
      </div>
      {company?.delegated ? <TagForm companyId={company.id} /> : null}
      <div className="space-y-2">
        {tags.map((tag) => company?.delegated ? <TagRow key={tag.id} tag={tag} /> : <div key={tag.id} style={{ color: tag.color }}>{tag.name}</div>)}
      </div>
      {tags.length === 0 ? <p className="text-sm text-muted">No tags for this company yet.</p> : null}
    </div>
  );
}
