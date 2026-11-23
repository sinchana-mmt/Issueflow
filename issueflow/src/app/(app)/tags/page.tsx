import { redirect } from "next/navigation";
import { TagRow } from "@/components/manage";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listTags } from "@/server/projects";

export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const tags = await listTags(actor);
  const groups = new Map<string, typeof tags>();
  for (const tag of tags) {
    const list = groups.get(tag.project.key) || [];
    list.push(tag);
    groups.set(tag.project.key, list);
  }
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold tracking-tight">Tags</h2>
      {[...groups.entries()].map(([key, group]) => (
        <section key={key} className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="font-mono text-sm text-accent-2">{key}</h3>
          <div className="mt-3 space-y-2">
            {group.map((tag) => can(actor, "tag.manage") ? <TagRow key={tag.id} tag={tag} /> : <div key={tag.id} style={{ color: tag.color }}>{tag.name}</div>)}
          </div>
        </section>
      ))}
      {tags.length === 0 ? <p className="text-sm text-muted">Tags are created inside a project.</p> : null}
    </div>
  );
}
