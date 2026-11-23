import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectCreator } from "@/components/manage";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listProjects } from "@/server/projects";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const projects = await listProjects(actor);
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
      {can(actor, "project.create") ? <ProjectCreator /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="rounded-2xl border border-line bg-panel p-4 hover:border-accent">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{project.name}</h3>
              <span className="font-mono text-xs text-accent-2">{project.key}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{project.description || "No description"}</p>
            <p className="mt-3 text-xs text-faint">{project.issueCount} issues · {project.memberCount} members · {project.status.toLowerCase()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
