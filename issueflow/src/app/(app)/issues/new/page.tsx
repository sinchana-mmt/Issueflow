import { redirect } from "next/navigation";
import { IssueForm } from "@/components/issue-form";
import { getActor } from "@/lib/session";
import { listProjects, listTags } from "@/server/projects";
import { listPeople } from "@/server/users";

export const metadata = { title: "Create issue" };

export default async function NewIssuePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const params = await searchParams;
  const [projects, people, tags] = await Promise.all([listProjects(actor), listPeople(actor), listTags(actor)]);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Create issue</h2>
      {projects.length === 0 ? <p className="text-sm text-muted">Create a project before adding issues.</p> : (
        <IssueForm
          projects={projects}
          people={people}
          tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color, projectId: tag.project.id }))}
          presetProjectId={params.projectId}
        />
      )}
    </div>
  );
}
