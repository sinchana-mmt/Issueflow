import { notFound, redirect } from "next/navigation";
import { IssueWorkspace } from "@/components/issue-workspace";
import { renderMarkdown } from "@/lib/markdown";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { getIssue } from "@/server/issues";
import { getProject } from "@/server/projects";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id };
}

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const { id } = await params;
  try {
    const issue = await getIssue(actor, id);
    const project = await getProject(actor, issue.project.id);
    return (
      <IssueWorkspace
        issue={issue}
        descriptionHtml={renderMarkdown(issue.description)}
        members={project.members}
        tags={project.tags}
        canUpdate={can(actor, "issue.update")}
        canDelete={can(actor, "issue.delete")}
      />
    );
  } catch {
    notFound();
  }
}
