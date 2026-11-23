import { redirect } from "next/navigation";
import { IssuesScreen } from "@/components/issues-screen";
import { parseIssueQuery } from "@/lib/issue-query";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listFilters } from "@/server/filters";
import { listIssues } from "@/server/issues";
import { listProjects, listTags } from "@/server/projects";
import { listPeople } from "@/server/users";

export const metadata = { title: "All issues" };

export default async function IssuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const params = await searchParams;
  const query = parseIssueQuery(params);
  const [result, projects, people, tags, filters] = await Promise.all([
    listIssues(actor, query),
    listProjects(actor),
    listPeople(actor),
    listTags(actor),
    listFilters(actor),
  ]);
  return (
    <IssuesScreen
      {...result}
      basePath="/issues"
      query={plain(params)}
      projects={projects}
      people={people}
      tags={tags.map((tag) => ({ ...tag, project: tag.project }))}
      filters={can(actor, "export") ? filters : filters}
    />
  );
}

function plain(params: Record<string, string | string[] | undefined>) {
  const query: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) query[key] = Array.isArray(value) ? value[0] : value;
  return query;
}
