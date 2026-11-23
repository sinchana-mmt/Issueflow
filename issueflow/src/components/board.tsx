"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DndContext, PointerSensor, closestCorners, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ISSUE_STATUSES, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/constants";
import type { IssueCard } from "@/lib/types";
import { send } from "@/lib/ui";

export function Board({ issues, canMove }: { issues: IssueCard[]; canMove: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(issues);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function onDragEnd(event: DragEndEvent) {
    if (!canMove) return;
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    const issue = items.find((item) => item.id === activeId);
    if (!issue || !overId) return;
    let status = issue.status;
    let overIssueId: string | undefined;
    if (overId.startsWith("column:")) status = overId.slice("column:".length);
    else {
      const over = items.find((item) => item.id === overId);
      if (!over || over.id === issue.id) return;
      status = over.status;
      overIssueId = over.id;
    }
    if (status === issue.status && !overIssueId) return;
    setItems((current) => current.map((item) => item.id === issue.id ? { ...item, status } : item));
    setError("");
    try {
      await send(`/api/v1/issues/${issue.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, overIssueId, place: "before", updatedAt: issue.updatedAt }),
      });
      setNote(`Moved to ${STATUS_LABEL[status]}`);
      router.refresh();
    } catch (caught) {
      setItems(issues);
      setError(caught instanceof Error ? caught.message : "Could not move the issue");
    }
  }

  return (
    <div>
      {note ? <p className="mb-3 text-sm text-ok">{note}</p> : null}
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={(event) => void onDragEnd(event)}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {ISSUE_STATUSES.map((status) => {
            const column = items.filter((issue) => issue.status === status).sort((a, b) => a.rank - b.rank);
            return <Column key={status} status={status} issues={column} canMove={canMove} />;
          })}
        </div>
      </DndContext>
    </div>
  );
}

function Column({ status, issues, canMove }: { status: string; issues: IssueCard[]; canMove: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  return (
    <section ref={setNodeRef} className={`w-72 shrink-0 rounded-2xl border bg-panel p-3 ${isOver ? "border-accent" : "border-line"}`}>
      <header className="mb-3 flex items-center justify-between text-sm">
        <span>{STATUS_LABEL[status]}</span>
        <span className="text-faint">{issues.length}</span>
      </header>
      <SortableContext items={issues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {issues.map((issue) => <Card key={issue.id} issue={issue} canMove={canMove} />)}
        </div>
      </SortableContext>
    </section>
  );
}

function Card({ issue, canMove }: { issue: IssueCard; canMove: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: issue.id, disabled: !canMove });
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-[12px] border border-line bg-canvas p-3"
      {...attributes}
      {...listeners}
    >
      <Link href={`/issues/${issue.id}`} className="font-mono text-xs text-accent-2">{issue.key}</Link>
      <h3 className="mt-1 text-sm font-medium">{issue.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1 text-xs text-faint">
        <span>{PRIORITY_LABEL[issue.priority]}</span>
        {issue.assignee ? <span>· {issue.assignee.name}</span> : null}
        {issue.tags.map((tag) => <span key={tag.id} style={{ color: tag.color }}>· {tag.name}</span>)}
      </div>
    </article>
  );
}
