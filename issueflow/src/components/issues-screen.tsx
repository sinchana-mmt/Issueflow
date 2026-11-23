"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Select } from "@/components/ui";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/constants";
import type { IssueCard, Person, TagRef } from "@/lib/types";
import { send } from "@/lib/ui";

const columns = ["key", "title", "project", "type", "status", "priority", "assignee", "due", "updated"] as const;

export function IssuesScreen({
  issues,
  total,
  page,
  pageSize,
  query,
  projects,
  people,
  tags,
  filters,
  basePath,
}: {
  issues: IssueCard[];
  total: number;
  page: number;
  pageSize: number;
  query: Record<string, string | undefined>;
  projects: { id: string; name: string; key: string }[];
  people: Person[];
  tags: (TagRef & { project?: { key: string } })[];
  filters: { id: string; name: string; queryString: string }[];
  basePath: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState<string[]>([...columns]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    const stored = window.localStorage.getItem("issueflow.columns");
    if (stored) setVisible(stored.split(","));
  }, []);
  const exportQuery = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
    return params.toString();
  }, [query]);

  function toggleColumn(column: string) {
    const next = visible.includes(column) ? visible.filter((item) => item !== column) : [...visible, column];
    setVisible(next);
    window.localStorage.setItem("issueflow.columns", next.join(","));
  }

  async function bulk(body: Record<string, unknown>) {
    setMessage("");
    const result = await send<{ updated: number; skipped: string[] }>("/api/v1/issues/bulk", { method: "POST", body: JSON.stringify({ ids: selected, ...body }) });
    setMessage(`Updated ${result.updated}. Skipped ${result.skipped.length}.`);
    setSelected([]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{basePath === "/my-issues" ? "My issues" : "All issues"}</h2>
          <p className="text-sm text-muted">{total} matching issues</p>
        </div>
        <div className="flex gap-2">
          <a className="inline-flex h-9 items-center rounded-[10px] border border-line px-3 text-sm" href={`/api/v1/exports/issues.csv?${exportQuery}`}>CSV</a>
          <a className="inline-flex h-9 items-center rounded-[10px] border border-line px-3 text-sm" href={`/api/v1/exports/issues.json?${exportQuery}`}>JSON</a>
        </div>
      </div>
      <form action={basePath} className="grid gap-2 rounded-2xl border border-line bg-panel p-3 md:grid-cols-6">
        <Select name="projectId" defaultValue={query.projectId || ""}>
          <option value="">All projects</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.key}</option>)}
        </Select>
        <Select name="status" defaultValue={query.status || ""}>
          <option value="">Any status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Select name="priority" defaultValue={query.priority || ""}>
          <option value="">Any priority</option>
          {Object.entries(PRIORITY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Select name="assigneeId" defaultValue={query.assigneeId || ""}>
          <option value="">Any assignee</option>
          <option value="unassigned">Unassigned</option>
          {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </Select>
        <Select name="tagId" defaultValue={query.tagId || ""}>
          <option value="">Any tag</option>
          {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.project ? `${tag.project.key} / ` : ""}{tag.name}</option>)}
        </Select>
        <Select name="due" defaultValue={query.due || ""}>
          <option value="">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="week">Due this week</option>
          <option value="none">No due date</option>
        </Select>
        <Select name="sort" defaultValue={query.sort || "updatedAt"}>
          <option value="updatedAt">Updated</option>
          <option value="createdAt">Created</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due date</option>
        </Select>
        <Select name="dir" defaultValue={query.dir || "desc"}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
        <Select name="archived" defaultValue={query.archived || "active"}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </Select>
        <Button type="submit" variant="subtle">Apply</Button>
        <Link href={basePath} className="inline-flex h-9 items-center text-sm text-muted">Clear</Link>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted">Columns</summary>
          <div className="mt-2 space-y-1">
            {columns.map((column) => (
              <label key={column} className="flex items-center gap-2 capitalize">
                <input type="checkbox" checked={visible.includes(column)} onChange={() => toggleColumn(column)} />
                {column}
              </label>
            ))}
          </div>
        </details>
      </form>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {filters.map((filter) => <Link key={filter.id} className="rounded-full border border-line px-3 py-1 text-muted hover:text-ink" href={`${basePath}?${filter.queryString}`}>{filter.name}</Link>)}
        <button
          className="text-accent-2"
          onClick={async () => {
            const name = window.prompt("Name this filter");
            if (!name) return;
            await send("/api/v1/filters", { method: "POST", body: JSON.stringify({ name, queryString: exportQuery }) });
            router.refresh();
          }}
        >
          Save filter
        </button>
      </div>
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-panel p-3">
          <span className="text-sm text-muted">{selected.length} selected</span>
          <Select defaultValue="" onChange={(event) => { if (event.target.value) void bulk({ status: event.target.value }); }}>
            <option value="">Set status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select defaultValue="" onChange={(event) => { if (event.target.value) void bulk({ assigneeId: event.target.value === "none" ? null : event.target.value }); }}>
            <option value="">Set assignee</option>
            <option value="none">Unassigned</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </Select>
          <Button variant="ghost" onClick={() => void bulk({ archive: true })}>Archive</Button>
        </div>
      ) : null}
      {message ? <p className="text-sm text-ok">{message}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="w-10 px-3 py-3" />
              {visible.includes("key") ? <th className="px-3 py-3">Key</th> : null}
              {visible.includes("title") ? <th className="px-3 py-3">Title</th> : null}
              {visible.includes("project") ? <th className="px-3 py-3">Project</th> : null}
              {visible.includes("type") ? <th className="px-3 py-3">Type</th> : null}
              {visible.includes("status") ? <th className="px-3 py-3">Status</th> : null}
              {visible.includes("priority") ? <th className="px-3 py-3">Priority</th> : null}
              {visible.includes("assignee") ? <th className="px-3 py-3">Assignee</th> : null}
              {visible.includes("due") ? <th className="px-3 py-3">Due</th> : null}
              {visible.includes("updated") ? <th className="px-3 py-3">Updated</th> : null}
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr><td colSpan={10} className="px-3 py-10 text-center text-muted">No issues match these filters.</td></tr>
            ) : null}
            {issues.map((issue) => (
              <tr key={issue.id} className="border-t border-line hover:bg-panel/60">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(issue.id)} onChange={() => setSelected((current) => current.includes(issue.id) ? current.filter((id) => id !== issue.id) : [...current, issue.id])} /></td>
                {visible.includes("key") ? <td className="px-3 py-3 font-mono text-xs text-accent-2"><Link href={`/issues/${issue.id}`}>{issue.key}</Link></td> : null}
                {visible.includes("title") ? <td className="px-3 py-3"><Link href={`/issues/${issue.id}`} className="hover:underline">{issue.title}</Link>{issue.parent ? <div className="text-xs text-faint">Subtask of {issue.parent.key}</div> : null}</td> : null}
                {visible.includes("project") ? <td className="px-3 py-3 text-muted">{issue.project.key}</td> : null}
                {visible.includes("type") ? <td className="px-3 py-3 text-muted">{issue.type}</td> : null}
                {visible.includes("status") ? <td className="px-3 py-3"><Badge>{STATUS_LABEL[issue.status]}</Badge></td> : null}
                {visible.includes("priority") ? <td className="px-3 py-3"><Badge tone={issue.priority === "CRITICAL" ? "critical" : issue.priority === "HIGH" ? "high" : issue.priority === "MEDIUM" ? "medium" : "low"}>{PRIORITY_LABEL[issue.priority]}</Badge></td> : null}
                {visible.includes("assignee") ? <td className="px-3 py-3 text-muted">{issue.assignee?.name || "—"}</td> : null}
                {visible.includes("due") ? <td className="px-3 py-3 text-muted">{issue.dueDate || "—"}</td> : null}
                {visible.includes("updated") ? <td className="px-3 py-3 text-faint">{issue.updatedAt.slice(0, 10)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Page {page} of {pages}</span>
        <div className="flex gap-2">
          {page > 1 ? <Link className="rounded-[10px] border border-line px-3 py-1" href={pageHref(basePath, query, page - 1)}>Previous</Link> : null}
          {page < pages ? <Link className="rounded-[10px] border border-line px-3 py-1" href={pageHref(basePath, query, page + 1)}>Next</Link> : null}
        </div>
      </div>
    </div>
  );
}

function pageHref(base: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  params.set("page", String(page));
  return `${base}?${params.toString()}`;
}
