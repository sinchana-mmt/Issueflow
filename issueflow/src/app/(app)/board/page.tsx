import { redirect } from "next/navigation";
import { Board } from "@/components/board";
import { Button, Select } from "@/components/ui";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { listBoard } from "@/server/issues";
import { listProjects, listTags } from "@/server/projects";
import { listPeople } from "@/server/users";

export const metadata = { title: "Board" };

export default async function BoardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const params = await searchParams;
  const [board, projects, people, tags] = await Promise.all([
    listBoard(actor, params),
    listProjects(actor),
    listPeople(actor),
    listTags(actor),
  ]);
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw || "";
  };
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Board</h2>
        <p className="text-sm text-muted">Drag a card to change its status. The board never moves a card on its own.</p>
      </div>
      <form action="/board" className="grid gap-2 rounded-2xl border border-line bg-panel p-3 md:grid-cols-5">
        <Select name="projectId" defaultValue={value("projectId")}>
          <option value="">All projects</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.key}</option>)}
        </Select>
        <Select name="assigneeId" defaultValue={value("assigneeId")}>
          <option value="">Any assignee</option>
          {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </Select>
        <Select name="priority" defaultValue={value("priority")}>
          <option value="">Any priority</option>
          {PRIORITIES.map((priority) => <option key={priority} value={priority}>{PRIORITY_LABEL[priority]}</option>)}
        </Select>
        <Select name="tagId" defaultValue={value("tagId")}>
          <option value="">Any tag</option>
          {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
        </Select>
        <Button type="submit" variant="subtle">Apply</Button>
      </form>
      {board.capped ? <p className="text-sm text-warn">Showing the 500 most recently updated matching issues.</p> : null}
      <Board issues={board.issues} canMove={can(actor, "issue.update")} />
    </div>
  );
}
