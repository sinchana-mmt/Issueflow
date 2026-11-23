import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArchiveProject, MemberControls, RemoveMember, TagForm, TagRow } from "@/components/manage";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { getProject } from "@/server/projects";
import { listUsers } from "@/server/users";

export const metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const { id } = await params;
  try {
    const project = await getProject(actor, id);
    const users = can(actor, "project.member.manage") ? await listUsers(actor) : [];
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-xs text-accent-2">{project.key}</div>
            <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">{project.description || "No description"}</p>
          </div>
          {can(actor, "project.update") ? <ArchiveProject projectId={project.id} archived={project.status === "ARCHIVED"} /> : null}
        </div>
        <div className="flex gap-3 text-sm">
          <Link className="text-accent-2" href={`/issues?projectId=${project.id}`}>View issues</Link>
          <Link className="text-accent-2" href={`/board?projectId=${project.id}`}>Open board</Link>
          <Link className="text-accent-2" href={`/issues/new?projectId=${project.id}`}>Create issue</Link>
        </div>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">People on this project</h3>
          <p className="mt-1 text-sm text-muted">Create the account on Team first, then add them here.</p>
          <div className="mt-3 space-y-2">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span>{member.name} <span className="text-faint">{member.email}</span></span>
                {can(actor, "project.member.manage") ? <RemoveMember projectId={project.id} userId={member.id} /> : null}
              </div>
            ))}
          </div>
          {can(actor, "project.member.manage") ? <div className="mt-4"><MemberControls projectId={project.id} users={users.filter((user) => user.active)} members={project.members} /></div> : null}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Tags</h3>
          <div className="mt-3 space-y-2">
            {project.tags.map((tag) => can(actor, "tag.manage") ? <TagRow key={tag.id} tag={tag} /> : <div key={tag.id} className="text-sm" style={{ color: tag.color }}>{tag.name}</div>)}
          </div>
          {can(actor, "tag.manage") ? <div className="mt-4"><TagForm projectId={project.id} /></div> : null}
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}
