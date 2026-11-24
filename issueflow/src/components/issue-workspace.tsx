"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Badge, Button, Input, Select, Textarea } from "@/components/ui";
import { ACTIVITY_LABEL, ISSUE_STATUSES, ISSUE_TYPES, PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, TYPE_LABEL } from "@/lib/constants";
import type { IssueCard, TagRef } from "@/lib/types";
import { send } from "@/lib/ui";

type Member = { id: string; name: string; email: string; active: boolean };
type Detail = IssueCard & {
  comments: { id: string; body: string; createdAt: string; updatedAt: string; author: { id: string; name: string }; own: boolean }[];
  attachments: { id: string; fileName: string; mimeType: string; sizeBytes: number; createdAt: string; uploadedBy: { id: string; name: string }; preview: boolean }[];
  activity: { id: string; action: string; oldValue: string | null; newValue: string | null; createdAt: string; actor: { id: string; name: string } }[];
  dependencies: { id: string; label: string; issue: { id: string; key: string; title: string; status: string } }[];
  children: IssueCard[];
};

export function IssueWorkspace({
  issue,
  descriptionHtml,
  members,
  tags,
  canUpdate,
  canDelete,
}: {
  issue: Detail;
  descriptionHtml: string;
  members: Member[];
  tags: TagRef[];
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(issue);
  const [html, setHtml] = useState(descriptionHtml);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [subtask, setSubtask] = useState("");
  const [comment, setComment] = useState("");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<IssueCard[]>([]);
  const [linkType, setLinkType] = useState("BLOCKS");

  useEffect(() => {
    setCurrent(issue);
    setHtml(descriptionHtml);
  }, [issue, descriptionHtml]);

  async function save(patch: Record<string, unknown>, success = "Saved") {
    setError("");
    try {
      const next = await send<Detail>(`/api/v1/issues/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...patch, updatedAt: current.updatedAt }),
      });
      setCurrent(next);
      setNote(success);
      router.refresh();
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
      return null;
    }
  }

  async function reload() {
    const next = await send<Detail>(`/api/v1/issues/${current.id}`);
    setCurrent(next);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <div>
          <div className="font-mono text-xs text-accent-2">{current.key}</div>
          {canUpdate ? (
            <input
              className="mt-1 w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
              defaultValue={current.title}
              key={current.updatedAt + current.title}
              onBlur={(event) => {
                if (event.target.value.trim() && event.target.value !== current.title) void save({ title: event.target.value.trim() });
              }}
            />
          ) : <h2 className="mt-1 text-3xl font-semibold tracking-tight">{current.title}</h2>}
          {current.parent ? <Link className="text-sm text-muted" href={`/issues/${current.parent.id}`}>Subtask of {current.parent.key}</Link> : null}
        </div>
        {note ? <p className="text-sm text-ok">{note}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <section className="rounded-2xl border border-line bg-panel p-4">
          {canUpdate ? (
            <MarkdownEditor html={html} onSave={async (markdown) => { await save({ description: markdown }, "Description saved"); }} />
          ) : <div className="markdown text-sm" dangerouslySetInnerHTML={{ __html: html }} />}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Subtasks {current.subtaskTotal ? `· ${current.subtaskDone}/${current.subtaskTotal}` : ""}</h3>
          <div className="mt-3 space-y-2">
            {current.children.map((child) => (
              <Link key={child.id} href={`/issues/${child.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-2 hover:bg-panel-2">
                <span><span className="mr-2 font-mono text-xs text-accent-2">{child.key}</span>{child.title}</span>
                <span className="text-xs text-faint">{STATUS_LABEL[child.status]}</span>
              </Link>
            ))}
          </div>
          {canUpdate && !current.parent ? (
            <form className="mt-3 flex gap-2" onSubmit={async (event) => {
              event.preventDefault();
              if (!subtask.trim()) return;
              await send("/api/v1/issues", { method: "POST", body: JSON.stringify({ title: subtask.trim(), companyId: current.company.id, parentId: current.id, type: "TASK", status: "TODO", priority: current.priority }) });
              setSubtask("");
              await reload();
            }}>
              <Input value={subtask} onChange={(event) => setSubtask(event.target.value)} placeholder="Add a subtask" />
              <Button type="submit">Add</Button>
            </form>
          ) : null}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Dependencies</h3>
          <div className="mt-3 space-y-2">
            {current.dependencies.map((link) => (
              <div key={link.id} className="flex items-center justify-between gap-3 text-sm">
                <Link href={`/issues/${link.issue.id}`}><span className="text-muted">{link.label}</span> {link.issue.key} {link.issue.title}</Link>
                {canUpdate ? <button className="text-xs text-faint" onClick={async () => { await send(`/api/v1/dependencies/${link.id}`, { method: "DELETE" }); await reload(); }}>Remove</button> : null}
              </div>
            ))}
          </div>
          {canUpdate ? (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Input value={query} placeholder="Find an issue" onChange={async (event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim().length < 1) { setMatches([]); return; }
                  const result = await send<{ issues: IssueCard[] }>(`/api/v1/issues?q=${encodeURIComponent(value)}&companyId=${current.company.id}&pageSize=6`);
                  setMatches(result.issues.filter((item) => item.id !== current.id));
                }} />
                <Select value={linkType} onChange={(event) => setLinkType(event.target.value)}>
                  <option value="BLOCKS">Blocks</option>
                  <option value="BLOCKED_BY">Is blocked by</option>
                  <option value="RELATES">Relates to</option>
                  <option value="DUPLICATES">Duplicates</option>
                </Select>
              </div>
              {matches.map((match) => (
                <button key={match.id} className="block w-full rounded-[10px] px-2 py-1 text-left text-sm hover:bg-panel-2" onClick={async () => {
                  await send(`/api/v1/issues/${current.id}/dependencies`, { method: "POST", body: JSON.stringify({ relatedId: match.id, type: linkType }) });
                  setQuery("");
                  setMatches([]);
                  setNote("Dependency added");
                  await reload();
                }}>{match.key} {match.title}</button>
              ))}
            </div>
          ) : null}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Attachments</h3>
          <div className="mt-3 space-y-2">
            {current.attachments.map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 text-sm">
                <a className="truncate text-accent-2" href={`/api/v1/attachments/${file.id}`}>{file.fileName}</a>
                <span className="text-xs text-faint">{Math.ceil(file.sizeBytes / 1024)} KB · {file.uploadedBy.name}</span>
              </div>
            ))}
          </div>
          {current.attachments.some((file) => file.preview) ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {current.attachments.filter((file) => file.preview).map((file) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={file.id} src={`/api/v1/attachments/${file.id}`} alt={file.fileName} className="max-h-48 rounded-[12px] border border-line object-contain" />
              ))}
            </div>
          ) : null}
          {canUpdate ? (
            <input className="mt-3 text-sm" type="file" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const body = new FormData();
              body.set("file", file);
              await send(`/api/v1/issues/${current.id}/attachments`, { method: "POST", body });
              event.target.value = "";
              setNote("File uploaded");
              await reload();
            }} />
          ) : null}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Comments</h3>
          <div className="mt-3 space-y-4">
            {current.comments.map((item) => (
              <article key={item.id}>
                <div className="text-xs text-faint">{item.author.name} · {item.createdAt.slice(0, 16).replace("T", " ")}</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p>
                {item.own ? (
                  <div className="mt-1 flex gap-3 text-xs text-faint">
                    <button onClick={async () => { const body = window.prompt("Edit comment", item.body); if (!body) return; await send(`/api/v1/comments/${item.id}`, { method: "PATCH", body: JSON.stringify({ body }) }); await reload(); }}>Edit</button>
                    <button onClick={async () => { await send(`/api/v1/comments/${item.id}`, { method: "DELETE" }); await reload(); }}>Delete</button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          {canUpdate ? (
            <form className="mt-4 space-y-2" onSubmit={async (event) => {
              event.preventDefault();
              await send(`/api/v1/issues/${current.id}/comments`, { method: "POST", body: JSON.stringify({ body: comment }) });
              setComment("");
              setNote("Comment added");
              await reload();
            }}>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment. Use @Name to mention a member." />
              <Button type="submit">Comment</Button>
            </form>
          ) : null}
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h3 className="text-sm font-medium">Activity</h3>
          <ol className="mt-3 space-y-3">
            {current.activity.map((entry) => (
              <li key={entry.id} className="text-sm">
                <span className="text-ink">{entry.actor.name}</span> <span className="text-muted">{ACTIVITY_LABEL[entry.action] || entry.action}</span>
                {entry.oldValue || entry.newValue ? <span className="text-faint"> {entry.oldValue ? `${entry.oldValue} → ` : ""}{entry.newValue || ""}</span> : null}
                <div className="text-xs text-faint">{entry.createdAt.slice(0, 16).replace("T", " ")}</div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <aside className="h-fit space-y-3 rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-20">
        <Property label="Status" value={current.status} options={ISSUE_STATUSES.map((status) => [status, STATUS_LABEL[status]])} disabled={!canUpdate} onChange={(status) => void save({ status }, `Moved to ${STATUS_LABEL[status]}`)} />
        <Property label="Priority" value={current.priority} options={PRIORITIES.map((priority) => [priority, PRIORITY_LABEL[priority]])} disabled={!canUpdate} onChange={(priority) => void save({ priority })} />
        <Property label="Type" value={current.type} options={ISSUE_TYPES.map((type) => [type, TYPE_LABEL[type]])} disabled={!canUpdate} onChange={(type) => void save({ type })} />
        <label className="block text-sm">
          <span className="text-muted">Assignee</span>
          <Select className="mt-1" disabled={!canUpdate} value={current.assignee?.id || ""} onChange={(event) => void save({ assigneeId: event.target.value || null })}>
            <option value="">Unassigned</option>
            {members.filter((member) => member.active).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </Select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Due date</span>
          <Input className="mt-1" type="date" disabled={!canUpdate} value={current.dueDate || ""} onChange={(event) => void save({ dueDate: event.target.value || null })} />
        </label>
        <div className="text-sm">
          <div className="text-muted">Reporter</div>
          <div className="mt-1">{current.reporter.name}</div>
        </div>
        <div className="text-sm">
          <div className="text-muted">Company</div>
          <div className="mt-1">{current.company.name}</div>
        </div>
        <div>
          <div className="text-sm text-muted">Tags</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const on = current.tags.some((item) => item.id === tag.id);
              return (
                <button key={tag.id} disabled={!canUpdate} className="rounded-full border px-2 py-0.5 text-xs" style={{ color: tag.color, borderColor: on ? tag.color : "#2c313c" }} onClick={() => {
                  const tagIds = on ? current.tags.filter((item) => item.id !== tag.id).map((item) => item.id) : [...current.tags.map((item) => item.id), tag.id];
                  void save({ tagIds });
                }}>{tag.name}</button>
              );
            })}
          </div>
        </div>
        {current.archivedAt ? <Badge tone="warn">Archived</Badge> : null}
        <div className="flex flex-col gap-2 pt-2">
          {canUpdate ? <Button variant="ghost" onClick={async () => { const copy = await send<Detail>(`/api/v1/issues/${current.id}/duplicate`, { method: "POST" }); router.push(`/issues/${copy.id}`); }}>Duplicate</Button> : null}
          {canUpdate ? <Button variant="ghost" onClick={() => void save({ archived: !current.archivedAt }, current.archivedAt ? "Restored" : "Archived")}>{current.archivedAt ? "Restore" : "Archive"}</Button> : null}
          {canDelete ? <Button variant="danger" onClick={async () => { if (!window.confirm("Delete this issue and its subtasks?")) return; await send(`/api/v1/issues/${current.id}`, { method: "DELETE" }); router.push("/issues"); router.refresh(); }}>Delete</Button> : null}
        </div>
      </aside>
    </div>
  );
}

function Property({ label, value, options, disabled, onChange }: { label: string; value: string; options: (string[])[]; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <Select className="mt-1" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}
      </Select>
    </label>
  );
}

