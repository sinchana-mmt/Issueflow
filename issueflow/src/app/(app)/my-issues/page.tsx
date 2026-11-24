import { redirect } from "next/navigation";
import { IssuesScreen } from "@/components/issues-screen";
import { parseIssueQuery } from "@/lib/issue-query";
import { getActor } from "@/lib/session";
import { companyContext, listTags } from "@/server/companies";
import { listFilters } from "@/server/filters";
import { listIssues } from "@/server/issues";
import { listPeople } from "@/server/users";

export const metadata = { title: "My issues" };

export default async function MyIssuesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const params = await searchParams;
  const context = await companyContext(actor);
  const query = parseIssueQuery(params, { mine: true, companyId: context.companyId || undefined });
  const [result, people, tags, filters] = await Promise.all([
    listIssues(actor, query),
    listPeople(actor),
    listTags(actor, context.companyId || undefined),
    listFilters(actor),
  ]);
  return (
    <IssuesScreen
      {...result}
      basePath="/my-issues"
      query={{ ...plain(params), mine: "1", companyId: query.companyId }}
      people={people}
      tags={tags}
      filters={filters}
    />
  );
}

function plain(params: Record<string, string | string[] | undefined>) {
  const query: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) query[key] = Array.isArray(value) ? value[0] : value;
  return query;
}
