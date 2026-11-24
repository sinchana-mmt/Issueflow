"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { ISSUE_TYPES, PRIORITIES, ISSUE_STATUSES, STATUS_LABEL, TYPE_LABEL, PRIORITY_LABEL, TAG_COLORS } from "@/lib/constants";
import type { Person, TagRef } from "@/lib/types";
import { send } from "@/lib/ui";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(100000).optional(),
  companyId: z.string().min(1, "Choose a company"),
  type: z.enum(ISSUE_TYPES),
  status: z.enum(ISSUE_STATUSES),
  priority: z.enum(PRIORITIES),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export function IssueForm({
  companyId,
  companyName,
  people,
  tags,
}: {
  companyId: string;
  companyName: string;
  people: Person[];
  tags: TagRef[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      companyId,
      type: "TASK" as const,
      status: "BACKLOG" as const,
      priority: "MEDIUM" as const,
      assigneeId: "",
      dueDate: "",
      tagIds: [] as string[],
    },
  });
  const projectTags = tags;

  return (
    <form
      className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-line bg-panel p-5"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try {
          const issue = await send<{ id: string }>("/api/v1/issues", {
            method: "POST",
            body: JSON.stringify({
              ...values,
              assigneeId: values.assigneeId || null,
              dueDate: values.dueDate || null,
              description: values.description || null,
            }),
          });
          router.push(`/issues/${issue.id}`);
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not create the issue");
        }
      })}
    >
      <Field label="Title"><Input {...form.register("title")} /></Field>
      <Field label="Description"><Textarea {...form.register("description")} placeholder="Markdown is supported" /></Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Company">
          <Input value={companyName} readOnly />
          <input type="hidden" {...form.register("companyId")} />
        </Field>
        <Field label="Type">
          <Select {...form.register("type")}>{ISSUE_TYPES.map((type) => <option key={type} value={type}>{TYPE_LABEL[type]}</option>)}</Select>
        </Field>
        <Field label="Status">
          <Select {...form.register("status")}>{ISSUE_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</Select>
        </Field>
        <Field label="Priority">
          <Select {...form.register("priority")}>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{PRIORITY_LABEL[priority]}</option>)}</Select>
        </Field>
        <Field label="Assignee">
          <Select {...form.register("assigneeId")}>
            <option value="">Unassigned</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
          </Select>
        </Field>
        <Field label="Due date"><Input type="date" {...form.register("dueDate")} /></Field>
      </div>
      {projectTags.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm text-muted">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {projectTags.map((tag) => {
              const selected = form.watch("tagIds")?.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  className="rounded-full border border-line px-3 py-1 text-sm"
                  style={{ color: tag.color || TAG_COLORS[0], borderColor: selected ? tag.color : undefined }}
                  onClick={() => {
                    const current = form.getValues("tagIds") || [];
                    form.setValue("tagIds", selected ? current.filter((id) => id !== tag.id) : [...current, tag.id]);
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}
      {error || form.formState.errors.title || form.formState.errors.companyId ? (
        <p className="text-sm text-danger">{error || form.formState.errors.title?.message || form.formState.errors.companyId?.message}</p>
      ) : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating" : "Create issue"}</Button>
    </form>
  );
}
